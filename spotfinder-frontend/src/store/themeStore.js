import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    isDarkMode: localStorage.getItem('theme') === 'dark',
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
        const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
            document.documentElement.classList.add('dark');
            set({ isDarkMode: true });
        } else {
            document.documentElement.classList.remove('dark');
            set({ isDarkMode: false });
        }
    }
}));
