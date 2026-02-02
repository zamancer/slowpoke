/**
 * Helpers for working with date strings (YYYY-MM-DD format).
 * Used for timezone-aware daily activity tracking.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Validate that a string is a valid YYYY-MM-DD date.
 * Throws if the format is invalid or if the date values are out of range.
 */
export const validateDateStr = (dateStr: string): void => {
	if (!DATE_PATTERN.test(dateStr)) {
		throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`)
	}

	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))

	// Verify the date wasn't normalized (e.g., month 13 becoming month 1 of next year)
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() + 1 !== month ||
		date.getUTCDate() !== day
	) {
		throw new Error(`Invalid date values: ${dateStr}`)
	}
}

/**
 * Get the previous date string given a YYYY-MM-DD date.
 */
export const getPreviousDateStr = (dateStr: string): string => {
	validateDateStr(dateStr)
	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	date.setUTCDate(date.getUTCDate() - 1)
	return date.toISOString().split('T')[0]
}

/**
 * Generate an array of date strings starting from startDate going backwards.
 */
export const getDateRange = (startDate: string, days: number): string[] => {
	const result: string[] = []
	let current = startDate
	for (let i = 0; i < days; i++) {
		result.push(current)
		current = getPreviousDateStr(current)
	}
	return result
}

/**
 * Get today's date in UTC as a YYYY-MM-DD string.
 * Used as fallback when client doesn't provide local date.
 */
export const getUtcTodayStr = (): string => {
	return new Date().toISOString().split('T')[0]
}
