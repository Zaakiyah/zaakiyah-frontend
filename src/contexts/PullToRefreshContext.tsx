import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react';

interface PullToRefreshContextType {
	registerRefresh: (path: string, refreshFn: () => Promise<void> | void) => () => void;
	getRefreshFunction: (path: string) => (() => Promise<void> | void) | null;
}

const PullToRefreshContext = createContext<PullToRefreshContextType | null>(null);

export function PullToRefreshProvider({ children }: { children: ReactNode }) {
	const refreshFunctionsRef = useRef<Map<string, () => Promise<void> | void>>(new Map());

	const registerRefresh = useCallback(
		(path: string, refreshFn: () => Promise<void> | void) => {
			refreshFunctionsRef.current.set(path, refreshFn);
			// Return unregister function
			return () => {
				refreshFunctionsRef.current.delete(path);
			};
		},
		[]
	);

	const getRefreshFunction = useCallback((path: string) => {
		// Try exact path first
		if (refreshFunctionsRef.current.has(path)) {
			return refreshFunctionsRef.current.get(path) || null;
		}
		
		// Try to find a matching route pattern (for dynamic routes)
		for (const [registeredPath, fn] of refreshFunctionsRef.current.entries()) {
			// Simple pattern matching - could be enhanced
			if (path.startsWith(registeredPath) || registeredPath.includes('*')) {
				return fn;
			}
		}
		
		return null;
	}, []);

	return (
		<PullToRefreshContext.Provider value={{ registerRefresh, getRefreshFunction }}>
			{children}
		</PullToRefreshContext.Provider>
	);
}

export function usePullToRefreshContext() {
	const context = useContext(PullToRefreshContext);
	if (!context) {
		throw new Error('usePullToRefreshContext must be used within PullToRefreshProvider');
	}
	return context;
}


