import api from './api';

export const groupService = {
    // Get all groups
    getGroups: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const { data } = await api.get(`/groups?${params}`);
        return data;
    },

    // Get single group
    getGroup: async (id) => {
        const { data } = await api.get(`/groups/${id}`);
        return data;
    },

    // Create group
    createGroup: async (groupData) => {
        const { data } = await api.post('/groups', groupData);
        return data;
    },

    // Update group
    updateGroup: async (id, groupData) => {
        const { data } = await api.put(`/groups/${id}`, groupData);
        return data;
    },

    // Delete group
    deleteGroup: async (id) => {
        const { data } = await api.delete(`/groups/${id}`);
        return data;
    },

    // Join group
    joinGroup: async (id) => {
        const { data } = await api.post(`/groups/${id}/join`);
        return data;
    },

    // Leave group
    leaveGroup: async (id) => {
        const { data } = await api.delete(`/groups/${id}/leave`);
        return data;
    },

    // Get user's groups
    getUserGroups: async () => {
        const { data } = await api.get('/groups/user/my-groups');
        return data;
    },
};
