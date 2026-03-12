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
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaCamera, FaImage } from 'react-icons/fa';
import { AMENITIES } from '../utils/constants';
import api from '../services/api';

const LocationDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuthStore();
    const [location, setLocation] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [externalReviews, setExternalReviews] = useState(null);
    const [loadingExternal, setLoadingExternal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine if this is an external location (e.g., from OSM)
                const isExternal = String(id).startsWith('osm_');
                
                const promises = [locationService.getLocation(id)];
                
                // Only fetch internal reviews if it's a database location (UUID)
                if (!isExternal) {
                    promises.push(reviewService.getReviewsForLocation(id));
                } else {
                    promises.push(Promise.resolve([]));
                }

                const [locationData, reviewsData] = await Promise.all(promises);

                setLocation(locationData);
                setReviews(reviewsData);

                // Check if favorited (only for DB locations)
                if (isAuthenticated && !isExternal) {
                    try {
                        const favorites = await favoriteService.getFavorites();
                        setIsFavorited(favorites.some(fav => fav.location_id === id));
                    } catch (favErr) {
                        console.error('Failed to load favorites:', favErr);
                    }
                }

                // Increment view count (only for DB locations)
                if (!isExternal) {
                    try {
                        await locationService.incrementViewCount(id);
                    } catch (viewErr) {
                        console.error('Failed to increment view count:', viewErr);
                    }
                }
            } catch (error) {
                console.error('Data fetch error:', error);
                toast.error('Failed to load location details');
            } finally {
                setLoading(false);
            }
        };

        const fetchExternalData = async () => {
            setLoadingExternal(true);
            try {
                const data = await locationService.getExternalReviews(id);
                setExternalReviews(data);
            } catch (error) {
                console.error('Failed to load external reviews:', error);
            } finally {
                setLoadingExternal(false);
            }
        };

        fetchData();
        fetchExternalData();
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

    const handleDeleteReview = async (reviewId) => {
        try {
            await reviewService.deleteReview(reviewId);
            setReviews(reviews.filter(r => r.id !== reviewId));
            toast.success('Review deleted');
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const getAmenityIcon = (amenityId) => {
        const amenity = AMENITIES.find(a => a.id === amenityId);
        return amenity?.icon || '•';
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!isAuthenticated) {
            toast.error('Please login to upload photos');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to Cloudinary
            const uploadRes = await api.uploadImage(file);
            const imageUrl = uploadRes.imageUrl;

            // 2. Link to location
            await locationService.addPhoto(id, imageUrl);
            
            // 3. Update local state
            setLocation(prev => ({
                ...prev,
                images: [...(prev.images || []), imageUrl]
            }));
            
            toast.success('Photo uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
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
        <div className="container mx-auto px-4 py-12 max-w-5xl animate-fadeIn">
            {/* Header / Hero Section */}
            <div className="mb-12 p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-4">
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] bg-sky-50 dark:bg-sky-900/30 text-sky-500 px-6 py-2 rounded-full border border-sky-100 dark:border-sky-800">
                                {location.category}
                            </span>
                            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                {location.name}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xl font-medium">
                                <FaMapMarkerAlt className="text-sky-400" />
                                {location.address}, {location.city}
                            </p>
                        </div>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`p-5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg border
                                ${isFavorited 
                                    ? 'bg-red-500 border-red-600 text-white shadow-red-200' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 hover:text-red-500'
                                }`}
                        >
                            {isFavorited ? <FaHeart className="text-2xl" /> : <FaRegHeart className="text-2xl" />}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-4">
                            <StarRating rating={averageRating} size="lg" />
                            <span className="font-black text-slate-900 dark:text-white text-3xl">
                                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                            </span>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                            {reviews.length} community {reviews.length === 1 ? 'review' : 'reviews'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Info & Details) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Ratings from the Web (Yelp Scraper Result) */}
                    <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="bg-[#FF0000] text-white p-2 px-4 rounded-xl text-[10px] font-black italic">Yelp</span>
                                External Discovery
                            </h3>
                        </div>

                        {loadingExternal ? (
                            <div className="flex items-center gap-4 py-8 px-10 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                                <LoadingSpinner size="md" />
                                <span className="text-slate-400 font-bold italic animate-pulse">Syncing data...</span>
                            </div>
                        ) : externalReviews && !externalReviews.error ? (
                            <div className="flex items-center gap-10">
                                <div className="text-center bg-white dark:bg-slate-900 p-10 px-12 rounded-[2rem] shadow-xl border border-slate-50 dark:border-slate-800">
                                    <div className="text-6xl font-black text-[#FF0000]">{externalReviews.rating || '—'}</div>
                                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-2">Score</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                                        {externalReviews.reviewCount ? `${externalReviews.reviewCount}+ reviews` : 'Found on Yelp'}
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
                                        Cross-referenced data to ensure the best possible community experience.
                                    </p>
                                    {externalReviews.yelpUrl && (
                                        <a 
                                            href={externalReviews.yelpUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 text-[#FF0000] font-black text-sm uppercase tracking-widest hover:translate-x-1 transition-transform"
                                        >
                                            View Source →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 bg-white/50 dark:bg-slate-900/50 rounded-3xl text-slate-400 font-bold italic text-center border border-slate-100 dark:border-white/5">
                                {externalReviews?.error || "External data currently unavailable for this location."}
                            </div>
                        )}
                    </div>

                    {/* Description Area */}
                    {location.description && (
                         <div className="p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-3xl font-black tracking-tighter italic">
                                "{location.description}"
                            </p>
                         </div>
                    )}

                    {/* Photos Gallery */}
                    <div className="space-y-8 pt-8">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <FaImage className="text-sky-400" /> Gallery
                            </h3>
                            <label className="cursor-pointer group">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <div className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all border
                                    ${uploading 
                                        ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 shadow-sm'
                                    }`}>
                                    {uploading ? <LoadingSpinner size="sm" /> : <FaCamera className="text-lg" />}
                                    <span className="font-bold text-sm">{uploading ? 'Uploading...' : 'Add Photo'}</span>
                                </div>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {location.images && location.images.length > 0 ? (
                                location.images.map((img, index) => (
                                    <div key={index} className="aspect-square rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-all duration-500 cursor-zoom-in group shadow-sm">
                                        <img src={img} alt={`${location.name} ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300">
                                    <FaCamera size={48} className="mb-4 opacity-10" />
                                    <p className="font-bold text-lg opacity-30">No photos yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Community Reviews Section */}
                    <div className="space-y-10 pt-16 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">The Community Word</h3>
                            <div className="h-1 flex-grow mx-8 bg-gradient-to-r from-sky-400 via-green-400 to-transparent rounded-full opacity-20 hidden md:block"></div>
                        </div>

                        {isAuthenticated && !reviews.some(r => r.user_id === user?.id) && (
                            <div className="relative p-1.5 bg-gradient-to-br from-sky-400 via-green-300 to-pink-300 rounded-[2.5rem] shadow-2xl">
                                <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] p-2 overflow-hidden">
                                     <ReviewForm locationId={id} onSuccess={handleReviewSuccess} />
                                </div>
                            </div>
                        )}

                        <ReviewList
                            reviews={reviews}
                            onVote={handleVoteReview}
                            currentUserId={user?.id}
                        />
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-8">

                    {/* Hours of Operation Card */}
                    {location.opening_hours && (
                        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden group">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                🕒 Hours
                            </h3>
                            <div className="grid grid-cols-1 gap-3 relative z-10">
                                {location.opening_hours.split(';').map((hoursBlock, idx) => (
                                    <div key={idx} className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <span className="font-bold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">{hoursBlock.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amenities Sidebar Card */}
                    {location.amenities && location.amenities.length > 0 && (
                        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Vibe Checklist</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {location.amenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700"
                                    >
                                        <span className="text-2xl">{getAmenityIcon(amenity)}</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interactive Sidebar Section */}
                    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-lg space-y-6">
                        <CheckInButton locationId={id} />
                        <div className="pt-6 border-t border-slate-100">
                            <WhoIsHere locationId={id} />
                        </div>
                    </div>
                    
                    {/* Discovery Tips Card */}
                    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-lg">
                        <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Pro Tip</h4>
                        <p className="font-bold text-slate-500 leading-relaxed text-sm">
                            Discover hidden gems by exploring the community's photo gallery!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailPage;
