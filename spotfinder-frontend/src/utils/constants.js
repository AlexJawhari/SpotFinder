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
    { id: 'food', label: 'Food & Dining' },
    { id: 'park', label: 'Park' },
    { id: 'bar', label: 'Bar / Nightlife' },
    { id: 'gym', label: 'Gym / Fitness' },
    { id: 'shop', label: 'Shopping' },
    { id: 'pharmacy', label: 'Pharmacy' },
    { id: 'education', label: 'Education' },
    { id: 'museum', label: 'Museum / Gallery' },
    { id: 'hotel', label: 'Hotel' },
    { id: 'cinema', label: 'Cinema / Theatre' },
    { id: 'other', label: 'Other' },
];

export const SORT_OPTIONS = [
    { id: 'distance', label: 'Distance' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'reviews', label: 'Most Reviews' },
    { id: 'newest', label: 'Newest' },
];

export const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50];

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
