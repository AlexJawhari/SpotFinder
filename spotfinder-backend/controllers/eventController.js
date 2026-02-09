const { supabase } = require('../config/database');
const { safeTitle, safeDescription } = require('../utils/sanitize');

const normalizeUuid = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('osm_')) return null;
    return trimmed;
};

// Create event
exports.createEvent = async (req, res) => {
    try {
        const {
            location_id,
            title,
            description,
            event_type,
            start_time,
            end_time,
            max_attendees,
            is_recurring,
            recurrence_pattern,
            image_url
        } = req.body;

        const normalizedLocationId = normalizeUuid(location_id);
        const safeTitleVal = safeTitle(title);
        if (!safeTitleVal) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{
                created_by: req.user.id,
                location_id: normalizedLocationId,
                title: safeTitleVal,
                description: safeDescription(description),
                event_type,
                start_time,
                end_time,
                max_attendees,
                is_recurring,
                recurrence_pattern,
                image_url
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all events with filters (include events from the last 24h to avoid timezone/skew hiding new events)
exports.getEvents = async (req, res) => {
    try {
        const { location_id, event_type, start_date, end_date } = req.query;

        let query = supabase
            .from('events')
            .select(`
        *,
        location:locations(*),
        creator:users!events_created_by_fkey(id, email, username)
      `)
            .order('start_time', { ascending: true });

        // Only apply default "upcoming" filter if no specific date range is requested
        if (!start_date && !end_date) {
            const now = new Date();
            const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            query = query.gte('start_time', cutoff.toISOString());
        }

        if (location_id) {
            query = query.eq('location_id', location_id);
        }

        if (event_type) {
            query = query.eq('event_type', event_type);
        }

        if (start_date) {
            query = query.gte('start_time', start_date);
        }

        if (end_date) {
            query = query.lte('start_time', end_date);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({ error: error.message });
        }

        // Calculate rsvp_count for each event
        const eventsWithCounts = await Promise.all(
            (data || []).map(async (event) => {
                try {
                    const { count, error: countError } = await supabase
                        .from('event_rsvps')
                        .select('id', { count: 'exact', head: true })
                        .eq('event_id', event.id);

                    if (countError) {
                        console.error('Error counting RSVPs:', countError);
                    }

                    return {
                        ...event,
                        rsvp_count: count || 0
                    };
                } catch (err) {
                    console.error('Error processing event:', err);
                    return {
                        ...event,
                        rsvp_count: 0
                    };
                }
            })
        );

        res.json(eventsWithCounts);
    } catch (error) {
        console.error('getEvents error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ... (getEvent and updateEvent unchanged for now, updateEvent might need admin check too but user only asked for delete)

// Get single event
exports.getEvent = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        location:locations(*),
        creator:users!events_created_by_fkey(id, email, username),
        rsvps:event_rsvps(*, user:users(id, username, email)),
        comments:event_comments(*, user:users(id, username))
      `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            event_type,
            start_time,
            end_time,
            max_attendees,
            is_recurring,
            recurrence_pattern,
            image_url
        } = req.body;

        const updatePayload = { updated_at: new Date().toISOString() };
        if (title !== undefined) updatePayload.title = safeTitle(title) ?? '';
        if (description !== undefined) updatePayload.description = safeDescription(description);
        if (event_type !== undefined) updatePayload.event_type = event_type;
        if (start_time !== undefined) updatePayload.start_time = start_time;
        if (end_time !== undefined) updatePayload.end_time = end_time;
        if (max_attendees !== undefined) updatePayload.max_attendees = max_attendees;
        if (is_recurring !== undefined) updatePayload.is_recurring = is_recurring;
        if (recurrence_pattern !== undefined) updatePayload.recurrence_pattern = recurrence_pattern;
        if (image_url !== undefined) updatePayload.image_url = image_url;

        // Check if user owns the event OR is admin
        const { data: event } = await supabase
            .from('events')
            .select('created_by')
            .eq('id', req.params.id)
            .single();

        const isAdmin = req.user.email === 'alexjw99@gmail.com' || req.user.email === 'admin@gmail.com' || req.user.isAdmin === true; // Hardcoded admin for now as requested

        if (!event || (event.created_by !== req.user.id && !isAdmin)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('events')
            .update(updatePayload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        // Check if user owns the event OR is admin
        const { data: event } = await supabase
            .from('events')
            .select('created_by')
            .eq('id', req.params.id)
            .single();

        const isAdmin = req.user.email === 'alexjw99@gmail.com' || req.user.email === 'admin@gmail.com' || req.user.isAdmin === true;

        if (!event || (event.created_by !== req.user.id && !isAdmin)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// RSVP to event
exports.rsvpEvent = async (req, res) => {
    try {
        const { status } = req.body; // going, interested, maybe

        const { data, error } = await supabase
            .from('event_rsvps')
            .upsert({
                event_id: req.params.id,
                user_id: req.user.id,
                status
            }, { onConflict: ['event_id', 'user_id'] })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove RSVP
exports.removeRsvp = async (req, res) => {
    try {
        const { error } = await supabase
            .from('event_rsvps')
            .delete()
            .eq('event_id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'RSVP removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add comment to event
exports.addComment = async (req, res) => {
    try {
        const { comment_text } = req.body;

        const { data, error } = await supabase
            .from('event_comments')
            .insert([{
                event_id: req.params.id,
                user_id: req.user.id,
                comment_text
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's events (created + RSVPed)
exports.getUserEvents = async (req, res) => {
    try {
        // Get created events
        const { data: createdEvents } = await supabase
            .from('events')
            .select('*, location:locations(*)')
            .eq('created_by', req.user.id)
            .order('start_time', { ascending: true });

        // Get RSVPed events
        const { data: rsvpedEvents } = await supabase
            .from('event_rsvps')
            .select('event:events(*, location:locations(*))')
            .eq('user_id', req.user.id);

        res.json({
            created: createdEvents || [],
            attending: rsvpedEvents?.map(r => r.event) || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
