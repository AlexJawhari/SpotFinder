const { supabase } = require('../config/database');

// Get or create user profile
exports.getProfile = async (req, res) => {
    try {
        const user_id = req.params.userId || req.user.id;

        let { data, error } = await supabase
            .from('user_profiles')
            .select(`
        *,
        user:users(id, username, email),
        badges:user_badges(*)
      `)
            .eq('user_id', user_id)
            .single();

        // If profile doesn't exist, create it
        if (error && error.code === 'PGRST116') {
            const { data: newProfile } = await supabase
                .from('user_profiles')
                .insert([{ user_id }])
                .select()
                .single();

            data = newProfile;
        } else if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user account settings (base user table)
exports.updateAccountSettings = async (req, res) => {
    try {
        const { username, default_radius, preferred_amenities, profile_image } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (default_radius !== undefined) updateData.default_radius = default_radius;
        if (preferred_amenities) updateData.preferred_amenities = preferred_amenities;
        if (profile_image) updateData.profile_image = profile_image;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Username already taken' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile (profile table)
exports.updateProfile = async (req, res) => {
    try {
        const { bio, interests, profile_picture_url, location_city } = req.body;

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: req.user.id,
                bio,
                interests,
                profile_picture_url,
                location_city,
                updated_at: new Date().toISOString()
            }, { onConflict: ['user_id'] })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Follow user
exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const { data, error } = await supabase
            .from('user_follows')
            .insert([{
                follower_id: req.user.id,
                following_id: userId
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Already following' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', req.user.id)
            .eq('following_id', userId);

        if (error) throw error;

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get followers
exports.getFollowers = async (req, res) => {
    try {
        const user_id = req.params.userId || req.user.id;

        const { data, error } = await supabase
            .from('user_follows')
            .select('follower:auth.users!user_follows_follower_id_fkey(id, username, email)')
            .eq('following_id', user_id);

        if (error) throw error;

        res.json(data?.map(f => f.follower) || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get following
exports.getFollowing = async (req, res) => {
    try {
        const user_id = req.params.userId || req.user.id;

        const { data, error } = await supabase
            .from('user_follows')
            .select('following:auth.users!user_follows_following_id_fkey(id, username, email)')
            .eq('follower_id', user_id);

        if (error) throw error;

        res.json(data?.map(f => f.following) || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get activity feed (posts, events, reviews from people you follow)
exports.getActivityFeed = async (req, res) => {
    try {
        // Get list of users being followed
        const { data: following } = await supabase
            .from('user_follows')
            .select('following_id')
            .eq('follower_id', req.user.id);

        const followingIds = following?.map(f => f.following_id) || [];

        if (followingIds.length === 0) {
            return res.json([]);
        }

        // Get recent posts
        const { data: posts } = await supabase
            .from('posts')
            .select('*, author:auth.users!posts_created_by_fkey(id, username), location:locations(id, name)')
            .in('created_by', followingIds)
            .order('created_at', { ascending: false })
            .limit(20);

        // Get recent events
        const { data: events } = await supabase
            .from('events')
            .select('*, creator:auth.users!events_created_by_fkey(id, username), location:locations(id, name)')
            .in('created_by', followingIds)
            .gte('start_time', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(20);

        // Combine and sort by date
        const activities = [
            ...(posts || []).map(p => ({ ...p, type: 'post' })),
            ...(events || []).map(e => ({ ...e, type: 'event' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's locations
exports.getUserLocations = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('created_by', id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('reviews')
            .select('*, location:locations(id, name)')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Note: CASCADE should handle user_profiles, user_follows, reviews, etc.
        // But auth.users is separate from our public.users table in some setups.
        // In our schema, we use public.users.
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
