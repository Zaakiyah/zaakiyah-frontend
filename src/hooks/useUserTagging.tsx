import { useState, useEffect, useRef, useCallback } from 'react';
import { communityService } from '../services/communityService';
import { logger } from '../utils/logger';
import Avatar from '../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

export interface UserTag {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	avatarUrl: string | null;
	isVerified: boolean;
	isAdmin: boolean;
}

interface UseUserTaggingProps {
	value: string;
	onChange: (value: string) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	currentUserId?: string; // ID of the authenticated user to filter out from suggestions
}

export function useUserTagging({
	value,
	onChange,
	textareaRef,
	currentUserId,
}: UseUserTaggingProps) {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<UserTag[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [mentionStart, setMentionStart] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Search users when query changes
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		if (!searchQuery.trim() || !showSuggestions) {
			setSuggestions([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);
		debounceTimerRef.current = setTimeout(async () => {
			try {
				const response = await communityService.searchUsers(searchQuery, 10);
				if (response.data) {
					// Filter out the current user from suggestions
					const filteredSuggestions = currentUserId
						? response.data.filter((user) => user.id !== currentUserId)
						: response.data;
					setSuggestions(filteredSuggestions);
					setSelectedIndex(0);
				}
			} catch (error) {
				logger.error('Error searching users:', error);
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [searchQuery, showSuggestions, currentUserId]);

	// Handle keyboard navigation in suggestions
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (!showSuggestions || suggestions.length === 0) {
				// Handle backspace deletion of mentions
				if (e.key === 'Backspace' && textareaRef.current) {
					const textarea = textareaRef.current;
					const cursorPosition = textarea.selectionStart;
					const textBeforeCursor = value.substring(0, cursorPosition);

					// Check if cursor is at the end of a completed mention with ID (using zero-width char)
					// Format: @FirstName LastName\u200C[userId]
					const completedMentionMatch = textBeforeCursor.match(
						/@([\w]+(?:\s+[\w]+)?)\u200C\[([^\]]+)\]\s*$/
					);
					if (completedMentionMatch) {
						const nameText = completedMentionMatch[1];
						const userId = completedMentionMatch[2];
						const mentionStartPos = textBeforeCursor.lastIndexOf('@');
						const nameParts = nameText.trim().split(/\s+/);

						if (nameParts.length === 2) {
							// If deleting from last name, remove entire last name
							e.preventDefault();
							const newContent =
								value.substring(0, mentionStartPos) +
								`@${nameParts[0]}\u200C[${userId}] ` +
								value.substring(cursorPosition);
							onChange(newContent);
							setTimeout(() => {
								const newPos =
									mentionStartPos + `@${nameParts[0]}\u200C[${userId}] `.length;
								textarea.setSelectionRange(newPos, newPos);
							}, 0);
							return;
						} else if (nameParts.length === 1) {
							// If deleting from first name, remove entire mention
							e.preventDefault();
							const newContent =
								value.substring(0, mentionStartPos) +
								value.substring(cursorPosition);
							onChange(newContent);
							setTimeout(() => {
								textarea.setSelectionRange(mentionStartPos, mentionStartPos);
							}, 0);
							return;
						}
					}

					// Also check for legacy format: @[userId]FirstName LastName
					const legacyMentionMatch = textBeforeCursor.match(
						/@\[([^\]]+)\]([\w]+(?:\s+[\w]+)?)\s*$/
					);
					if (legacyMentionMatch) {
						const nameText = legacyMentionMatch[2];
						const mentionStartPos = textBeforeCursor.lastIndexOf('@');
						const nameParts = nameText.trim().split(/\s+/);

						if (nameParts.length === 2) {
							// If deleting from last name, remove entire last name
							e.preventDefault();
							const userId = legacyMentionMatch[1];
							const newContent =
								value.substring(0, mentionStartPos) +
								`@[${userId}]${nameParts[0]} ` +
								value.substring(cursorPosition);
							onChange(newContent);
							setTimeout(() => {
								const newPos =
									mentionStartPos + `@[${userId}]${nameParts[0]} `.length;
								textarea.setSelectionRange(newPos, newPos);
							}, 0);
							return;
						} else if (nameParts.length === 1) {
							// If deleting from first name, remove entire mention
							e.preventDefault();
							const newContent =
								value.substring(0, mentionStartPos) +
								value.substring(cursorPosition);
							onChange(newContent);
							setTimeout(() => {
								textarea.setSelectionRange(mentionStartPos, mentionStartPos);
							}, 0);
							return;
						}
					}

					// Check if cursor is at the end of a mention without ID (legacy or typing)
					const mentionMatch = textBeforeCursor.match(/@([\w]+(?:\s+[\w]+)?)$/);
					if (mentionMatch) {
						const mentionText = mentionMatch[1];
						const mentionStartPos = textBeforeCursor.lastIndexOf('@');

						if (mentionStartPos !== -1) {
							// Check if mention has both first and last name
							const nameParts = mentionText.trim().split(/\s+/);

							if (nameParts.length === 2) {
								// If deleting from last name, remove entire last name
								e.preventDefault();
								const newContent =
									value.substring(0, mentionStartPos + 1 + nameParts[0].length) +
									' ' +
									value.substring(cursorPosition);
								onChange(newContent);
								setTimeout(() => {
									textarea.setSelectionRange(
										mentionStartPos + 1 + nameParts[0].length + 1,
										mentionStartPos + 1 + nameParts[0].length + 1
									);
								}, 0);
								return;
							} else if (nameParts.length === 1) {
								// If deleting from first name, remove entire mention
								e.preventDefault();
								const newContent =
									value.substring(0, mentionStartPos) +
									value.substring(cursorPosition);
								onChange(newContent);
								setTimeout(() => {
									textarea.setSelectionRange(mentionStartPos, mentionStartPos);
								}, 0);
								return;
							}
						}
					}
				}
				return;
			}

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
					break;
				case 'Enter':
				case 'Tab':
					e.preventDefault();
					if (suggestions[selectedIndex]) {
						insertMention(suggestions[selectedIndex]);
					}
					break;
				case 'Escape':
					e.preventDefault();
					setShowSuggestions(false);
					setSuggestions([]);
					break;
			}
		},
		[showSuggestions, suggestions, selectedIndex, value, onChange]
	);

	// Insert mention into text with user ID embedded using zero-width non-joiner (invisible)
	// Format: @FirstName LastName\u200C[userId] - ID is stored but invisible
	const insertMention = useCallback(
		(user: UserTag) => {
			if (!textareaRef.current || mentionStart === null) return;

			const textarea = textareaRef.current;
			// Store mention with ID using zero-width non-joiner (U+200C) to hide it
			// This way users only see: @FirstName LastName
			const mention = `@${user.firstName} ${user.lastName}\u200C[${user.id}] `;
			// mentionStart is the position of the @ character
			// We need to replace everything from @ to the current cursor position
			const beforeMention = value.substring(0, mentionStart);
			const afterMention = value.substring(textarea.selectionStart);
			const newValue = beforeMention + mention + afterMention;

			// Calculate display position (without IDs) for cursor
			// The display value will be: beforeMention + "@FirstName LastName " + afterMention
			const displayMention = `@${user.firstName} ${user.lastName} `;
			// Remove IDs from beforeMention to get display length
			const displayBeforeMention = beforeMention
				.replace(/@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]/g, (m) => {
					const match = m.match(/@([\w]+(?:\s+[\w]+)?)\u200C\[[^\]]+\]/);
					return match ? `@${match[1]}` : m;
				})
				.replace(/@\[[^\]]+\]([\w]+(?:\s+[\w]+)?)/g, '@$1');
			const displayCursorPos = displayBeforeMention.length + displayMention.length;

			onChange(newValue);
			setShowSuggestions(false);
			setSuggestions([]);
			setMentionStart(null);
			setSearchQuery('');

			// Set cursor after mention (using display position since contentEditable shows display value)
			setTimeout(() => {
				if (textarea.setSelectionRange) {
					textarea.setSelectionRange(displayCursorPos, displayCursorPos);
				}
				if (textarea.focus) {
					textarea.focus();
				}
			}, 50); // Increased timeout to ensure contentEditable has updated
		},
		[value, mentionStart, onChange, textareaRef]
	);

	// Handle text change and detect @ trigger
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			const cursorPosition = e.target.selectionStart;
			const textBeforeCursor = newValue.substring(0, cursorPosition);

			// STEP 1: Check if there's a space after any completed mention
			// This is the PRIMARY STOPPER - once space is after mention, no more searching
			// Pattern: @FirstName LastName\u200C[userId] followed by space
			const mentionWithSpaceRegex = /@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]\s/g;
			let lastMentionWithSpace: RegExpMatchArray | null = null;
			let match;
			while ((match = mentionWithSpaceRegex.exec(textBeforeCursor)) !== null) {
				lastMentionWithSpace = match;
			}

			if (lastMentionWithSpace) {
				const mentionEnd = lastMentionWithSpace.index! + lastMentionWithSpace[0].length;
				// If cursor is at or after the mention+space, STOP searching completely
				if (cursorPosition >= mentionEnd) {
					setShowSuggestions(false);
					setSuggestions([]);
					setMentionStart(null);
					setSearchQuery('');
					onChange(newValue);
					return;
				}
			}

			// STEP 2: Check if @ was typed (find the last @ in text before cursor)
			const atIndex = textBeforeCursor.lastIndexOf('@');
			if (atIndex === -1) {
				// No @ found - hide suggestions
				setShowSuggestions(false);
				setSuggestions([]);
				setMentionStart(null);
				setSearchQuery('');
				onChange(newValue);
				return;
			}

			// STEP 3: Check if this @ is part of a completed mention
			const textAfterAt = textBeforeCursor.substring(atIndex);
			const isPartOfCompletedMention =
				/^@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]/.test(textAfterAt) ||
				/^@\[[^\]]+\][\w]+(?:\s+[\w]+)?/.test(textAfterAt);

			if (isPartOfCompletedMention) {
				// This @ is part of a completed mention - don't show suggestions
				setShowSuggestions(false);
				setSuggestions([]);
				setMentionStart(null);
				setSearchQuery('');
				onChange(newValue);
				return;
			}

			// STEP 4: Extract the query after @
			const queryMatch = textAfterAt.match(/^@([\w\s]*)$/);
			if (!queryMatch) {
				// Not a valid mention pattern
				setShowSuggestions(false);
				setSuggestions([]);
				setMentionStart(null);
				setSearchQuery('');
				onChange(newValue);
				return;
			}

			const query = queryMatch[1];

			// STEP 5: CRITICAL - If @ is immediately followed by space, disable tagging
			if (/^\s/.test(query)) {
				setShowSuggestions(false);
				setSuggestions([]);
				setMentionStart(null);
				setSearchQuery('');
				onChange(newValue);
				return;
			}

			// STEP 6: Check if there's a completed mention before this @
			const textBeforeAt = textBeforeCursor.substring(0, atIndex);
			const hasCompletedMentionBefore =
				/@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]\s|@\[[^\]]+\][\w]+(?:\s+[\w]+)?\s/.test(
					textBeforeAt
				);

			if (hasCompletedMentionBefore) {
				// There's a mention with space before this @ - don't search
				setShowSuggestions(false);
				setSuggestions([]);
				setMentionStart(null);
				setSearchQuery('');
				onChange(newValue);
				return;
			}

			// STEP 7: All checks passed - show suggestions for this @
			const trimmedQuery = query.trim();
			if (trimmedQuery.length > 0 || query.length === 0) {
				// Only search if query is empty (just @) or has non-space characters
				setMentionStart(atIndex);
				setSearchQuery(trimmedQuery);
				setShowSuggestions(true);
				onChange(newValue);
				return;
			}

			// Fallback - hide suggestions
			setShowSuggestions(false);
			setSuggestions([]);
			setMentionStart(null);
			setSearchQuery('');
			onChange(newValue);
		},
		[onChange]
	);

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				textareaRef.current &&
				!textareaRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setSuggestions([]);
			}
		};

		if (showSuggestions) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showSuggestions]);

	return {
		handleChange,
		handleKeyDown,
		showSuggestions,
		suggestions,
		selectedIndex,
		suggestionsRef,
		insertMention,
		isSearching,
	};
}

// Suggestions dropdown component
export function UserTaggingSuggestions({
	show,
	suggestions,
	selectedIndex,
	onSelect,
	isSearching,
	ref: suggestionsRef,
}: {
	show: boolean;
	suggestions: UserTag[];
	selectedIndex: number;
	onSelect: (user: UserTag) => void;
	isSearching?: boolean;
	ref: React.RefObject<HTMLDivElement | null>;
}) {
	if (!show) return null;

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					ref={suggestionsRef}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto"
				>
					{isSearching ? (
						<div className="px-3 py-4 flex items-center justify-center">
							<div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
								<svg
									className="animate-spin h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<span className="text-sm">Searching users...</span>
							</div>
						</div>
					) : suggestions.length === 0 ? (
						<div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
							No users found
						</div>
					) : (
						suggestions.map((user, index) => (
							<button
								key={user.id}
								type="button"
								onClick={() => onSelect(user)}
								className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
									index === selectedIndex
										? 'bg-primary-50 dark:bg-primary-900/20'
										: ''
								}`}
							>
								<Avatar
									avatarUrl={user.avatarUrl}
									firstName={user.firstName}
									lastName={user.lastName}
									size="sm"
									isVerified={user.isVerified}
									isAdmin={user.isAdmin}
								/>
								<div className="flex-1 text-left">
									<div className="text-sm font-medium text-slate-900 dark:text-slate-100">
										{user.firstName} {user.lastName}
									</div>
								</div>
							</button>
						))
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

UserTaggingSuggestions.displayName = 'UserTaggingSuggestions';
