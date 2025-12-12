import { useEffect, useRef } from 'react';

/**
 * Hook to automatically scroll to the first form error
 * @param errors - The errors object from react-hook-form
 * @param options - Configuration options
 */
export function useScrollToError(
	errors: Record<string, any>,
	options: {
		enabled?: boolean;
		offset?: number;
		behavior?: ScrollBehavior;
	} = {}
) {
	const {
		enabled = true,
		offset = 100, // Offset from top of viewport
		behavior = 'smooth',
	} = options;

	const previousErrorCount = useRef(0);

	useEffect(() => {
		if (!enabled) return;

		const errorKeys = Object.keys(errors);
		const currentErrorCount = errorKeys.length;

		// Only scroll if there are new errors (not when errors are cleared)
		if (currentErrorCount > 0 && currentErrorCount !== previousErrorCount.current) {
			// Find the first error field
			const firstErrorKey = errorKeys[0];
			if (!firstErrorKey) return;

			// Try multiple strategies to find the error element
			let errorElement: HTMLElement | null = null;

			// Strategy 1: Find by name attribute (most common)
			errorElement =
				document.querySelector(`[name="${firstErrorKey}"]`) ||
				document.querySelector(`input[name="${firstErrorKey}"]`) ||
				document.querySelector(`textarea[name="${firstErrorKey}"]`) ||
				document.querySelector(`select[name="${firstErrorKey}"]`);

			// Strategy 2: Find by ID
			if (!errorElement) {
				errorElement = document.getElementById(firstErrorKey);
			}

			// Strategy 3: Find by data-error-field attribute
			if (!errorElement) {
				errorElement = document.querySelector(`[data-error-field="${firstErrorKey}"]`);
			}

			// Strategy 4: Find by aria-describedby or aria-invalid
			if (!errorElement) {
				const elementsWithAria = document.querySelectorAll(
					`[aria-invalid="true"], [aria-describedby*="${firstErrorKey}"]`
				);
				if (elementsWithAria.length > 0) {
					errorElement = elementsWithAria[0] as HTMLElement;
				}
			}

			// Strategy 5: Find parent container with error class
			if (!errorElement) {
				const errorMessages = document.querySelectorAll(
					'.text-error-600, .text-error-400, [class*="error"]'
				);
				if (errorMessages.length > 0) {
					// Find the closest input/textarea/select to the error message
					const errorMsg = errorMessages[0] as HTMLElement;
					const formGroup = errorMsg.closest(
						'.space-y-4, .space-y-2, form, [class*="form"]'
					);
					if (formGroup) {
						errorElement = formGroup.querySelector(
							'input, textarea, select'
						) as HTMLElement;
					}
				}
			}

			if (errorElement) {
				// Small delay to ensure DOM is updated
				setTimeout(() => {
					const elementPosition = errorElement!.getBoundingClientRect().top;
					const offsetPosition = elementPosition + window.pageYOffset - offset;

					window.scrollTo({
						top: offsetPosition,
						behavior,
					});

					// Focus the element for better accessibility
					if (
						errorElement instanceof HTMLInputElement ||
						errorElement instanceof HTMLTextAreaElement ||
						errorElement instanceof HTMLSelectElement
					) {
						errorElement.focus();
					}
				}, 100);
			}
		}

		previousErrorCount.current = currentErrorCount;
	}, [errors, enabled, offset, behavior]);
}
