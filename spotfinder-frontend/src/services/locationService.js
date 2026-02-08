import api from './api';

export const locationService = {
    // Get all locations with optional filters
    getLocations: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.amenities?.length) params.append('amenities', filters.amenities.join(','));
        if (filters.minRating) params.append('minRating', filters.minRating);
        if (filters.search && String(filters.search).trim()) params.append('search', String(filters.search).trim());
        // When there is no search query, request discover so the map gets baseline POI data
        if (filters.discover || !filters.search) params.append('discover', '1');
        if (filters.lat != null && filters.lng != null) {
            params.append('lat', filters.lat);
            params.append('lng', filters.lng);
        }
        if (filters.radius != null) params.append('radius', filters.radius);

        const response = await api.get(`/locations?${params.toString()}`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // Get nearby locations
    getNearby: async (latitude, longitude, radius = 5) => {
        const response = await api.get('/locations/nearby', {
            params: { latitude, longitude, radius },
        });
        return response.data;
    },

    // Get single location by ID
    getLocation: async (id) => {
        const response = await api.get(`/locations/${id}`);
        return response.data;
    },

    // Create new location
    createLocation: async (locationData) => {
        const response = await api.post('/locations', locationData);
        return response.data;
    },

    // Update location
    updateLocation: async (id, locationData) => {
        const response = await api.put(`/locations/${id}`, locationData);
        return response.data;
    },

    // Delete location
    deleteLocation: async (id) => {
        const response = await api.delete(`/locations/${id}`);
        return response.data;
    },

    // Increment view count
    incrementViewCount: async (id) => {
        const response = await api.post(`/locations/${id}/view`);
        return response.data;
    },
};
