import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
	onRefresh: () => Promise<void> | void;
	enabled?: boolean;
	threshold?: number; // Distance in pixels to trigger refresh
}

export function usePullToRefresh({
	onRefresh,
	enabled = true,
	threshold = 80,
}: UsePullToRefreshOptions) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [pullDistance, setPullDistance] = useState(0);
	const containerRef = useRef<HTMLElement | null>(null);
	const isPulling = useRef(false);
	const touchStartY = useRef(0);
	const touchCurrentY = useRef(0);
	const isDragging = useRef(false);
	const onRefreshRef = useRef(onRefresh);
	const pullDistanceRef = useRef(0);
	const isRefreshingRef = useRef(false);

	// Keep refs up to date
	useEffect(() => {
		onRefreshRef.current = onRefresh;
		isRefreshingRef.current = isRefreshing;
	}, [onRefresh, isRefreshing]);

	useEffect(() => {
		if (!enabled) return;

		const container = containerRef.current || document.documentElement;

		const handleTouchStart = (e: TouchEvent) => {
			// Only trigger if at the top of the scrollable container
			const scrollTop =
				container === document.documentElement
					? window.scrollY || document.documentElement.scrollTop
					: container.scrollTop;

			// Only start pull-to-refresh if we're at the very top (0 or very close)
			if (scrollTop <= 1 && !isRefreshingRef.current) {
				touchStartY.current = e.touches[0].clientY;
				isDragging.current = true;
				isPulling.current = false; // Don't set to true until we confirm it's a pull gesture
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (isRefreshingRef.current) return;

			// If we're not in a dragging state, allow normal scroll
			if (!isDragging.current) {
				return;
			}

			touchCurrentY.current = e.touches[0].clientY;
			const distance = touchCurrentY.current - touchStartY.current;

			// Check if we're still at the top
			const scrollTop =
				container === document.documentElement
					? window.scrollY || document.documentElement.scrollTop
					: container.scrollTop;

			// If user scrolls up (negative distance) or page has scrolled down, cancel pull gesture
			if (distance < 0 || scrollTop > 1) {
				isDragging.current = false;
				isPulling.current = false;
				pullDistanceRef.current = 0;
				setPullDistance(0);
				return; // Allow normal scrolling - don't prevent default
			}

			// Only activate pull-to-refresh if:
			// 1. User is pulling DOWN (distance > 0)
			// 2. We're still at the top of the page
			// 3. The pull distance is significant enough (at least 15px) to indicate pull intent
			if (distance > 15 && scrollTop <= 1) {
				// This is a confirmed pull-to-refresh gesture
				isPulling.current = true;
				e.preventDefault(); // Only prevent default when we're actually pulling
				const pullAmount = Math.min(distance, threshold * 2); // Allow over-pull for visual feedback
				pullDistanceRef.current = pullAmount;
				setPullDistance(pullAmount);
			}
			// If distance is 0-15px, don't prevent default - allow normal scroll to happen
		};

		const handleTouchEnd = async () => {
			if (!isDragging.current || isRefreshingRef.current) {
				isDragging.current = false;
				isPulling.current = false;
				pullDistanceRef.current = 0;
				setPullDistance(0);
				return;
			}

			const finalDistance = pullDistanceRef.current;
			isDragging.current = false;
			isPulling.current = false;
			pullDistanceRef.current = 0;
			setPullDistance(0);

			if (finalDistance >= threshold) {
				setIsRefreshing(true);
				try {
					await onRefreshRef.current();
				} catch (error) {
					console.error('Error refreshing:', error);
				} finally {
					setIsRefreshing(false);
				}
			}
		};

		// Add touch event listeners
		container.addEventListener('touchstart', handleTouchStart, { passive: false });
		container.addEventListener('touchmove', handleTouchMove, { passive: false });
		container.addEventListener('touchend', handleTouchEnd);

		return () => {
			container.removeEventListener('touchstart', handleTouchStart);
			container.removeEventListener('touchmove', handleTouchMove);
			container.removeEventListener('touchend', handleTouchEnd);
		};
	}, [enabled, threshold]);

	return {
		containerRef,
		isRefreshing,
		pullDistance,
		isPulling: isPulling.current,
	};
}
