import { useEffect, useState } from 'react';
import { useThemeStore, applyTheme } from '../../store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useThemeStore();
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		applyTheme(theme);

		const handleThemeChange = () => {
			requestAnimationFrame(() => {
				forceUpdate((prev) => prev + 1);
			});
		};

		window.addEventListener('themechange', handleThemeChange);

		let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

			systemThemeListener = () => {
				applyTheme('system');
			};

			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', systemThemeListener);
			} else {
				mediaQuery.addListener(systemThemeListener);
			}
		}

		return () => {
			window.removeEventListener('themechange', handleThemeChange);
			if (systemThemeListener && theme === 'system') {
				const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
				if (mediaQuery.removeEventListener) {
					mediaQuery.removeEventListener('change', systemThemeListener);
				} else {
					mediaQuery.removeListener(systemThemeListener);
				}
			}
		};
	}, [theme]);

	return <>{children}</>;
}
