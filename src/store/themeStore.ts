import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
	getEffectiveTheme: () => 'light' | 'dark';
}

const DEFAULT_THEME: ThemeMode = 'system';

// Helper to get system preference
const getSystemTheme = (): 'light' | 'dark' => {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply theme to document
const applyTheme = (theme: ThemeMode) => {
	if (typeof window === 'undefined') return;

	const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
	const root = document.documentElement;

	// Tailwind only uses the 'dark' class
	// Always remove first, then add if needed to ensure clean state
	root.classList.remove('dark');

	if (effectiveTheme === 'dark') {
		root.classList.add('dark');
	} else {
		// Light mode - dark class already removed above
	}

	// Force a reflow to ensure the class change is applied
	// This helps with immediate visual updates
	void root.offsetHeight;

	// Dispatch custom event for components to listen
	window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: effectiveTheme } }));
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			theme: DEFAULT_THEME,

			setTheme: (theme: ThemeMode) => {
				set({ theme });
				// Apply theme immediately
				applyTheme(theme);
			},

			getEffectiveTheme: () => {
				const { theme } = get();
				return theme === 'system' ? getSystemTheme() : theme;
			},
		}),
		{
			name: 'theme-storage',
			partialize: (state) => ({
				theme: state.theme,
			}),
			onRehydrateStorage: () => (state, error) => {
				// Apply theme after rehydration
				if (state && !error) {
					// Use setTimeout to ensure DOM is ready
					setTimeout(() => {
						applyTheme(state.theme);
					}, 0);

					// Listen to system theme changes if using system mode
					if (state.theme === 'system' && typeof window !== 'undefined') {
						const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
						const handleChange = () => applyTheme('system');
						mediaQuery.addEventListener('change', handleChange);

						// Cleanup on unmount is handled by the component
					}
				} else if (error) {
					// Apply default theme on error
					setTimeout(() => {
						applyTheme(DEFAULT_THEME);
					}, 0);
				}
			},
		}
	)
);

// Export applyTheme for use in ThemeProvider
export { applyTheme };
