import { describe, expect, it } from 'vitest'
import { getLocalTodayStr } from './date-common-fns'

describe('getLocalTodayStr', () => {
	it('returns a string in YYYY-MM-DD format', () => {
		const result = getLocalTodayStr()
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})

	it('matches the current local date', () => {
		const result = getLocalTodayStr()
		const now = new Date()
		const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
		expect(result).toBe(expected)
	})
})
