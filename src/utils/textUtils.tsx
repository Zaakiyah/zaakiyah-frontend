import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shortens a URL for display purposes
 * Examples:
 * - https://www.example.com/page -> example.com/page
 * - http://subdomain.example.com/path/to/page -> subdomain.example.com/path...
 */
export function shortenUrl(url: string, maxLength: number = 50): string {
	try {
		// Remove protocol
		let shortened = url.replace(/^https?:\/\//i, '');

		// Remove www.
		shortened = shortened.replace(/^www\./i, '');

		// Truncate if too long
		if (shortened.length > maxLength) {
			shortened = shortened.substring(0, maxLength - 3) + '...';
		}

		return shortened;
	} catch {
		return url;
	}
}

/**
 * Shortens a URL using TinyURL API
 * Returns the original URL if shortening fails
 */
export async function shortenUrlWithService(url: string): Promise<string> {
	try {
		// Ensure URL has protocol
		let fullUrl = url;
		if (!fullUrl.match(/^https?:\/\//i)) {
			if (fullUrl.startsWith('www.')) {
				fullUrl = 'https://' + fullUrl;
			} else {
				fullUrl = 'https://' + fullUrl;
			}
		}

		// Use TinyURL API (free, no API key required)
		const response = await fetch(
			`https://tinyurl.com/api-create.php?url=${encodeURIComponent(fullUrl)}`
		);

		if (response.ok) {
			const shortUrl = await response.text();
			// TinyURL returns the shortened URL or error message
			if (shortUrl && !shortUrl.startsWith('Error')) {
				return shortUrl.trim();
			}
		}

		// If shortening fails, return original URL
		return url;
	} catch (error) {
		console.error('Error shortening URL:', error);
		// Return original URL if shortening fails
		return url;
	}
}

/**
 * Shortens all URLs in text content using a URL shortening service
 * This modifies the actual content that will be stored
 * Examples:
 * - "Check https://www.example.com/very/long/path" -> "Check https://tinyurl.com/abc123"
 * - "Visit http://subdomain.example.com/page" -> "Visit https://tinyurl.com/xyz789"
 */
export async function shortenUrlsInText(text: string): Promise<string> {
	// Ensure we always return a string
	if (!text || typeof text !== 'string') {
		return text || '';
	}

	// Trim and ensure non-empty
	const trimmedText = text.trim();
	if (!trimmedText) {
		return text; // Return original if empty after trim
	}

	try {
		// URL regex pattern - matches http://, https://, www., and common domain patterns
		const urlPattern =
			/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?)/gi;

		// Find all URLs
		const urls = trimmedText.match(urlPattern);
		if (!urls || urls.length === 0) {
			return trimmedText;
		}

		// Shorten all URLs in parallel with timeout protection
		const shortenedUrls = await Promise.all(
			urls.map(async (url) => {
				try {
					// Add timeout to prevent hanging
					const timeoutPromise = new Promise<string>((resolve) => {
						setTimeout(() => resolve(url), 5000); // 5 second timeout
					});
					const shortenPromise = shortenUrlWithService(url);
					return await Promise.race([shortenPromise, timeoutPromise]);
				} catch (error) {
					console.error('Error shortening URL:', error);
					return url; // Return original if error
				}
			})
		);

		// Replace URLs in text with shortened versions
		let result = trimmedText;
		urls.forEach((originalUrl, index) => {
			if (shortenedUrls[index] && typeof shortenedUrls[index] === 'string') {
				result = result.replace(originalUrl, shortenedUrls[index]);
			}
		});

		// Ensure result is always a non-empty string
		return result || trimmedText;
	} catch (error) {
		console.error('Error shortening URLs in text:', error);
		// Always return a valid string
		return trimmedText || text || '';
	}
}

/**
 * Renders a single line of text with clickable hashtags, mentions, and links
 */
function renderLineContent(
	line: string,
	navigate: ReturnType<typeof useNavigate>
): React.ReactNode {
	// Combined pattern: URLs, mentions, or hashtags (URLs first to avoid matching # in URLs)
	const combinedPattern =
		/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?|@[\w]+(?:\s+[\w]+)?\u200C\[[^\]]+\]|@\[[^\]]+\][\w]+(?:\s+[\w]+)?|@[\w]+(?:\s+[\w]+)?|#[\w]+)/gi;

	const parts: Array<{
		type: 'text' | 'url' | 'hashtag' | 'mention';
		content: string;
		match: string;
	}> = [];
	let lastIndex = 0;
	let match;

	// Find all matches (URLs, mentions, and hashtags)
	while ((match = combinedPattern.exec(line)) !== null) {
		// Add text before match
		if (match.index > lastIndex) {
			let textBefore = line.substring(lastIndex, match.index);
			const matchText = match[0];

			// If this is a hashtag match, check if "hashtag" appears immediately before it
			if (matchText.startsWith('#')) {
				const hashtagPrefix = /hashtag\s*$/i;
				if (hashtagPrefix.test(textBefore)) {
					textBefore = textBefore.replace(hashtagPrefix, '').trimEnd();
				}
			}

			if (textBefore) {
				parts.push({
					type: 'text',
					content: textBefore,
					match: '',
				});
			}
		}

		// Add the match
		const matchText = match[0];
		if (matchText.startsWith('@')) {
			parts.push({
				type: 'mention',
				content: matchText,
				match: matchText,
			});
		} else if (matchText.startsWith('#')) {
			parts.push({
				type: 'hashtag',
				content: matchText,
				match: matchText,
			});
		} else {
			parts.push({
				type: 'url',
				content: matchText,
				match: matchText,
			});
		}

		lastIndex = combinedPattern.lastIndex;
	}

	// Add remaining text
	if (lastIndex < line.length) {
		parts.push({
			type: 'text',
			content: line.substring(lastIndex),
			match: '',
		});
	}

	// Render parts
	return (
		<>
			{parts.map((part, index) => {
				if (part.type === 'mention') {
					let userId: string | null = null;
					let displayText = part.content;

					const newFormatMatch = part.content.match(
						/@([\w]+(?:\s+[\w]+)?)\u200C\[([^\]]+)\]/
					);
					if (newFormatMatch) {
						userId = newFormatMatch[2];
						displayText = `@${newFormatMatch[1]}`;
					} else {
						const legacyFormatMatch = part.content.match(/@\[([^\]]+)\](.+)/);
						if (legacyFormatMatch) {
							userId = legacyFormatMatch[1];
							displayText = `@${legacyFormatMatch[2]}`;
						} else {
							displayText = part.content;
						}
					}

					return (
						<span
							key={index}
							className="text-primary-600 dark:text-primary-400 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								if (userId) {
									navigate(`/community/members/${userId}`);
								} else {
									const userName = part.content
										.slice(1)
										.replace(/\u200C\[[^\]]+\]/, '');
									navigate(`/community/members/${encodeURIComponent(userName)}`);
								}
							}}
						>
							{displayText}
						</span>
					);
				} else if (part.type === 'hashtag') {
					return (
						<span
							key={index}
							className="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer"
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
							}}
						>
							{part.content}
						</span>
					);
				} else if (part.type === 'url') {
					let url = part.content;
					if (!url.match(/^https?:\/\//i)) {
						url = url.startsWith('www.') ? 'https://' + url : 'https://' + url;
					}

					const displayUrl = shortenUrl(part.content);

					return (
						<a
							key={index}
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e: React.MouseEvent) => e.stopPropagation()}
							className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer break-all"
							title={part.content}
						>
							{displayUrl}
						</a>
					);
				} else {
					return <span key={index}>{part.content}</span>;
				}
			})}
		</>
	);
}

/**
 * Renders text content with clickable hashtags, mentions, links, and list formatting
 * Supports hashtags (#tag), mentions (@FirstName LastName), URLs, and lists (- item)
 */
function ContentRenderer({ text }: { text: string }) {
	const navigate = useNavigate();

	if (!text || typeof text !== 'string') return <>{text}</>;

	try {
		// Normalize line endings and split text by newlines to handle list formatting
		// Handle both \n and \r\n line endings
		const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		const lines = normalizedText.split('\n');

		// Check if any line starts with "-" (with space after, or directly followed by content)
		// Pattern: start of line (after trim), dash, then space or non-whitespace
		const hasListItems = lines.some((line) => {
			const trimmed = line.trim();
			// Match: dash at start, followed by space OR directly by non-whitespace character
			// Also handle cases where there might be leading/trailing whitespace
			// Use more lenient pattern: starts with dash and has content after it
			return trimmed.length > 1 && trimmed.startsWith('-');
		});

		// If no list items, render as before (single block)
		if (!hasListItems) {
			return <>{renderLineContent(text, navigate)}</>;
		}

		// Render with list formatting
		return (
			<div className="space-y-1">
				{lines.map((line, lineIndex) => {
					const trimmedLine = line.trim();
					// Match: dash at start with content after it
					// More lenient: any line that starts with "-" and has more than just the dash
					const isListItem = trimmedLine.length > 1 && trimmedLine.startsWith('-');

					if (isListItem) {
						// Remove the "- " or "-" prefix and render the content
						// Handle both "- item" and "-item" formats
						const listItemContent = trimmedLine.replace(/^-\s*/, '').trim();
						// Only render if there's actual content after removing the dash
						if (listItemContent.length > 0) {
							return (
								<div key={lineIndex} className="flex items-start gap-2">
									<span className="text-slate-600 dark:text-slate-400 font-semibold mt-0.5 shrink-0">
										•
									</span>
									<span className="flex-1">
										{renderLineContent(listItemContent, navigate)}
									</span>
								</div>
							);
						}
					}

					if (trimmedLine) {
						// Regular line (not a list item)
						return (
							<div key={lineIndex} className="py-0.5">
								{renderLineContent(trimmedLine, navigate)}
							</div>
						);
					} else {
						// Empty line - preserve spacing
						return <div key={lineIndex} className="h-1" />;
					}
				})}
			</div>
		);
	} catch (error) {
		console.error('Error rendering content with hashtags and links:', error);
		return <>{text}</>;
	}
}

export function renderContentWithHashtagsAndLinks(text: string): React.ReactNode {
	return <ContentRenderer text={text} />;
}
