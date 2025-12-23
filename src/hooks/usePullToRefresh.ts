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
			// Only trigger if at the top of the scrollable container (content after header is at top)
			const scrollTop =
				container === document.documentElement
					? window.scrollY || document.documentElement.scrollTop
					: container.scrollTop;

			// Only start pull-to-refresh if content is exactly at the top (scrollTop === 0)
			// This means the content after the header has scrolled back to the top
			if (scrollTop === 0 && !isRefreshingRef.current) {
				touchStartY.current = e.touches[0].clientY;
				isDragging.current = true;
				isPulling.current = false; // Don't set to true until we confirm it's a pull gesture
			} else {
				// If not at top, don't interfere with normal scrolling
				isDragging.current = false;
				isPulling.current = false;
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (isRefreshingRef.current) return;

			// If we're not in a dragging state, allow normal scroll
			if (!isDragging.current) {
				return;
			}

			// Check if content is still at the top (after header)
			const scrollTop =
				container === document.documentElement
					? window.scrollY || document.documentElement.scrollTop
					: container.scrollTop;

			// If content has scrolled away from top, immediately cancel and allow normal scrolling
			if (scrollTop > 0) {
				isDragging.current = false;
				isPulling.current = false;
				pullDistanceRef.current = 0;
				setPullDistance(0);
				return; // Allow normal scrolling - don't prevent default
			}

			touchCurrentY.current = e.touches[0].clientY;
			const distance = touchCurrentY.current - touchStartY.current;

			// If user scrolls up (negative distance), cancel pull gesture and allow normal scroll
			if (distance < 0) {
				isDragging.current = false;
				isPulling.current = false;
				pullDistanceRef.current = 0;
				setPullDistance(0);
				return; // Allow normal scrolling - don't prevent default
			}

			// Only activate pull-to-refresh if:
			// 1. Content is still at the top (scrollTop === 0)
			// 2. User is pulling DOWN (distance > 0)
			// 3. The pull distance is significant enough (at least 15px) to indicate pull intent
			if (distance > 15 && scrollTop === 0) {
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
			// Check if content is still at the top before processing
			const scrollTop =
				container === document.documentElement
					? window.scrollY || document.documentElement.scrollTop
					: container.scrollTop;

			if (!isDragging.current || isRefreshingRef.current || scrollTop > 0) {
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

			// Only trigger refresh if we're still at the top and threshold is met
			if (finalDistance >= threshold && scrollTop === 0) {
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
