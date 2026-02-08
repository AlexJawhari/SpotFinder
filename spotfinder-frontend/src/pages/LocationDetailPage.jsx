import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { locationService } from '../services/locationService';
import { reviewService } from '../services/reviewService';
import { favoriteService } from '../services/favoriteService';
import { useAuthStore } from '../store/authStore';
import StarRating from '../components/common/StarRating';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CheckInButton from '../components/checkins/CheckInButton';
import WhoIsHere from '../components/checkins/WhoIsHere';
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { AMENITIES } from '../utils/constants';

const LocationDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuthStore();
    const [location, setLocation] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [locationData, reviewsData] = await Promise.all([
                    locationService.getLocation(id),
                    reviewService.getReviewsForLocation(id),
                ]);

                setLocation(locationData);
                setReviews(reviewsData);

                // Check if favorited
                if (isAuthenticated) {
                    const favorites = await favoriteService.getFavorites();
                    setIsFavorited(favorites.some(fav => fav.location_id === id));
                }

                // Increment view count
                await locationService.incrementViewCount(id);
            } catch (error) {
                toast.error('Failed to load location');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated]);

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to favorite locations');
            return;
        }

        try {
            if (isFavorited) {
                const favorites = await favoriteService.getFavorites();
                const fav = favorites.find(f => f.location_id === id);
                if (fav) {
                    await favoriteService.removeFavorite(fav.id);
                    setIsFavorited(false);
                    toast.success('Removed from favorites');
                }
            } else {
                await favoriteService.addFavorite(id);
                setIsFavorited(true);
                toast.success('Added to favorites');
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    const handleVoteReview = async (reviewId, voteType) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        try {
            await reviewService.voteOnReview(reviewId, voteType);
            // Refresh reviews
            const updatedReviews = await reviewService.getReviewsForLocation(id);
            setReviews(updatedReviews);
            toast.success('Vote recorded');
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleReviewSuccess = async () => {
        const updatedReviews = await reviewService.getReviewsForLocation(id);
        setReviews(updatedReviews);
    };

    const getAmenityIcon = (amenityId) => {
        const amenity = AMENITIES.find(a => a.id === amenityId);
        return amenity?.icon || '•';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!location) {
        return <div className="text-center py-12">Location not found</div>;
    }

    const averageRating = location.average_rating || 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{location.name}</h1>
                        <p className="text-gray-600 flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {location.address}, {location.city}
                        </p>
                    </div>
                    <button
                        onClick={handleFavoriteToggle}
                        className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition"
                    >
                        {isFavorited ? (
                            <FaHeart className="text-red-500 text-2xl" />
                        ) : (
                            <FaRegHeart className="text-gray-600 text-2xl" />
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <StarRating rating={averageRating} size="md" />
                    <span className="text-sm text-gray-500">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
                        {location.category}
                    </span>
                </div>
            </div>

            {/* Description */}
            {location.description && (
                <div className="mb-6">
                    <p className="text-gray-700">{location.description}</p>
                </div>
            )}

            {/* Amenities */}
            {location.amenities && location.amenities.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {location.amenities.map((amenity) => (
                            <span
                                key={amenity}
                                className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                            >
                                {getAmenityIcon(amenity)} {amenity}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Check-in Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <CheckInButton locationId={id} />
                </div>
                <WhoIsHere locationId={id} />
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
                {isAuthenticated && !reviews.some(r => r.user_id === user?.id) && (
                    <ReviewForm locationId={id} onSuccess={handleReviewSuccess} />
                )}

                <ReviewList
                    reviews={reviews}
                    onVote={handleVoteReview}
                    currentUserId={user?.id}
                />
            </div>
        </div>
    );
};

export default LocationDetailPage;
