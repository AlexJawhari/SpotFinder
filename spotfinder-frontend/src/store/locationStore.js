import { create } from 'zustand';

export const useLocationStore = create((set) => ({
    locations: [],
    selectedLocation: null,
    loading: false,
    error: null,
    userLocation: null,

    setLocations: (locations) => set({ locations }),

    setSelectedLocation: (location) => set({ selectedLocation: location }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    setUserLocation: (coords) => set({ userLocation: coords }),

    addLocation: (location) => set((state) => ({
        locations: [...state.locations, location],
    })),

    updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map(loc =>
            loc.id === id ? { ...loc, ...updates } : loc
        ),
    })),

    removeLocation: (id) => set((state) => ({
        locations: state.locations.filter(loc => loc.id !== id),
    })),

    clearError: () => set({ error: null }),
}));
