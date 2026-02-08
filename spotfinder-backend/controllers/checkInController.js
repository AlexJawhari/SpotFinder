const { supabase } = require('../config/database');

// Check in to location
exports.checkIn = async (req, res) => {
    try {
        const { location_id } = req.body;

        // Check if user is already checked in to this location
        const { data: existing } = await supabase
            .from('check_ins')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('location_id', location_id)
            .eq('status', 'here_now')
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already checked in to this location' });
        }

        const { data, error } = await supabase
            .from('check_ins')
            .insert([{
                user_id: req.user.id,
                location_id,
                status: 'here_now'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check out from location
exports.checkOut = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('check_ins')
            .update({
                status: 'left',
                check_out_time: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current check-ins for a location (who's here now)
exports.getLocationCheckIns = async (req, res) => {
    try {
        const { locationId } = req.params;

        // Get check-ins from last 4 hours that are "here_now"
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('check_ins')
            .select('*, user:auth.users(id, username, email)')
            .eq('location_id', locationId)
            .eq('status', 'here_now')
            .gte('check_in_time', fourHoursAgo)
            .order('check_in_time', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's check-in history
exports.getUserCheckIns = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('check_ins')
            .select('*, location:locations(id, name, city, category)')
            .eq('user_id', req.user.id)
            .order('check_in_time', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get trending/"hot" locations (most check-ins recently)
exports.getTrendingLocations = async (req, res) => {
    try {
        // Get check-ins from last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('check_ins')
            .select('location_id, location:locations(id, name, city, category, average_rating, images)')
            .gte('check_in_time', sevenDaysAgo);

        if (error) throw error;

        // Count check-ins per location
        const locationCounts = {};
        data.forEach(checkIn => {
            if (checkIn.location) {
                const id = checkIn.location.id;
                if (!locationCounts[id]) {
                    locationCounts[id] = {
                        ...checkIn.location,
                        check_in_count: 0
                    };
                }
                locationCounts[id].check_in_count++;
            }
        });

        // Convert to array and sort
        const trending = Object.values(locationCounts)
            .sort((a, b) => b.check_in_count - a.check_in_count)
            .slice(0, 10);

        res.json(trending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
