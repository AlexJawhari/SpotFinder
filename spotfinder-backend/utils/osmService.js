// Use Overpass API for better POI results with actual location data
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const crypto = require('crypto');

// Helper to create a deterministic UUID v5 from an OSM ID
function generateUUIDv5(name, namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8') {
    const nsBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');
    const nameBuffer = Buffer.from(name, 'utf8');
    const hash = crypto.createHash('sha1');
    hash.update(nsBuffer);
    hash.update(nameBuffer);
    const buffer = hash.digest();
    
    // Set version to 5 and variant to RFC4122
    buffer[6] = (buffer[6] & 0x0f) | 0x50;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;
    
    const hex = buffer.toString('hex');
    return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20,12)}`;
}

// US bounding box (shared across functions)
const US_BBOX = {
    south: 24.396308,
    north: 49.384358,
    west: -125.0,
    east: -66.93457
};

// Comprehensive category → OSM tag mapping
const CATEGORY_MAP = {
    'cafe': ['amenity=cafe', 'amenity=coffee_shop'],
    'library': ['amenity=library'],
    'park': ['leisure=park', 'leisure=recreation_ground', 'leisure=garden', 'leisure=nature_reserve'],
    'food': ['amenity=restaurant', 'amenity=fast_food', 'amenity=food_court'],
    'restaurant': ['amenity=restaurant', 'amenity=fast_food'],
    'study': ['amenity=library', 'amenity=coworking_space', 'amenity=university'],
    'coworking': ['amenity=coworking_space'],
    'bar': ['amenity=bar', 'amenity=pub', 'amenity=biergarten', 'amenity=nightclub'],
    'nightlife': ['amenity=bar', 'amenity=pub', 'amenity=nightclub'],
    'gym': ['leisure=fitness_centre', 'leisure=sports_centre', 'amenity=gym'],
    'fitness': ['leisure=fitness_centre', 'leisure=sports_centre'],
    'shop': ['shop=supermarket', 'shop=convenience', 'shop=mall', 'shop=department_store'],
    'museum': ['tourism=museum', 'tourism=gallery', 'tourism=artwork'],
    'community': ['amenity=community_centre', 'amenity=social_facility', 'amenity=library'],
    'hotel': ['tourism=hotel', 'tourism=motel', 'tourism=hostel'],
    'cinema': ['amenity=cinema', 'amenity=theatre'],
    'other': [],
};

/**
 * Build Overpass union elements for a set of OSM tags within a bbox.
 * Returns a string of node+way queries for each tag.
 */
function buildOverpassTagQueries(tags, bboxStr, nameFilter = '') {
    let q = '';
    for (const tag of tags) {
        const [key, value] = tag.split('=');
        // Each Overpass filter must have its own brackets: ["key"="value"]["name"~"...",i]
        q += `node["${key}"="${value}"]${nameFilter}(${bboxStr});`;
        q += `way["${key}"="${value}"]${nameFilter}(${bboxStr});`;
    }
    return q;
}

/**
 * Build a broad Overpass query for all common POI types.
 * Used when no specific category is selected.
 */
function buildBroadOverpassQuery(bboxStr, nameFilter = '') {
    let q = '';
    // Amenities — each filter in its own brackets: ["amenity"~"..."]["name"~"...",i]
    // Key Third Space Amenities
    q += `node["amenity"~"^(cafe|restaurant|fast_food|bar|pub|nightclub|library|coffee_shop|coworking_space|community_centre|cinema|theatre|university|college)$"]${nameFilter}(${bboxStr});`;
    q += `way["amenity"~"^(cafe|restaurant|fast_food|bar|pub|nightclub|library|coffee_shop|coworking_space|community_centre|cinema|theatre|university|college)$"]${nameFilter}(${bboxStr});`;
    // Leisure & Nature
    q += `node["leisure"~"^(park|recreation_ground|garden|fitness_centre|sports_centre)$"]${nameFilter}(${bboxStr});`;
    q += `way["leisure"~"^(park|recreation_ground|garden|fitness_centre|sports_centre)$"]${nameFilter}(${bboxStr});`;
    // Cultural & Community Shops
    q += `node["shop"~"^(books|mall|department_store)$"]${nameFilter}(${bboxStr});`;
    q += `way["shop"~"^(supermarket|mall|department_store|books|convenience)$"]${nameFilter}(${bboxStr});`;
    // Tourism & Art
    q += `node["tourism"~"^(museum|gallery|artwork|hotel|hostel)$"]${nameFilter}(${bboxStr});`;
    q += `way["tourism"~"^(museum|gallery|hotel|hostel)$"]${nameFilter}(${bboxStr});`;
    return q;
}

/**
 * Search OSM for locations using Overpass API for better POI results
 * @param {string} query - The search text (e.g. "Starbucks", "library")
 * @param {string} category - Specific category preference (optional)
 * @param {number} lat - Latitude for proximity search (optional)
 * @param {number} lng - Longitude for proximity search (optional)
 * @param {number} radius - Search radius in km (default 25)
 * @returns {Promise<Array>} - Array of SpotFinder-formatted location objects
 */
async function searchExternalLocations(query, category, lat = null, lng = null, radius = 25) {
    if (!query || query.length < 2) return [];

    try {
        // If we have coordinates, search in a bounding box
        if (lat && lng) {
            // Clamp coordinates to US bounds
            if (lat < US_BBOX.south || lat > US_BBOX.north || lng < US_BBOX.west || lng > US_BBOX.east) {
                lat = 39.8283;
                lng = -98.5795;
            }

            const bbox = calculateBoundingBox(lat, lng, radius);
            const clampedBbox = {
                south: Math.max(bbox.south, US_BBOX.south),
                north: Math.min(bbox.north, US_BBOX.north),
                west: Math.max(bbox.west, US_BBOX.west),
                east: Math.min(bbox.east, US_BBOX.east)
            };
            const bboxStr = `${clampedBbox.south},${clampedBbox.west},${clampedBbox.north},${clampedBbox.east}`;

            // Build a case-insensitive name filter from the query text.
            // This is the key fix — previously search text was ignored entirely.
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const nameFilter = `["name"~"${escapedQuery}",i]`;

            let overpassQuery = '[out:json][timeout:20];(';

            if (category && CATEGORY_MAP[category] && CATEGORY_MAP[category].length > 0) {
                // Search within the specific category, filtered by name
                overpassQuery += buildOverpassTagQueries(CATEGORY_MAP[category], bboxStr, nameFilter);
            } else {
                // Search ALL POI types filtered by name
                overpassQuery += buildBroadOverpassQuery(bboxStr, nameFilter);
                // Also do a pure name search across any named node/way (catches things like "Target", "Walmart")
                // Also do a pure name search across any amenity/shop/leisure/tourism node
                overpassQuery += `node["name"~"${escapedQuery}",i]["amenity"](${bboxStr});`;
                overpassQuery += `way["name"~"${escapedQuery}",i]["amenity"](${bboxStr});`;
                overpassQuery += `node["name"~"${escapedQuery}",i]["shop"](${bboxStr});`;
                overpassQuery += `way["name"~"${escapedQuery}",i]["shop"](${bboxStr});`;
                overpassQuery += `node["name"~"${escapedQuery}",i]["leisure"](${bboxStr});`;
                overpassQuery += `way["name"~"${escapedQuery}",i]["leisure"](${bboxStr});`;
                overpassQuery += `node["name"~"${escapedQuery}",i]["tourism"](${bboxStr});`;
                overpassQuery += `way["name"~"${escapedQuery}",i]["tourism"](${bboxStr});`;
            }

            overpassQuery += ');out center meta;';

            const response = await fetch(OVERPASS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'SpotFinder-Student-App/1.0 (edu-project)'
                },
                body: `data=${encodeURIComponent(overpassQuery)}`
            });

            if (!response.ok) {
                console.error('Overpass API error:', response.status);
                return await searchWithNominatim(query, category, lat, lng);
            }

            const data = await response.json();

            if (!data.elements || data.elements.length === 0) {
                // Fall back to Nominatim for text-based search
                return await searchWithNominatim(query, category, lat, lng);
            }

            const results = transformOverpassResults(data.elements, category)
                .slice(0, 150); // Increased from 50 to 150

            return results;

        } else {
            // Fallback to Nominatim for text-based search without coordinates
            return await searchWithNominatim(query, category);
        }
    } catch (error) {
        console.error('Overpass Search Failed:', error.message);
        return await searchWithNominatim(query, category, lat, lng);
    }
}

/**
 * Discover nearby locations from OSM without requiring a text query.
 * This powers the "default map data" experience (Google/Apple Maps-like browsing).
 */
async function discoverExternalLocations(category, lat, lng, radius = 20) {
    if (lat === null || lng === null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return [];

    try {
        let qLat = parseFloat(lat);
        let qLng = parseFloat(lng);
        if (qLat < US_BBOX.south || qLat > US_BBOX.north || qLng < US_BBOX.west || qLng > US_BBOX.east) {
            qLat = 39.8283;
            qLng = -98.5795;
        }

        const bbox = calculateBoundingBox(qLat, qLng, radius);
        const clampedBbox = {
            south: Math.max(bbox.south, US_BBOX.south),
            north: Math.min(bbox.north, US_BBOX.north),
            west: Math.max(bbox.west, US_BBOX.west),
            east: Math.min(bbox.east, US_BBOX.east)
        };
        const bboxStr = `${clampedBbox.south},${clampedBbox.west},${clampedBbox.north},${clampedBbox.east}`;

        let overpassQuery = '[out:json][timeout:20];(';

        if (category && CATEGORY_MAP[category] && CATEGORY_MAP[category].length > 0) {
            overpassQuery += buildOverpassTagQueries(CATEGORY_MAP[category], bboxStr);
        } else {
            // Broad discovery — show all interesting POIs
            overpassQuery += buildBroadOverpassQuery(bboxStr);
        }

        overpassQuery += ');out center meta;';

        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'SpotFinder-Student-App/1.0 (edu-project)'
            },
            body: `data=${encodeURIComponent(overpassQuery)}`
        });

        if (!response.ok) {
            console.error('Overpass API error (discover):', response.status);
            return [];
        }

        const data = await response.json();
        if (!data.elements || data.elements.length === 0) return [];

        const results = transformOverpassResults(data.elements, category)
            .slice(0, 250); // Increased from 100 to 250

        return results;
    } catch (error) {
        console.error('Overpass Discover Failed:', error.message);
        return [];
    }
}

/**
 * Transform raw Overpass elements into SpotFinder-formatted location objects.
 * Shared between search and discover to avoid duplication.
 */
function transformOverpassResults(elements, category) {
    return elements
        .filter(item => {
            const center = item.center || { lat: item.lat, lon: item.lon };
            const rLat = parseFloat(center.lat);
            const rLng = parseFloat(center.lon);
            return rLat && rLng &&
                rLat >= US_BBOX.south && rLat <= US_BBOX.north &&
                rLng >= US_BBOX.west && rLng <= US_BBOX.east;
        })
        .map(item => {
            const center = item.center || { lat: item.lat, lon: item.lon };
            const tags = item.tags || {};
            const name = tags.name || tags['name:en'] || 'Unnamed Location';

            const city = tags['addr:city'] || tags['addr:town'] || tags['addr:suburb'] || 'Unknown';
            const state = tags['addr:state'] || tags['is_in:state'] || '';
            const zip = tags['addr:postcode'] || '';

            // Build full address
            const street = tags['addr:street'] || '';
            const houseNumber = tags['addr:housenumber'] || '';
            let fullAddress = '';
            if (street) {
                fullAddress = `${houseNumber ? houseNumber + ' ' : ''}${street}`;
                if (city !== 'Unknown') fullAddress += `, ${city}`;
                if (state) fullAddress += `, ${state}`;
                if (zip) fullAddress += ` ${zip}`;
            } else {
                fullAddress = city !== 'Unknown' ? city : 'Address not available';
            }

            // Determine the best OSM type for category mapping
            const osmType = tags.amenity || tags.leisure || tags.shop || tags.tourism;
            const osmId = `${item.type}_${item.id}`;

            return {
                id: generateUUIDv5(osmId),
                external_id: osmId,
                name,
                description: tags.description || tags['description:en'] || tags.opening_hours || `A ${osmType || 'location'} in ${city}`,
                address: fullAddress,
                city,
                state,
                zip,
                latitude: parseFloat(center.lat),
                longitude: parseFloat(center.lon),
                category: category || mapOsmCategory(osmType),
                amenities: extractAmenities(tags),
                images: getLocationImage(osmType),
                rating: 0,
                review_count: 0,
                is_external: true,
                phone: tags['phone'] || tags['contact:phone'] || null,
                website: tags['website'] || tags['contact:website'] || null,
                opening_hours: tags.opening_hours || null,
            };
        })
        .filter(loc => loc.name !== 'Unnamed Location');
}

/**
 * Fallback to Nominatim for text-based search
 */
async function searchWithNominatim(query, category, lat = null, lng = null) {
    try {
        let q = query;
        if (category) {
            q = `${category} ${query}`;
        }
        q += ' USA';
        if (lat && lng) {
            q += ` near ${lat},${lng}`;
        }

        const params = new URLSearchParams({
            q: q,
            format: 'json',
            addressdetails: 1,
            limit: 20,
            extratags: 1,
            namedetails: 1,
            countrycodes: 'us'
        });

        const headers = {
            'User-Agent': 'SpotFinder-Student-App/1.0 (edu-project)'
        };

        const response = await fetch(`${NOMINATIM_API}?${params.toString()}`, { headers });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return data
            .filter(item => {
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                const address = item.address || {};
                const country = address.country_code || address.country;

                return (item.osm_type === 'node' || item.osm_type === 'way' || item.osm_type === 'relation') &&
                       lat && lng &&
                       lat >= US_BBOX.south && lat <= US_BBOX.north &&
                       lng >= US_BBOX.west && lng <= US_BBOX.east &&
                       (country === 'us' || country === 'US' || !country);
            })
            .map(item => {
                const address = item.address || {};
                const fullAddress = [
                    address.house_number,
                    address.road,
                    address.city || address.town || address.village,
                    address.state,
                    address.postcode
                ].filter(Boolean).join(', ');

                const osmId = `${item.osm_type}_${item.osm_id}`;

                return {
                    id: generateUUIDv5(osmId),
                    external_id: osmId,
                    name: item.name || item.display_name.split(',')[0],
                    description: `Found via OpenStreetMap`,
                    address: fullAddress || item.display_name.split(',').slice(0, 3).join(','),
                    city: address.city || address.town || address.village || 'Unknown',
                    state: address.state || '',
                    zip: address.postcode || '',
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    category: category || mapOsmCategory(item.type),
                    amenities: ['public_access'],
                    images: getLocationImage(item.type),
                    rating: 0,
                    review_count: 0,
                    is_external: true
                };
            })
            .slice(0, 20);
    } catch (error) {
        console.error('Nominatim fallback failed:', error);
        return [];
    }
}

function calculateBoundingBox(lat, lng, radiusKm) {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return {
        north: lat + latDelta,
        south: lat - latDelta,
        east: lng + lngDelta,
        west: lng - lngDelta
    };
}

function extractAmenities(tags) {
    const amenities = [];
    if (tags.wifi === 'yes' || tags['internet_access'] === 'yes' || tags['internet_access'] === 'wlan') amenities.push('wifi');
    if (tags['outdoor_seating'] === 'yes') amenities.push('outdoor_seating');
    if (tags['wheelchair'] === 'yes') amenities.push('wheelchair_accessible');
    if (tags['smoking'] === 'no') amenities.push('non_smoking');
    if (tags['parking'] || tags['parking:lane']) amenities.push('parking');
    if (tags['toilets'] === 'yes') amenities.push('restrooms');
    return amenities.length > 0 ? amenities : ['public_access'];
}

function getLocationImage(type) {
    const imageMap = {
        'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400',
        'coffee_shop': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400',
        'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
        'fast_food': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
        'library': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400',
        'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400',
        'bar': 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=400',
        'pub': 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=400',
        'nightclub': 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=400',
        'fitness_centre': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
        'sports_centre': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
        'supermarket': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=400',
        'pharmacy': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=400',
        'hospital': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
        'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=400',
        'hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
        'cinema': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400',
        'university': 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400',
    };
    return [imageMap[type] || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=400'];
}

function mapOsmCategory(osmType) {
    const map = {
        'cafe': 'cafe',
        'coffee_shop': 'cafe',
        'library': 'library',
        'park': 'park',
        'garden': 'park',
        'recreation_ground': 'park',
        'nature_reserve': 'park',
        'restaurant': 'food',
        'fast_food': 'food',
        'food_court': 'food',
        'bar': 'bar',
        'pub': 'bar',
        'biergarten': 'bar',
        'nightclub': 'nightlife',
        'fitness_centre': 'gym',
        'sports_centre': 'gym',
        'gym': 'gym',
        'university': 'education',
        'college': 'education',
        'school': 'education',
        'supermarket': 'shop',
        'mall': 'shop',
        'department_store': 'shop',
        'convenience': 'shop',
        'books': 'bookstore',
        'cinema': 'cinema',
        'theatre': 'cinema',
        'coworking_space': 'coworking',
        'community_centre': 'community',
        'social_facility': 'community',
        'art_gallery': 'museum',
        'artwork': 'museum',
    };
    return map[osmType] || 'other';
}

module.exports = { searchExternalLocations, discoverExternalLocations, NOMINATIM_API };
