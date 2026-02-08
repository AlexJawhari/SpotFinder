import { useState, useEffect } from 'react';
import LocationCard from './LocationCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useLocationStore } from '../../store/locationStore';
import { useFilterStore } from '../../store/filterStore';
import { calculateDistance } from '../../utils/formatters';

const LocationList = ({ onLocationSelect, favorites = [], onFavoriteToggle }) => {
    const { locations, loading, userLocation } = useLocationStore();
    const { sortBy } = useFilterStore();
    const [sortedLocations, setSortedLocations] = useState([]);

    useEffect(() => {
        let sorted = [...locations];

        // Calculate distances if user location is available
        if (userLocation) {
            sorted = sorted.map(loc => ({
                ...loc,
                distance: calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    parseFloat(loc.latitude),
                    parseFloat(loc.longitude)
                ),
            }));
        }

        // Sort based on selected option
        switch (sortBy) {
            case 'distance':
                if (userLocation) {
                    sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                }
                break;
            case 'rating':
                sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                break;
            case 'reviews':
                sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default:
                break;
        }

        setSortedLocations(sorted);
    }, [locations, sortBy, userLocation]);

    const isFavorited = (locationId) => {
        return favorites.some(fav => fav.location_id === locationId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (sortedLocations.length === 0) {
        return (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-6xl mb-4">🌿</div>
                <p className="text-slate-700 text-lg mb-2 font-semibold">No locations found</p>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search for nearby places</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-slate-700 font-medium bg-gradient-to-r from-[#4FC3F7]/15 to-[#66BB6A]/15 px-4 py-2 rounded-xl border border-[#B2DFDB]/40 shadow-sm">
                ✨ Found {sortedLocations.length} {sortedLocations.length === 1 ? 'location' : 'locations'}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                {sortedLocations.map((location) => (
                    <LocationCard
                        key={location.id}
                        location={location}
                        distance={location.distance}
                        isFavorited={isFavorited(location.id)}
                        onFavoriteToggle={onFavoriteToggle}
                        onCenterOnMap={onLocationSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default LocationList;
