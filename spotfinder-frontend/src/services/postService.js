import api from './api';

export const postService = {
    // Get posts with filters
    getPosts: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const { data } = await api.get(`/posts?${params}`);
        return data;
    },

    // Get single post
    getPost: async (id) => {
        const { data } = await api.get(`/posts/${id}`);
        return data;
    },

    // Create post
    createPost: async (postData) => {
        const { data } = await api.post('/posts', postData);
        return data;
    },

    // Update post
    updatePost: async (id, postData) => {
        const { data } = await api.put(`/posts/${id}`, postData);
        return data;
    },

    // Delete post
    deletePost: async (id) => {
        const { data } = await api.delete(`/posts/${id}`);
        return data;
    },

    // Vote on post
    votePost: async (id, vote_type) => {
        const { data } = await api.post(`/posts/${id}/vote`, { vote_type });
        return data;
    },

    // Remove vote
    removeVote: async (id) => {
        const { data } = await api.delete(`/posts/${id}/vote`);
        return data;
    },

    // Add comment
    addComment: async (id, comment_text, parent_comment_id = null) => {
        const { data } = await api.post(`/posts/${id}/comments`, { comment_text, parent_comment_id });
        return data;
    },

    // Get user's posts
    getUserPosts: async () => {
        const { data } = await api.get('/posts/user/my-posts');
        return data;
    },
};
