import api from './api';

export const userService = {
    // Get user profile
    getProfile: async (userId = null) => {
        const url = userId ? `/profile/profile/${userId}` : '/profile/profile';
        const { data } = await api.get(url);
        return data;
    },

    // Update profile
    updateProfile: async (profileData) => {
        const { data } = await api.put('/profile/profile', profileData);
        return data;
    },

    // Update account settings
    updateSettings: async (settingsData) => {
        const { data } = await api.put('/profile/settings', settingsData);
        return data;
    },

    // Follow user
    followUser: async (userId) => {
        const { data } = await api.post(`/profile/${userId}/follow`);
        return data;
    },

    // Unfollow user
    unfollowUser: async (userId) => {
        const { data } = await api.delete(`/profile/${userId}/unfollow`);
        return data;
    },

    // Get followers
    getFollowers: async (userId) => {
        const { data } = await api.get(`/profile/${userId}/followers`);
        return data;
    },

    // Get following
    getFollowing: async (userId) => {
        const { data } = await api.get(`/profile/${userId}/following`);
        return data;
    },

    // Get activity feed
    getActivityFeed: async () => {
        const { data } = await api.get('/profile/activity-feed');
        return data;
    },
};
