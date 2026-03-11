import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    isDarkMode: localStorage.getItem('theme') === 'dark', // Initially check storage, but we'll default to light if nothing is set
    toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
    }),
    initTheme: () => {
        const stored = localStorage.getItem('theme');
        // Default to light unless 'dark' is explicitly stored
        const isDark = stored === 'dark';
        if (isDark) {
            document.documentElement.classList.add('dark');
            set({ isDarkMode: true });
        } else {
            document.documentElement.classList.remove('dark');
            set({ isDarkMode: false });
            localStorage.setItem('theme', 'light');
        }
    }
}));
