import api from './api';

export const favoriteService = {
    // Get user's favorites
    getFavorites: async () => {
        const response = await api.get('/favorites');
        return response.data;
    },

    // Add location to favorites
    addFavorite: async (locationId) => {
        const response = await api.post('/favorites', { location_id: locationId });
        return response.data;
    },

    // Remove location from favorites
    removeFavorite: async (favoriteId) => {
        const response = await api.delete(`/favorites/${favoriteId}`);
        return response.data;
    },

    // Check if location is favorited
    isFavorited: async (locationId, favorites) => {
        return favorites.some(fav => fav.location_id === locationId);
    },
};
