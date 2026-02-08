import { useState } from 'react';
import ReviewCard from './ReviewCard';
import LoadingSpinner from '../common/LoadingSpinner';

const ReviewList = ({ reviews = [], loading, onVote, currentUserId }) => {
    const [sortBy, setSortBy] = useState('newest');

    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'highest':
                return b.overall_rating - a.overall_rating;
            case 'lowest':
                return a.overall_rating - b.overall_rating;
            case 'helpful':
                return (b.helpful_count || 0) - (a.helpful_count || 0);
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            <div className="space-y-3">
                {sortedReviews.map(review => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        onVote={onVote}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
