import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import MapView from '../components/map/MapView';
import LocationList from '../components/locations/LocationList';
import ErrorBoundary from '../components/common/ErrorBoundary';
import FilterPanel from '../components/filters/FilterPanel';
import CurrentLocationButton from '../components/map/CurrentLocationButton';
import { locationService } from '../services/locationService';
import { favoriteService } from '../services/favoriteService';
import { geolocationService } from '../services/geolocationService';
import { useLocationStore } from '../store/locationStore';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';
import { useDebounce } from '../hooks/useDebounce';
import { DEFAULT_MAP_CENTER } from '../utils/constants';
import { calculateDistance } from '../utils/formatters';

const Home = () => {
    const { locations, selectedLocation, setLocations, setLoading, setSelectedLocation, userLocation, setUserLocation } = useLocationStore();
    const { radius, amenities, category, minRating, searchQuery, setSearchQuery } = useFilterStore();
    const { isAuthenticated } = useAuthStore();
    const [favorites, setFavorites] = useState([]);
    const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
    const [searchAnchor, setSearchAnchor] = useState(DEFAULT_MAP_CENTER);
    const [viewportCenter, setViewportCenter] = useState(DEFAULT_MAP_CENTER);
    const [viewportBounds, setViewportBounds] = useState(null);
    const [useViewportRadius, setUseViewportRadius] = useState(false);
    const [viewportRadiusMiles, setViewportRadiusMiles] = useState(null);
    const [locationInitialized, setLocationInitialized] = useState(false);
    const [searchDraft, setSearchDraft] = useState(searchQuery || '');
    
    // Debounce the draft value so the list/map updates as you type, without spamming requests.
    const debouncedSearchDraft = useDebounce(searchDraft, 450);

    useEffect(() => {
        setSearchDraft(searchQuery || '');
    }, [searchQuery]);

    useEffect(() => {
        const next = (debouncedSearchDraft || '').trim();
        if (next === (searchQuery || '')) return;
        setSearchQuery(next);
    }, [debouncedSearchDraft, searchQuery, setSearchQuery]);

    const isSearchAreaDirty = useMemo(() => {
        if (!viewportCenter || !searchAnchor) return false;
        const miles = calculateDistance(searchAnchor.lat, searchAnchor.lng, viewportCenter.lat, viewportCenter.lng);
        return miles > 0.35; // ~0.35 miles feels like "moved enough" for a Search-this-area prompt
    }, [searchAnchor, viewportCenter]);

    const effectiveRadiusMiles = useMemo(() => {
        if (useViewportRadius && viewportRadiusMiles && Number.isFinite(viewportRadiusMiles)) {
            return Math.max(0.5, Math.min(50, viewportRadiusMiles));
        }
        return radius;
    }, [radius, useViewportRadius, viewportRadiusMiles]);

    // If the user manually changes radius in the filter panel, treat that as the source of truth again.
    useEffect(() => {
        setUseViewportRadius(false);
    }, [radius]);

    // Request user location on page load with IP fallback - only run once
    useEffect(() => {
        if (!locationInitialized) {
            setLocationInitialized(true);
            
            // Try browser geolocation first
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        setUserLocation(coords);
                        setMapCenter({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                        setSearchAnchor({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                        setViewportCenter({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                    },
                    async (error) => {
                        console.log('Browser geolocation denied, using IP geolocation:', error.message);
                        // Fallback to IP geolocation immediately
                        try {
                            const ipLocation = await geolocationService.getLocationFromIP();
                            console.log('IP geolocation result:', ipLocation);
                            if (ipLocation && ipLocation.latitude && ipLocation.longitude) {
                                const coords = {
                                    latitude: ipLocation.latitude,
                                    longitude: ipLocation.longitude,
                                };
                                setUserLocation(coords);
                                setMapCenter({
                                    lat: coords.latitude,
                                    lng: coords.longitude,
                                });
                                setSearchAnchor({
                                    lat: coords.latitude,
                                    lng: coords.longitude,
                                });
                                setViewportCenter({
                                    lat: coords.latitude,
                                    lng: coords.longitude,
                                });
                            } else {
                                // Use default Dallas location
                                setMapCenter(DEFAULT_MAP_CENTER);
                                setSearchAnchor(DEFAULT_MAP_CENTER);
                                setViewportCenter(DEFAULT_MAP_CENTER);
                            }
                        } catch (ipError) {
                            console.error('IP geolocation failed:', ipError);
                            // Use default center
                            setMapCenter(DEFAULT_MAP_CENTER);
                            setSearchAnchor(DEFAULT_MAP_CENTER);
                            setViewportCenter(DEFAULT_MAP_CENTER);
                        }
                    },
                    {
                        enableHighAccuracy: false, // Faster, less accurate is fine
                        timeout: 3000, // Shorter timeout
                        maximumAge: 300000, // Accept cached location up to 5 minutes old
                    }
                );
            } else {
                // Browser doesn't support geolocation, use IP immediately
                geolocationService.getLocationFromIP().then(ipLocation => {
                    console.log('IP geolocation result (no browser support):', ipLocation);
                    if (ipLocation && ipLocation.latitude && ipLocation.longitude) {
                        const coords = {
                            latitude: ipLocation.latitude,
                            longitude: ipLocation.longitude,
                        };
                        setUserLocation(coords);
                        setMapCenter({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                        setSearchAnchor({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                        setViewportCenter({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                    } else {
                        setMapCenter(DEFAULT_MAP_CENTER);
                        setSearchAnchor(DEFAULT_MAP_CENTER);
                        setViewportCenter(DEFAULT_MAP_CENTER);
                    }
                }).catch(() => {
                    setMapCenter(DEFAULT_MAP_CENTER);
                    setSearchAnchor(DEFAULT_MAP_CENTER);
                    setViewportCenter(DEFAULT_MAP_CENTER);
                });
            }
        }
    }, [locationInitialized, setUserLocation]);

    // Fetch locations - use debounced search query
    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const filters = {
                    category,
                    amenities,
                    minRating,
                    search: searchQuery, // already debounced via draft
                    discover: !searchQuery, // default map data when user hasn't searched yet
                };

                // Anchor searches to either the user's location or the last explicit map area search.
                const anchor = searchAnchor || (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null) || DEFAULT_MAP_CENTER;
                filters.lat = anchor.lat;
                filters.lng = anchor.lng;
                filters.radius = effectiveRadiusMiles ?? 5;

                const data = await locationService.getLocations(filters);
                setLocations(Array.isArray(data) ? data : []);
                
                // Center map on results after a search (Maps-like behavior)
                if (searchQuery && data && data.length > 0) {
                    const validLocations = data.filter(loc => loc.latitude && loc.longitude);
                    if (validLocations.length > 0) {
                        const avgLat = validLocations.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) / validLocations.length;
                        const avgLng = validLocations.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) / validLocations.length;
                        setMapCenter({ lat: avgLat, lng: avgLng });
                    }
                }
            } catch (error) {
                console.error('Failed to load locations:', error);
                if (!searchQuery) toast.error('Failed to load locations');
                setLocations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [category, amenities, minRating, searchQuery, userLocation, effectiveRadiusMiles, searchAnchor, setLocations, setLoading]);

    // Fetch favorites if authenticated
    useEffect(() => {
        const fetchFavorites = async () => {
            if (isAuthenticated) {
                try {
                    const data = await favoriteService.getFavorites();
                    setFavorites(data);
                } catch (error) {
                    console.error('Failed to load favorites:', error);
                }
            }
        };

        fetchFavorites();
    }, [isAuthenticated]);

    const handleMarkerClick = (location) => {
        setSelectedLocation(location);
        if (location?.latitude && location?.longitude) {
            setMapCenter({ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) });
        }
    };

    const handleLocationFound = (coords) => {
        setMapCenter({
            lat: coords.latitude,
            lng: coords.longitude,
        });
        setSearchAnchor({
            lat: coords.latitude,
            lng: coords.longitude,
        });
    };

    const handleViewportChanged = (v) => {
        if (v?.center?.lat && v?.center?.lng) {
            setViewportCenter({ lat: v.center.lat, lng: v.center.lng });
        }
        if (v?.bounds) {
            setViewportBounds(v.bounds);
            if (v?.center?.lat && v?.center?.lng) {
                const r = calculateDistance(v.center.lat, v.center.lng, v.bounds.north, v.bounds.east);
                if (Number.isFinite(r)) setViewportRadiusMiles(r);
            }
        }
    };

    const submitSearch = () => {
        const nextQuery = (searchDraft || '').trim();
        setSearchQuery(nextQuery); // commit immediately (no debounce) when user explicitly submits
        setSearchAnchor(viewportCenter || mapCenter);
        setMapCenter(viewportCenter || mapCenter);
        setUseViewportRadius(false);
    };

    const searchThisArea = () => {
        setSearchAnchor(viewportCenter || mapCenter);
        setMapCenter(viewportCenter || mapCenter);
        setUseViewportRadius(true);
        toast.info('Searching this area...');
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        if (location?.latitude && location?.longitude) {
            setMapCenter({ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) });
        }
    };

    const handleFavoriteToggle = async (location) => {
        if (!isAuthenticated) {
            toast.error('Please login to favorite locations');
            return;
        }

        try {
            const fav = favorites.find(f => f.location_id === location.id);
            if (fav) {
                await favoriteService.removeFavorite(fav.id);
                setFavorites(favorites.filter(f => f.id !== fav.id));
                toast.success('Removed from favorites');
            } else {
                const newFav = await favoriteService.addFavorite(location.id);
                setFavorites([...favorites, newFav]);
                toast.success('Added to favorites');
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    return (
        <div className="relative z-10 isolation-isolate h-[calc(100vh-72px)] min-h-0">
            {/* Full map canvas – isolated so map errors don't hide the locations panel */}
            <div className="absolute inset-0 z-0">
                <ErrorBoundary>
                    <MapView
                        locations={locations}
                        onMarkerClick={handleMarkerClick}
                        onViewportChanged={handleViewportChanged}
                        selectedLocationId={selectedLocation?.id}
                        center={mapCenter}
                    />
                </ErrorBoundary>
                <CurrentLocationButton onLocationFound={handleLocationFound} />
            </div>

            {/* Top search bar – on desktop sits right of filter panel to avoid clipping */}
            <div className="absolute top-4 left-4 right-4 md:left-[456px] md:right-4 md:max-w-[520px] z-[1000]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitSearch();
                    }}
                    className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden flex items-center"
                >
                    <input
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder="Search places (cafes, libraries, parks...)"
                        className="w-full md:w-[520px] px-5 py-4 bg-transparent outline-none text-slate-900 placeholder:text-slate-500"
                    />
                    {searchDraft?.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchDraft('');
                                setSearchQuery('');
                            }}
                            className="px-4 py-4 text-slate-600 hover:text-slate-900 transition"
                            title="Clear"
                        >
                            ✕
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-5 py-4 bg-gradient-to-br from-[#4FC3F7] to-[#66BB6A] text-white font-semibold hover:brightness-110 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Search this area prompt */}
            {isSearchAreaDirty && (
                <div className="absolute top-[92px] left-1/2 -translate-x-1/2 z-[1000]">
                    <button
                        onClick={searchThisArea}
                        className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border border-white/60 text-slate-900 font-semibold hover:scale-[1.02] transition"
                    >
                        Search this area{viewportRadiusMiles ? ` (~${Math.round(viewportRadiusMiles)} mi)` : ''}
                    </button>
                </div>
            )}

            {/* Desktop panel */}
            <div className="hidden md:block absolute top-4 left-4 bottom-4 w-[440px] z-[900]">
                <div className="h-full overflow-hidden bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/40">
                    <div className="h-full overflow-y-auto p-4 space-y-4">
                        <FilterPanel hideSearch />
                        <LocationList
                            onLocationSelect={handleLocationSelect}
                            favorites={favorites}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile bottom sheet */}
            <div className="md:hidden absolute left-3 right-3 bottom-3 z-[900]">
                <div className="max-h-[46vh] overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/40">
                    <div className="h-full max-h-[46vh] overflow-y-auto p-4 space-y-4">
                        <FilterPanel hideSearch />
                        <LocationList
                            onLocationSelect={handleLocationSelect}
                            favorites={favorites}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
