// App constants and configuration

export const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'outlets', label: 'Outlets', icon: '🔌' },
    { id: 'quiet', label: 'Quiet', icon: '🤫' },
    { id: 'restrooms', label: 'Restrooms', icon: '🚻' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'food', label: 'Food/Drinks', icon: '☕' },
    { id: 'outdoor', label: 'Outdoor Seating', icon: '🌳' },
];

export const CATEGORIES = [
    { id: 'cafe', label: 'Cafe' },
    { id: 'library', label: 'Library' },
    { id: 'coworking', label: 'Coworking Space' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'park', label: 'Park' },
    { id: 'other', label: 'Other' },
];

export const SORT_OPTIONS = [
    { id: 'distance', label: 'Distance' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'reviews', label: 'Most Reviews' },
    { id: 'newest', label: 'Newest' },
];

export const RADIUS_OPTIONS = [1, 3, 5, 10, 25];

export const RATING_LABELS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
};

export const DEFAULT_MAP_CENTER = {
    lat: 32.7767, // Dallas, TX (UTD area)
    lng: -96.7970,
};

export const MAP_ZOOM = 12;
