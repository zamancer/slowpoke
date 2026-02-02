import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'
import {
	getDateRange,
	getUtcTodayStr,
	getPreviousDateStr,
	validateDateStr,
} from './lib/dateHelpers'

export const recordQuizCompletion = internalMutation({
	args: {
		userId: v.id('users'),
		date: v.string(),
	},
	handler: async (ctx, args) => {
		const existingActivity = await ctx.db
			.query('dailyActivity')
			.withIndex('byUserIdAndDate', (q) =>
				q.eq('userId', args.userId).eq('date', args.date)
			)
			.unique()

		if (existingActivity) {
			await ctx.db.patch(existingActivity._id, { quizCompleted: true })
		} else {
			await ctx.db.insert('dailyActivity', {
				userId: args.userId,
				date: args.date,
				quizCompleted: true,
			})
		}
	},
})

export const getStreak = query({
	args: {
		clientToday: v.optional(v.string()), // YYYY-MM-DD from client's timezone
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		// Validate client date if provided
		if (args.clientToday) {
			validateDateStr(args.clientToday)
		}

		const activities = await ctx.db
			.query('dailyActivity')
			.withIndex('byUserId', (q) => q.eq('userId', user._id))
			.collect()

		if (activities.length === 0) {
			return 0
		}

		const completedDates = new Set(
			activities.filter((a) => a.quizCompleted).map((a) => a.date)
		)

		if (completedDates.size === 0) {
			return 0
		}

		// Use client's local date if provided, fall back to UTC
		const todayStr = args.clientToday ?? getUtcTodayStr()
		let streak = 0
		let currentDateStr = todayStr

		while (completedDates.has(currentDateStr)) {
			streak++
			currentDateStr = getPreviousDateStr(currentDateStr)
		}

		return streak
	},
})

export const getRecentActivity = query({
	args: {
		days: v.optional(v.number()),
		clientToday: v.optional(v.string()), // YYYY-MM-DD from client's timezone
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)
		const numDays = args.days ?? 30

		// Validate client date if provided
		if (args.clientToday) {
			validateDateStr(args.clientToday)
		}

		const activities = await ctx.db
			.query('dailyActivity')
			.withIndex('byUserId', (q) => q.eq('userId', user._id))
			.collect()

		const activityMap = new Map(activities.map((a) => [a.date, a.quizCompleted]))

		// Use client's local date if provided, fall back to UTC
		const todayStr = args.clientToday ?? getUtcTodayStr()
		const dateRange = getDateRange(todayStr, numDays)

		return dateRange.map((dateStr) => ({
			date: dateStr,
			quizCompleted: activityMap.get(dateStr) ?? false,
		}))
	},
})
