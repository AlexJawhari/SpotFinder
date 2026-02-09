import { FaMapMarkerAlt, FaHeart, FaRegHeart, FaLocationArrow } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import { formatDistance } from '../../utils/formatters';
import { AMENITIES } from '../../utils/constants';

const LocationCard = ({ location, distance, isFavorited, onFavoriteToggle, onCenterOnMap }) => {
    const averageRating = location.average_rating || 0;
    const reviewCount = location.review_count || 0;

    const getAmenityIcon = (amenityId) => {
        const amenity = AMENITIES.find(a => a.id === amenityId);
        return amenity?.icon || '•';
    };

    // Format address nicely
    const formatAddress = () => {
        if (location.address && location.address !== 'Address not available') {
            return location.address;
        }
        if (location.city) {
            return location.city + (location.state ? `, ${location.state}` : '');
        }
        return 'Address not available';
    };
    return (
        <Link to={`/location/${location.id}`} className="block bg-white/95 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-2 border-white/60 hover:scale-[1.02] hover:border-[#7DD3FC]/40 group">
            <div className="relative">
                {location.images && location.images.length > 0 ? (
                    <img
                        src={location.images[0]}
                        alt={location.name}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[#4FC3F7] via-[#66BB6A] to-[#26C6DA] flex items-center justify-center relative overflow-hidden">
                        {/* Lens flare effect - Y2K Futurism */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/35 rounded-full blur-3xl"></div>
                        {/* Bubbles effect */}
                        <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                        <FaMapMarkerAlt className="text-white text-6xl opacity-95 relative z-10 drop-shadow-lg" />
                    </div>
                )}

                {onCenterOnMap && location.latitude && location.longitude && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCenterOnMap(location);
                        }}
                        className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-xl hover:shadow-2xl transition-all border border-white/60 hover:scale-[1.02] flex items-center gap-2 text-sm font-semibold text-slate-800 z-20"
                        title="Center this place on the map"
                    >
                        <FaLocationArrow className="text-[#4FC3F7]" />
                        View on map
                    </button>
                )}

                {onFavoriteToggle && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFavoriteToggle(location);
                        }}
                        className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-full shadow-xl hover:scale-110 transition-all hover:bg-white border border-white/50 z-20"
                    >
                        {isFavorited ? (
                            <FaHeart className="text-[#F9A8D4] text-xl" />
                        ) : (
                            <FaRegHeart className="text-slate-600 text-xl" />
                        )}
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#4FC3F7] transition-all leading-tight">
                        {location.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-700 bg-gradient-to-r from-[#4FC3F7]/25 to-[#66BB6A]/25 px-3 py-1.5 rounded-full border border-[#4FC3F7]/40 capitalize whitespace-nowrap ml-2 shadow-sm">
                        {location.category}
                    </span>
                </div>

                {/* Rating and Reviews - Google Maps style */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                        <StarRating rating={averageRating} size="sm" />
                        <span className="text-sm font-semibold text-slate-800 ml-1">
                            {averageRating > 0 ? averageRating.toFixed(1) : 'No rating'}
                        </span>
                    </div>
                    {reviewCount > 0 && (
                        <span className="text-sm text-slate-600">
                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                    )}
                </div>

                {/* Address - Google Maps style */}
                <div className="text-sm text-slate-700 mb-3 flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">📍</span>
                    <div>
                        {distance !== undefined && (
                            <div className="font-medium text-slate-900 mb-1">
                                {formatDistance(distance)} away
                            </div>
                        )}
                        <div className="text-slate-600 leading-relaxed">
                            {formatAddress()}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {location.description && location.description !== 'No description available' && (
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {location.description}
                    </p>
                )}

                {/* Amenities - More prominent */}
                {location.amenities && location.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                        {location.amenities.slice(0, 5).map((amenity) => (
                            <span
                                key={amenity}
                                className="text-xs font-medium bg-gradient-to-r from-[#4FC3F7]/20 to-[#66BB6A]/20 text-slate-700 px-2.5 py-1 rounded-lg border border-[#4FC3F7]/35 shadow-sm"
                            >
                                {getAmenityIcon(amenity)} {amenity.replace('_', ' ')}
                            </span>
                        ))}
                        {location.amenities.length > 5 && (
                            <span className="text-xs text-slate-500 px-2.5 py-1">
                                +{location.amenities.length - 5} more
                            </span>
                        )}
                    </div>
                )}

                {/* External location indicator */}
                {location.is_external && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-xs text-slate-500 italic">
                            🌐 Found via OpenStreetMap
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default LocationCard;
