const { supabase } = require('../config/database');

// Reuse the same UUID normalizer as posts to keep behavior consistent.
const normalizeUuid = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('osm_')) return null;
    return trimmed;
};

// Create group
exports.createGroup = async (req, res) => {
    try {
        const { name, description, group_type, is_private, location_id, image_url } = req.body;
        const normalizedLocationId = normalizeUuid(location_id);

        const { data, error } = await supabase
            .from('groups')
            .insert([{
                created_by: req.user.id,
                name,
                description,
                group_type,
                is_private,
                location_id: normalizedLocationId,
                image_url
            }])
            .select()
            .single();

        if (error) throw error;

        // Automatically add creator as admin member
        await supabase
            .from('group_members')
            .insert([{
                group_id: data.id,
                user_id: req.user.id,
                role: 'admin'
            }]);

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all groups
exports.getGroups = async (req, res) => {
    try {
        const { group_type } = req.query;

        let query = supabase
            .from('groups')
            .select(`
        *,
        creator:users!groups_created_by_fkey(id, username),
        location:locations(id, name, city)
      `)
            .eq('is_private', false)
            .order('created_at', { ascending: false });

        if (group_type) {
            query = query.eq('group_type', group_type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching groups:', error);
            return res.status(500).json({ error: error.message });
        }

        // Calculate member_count for each group
        const groupsWithCounts = await Promise.all(
            (data || []).map(async (group) => {
                try {
                    const { count, error: countError } = await supabase
                        .from('group_members')
                        .select('id', { count: 'exact', head: true })
                        .eq('group_id', group.id);

                    if (countError) {
                        console.error('Error counting group members:', countError);
                    }

                    return {
                        ...group,
                        member_count: count || 0
                    };
                } catch (err) {
                    console.error('Error processing group:', err);
                    return {
                        ...group,
                        member_count: 0
                    };
                }
            })
        );

        res.json(groupsWithCounts);
    } catch (error) {
        console.error('getGroups error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single group
exports.getGroup = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('groups')
            .select(`
        *,
        creator:users!groups_created_by_fkey(id, username),
        location:locations(id, name, city),
        members:group_members(*, user:users(id, username, email))
      `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update group
exports.updateGroup = async (req, res) => {
    try {
        const { name, description, group_type, is_private, location_id, image_url } = req.body;
        const normalizedLocationId = normalizeUuid(location_id);

        // Check if user is admin of the group
        const { data: member } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (!member || member.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('groups')
            .update({
                name,
                description,
                group_type,
                is_private,
                location_id: normalizedLocationId,
                image_url
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete group
exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const { data: group, error: fetchError } = await supabase
            .from('groups')
            .select('created_by')
            .eq('id', id)
            .single();

        if (fetchError || !group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.created_by !== req.user.id && req.user.email !== 'alexjw99@gmail.com' && req.user.email !== 'admin@gmail.com') {
            return res.status(403).json({ error: 'Not authorized to delete this group' });
        }

        // We'll attempt a direct delete first. 
        // If it fails due to FK constraints (even though cascade is set in SQL, 
        // sometimes Supabase instances/RLS have quirks), we'll catch and try cleanup.
        const { error: deleteError } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.warn('Direct group delete failed, attempting manual member cleanup:', deleteError);

            // Manual cleanup of members if cascade failed or trigger conflicted
            await supabase
                .from('group_members')
                .delete()
                .eq('group_id', id);

            // Try again
            const { error: retryError } = await supabase
                .from('groups')
                .delete()
                .eq('id', id);

            if (retryError) throw retryError;
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Group deletion error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Join group
exports.joinGroup = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('group_members')
            .insert([{
                group_id: req.params.id,
                user_id: req.user.id,
                role: 'member'
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // unique violation
                return res.status(400).json({ error: 'Already a member' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Leave group
exports.leaveGroup = async (req, res) => {
    try {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('group_members')
            .select('group:groups(*, location:locations(id, name))')
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json(data?.map(m => m.group) || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
