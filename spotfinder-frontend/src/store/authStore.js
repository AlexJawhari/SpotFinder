import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
    user: authService.getStoredUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: authService.isAuthenticated(),

    login: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (updates) => {
        set((state) => ({
            user: { ...state.user, ...updates },
        }));
    },

    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },
}));
