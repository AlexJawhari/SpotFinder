// Use Overpass API for better POI results with actual location data
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

/**
 * Search OSM for locations using Overpass API for better POI results
 * @param {string} query - The search text (e.g. "cafe", "library")
 * @param {string} category - Specific category preference (optional)
 * @param {number} lat - Latitude for proximity search (optional)
 * @param {number} lng - Longitude for proximity search (optional)
 * @param {number} radius - Search radius in km (default 5)
 * @returns {Promise<Array>} - Array of SpotFinder-formatted location objects
 */
async function searchExternalLocations(query, category, lat = null, lng = null, radius = 5) {
    if (!query || query.length < 2) return [];

    try {
        // Map category to OSM amenity/leisure tags
        const categoryMap = {
            'cafe': ['amenity=cafe', 'amenity=coffee_shop'],
            'library': ['amenity=library'],
            'park': ['leisure=park', 'leisure=recreation_ground'],
            'food': ['amenity=restaurant', 'amenity=fast_food'],
            'study': ['amenity=library', 'amenity=coworking_space'],
            'coworking': ['amenity=coworking_space'],
        };

        // Build Overpass query - RESTRICT TO US ONLY
        // US bounding box: approximately 24.396308 to 49.384358 lat, -125.0 to -66.93457 lng
        const US_BBOX = {
            south: 24.396308,
            north: 49.384358,
            west: -125.0,
            east: -66.93457
        };
        
        let overpassQuery = '[out:json][timeout:15];(';
        
        // If we have coordinates, search in a bounding box
        if (lat && lng) {
            // Verify coordinates are in US
            if (lat < US_BBOX.south || lat > US_BBOX.north || lng < US_BBOX.west || lng > US_BBOX.east) {
                console.log('Coordinates outside US bounds, using default US location');
                // Use center of US as fallback
                lat = 39.8283; // Center of US
                lng = -98.5795;
            }
            
            const bbox = calculateBoundingBox(lat, lng, radius);
            // Clamp bounding box to US bounds
            const clampedBbox = {
                south: Math.max(bbox.south, US_BBOX.south),
                north: Math.min(bbox.north, US_BBOX.north),
                west: Math.max(bbox.west, US_BBOX.west),
                east: Math.min(bbox.east, US_BBOX.east)
            };
            const bboxStr = `${clampedBbox.south},${clampedBbox.west},${clampedBbox.north},${clampedBbox.east}`;
            
            // Search for amenities matching the category - WITH US COUNTRY FILTER
            if (category && categoryMap[category]) {
                categoryMap[category].forEach(tag => {
                    const [key, value] = tag.split('=');
                    overpassQuery += `node["${key}"="${value}"]["addr:country"!~"."](${bboxStr});`;
                    overpassQuery += `node["${key}"="${value}"]["addr:country"="US"](${bboxStr});`;
                    overpassQuery += `way["${key}"="${value}"]["addr:country"!~"."](${bboxStr});`;
                    overpassQuery += `way["${key}"="${value}"]["addr:country"="US"](${bboxStr});`;
                });
            } else {
                // General search for cafes, restaurants, libraries, parks - US ONLY
                overpassQuery += `node["amenity"~"^(cafe|restaurant|library|coffee_shop|coworking_space)$"](${bboxStr});`;
                overpassQuery += `way["amenity"~"^(cafe|restaurant|library|coffee_shop|coworking_space)$"](${bboxStr});`;
                overpassQuery += `node["leisure"~"^(park|recreation_ground)$"](${bboxStr});`;
                overpassQuery += `way["leisure"~"^(park|recreation_ground)$"](${bboxStr});`;
            }
        } else {
            // Fallback to Nominatim for text-based search without coordinates
            return await searchWithNominatim(query, category);
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
            return await searchWithNominatim(query, category, lat, lng);
        }

        // Transform Overpass results to SpotFinder schema
        // FILTER TO US ONLY - check coordinates are in US bounds
        // (US_BBOX already declared at top of function)
        
        const results = data.elements
            .filter(item => {
                const center = item.center || { lat: item.lat, lon: item.lon };
                const lat = parseFloat(center.lat);
                const lng = parseFloat(center.lon);
                // Only include if coordinates are in US bounds
                return lat && lng && 
                       lat >= US_BBOX.south && lat <= US_BBOX.north &&
                       lng >= US_BBOX.west && lng <= US_BBOX.east;
            })
            .map(item => {
                const center = item.center || { lat: item.lat, lon: item.lon };
                const tags = item.tags || {};
                const name = tags.name || tags['name:en'] || 'Unnamed Location';
                
                // Build full address
                const street = tags['addr:street'] || '';
                const houseNumber = tags['addr:housenumber'] || '';
                const city = tags['addr:city'] || tags['addr:town'] || tags['addr:suburb'] || 'Unknown';
                const state = tags['addr:state'] || tags['is_in:state'] || '';
                const zip = tags['addr:postcode'] || '';
                
                let fullAddress = '';
                if (street) {
                    fullAddress = `${houseNumber ? houseNumber + ' ' : ''}${street}`;
                    if (city) fullAddress += `, ${city}`;
                    if (state) fullAddress += `, ${state}`;
                    if (zip) fullAddress += ` ${zip}`;
                } else {
                    fullAddress = city || 'Address not available';
                }
                
                return {
                    id: `osm_${item.id}`,
                    name: name,
                    description: tags.description || tags['description:en'] || tags.opening_hours || `A ${tags.amenity || tags.leisure || 'location'} in ${city}`,
                    address: fullAddress,
                    city: city,
                    state: state,
                    zip: zip,
                    latitude: parseFloat(center.lat),
                    longitude: parseFloat(center.lon),
                    category: category || mapOsmCategory(tags.amenity || tags.leisure),
                    amenities: extractAmenities(tags),
                    images: getLocationImage(tags.amenity || tags.leisure),
                    rating: 0,
                    review_count: 0,
                    is_external: true,
                    phone: tags['phone'] || tags['contact:phone'] || null,
                    website: tags['website'] || tags['contact:website'] || null,
                    opening_hours: tags.opening_hours || null,
                };
            })
            .filter(loc => loc.name !== 'Unnamed Location') // Filter out unnamed places
            .slice(0, 20); // Limit to 20 results

        return results;

    } catch (error) {
        console.error('Overpass Search Failed:', error.message);
        // Fallback to Nominatim
        return await searchWithNominatim(query, category, lat, lng);
    }
}

/**
 * Discover nearby locations from OSM without requiring a text query.
 * This powers the “default map data” experience (Google/Apple Maps-like browsing).
 *
 * @param {string} category - optional category preference (e.g. 'cafe', 'library')
 * @param {number} lat
 * @param {number} lng
 * @param {number} radius - radius in km
 */
async function discoverExternalLocations(category, lat, lng, radius = 5) {
    if (lat === null || lng === null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return [];

    try {
        const categoryMap = {
            'cafe': ['amenity=cafe', 'amenity=coffee_shop'],
            'library': ['amenity=library'],
            'park': ['leisure=park', 'leisure=recreation_ground'],
            'food': ['amenity=restaurant', 'amenity=fast_food'],
            'study': ['amenity=library', 'amenity=coworking_space'],
            'coworking': ['amenity=coworking_space'],
        };

        const US_BBOX = {
            south: 24.396308,
            north: 49.384358,
            west: -125.0,
            east: -66.93457
        };

        // Clamp any out-of-US coords to a US fallback so we never query outside scope.
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

        let overpassQuery = '[out:json][timeout:15];(';

        if (category && categoryMap[category]) {
            categoryMap[category].forEach(tag => {
                const [key, value] = tag.split('=');
                overpassQuery += `node["${key}"="${value}"](${bboxStr});`;
                overpassQuery += `way["${key}"="${value}"](${bboxStr});`;
            });
        } else {
            // Baseline set for the homepage map browsing experience.
            overpassQuery += `node["amenity"~"^(cafe|restaurant|library|coffee_shop|coworking_space)$"](${bboxStr});`;
            overpassQuery += `way["amenity"~"^(cafe|restaurant|library|coffee_shop|coworking_space)$"](${bboxStr});`;
            overpassQuery += `node["leisure"~"^(park|recreation_ground)$"](${bboxStr});`;
            overpassQuery += `way["leisure"~"^(park|recreation_ground)$"](${bboxStr});`;
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

        const results = data.elements
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

                return {
                    id: `osm_${item.id}`,
                    name: name,
                    description: tags.description || tags['description:en'] || tags.opening_hours || `A ${tags.amenity || tags.leisure || 'location'} in ${city}`,
                    address: tags['addr:street'] ? `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}` : (city || 'Address not available'),
                    city,
                    state,
                    zip: tags['addr:postcode'] || '',
                    latitude: parseFloat(center.lat),
                    longitude: parseFloat(center.lon),
                    category: category || mapOsmCategory(tags.amenity || tags.leisure),
                    amenities: extractAmenities(tags),
                    images: getLocationImage(tags.amenity || tags.leisure),
                    rating: 0,
                    review_count: 0,
                    is_external: true,
                    phone: tags['phone'] || tags['contact:phone'] || null,
                    website: tags['website'] || tags['contact:website'] || null,
                    opening_hours: tags.opening_hours || null,
                };
            })
            .filter(loc => loc.name !== 'Unnamed Location')
            .slice(0, 60);

        return results;
    } catch (error) {
        console.error('Overpass Discover Failed:', error.message);
        return [];
    }
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
        // RESTRICT TO US - add country code
        q += ' USA';
        if (lat && lng) {
            q += ` near ${lat},${lng}`;
        }

        const params = new URLSearchParams({
            q: q,
            format: 'json',
            addressdetails: 1,
            limit: 15,
            extratags: 1,
            namedetails: 1,
            countrycodes: 'us' // RESTRICT TO US ONLY
        });

        const headers = {
            'User-Agent': 'SpotFinder-Student-App/1.0 (edu-project)'
        };

        const response = await fetch(`${NOMINATIM_API}?${params.toString()}`, { headers });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        // US bounding box for filtering
        const US_BBOX = {
            south: 24.396308,
            north: 49.384358,
            west: -125.0,
            east: -66.93457
        };
        
        return data
            .filter(item => {
                // Only include US locations
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                const address = item.address || {};
                const country = address.country_code || address.country;
                
                return (item.osm_type === 'node' || item.osm_type === 'way') &&
                       lat && lng &&
                       lat >= US_BBOX.south && lat <= US_BBOX.north &&
                       lng >= US_BBOX.west && lng <= US_BBOX.east &&
                       (country === 'us' || country === 'US' || !country); // Allow if no country specified but in US bounds
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
                
                return {
                    id: `osm_${item.osm_id}`,
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
            .slice(0, 15);
    } catch (error) {
        console.error('Nominatim fallback failed:', error);
        return [];
    }
}

function calculateBoundingBox(lat, lng, radiusKm) {
    const latDelta = radiusKm / 111; // ~111 km per degree latitude
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
    if (tags.wifi === 'yes' || tags['internet_access'] === 'yes') amenities.push('wifi');
    if (tags['outdoor_seating'] === 'yes') amenities.push('outdoor_seating');
    if (tags['wheelchair'] === 'yes') amenities.push('wheelchair_accessible');
    if (tags['smoking'] === 'no') amenities.push('non_smoking');
    return amenities.length > 0 ? amenities : ['public_access'];
}

function getLocationImage(type) {
    const imageMap = {
        'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400',
        'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
        'library': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400',
        'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400',
    };
    return [imageMap[type] || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=400'];
}

function mapOsmCategory(osmType) {
    const map = {
        'cafe': 'cafe',
        'library': 'library',
        'park': 'park',
        'restaurant': 'food',
        'university': 'study'
    };
    return map[osmType] || 'other';
}

module.exports = { searchExternalLocations, discoverExternalLocations };
