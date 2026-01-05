/**
 * Format a date string to a short format (e.g., "Jan 3")
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
	}).format(date);
}

/**
 * Format a date string to a long format (e.g., "Monday, January 3, 2024")
 */
export function formatDateLong(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

/**
 * Format a Hijri date string to a readable format
 * @param hijriDate - Hijri date in format "YYYY-MM-DD"
 * @returns Formatted string like "15 Ramaḍān 1445"
 */
export function formatHijriDate(hijriDate: string): string {
	if (!hijriDate) return '';
	const parts = hijriDate.split('-');
	if (parts.length !== 3) return hijriDate;

	const day = parseInt(parts[2]);
	const month = parseInt(parts[1]);
	const year = parseInt(parts[0]);

	const monthNames = [
		'Muḥarram',
		'Ṣafar',
		'Rabīʿ al-awwal',
		'Rabīʿ al-thānī',
		'Jumādá al-ūlá',
		'Jumādá al-ākhirah',
		'Rajab',
		'Shaʿbān',
		'Ramaḍān',
		'Shawwāl',
		'Dhū al-Qaʿdah',
		'Dhū al-Ḥijjah',
	];

	return `${day} ${monthNames[month - 1]} ${year}`;
}

/**
 * Format both Gregorian and Hijri dates with labels
 * @param gregorianDate - Gregorian date string
 * @param hijriDate - Hijri date string
 * @returns Formatted string like "Jan 3 G • 15 Ramaḍān 1445 H"
 */
export function formatDatesWithLabels(
	gregorianDate?: string | null,
	hijriDate?: string | null
): string {
	const parts: string[] = [];

	if (gregorianDate) {
		parts.push(`${formatDate(gregorianDate)} G`);
	}

	if (hijriDate) {
		parts.push(`${formatHijriDate(hijriDate)} H`);
	}

	return parts.join(' • ');
}

