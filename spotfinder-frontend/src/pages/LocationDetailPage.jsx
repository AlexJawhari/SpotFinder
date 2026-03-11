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
        <div className="container mx-auto px-4 py-8 max-w-5xl animate-fadeIn">
            {/* Header / Hero Section */}
            <div className="mb-8 p-8 rounded-[2.5rem] frosted-glass border-2 border-white/80 shadow-2xl relative overflow-hidden group">
                {/* Aero lens flare effect */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-radial from-white/30 to-transparent blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-1.5 rounded-full shadow-inner border border-white/20">
                                    {location.category}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight drop-shadow-sm">
                                {location.name}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-lg">
                                <FaMapMarkerAlt className="text-sky-500" />
                                {location.address}, {location.city}
                            </p>
                        </div>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border-2 
                                ${isFavorited 
                                    ? 'bg-red-50 border-red-200 text-red-500' 
                                    : 'bg-white/80 border-white text-slate-400 hover:text-red-400'
                                }`}
                        >
                            {isFavorited ? (
                                <FaHeart className="text-3xl drop-shadow-md" />
                            ) : (
                                <FaRegHeart className="text-3xl" />
                            )}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-6">
                        <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50">
                            <StarRating rating={averageRating} size="lg" />
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-xl">
                                {averageRating.toFixed(1)}
                            </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                            Based on {reviews.length} community {reviews.length === 1 ? 'review' : 'reviews'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Info & Details) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Ratings from the Web (Yelp Scraper Result) */}
                    <div className="p-10 rounded-[2.5rem] glass-gloss relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <span className="bg-red-500 text-white p-2.5 rounded-2xl text-xs font-black italic shadow-lg">Yelp</span>
                                Ratings from the Web
                            </h3>
                        </div>

                        {loadingExternal ? (
                            <div className="flex items-center gap-4 py-4 p-6 bg-white/30 dark:bg-slate-800/40 rounded-3xl">
                                <LoadingSpinner size="md" />
                                <span className="text-slate-500 dark:text-sky-300 font-bold italic animate-pulse">Syncing with external networks...</span>
                            </div>
                        ) : externalReviews && !externalReviews.error ? (
                            <div className="flex items-center gap-10">
                                <div className="text-center bg-white/95 dark:bg-slate-800/80 p-8 rounded-[2rem] border-2 border-white shadow-2xl scale-110 ml-2 shadow-sky-100/50 dark:shadow-none">
                                    <div className="text-5xl font-black text-red-500 mb-1 drop-shadow-sm">{externalReviews.rating || '—'}</div>
                                    <div className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-1">Stars</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                                        {externalReviews.reviewCount ? `${externalReviews.reviewCount}+ Verified Reviews` : 'Found on Yelp'}
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
                                        We're pulling real-time data from across the web to help you find the absolute best spots in town.
                                    </p>
                                    {externalReviews.yelpUrl && (
                                        <a 
                                            href={externalReviews.yelpUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-block mt-4 bg-red-500 text-white px-6 py-2 rounded-full font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-none text-sm"
                                        >
                                            View Yelp Source
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-white/50 dark:bg-slate-800/50 rounded-3xl text-slate-400 font-bold italic text-center border border-white/40">
                                {externalReviews?.error || "We couldn't find external ratings for this specific location today."}
                            </div>
                        )}
                    </div>

                    {/* Description Area */}
                    {location.description && (
                         <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-green-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-sm">
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-2xl font-bold italic tracking-tight">
                                    "{location.description}"
                                </p>
                            </div>
                         </div>
                    )}

                    {/* Photos Gallery */}
                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-center bg-sky-50/50 dark:bg-sky-900/20 p-6 rounded-[2.5rem] border border-sky-100/50 relative overflow-hidden">
                            {/* Inner gloss */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                            
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4 relative z-10">
                                <FaImage className="text-sky-500 drop-shadow-md" /> Photo Gallery
                            </h3>
                            <label className="cursor-pointer group relative z-10">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <div className={`flex items-center gap-3 px-8 py-3.5 rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95 border-2 
                                    ${uploading 
                                        ? 'bg-slate-100 text-slate-400 border-white/20' 
                                        : 'bg-gradient-to-br from-[#7DD3FC] via-[#0EA5E9] to-[#0284C7] text-white border-white/50 shadow-sky-200'
                                    }`}>
                                    {uploading ? <LoadingSpinner size="sm" /> : <FaCamera className="text-xl" />}
                                    <span className="font-black text-lg tracking-tight">{uploading ? 'Processing...' : 'Add Your Photo'}</span>
                                </div>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {location.images && location.images.length > 0 ? (
                                location.images.map((img, index) => (
                                    <div key={index} className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 hover:scale-[1.05] transition-all duration-700 cursor-zoom-in group relative hover:z-10">
                                        <img src={img} alt={`${location.name} ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <span className="text-white font-black text-sm uppercase tracking-widest">Full View</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-24 bg-white/40 dark:bg-slate-800/40 rounded-[3rem] border-4 border-dashed border-sky-100/50 dark:border-slate-700 flex flex-col items-center justify-center text-slate-300">
                                    <FaCamera size={80} className="mb-6 opacity-10" />
                                    <p className="font-black text-2xl italic tracking-tighter opacity-30">The vibe is waiting for your lens...</p>
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
                    {/* Amenities Sidebar Card */}
                    {location.amenities && location.amenities.length > 0 && (
                        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                             {/* Floating bubble background details */}
                             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-sky-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/80 dark:from-slate-800/50 to-transparent pointer-events-none"></div>
                             
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-8 relative z-10 tracking-tight">Vibe Checklist</h3>
                            <div className="grid grid-cols-1 gap-4 relative z-10">
                                {location.amenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center gap-5 bg-sky-50 dark:bg-sky-900/40 p-5 rounded-3xl border border-sky-100 dark:border-sky-800 group/item hover:bg-sky-100 dark:hover:bg-sky-800 transition-all hover:scale-[1.03] shadow-sm"
                                    >
                                        <span className="text-3xl group-hover/item:scale-125 transition-transform duration-300 drop-shadow-sm">{getAmenityIcon(amenity)}</span>
                                        <span className="font-extrabold text-slate-700 dark:text-slate-100 text-lg capitalize">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interactive Sidebar Section */}
                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 border border-white/20 shadow-2xl space-y-8 relative overflow-hidden">
                        {/* Skeuomorphic gloss overlap */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <CheckInButton locationId={id} />
                        </div>
                        <div className="relative z-10 pt-8 border-t border-white/20">
                            <WhoIsHere locationId={id} />
                        </div>
                    </div>
                    
                    {/* Discovery Tips Card */}
                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-green-400 to-cyan-500 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                        <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight">Pro Tip</h4>
                        <p className="font-bold text-white/90 leading-relaxed relative z-10 italic">
                            Discover hidden gems by exploring the community's photo gallery above!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailPage;
