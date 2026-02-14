/**
 * Get today's date in the user's local timezone as a YYYY-MM-DD string.
 */
export const getLocalTodayStr = (): string => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}
