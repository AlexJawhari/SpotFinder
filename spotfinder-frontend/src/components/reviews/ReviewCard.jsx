import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import StarRating from '../common/StarRating';
import { formatRelativeTime } from '../../utils/formatters';

const ReviewCard = ({ review, onVote, currentUserId }) => {
    const isOwnReview = review.user_id === currentUserId;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-semibold text-gray-900">{review.username || 'Anonymous'}</h4>
                    <p className="text-sm text-gray-500">{formatRelativeTime(review.created_at)}</p>
                </div>
                <StarRating rating={review.overall_rating} size="sm" />
            </div>

            {review.review_text && (
                <p className="text-gray-700 mb-3">{review.review_text}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mb-3">
                {review.wifi_rating && (
                    <div className="text-sm">
                        <span className="text-gray-600">WiFi:</span>{' '}
                        <span className="font-semibold">{review.wifi_rating}/5</span>
                    </div>
                )}
                {review.seating_rating && (
                    <div className="text-sm">
                        <span className="text-gray-600">Seating:</span>{' '}
                        <span className="font-semibold">{review.seating_rating}/5</span>
                    </div>
                )}
                {review.noise_rating && (
                    <div className="text-sm">
                        <span className="text-gray-600">Noise:</span>{' '}
                        <span className="font-semibold">{review.noise_rating}/5</span>
                    </div>
                )}
            </div>

            {onVote && !isOwnReview && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Helpful?</span>
                    <button
                        onClick={() => onVote(review.id, 'upvote')}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition"
                    >
                        <FaThumbsUp />
                        <span>{review.helpful_count || 0}</span>
                    </button>
                    <button
                        onClick={() => onVote(review.id, 'downvote')}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
                    >
                        <FaThumbsDown />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
