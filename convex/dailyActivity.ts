import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

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
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx)

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

		const today = new Date()
		let streak = 0
		let currentDate = new Date(today)

		while (true) {
			const dateStr = currentDate.toISOString().split('T')[0]

			if (completedDates.has(dateStr)) {
				streak++
				currentDate.setDate(currentDate.getDate() - 1)
			} else {
				break
			}
		}

		return streak
	},
})

export const getRecentActivity = query({
	args: {
		days: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)
		const numDays = args.days ?? 30

		const activities = await ctx.db
			.query('dailyActivity')
			.withIndex('byUserId', (q) => q.eq('userId', user._id))
			.collect()

		const activityMap = new Map(activities.map((a) => [a.date, a.quizCompleted]))

		const result: Array<{ date: string; quizCompleted: boolean }> = []
		const today = new Date()

		for (let i = 0; i < numDays; i++) {
			const date = new Date(today)
			date.setDate(date.getDate() - i)
			const dateStr = date.toISOString().split('T')[0]

			result.push({
				date: dateStr,
				quizCompleted: activityMap.get(dateStr) ?? false,
			})
		}

		return result
	},
})
