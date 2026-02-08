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
      const latDelta = radiusKm / 111; // approx degrees latitude per km
      const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

      query = query
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta);
    }

    const { data: rawDbResults, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    // If we have coords, filter precisely by radius and include distance for client-side sorting.
    const dbResults = (rawDbResults || [])
      .map((loc) => {
        if (!hasCoords) return loc;

        const dKm = haversineDistanceKm(
          latitude,
          longitude,
          Number(loc.latitude),
          Number(loc.longitude)
        );

        return {
          ...loc,
          distance_km: dKm,
          distance_miles: dKm / 1.60934,
        };
      })
      .filter((loc) => {
        if (!hasCoords) return true;
        return typeof loc.distance_km === 'number' && loc.distance_km <= radiusKm;
      });

    let finalResults = dbResults;

    // 2. External OSM Search (Only if searching)
    // Use user location if available for proximity search
    if (search && hasCoords) {
      const { searchExternalLocations } = require('../utils/osmService');
      const searchRadius = radiusKm; // already km
      const externalResults = await searchExternalLocations(
        search, 
        category, 
        latitude, 
        longitude,
        searchRadius
      );

      // Dedup: Don't show external if we have a close match in DB (Basic name check)
      const validExternal = externalResults.filter(ext =>
        !finalResults.some(db => {
          const nameMatch = db.name.toLowerCase() === ext.name.toLowerCase();
          const locationMatch = Math.abs(db.latitude - ext.latitude) < 0.001 && 
                               Math.abs(db.longitude - ext.longitude) < 0.001;
          return nameMatch && locationMatch;
        })
      );

      finalResults = [...finalResults, ...validExternal];
    } else if (search) {
      // Fallback to text-only search without coordinates
      const { searchExternalLocations } = require('../utils/osmService');
      const externalResults = await searchExternalLocations(search, category);
      const validExternal = externalResults.filter(ext =>
        !finalResults.some(db => db.name.toLowerCase() === ext.name.toLowerCase() && db.city === ext.city)
      );
      finalResults = [...finalResults, ...validExternal];
    }

    // 3. External OSM Discover (no text query)
    // This is how the map can show “baseline” locations even when the user hasn’t searched yet.
    const wantsDiscover = discover === '1' || discover === 'true';
    if (!search && hasCoords && wantsDiscover) {
      try {
        const { discoverExternalLocations } = require('../utils/osmService');
        const externalDiscover = await discoverExternalLocations(category, latitude, longitude, radiusKm);

        const validExternal = (externalDiscover || []).filter(ext =>
          !finalResults.some(db => {
            const nameMatch = (db.name || '').toLowerCase() === (ext.name || '').toLowerCase();
            const locationMatch = Math.abs(db.latitude - ext.latitude) < 0.001 &&
                                 Math.abs(db.longitude - ext.longitude) < 0.001;
            return nameMatch && locationMatch;
          })
        );

        finalResults = [...finalResults, ...validExternal];
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

    // Handle OSM external locations - they don't exist in our database
    if (id.startsWith('osm_')) {
      return res.status(404).json({ error: 'External location - details not available in database' });
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

module.exports = {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  nearbyLocations,
  incrementViewCount,
};

