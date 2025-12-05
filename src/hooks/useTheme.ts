import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/themeStore';

/**
 * Hook to make components reactive to theme changes
 * Use this in any component that needs to update when theme changes
 */
export function useTheme() {
	const { theme, getEffectiveTheme } = useThemeStore();
	const [effectiveTheme, setEffectiveTheme] = useState(getEffectiveTheme());
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		// Update effective theme when store theme changes
		setEffectiveTheme(getEffectiveTheme());

		// Listen to theme changes and force re-render
		const handleThemeChange = () => {
			setEffectiveTheme(getEffectiveTheme());
			forceUpdate((prev) => prev + 1);
		};

		window.addEventListener('themechange', handleThemeChange);
		return () => window.removeEventListener('themechange', handleThemeChange);
	}, [theme, getEffectiveTheme]);

	return {
		theme,
		effectiveTheme,
		isDark: effectiveTheme === 'dark',
		isLight: effectiveTheme === 'light',
	};
}


