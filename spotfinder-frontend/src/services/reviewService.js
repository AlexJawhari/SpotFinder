import api from './api';

export const reviewService = {
    // Get reviews for a location
    getReviewsForLocation: async (locationId) => {
        const response = await api.get(`/reviews/location/${locationId}`);
        return response.data;
    },

    // Create review
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    // Update review
    updateReview: async (id, reviewData) => {
        const response = await api.put(`/reviews/${id}`, reviewData);
        return response.data;
    },

    // Delete review
    deleteReview: async (id) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },

    // Vote on review (upvote/downvote)
    voteOnReview: async (id, voteType) => {
        const response = await api.post(`/reviews/${id}/vote`, { vote_type: voteType });
        return response.data;
    },
};
