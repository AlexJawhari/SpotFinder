import api from './api';

const eventService = {
    // Get all events with optional filters
    getEvents: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const { data } = await api.get(`/events?${params}`);
        return data;
    },

    // Get single event
    getEvent: async (id) => {
        const { data } = await api.get(`/events/${id}`);
        return data;
    },

    // Create event
    createEvent: async (eventData) => {
        const { data } = await api.post('/events', eventData);
        return data;
    },

    // Update event
    updateEvent: async (id, eventData) => {
        const { data } = await api.put(`/events/${id}`, eventData);
        return data;
    },

    // Delete event
    deleteEvent: async (id) => {
        const { data } = await api.delete(`/events/${id}`);
        return data;
    },

    // RSVP to event
    rsvpEvent: async (id, status) => {
        const { data } = await api.post(`/events/${id}/rsvp`, { status });
        return data;
    },

    // Remove RSVP
    removeRsvp: async (id) => {
        const { data } = await api.delete(`/events/${id}/rsvp`);
        return data;
    },

    // Add comment
    addComment: async (id, comment_text) => {
        const { data } = await api.post(`/events/${id}/comments`, { comment_text });
        return data;
    },

    // Get user's events
    getUserEvents: async () => {
        const { data } = await api.get('/events/user/my-events');
        return data;
    },
};

export default eventService;
