const { validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { haversineDistanceKm } = require('../utils/geocoding');

const listLocations = async (req, res, next) => {
  try {
    const { category, amenities, minRating, search, discover } = req.query;
    const { lat, lng, radius } = req.query;

    const hasCoords = lat !== undefined && lng !== undefined && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng));
    const radiusMiles = radius ? parseFloat(radius) : 5;
    const radiusKm = Number.isFinite(radiusMiles) ? radiusMiles * 1.60934 : 5 * 1.60934;
    const latitude = hasCoords ? parseFloat(lat) : null;
    const longitude = hasCoords ? parseFloat(lng) : null;

    // 1. Internal Database Search
    let query = supabase.from('locations').select('*');

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (amenities) {
      const amenityArray = amenities.split(',').map((a) => a.trim());
      query = query.contains('amenities', amenityArray);
    }

    // If the client provides coordinates, keep DB results local to the visible area.
    // This makes the map UX feel much more like Google/Apple Maps.
    if (hasCoords) {
      // 1 degree of latitude is always ~111km
      const latDelta = radiusKm / 111.0;
      // 1 degree of longitude varies by cosine of latitude
      const lngDelta = radiusKm / (111.0 * Math.cos((latitude * Math.PI) / 180.0));

      console.log(`Searching within radius: ${radiusKm}km (latDelta: ${latDelta}, lngDelta: ${lngDelta})`);

      query = query
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta);
    }

    const { data: rawDbResults, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    // If we have coords, filter precisely by circular radius and include distance for client-side sorting.
    const dbResults = (rawDbResults || [])
      .map((loc) => {
        if (!hasCoords) return loc;

        const dKm = haversineDistanceKm(
          latitude,
          longitude,
          parseFloat(loc.latitude),
          parseFloat(loc.longitude)
        );

        return {
          ...loc,
          distance_km: dKm,
          distance_miles: dKm / 1.60934,
        };
      })
      .filter((loc) => {
        if (!hasCoords) return true;
        // Strict circular radius check within the bounding box
        return typeof loc.distance_km === 'number' && loc.distance_km <= radiusKm;
      });

    let finalResults = dbResults;

    // 2. External OSM Search & Geocoding
    if (search) {
      const { searchExternalLocations } = require('../utils/osmService');

      let searchLat = latitude;
      let searchLng = longitude;
      let searchRadius = radiusKm;

      // Smarts: If searching for a city/state, geocode it first to move the search center
      // Only do this if the search query is more than just a keyword
      if (search.length > 3) {
        try {
          const { NOMINATIM_API } = require('../utils/osmService');
          const geocodeRes = await fetch(`${NOMINATIM_API}?q=${encodeURIComponent(search + ' USA')}&format=json&limit=1`, {
            headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' }
          });
          const geocodeData = await geocodeRes.json();

          if (geocodeData && geocodeData.length > 0 && geocodeData[0].importance > 0.4) {
            const place = geocodeData[0];
            // If it's a city/state/county, it likely represents a "Browse this area" intent
            if (['city', 'state', 'administrative', 'village', 'town'].includes(place.type) || place.importance > 0.7) {
              searchLat = parseFloat(place.lat);
              searchLng = parseFloat(place.lon);
              searchRadius = 25; // Increase radius for city-wide search
              console.log(`Detected city/place search for "${search}". Moving center to ${searchLat}, ${searchLng}`);

              // Update DB query to use the NEW center
              const latDelta = searchRadius / 111.0;
              const lngDelta = searchRadius / (111.0 * Math.cos((searchLat * Math.PI) / 180.0));

              // Re-initialize query for the new area
              query = supabase.from('locations').select('*');
              if (category) query = query.eq('category', category);
              query = query
                .gte('latitude', searchLat - latDelta)
                .lte('latitude', searchLat + latDelta)
                .gte('longitude', searchLng - lngDelta)
                .lte('longitude', searchLng + lngDelta);

              const { data: movedDbResults } = await query.limit(100);
              if (movedDbResults) {
                finalResults = movedDbResults.map(loc => {
                  const dKm = haversineDistanceKm(searchLat, searchLng, parseFloat(loc.latitude), parseFloat(loc.longitude));
                  return { ...loc, distance_km: dKm, distance_miles: dKm / 1.60934 };
                });
              }
            }
          }
        } catch (e) {
          console.error("Geocoding failed, falling back to proximity search", e);
        }
      }

      // Fetch from OSM around the (possibly updated) center
      const externalResults = await searchExternalLocations(
        search,
        category,
        searchLat,
        searchLng,
        searchRadius
      );

      // Dedup: Don't show external if we have a close match in DB
      const validExternal = externalResults.filter(ext =>
        !finalResults.some(db => {
          const nameMatch = db.name.toLowerCase().includes(ext.name.toLowerCase()) ||
            ext.name.toLowerCase().includes(db.name.toLowerCase());
          const locationMatch = Math.abs(db.latitude - ext.latitude) < 0.005 &&
            Math.abs(db.longitude - ext.longitude) < 0.005;
          return nameMatch && locationMatch;
        })
      );

      finalResults = [...finalResults, ...validExternal];

      // Background cache newly found search results
      if (validExternal.length > 0) {
        cacheExternalLocations(validExternal).catch(err => 
          console.error('Background search cache failed:', err.message)
        );
      }
    }

    // 3. External OSM Discover (no text query)
    // This is how the map can show “baseline” locations even when the user hasn’t searched yet.
    const wantsDiscover = discover === '1' || discover === 'true';
    if (!search && hasCoords && wantsDiscover) {
      try {
        const { discoverExternalLocations } = require('../utils/osmService');
        // Use at least 12km for discover so the map always has a decent baseline of POIs
        const discoverRadius = Math.max(radiusKm, 12);
        const externalDiscover = await discoverExternalLocations(category, latitude, longitude, discoverRadius);

        const validExternal = (externalDiscover || []).filter(ext =>
          !finalResults.some(db => {
            const nameMatch = (db.name || '').toLowerCase() === (ext.name || '').toLowerCase();
            const locationMatch = Math.abs(db.latitude - ext.latitude) < 0.001 &&
              Math.abs(db.longitude - ext.longitude) < 0.001;
            return nameMatch && locationMatch;
          })
        );

        finalResults = [...finalResults, ...validExternal];

        // Background cache newly found discovery results
        if (validExternal.length > 0) {
          cacheExternalLocations(validExternal).catch(err => 
            console.error('Background discover cache failed:', err.message)
          );
        }
      } catch (discoverErr) {
        console.error('Discover locations failed (non-fatal):', discoverErr?.message || discoverErr);
      }
    }

    res.json(finalResults);
  } catch (err) {
    return next(err);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Handle OSM external locations
    if (id.startsWith('osm_')) {
      // For now, we don't have a specific table for external details, 
      // but we shouldn't 404. We'll return a basic object that the 
      // frontend can use, or ideally, we should have the frontend 
      // pass the data in state. But since this is an API call:
      return res.json({
        id,
        name: 'External Location',
        is_external: true,
        description: 'Detail view for external locations is currently limited to the map popup data. We are working on full integration.'
      });
    }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(data);
  } catch (err) {
    return next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      category,
      amenities,
      hours,
      phone,
      website,
      images,
    } = req.body;

    const payload = {
      name,
      description: description || null,
      address,
      city,
      state: state || null,
      country: country || 'USA',
      latitude,
      longitude,
      category,
      amenities: amenities || [],
      hours: hours || null,
      phone: phone || null,
      website: website || null,
      images: images || [],
      created_by: userId,
    };

    const { data, error } = await supabase.from('locations').insert(payload).select('*').single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Ensure user owns the location
    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    if (location.created_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this location' });
    }

    const { data, error } = await supabase
      .from('locations')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    return next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    if (location.created_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this location' });
    }

    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

const nearbyLocations = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius) * 1.60934; // miles to km

    // Simple bounding-box first to keep results small
    const latDelta = radiusKm / 111; // approx degrees latitude per km
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lngDelta)
      .lte('longitude', longitude + lngDelta);

    if (error) throw error;

    const withDistance = (data || []).map((loc) => ({
      ...loc,
      distance_km: haversineDistanceKm(
        latitude,
        longitude,
        Number(loc.latitude),
        Number(loc.longitude)
      ),
    }));

    withDistance.sort((a, b) => a.distance_km - b.distance_km);

    res.json(withDistance);
  } catch (err) {
    return next(err);
  }
};

const incrementViewCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: current, error: fetchError } = await supabase
      .from('locations')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!current) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { data, error } = await supabase
      .from('locations')
      .update({ view_count: (current.view_count || 0) + 1 })
      .eq('id', id)
      .select('view_count')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    return next(err);
  }
};

const cacheExternalLocations = async (locations) => {
  if (!locations || locations.length === 0) return;

  try {
    const toCache = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      address: loc.address,
      city: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
      category: loc.category,
      amenities: loc.amenities,
      images: loc.images,
      created_by: null // External source
    }));

    // Perform upsert. Even if RLS prevents this for 'anon', 
    // it will be tried if the user has a more permissive role 
    // or if the service role key is added later.
    const { error } = await supabase
      .from('locations')
      .upsert(toCache, { onConflict: 'id' });

    if (error) {
       // Silently fail if RLS prevents it, but keep logged for dev.
       // In production with a service role key, this will start working.
       console.log(`Cache Note: Background cache check for ${locations.length} spots resulted in: ${error.message}`);
    } else {
      console.log(`Successfully cached/verified ${locations.length} locations in database.`);
    }
  } catch (err) {
    console.error('Cache function error:', err.message);
  }
};

const addLocationImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    // Security check: Basic validation for image URL / format
    // In a production app with direct uploads, we would check the buffer.
    // Since images go through Cloudinary first, we ensure the URL from Cloudinary looks safe.
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerUrl = imageUrl.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => lowerUrl.endsWith(ext));
    
    // Very basic check to ensure it's a Cloudinary URL if we want to be strict
    const isCloudinary = imageUrl.includes('cloudinary.com');

    if (!hasValidExtension || !isCloudinary) {
      return res.status(400).json({ error: 'Security: Invalid image source or format.' });
    }

    // 1. Get current images
    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const currentImages = location.images || [];
    const updatedImages = [...currentImages, imageUrl];

    // 2. Update location
    const { data, error: updateError } = await supabase
      .from('locations')
      .update({ images: updatedImages })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getExternalReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch location details to get name and city
    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('name, city')
      .eq('id', id)
      .single();

    if (fetchError || !location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // 2. Scrape Yelp data
    const { scrapeYelpData } = require('../utils/yelpScraper');
    const yelpData = await scrapeYelpData(location.name, location.city);

    res.json(yelpData);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  nearbyLocations,
  incrementViewCount,
  addLocationImage,
  getExternalReviews,
};

