import React, { useRef, useEffect, useCallback, forwardRef } from 'react';

interface MentionTextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

/**
 * A textarea component that highlights mentions using contentEditable
 * This approach is used by LinkedIn, Outlook, and other professional apps
 */
const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
	function MentionTextarea(
		{ value, onChange, onKeyDown, className = '', placeholder, ...props },
		ref
	) {
		const contentEditableRef = useRef<HTMLDivElement>(null);
		const isInternalUpdateRef = useRef(false);

		// Create a proxy object that mimics textarea API for compatibility
		useEffect(() => {
			if (!contentEditableRef.current) return;

			const proxy = {
				get value() {
					return getValueFromContentEditable();
				},
				set value(val: string) {
					setContentEditableValue(val);
				},
				get selectionStart() {
					return getCaretPosition();
				},
				get selectionEnd() {
					return getCaretPosition();
				},
				setSelectionRange(start: number, end: number) {
					setCaretPosition(start, end);
				},
				focus: () => contentEditableRef.current?.focus(),
				blur: () => contentEditableRef.current?.blur(),
			};

			if (typeof ref === 'function') {
				ref(proxy as any);
			} else if (ref && typeof ref === 'object' && 'current' in ref) {
				(ref as React.MutableRefObject<any>).current = proxy;
			}
		}, [ref]);

		// Get plain text value from contentEditable (with IDs preserved)
		const getValueFromContentEditable = useCallback((): string => {
			if (!contentEditableRef.current) return value;

			// Use innerText which automatically handles line breaks from <br> and block elements
			// This is simpler and more reliable than manually parsing the DOM
			const displayText = contentEditableRef.current.innerText || contentEditableRef.current.textContent || '';

			// The contentEditable shows clean text, but we need to restore IDs
			return restoreIdsInText(displayText, value);
		}, [value]);

		// Restore IDs in text by mapping mentions
		const restoreIdsInText = useCallback(
			(displayText: string, originalValue: string): string => {
				// Extract mentions with IDs from original value, preserving their display names
				const mentionPattern =
					/(@[\w]+(?:\s+[\w]+)?)\u200C\[([^\]]+)\]|@\[([^\]]+)\]([\w]+(?:\s+[\w]+)?)/g;
				const mentionMap = new Map<string, string>(); // display name -> full mention with ID

				let match;
				while ((match = mentionPattern.exec(originalValue)) !== null) {
					const displayName = match[1] ? `@${match[1]}` : `@${match[4]}`;
					mentionMap.set(displayName, match[0]);
				}

				// Replace display mentions with stored mentions
				let result = displayText;
				const displayMentionPattern = /@[\w]+(?:\s+[\w]+)?/g;
				const matches: Array<{ text: string; index: number }> = [];

				while ((match = displayMentionPattern.exec(displayText)) !== null) {
					matches.push({ text: match[0], index: match.index });
				}

				// Replace from end to start to preserve indices
				for (let i = matches.length - 1; i >= 0; i--) {
					const displayMention = matches[i].text;
					const storedMention = mentionMap.get(displayMention);
					if (storedMention) {
						result =
							result.substring(0, matches[i].index) +
							storedMention +
							result.substring(matches[i].index + displayMention.length);
						// Remove from map to avoid duplicates
						mentionMap.delete(displayMention);
					}
				}

				return result;
			},
			[]
		);

		// Set contentEditable value (display version without IDs)
		const setContentEditableValue = useCallback(
			(val: string) => {
				if (!contentEditableRef.current) return;

				const displayValue = removeIdsFromText(val);
				const html = renderContentWithMentions(displayValue);

				isInternalUpdateRef.current = true;
				contentEditableRef.current.innerHTML = html || (placeholder ? '' : '<br>');
				isInternalUpdateRef.current = false;
			},
			[placeholder]
		);

		// Remove IDs from text for display
		const removeIdsFromText = useCallback((text: string): string => {
			return text
				.replace(/@([\w]+(?:\s+[\w]+)?)\u200C\[[^\]]+\]/g, '@$1')
				.replace(/@\[[^\]]+\](.+?)(?=\s|$)/g, '@$1');
		}, []);

		// Render content with highlighted mentions
		const renderContentWithMentions = useCallback((text: string): string => {
			const mentionPattern = /@[\w]+(?:\s+[\w]+)?/g;
			const parts: Array<{ text: string; isMention: boolean }> = [];
			let lastIndex = 0;
			let match;

			while ((match = mentionPattern.exec(text)) !== null) {
				if (match.index > lastIndex) {
					parts.push({
						text: text.substring(lastIndex, match.index),
						isMention: false,
					});
				}

				parts.push({
					text: match[0],
					isMention: true,
				});

				lastIndex = mentionPattern.lastIndex;
			}

			if (lastIndex < text.length) {
				parts.push({
					text: text.substring(lastIndex),
					isMention: false,
				});
			}

			return parts
				.map((part) => {
					if (part.isMention) {
						return `<span class="text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/20 px-1 py-0.5 rounded">${escapeHtml(
							part.text
						)}</span>`;
					}
					return escapeHtml(part.text).replace(/\n/g, '<br>');
				})
				.join('');
		}, []);

		const escapeHtml = (text: string): string => {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		};

		// Get caret position
		const getCaretPosition = useCallback((): number => {
			if (!contentEditableRef.current) return 0;

			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) return 0;

			const range = selection.getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(contentEditableRef.current);
			preCaretRange.setEnd(range.endContainer, range.endOffset);

			// Get plain text up to caret
			return preCaretRange.toString().length;
		}, []);

		// Set caret position
		const setCaretPosition = useCallback((start: number, end: number) => {
			if (!contentEditableRef.current) return;

			const selection = window.getSelection();
			if (!selection) return;

			// Find text node and offset
			const walker = document.createTreeWalker(
				contentEditableRef.current,
				NodeFilter.SHOW_TEXT,
				null
			);

			let currentOffset = 0;
			let startNode: Text | null = null;
			let startOffset = 0;
			let endNode: Text | null = null;
			let endOffset = 0;

			let node: Node | null;
			while ((node = walker.nextNode())) {
				const textNode = node as Text;
				const length = textNode.textContent?.length || 0;

				if (!startNode && currentOffset + length >= start) {
					startNode = textNode;
					startOffset = start - currentOffset;
				}

				if (currentOffset + length >= end) {
					endNode = textNode;
					endOffset = end - currentOffset;
					break;
				}

				currentOffset += length;
			}

			if (startNode) {
				const range = document.createRange();
				range.setStart(
					startNode,
					Math.min(startOffset, startNode.textContent?.length || 0)
				);
				if (endNode) {
					range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length || 0));
				} else {
					range.setEnd(
						startNode,
						Math.min(startOffset, startNode.textContent?.length || 0)
					);
				}
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}, []);

		// Track previous value to detect mention insertions
		const prevValueRef = useRef<string>(value);

		// Update contentEditable ONLY when:
		// 1. A mention is inserted (detected by new mention with ID)
		// 2. Value changes from outside (initial load, etc.)
		// NOT during normal typing
		useEffect(() => {
			// Skip if this update came from user typing (marked as internal)
			if (isInternalUpdateRef.current) {
				prevValueRef.current = value;
				return;
			}

			// Detect if a new mention was inserted (has ID that wasn't there before)
			const currentMentions =
				value.match(/@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]|@\[[^\]]+\][\w]+(?:\s+[\w]+)?/g) ||
				[];
			const prevMentions =
				prevValueRef.current.match(
					/@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]|@\[[^\]]+\][\w]+(?:\s+[\w]+)?/g
				) || [];
			const hasNewMention = currentMentions.length > prevMentions.length;

			// Get display values (without IDs)
			const displayValue = removeIdsFromText(value);
			const prevDisplayValue = removeIdsFromText(prevValueRef.current);

			// Only update if:
			// - A new mention was inserted, OR
			// - The display value changed significantly (not just from typing)
			// Skip if user is just typing normally (display value changes but no new mention)
			if (!hasNewMention && displayValue.length === prevDisplayValue.length + 1) {
				// Likely just normal typing - don't re-render
				prevValueRef.current = value;
				return;
			}

			// Save cursor position before update
			const selection = window.getSelection();
			let savedOffset = 0;
			if (selection && selection.rangeCount > 0 && contentEditableRef.current) {
				const range = selection.getRangeAt(0);
				const preCaretRange = range.cloneRange();
				preCaretRange.selectNodeContents(contentEditableRef.current);
				preCaretRange.setEnd(range.endContainer, range.endOffset);
				savedOffset = preCaretRange.toString().length;
			}

			setContentEditableValue(value);
			prevValueRef.current = value;

			// Restore cursor position after update
			if (savedOffset > 0) {
				setTimeout(() => {
					setCaretPosition(savedOffset, savedOffset);
				}, 0);
			}
		}, [value, setContentEditableValue, setCaretPosition, removeIdsFromText]);

		// Handle input - only update parent, don't re-render contentEditable during normal typing
		const handleInput = useCallback(() => {
			if (isInternalUpdateRef.current) return;

			const newValue = getValueFromContentEditable();
			const cursorPos = getCaretPosition();

			// Create synthetic event
			const syntheticEvent = {
				target: {
					value: newValue,
					selectionStart: cursorPos,
					selectionEnd: cursorPos,
				},
			} as React.ChangeEvent<HTMLTextAreaElement>;

			// Mark as internal to prevent re-render during normal typing
			isInternalUpdateRef.current = true;
			onChange(syntheticEvent);
			// Reset after a brief moment to allow mention insertions to trigger updates
			setTimeout(() => {
				isInternalUpdateRef.current = false;
			}, 10);
		}, [onChange, getValueFromContentEditable, getCaretPosition]);

		// Handle key down
		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLDivElement>) => {
				// Convert to textarea-like event
				const syntheticEvent = {
					...e,
					target: {
						...e.target,
						value: getValueFromContentEditable(),
						selectionStart: getCaretPosition(),
						selectionEnd: getCaretPosition(),
					},
				} as any;

				// Call parent handler first
				if (onKeyDown) {
					onKeyDown(syntheticEvent);
				}

				// For Enter key: if parent didn't prevent default (suggestions not showing),
				// ensure Enter creates a new line in contentEditable
				// contentEditable naturally handles Enter, but we need to ensure it's not blocked
				if (e.key === 'Enter' && !e.defaultPrevented && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
					// Let contentEditable handle Enter naturally - it will create a <br> or <div>
					// The handleInput will pick up the change
					return;
				}
			},
			[onKeyDown, getValueFromContentEditable, getCaretPosition]
		);

		// Handle paste - strip formatting
		const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			document.execCommand('insertText', false, text);
		}, []);

		// Handle placeholder
		useEffect(() => {
			if (!contentEditableRef.current) return;

			const hasContent = contentEditableRef.current.textContent?.trim().length > 0;
			if (hasContent) {
				contentEditableRef.current.removeAttribute('data-placeholder-active');
			} else {
				contentEditableRef.current.setAttribute('data-placeholder-active', 'true');
			}
		}, [value, placeholder]);

		return (
			<div className="relative w-full">
				<div
					ref={contentEditableRef}
					contentEditable
					suppressContentEditableWarning
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					className={`${className} outline-none`}
					style={{
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
						minHeight: props.rows ? `${props.rows * 1.5}em` : 'auto',
					}}
					data-placeholder={placeholder}
					role="textbox"
					aria-multiline="true"
				/>
				<style>{`
					[data-placeholder]:empty:before,
					[data-placeholder][data-placeholder-active="true"]:before {
						content: attr(data-placeholder);
						color: rgb(148 163 184);
						pointer-events: none;
						position: absolute;
					}
					.dark [data-placeholder]:empty:before,
					.dark [data-placeholder][data-placeholder-active="true"]:before {
						color: rgb(100 116 139);
					}
				`}</style>
			</div>
		);
	}
);

export default MentionTextarea;
