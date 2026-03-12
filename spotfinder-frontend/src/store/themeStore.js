import { create } from 'zustand';

export const useThemeStore = create(() => ({
    isDarkMode: false,
    toggleDarkMode: () => {},
    initTheme: () => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}));
