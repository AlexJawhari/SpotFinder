import api from './api';

export const checkInService = {
    // Check in to location
    checkIn: async (location_id) => {
        const { data } = await api.post('/check-ins', { location_id });
        return data;
    },

    // Check out
    checkOut: async (id) => {
        const { data } = await api.put(`/check-ins/${id}/checkout`);
        return data;
    },

    // Get check-ins for a location
    getLocationCheckIns: async (locationId) => {
        const { data } = await api.get(`/check-ins/location/${locationId}`);
        return data;
    },

    // Get user's check-in history
    getUserCheckIns: async () => {
        const { data } = await api.get('/check-ins/user/history');
        return data;
    },

    // Get trending locations
    getTrendingLocations: async () => {
        const { data } = await api.get('/check-ins/trending');
        return data;
    },
};
