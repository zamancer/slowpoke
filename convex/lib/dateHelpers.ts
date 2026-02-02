/**
 * Helpers for working with date strings (YYYY-MM-DD format).
 * Used for timezone-aware daily activity tracking.
 */

/**
 * Get the previous date string given a YYYY-MM-DD date.
 */
export const getPreviousDateStr = (dateStr: string): string => {
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
