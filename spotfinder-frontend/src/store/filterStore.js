import { create } from 'zustand';

export const useFilterStore = create((set) => ({
    radius: 5, // miles
    amenities: [],
    category: '',
    minRating: 0,
    searchQuery: '',
    sortBy: 'distance', // distance, rating, reviews, newest

    setRadius: (radius) => set({ radius }),

    setAmenities: (amenities) => set({ amenities }),

    toggleAmenity: (amenity) => set((state) => ({
        amenities: state.amenities.includes(amenity)
            ? state.amenities.filter(a => a !== amenity)
            : [...state.amenities, amenity],
    })),

    setCategory: (category) => set({ category }),

    setMinRating: (minRating) => set({ minRating }),

    setSearchQuery: (searchQuery) => set({ searchQuery }),

    setSortBy: (sortBy) => set({ sortBy }),

    resetFilters: () => set({
        radius: 5,
        amenities: [],
        category: '',
        minRating: 0,
        searchQuery: '',
        sortBy: 'distance',
    }),
}));
