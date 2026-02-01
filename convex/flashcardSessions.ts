import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser, getOptionalUser } from './lib/auth'

export const start = mutation({
	args: {
		groupId: v.string(),
		totalCards: v.number(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const sessionId = await ctx.db.insert('flashcardSessions', {
			userId: user._id,
			groupId: args.groupId,
			totalCards: args.totalCards,
			revealedCount: 0,
			lastStudiedAt: Date.now(),
		})

		return sessionId
	},
})

export const getActiveSession = query({
	args: {
		groupId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getOptionalUser(ctx)
		if (!user) {
			return null
		}

		const session = await ctx.db
			.query('flashcardSessions')
			.withIndex('byUserIdAndGroupId', (q) =>
				q.eq('userId', user._id).eq('groupId', args.groupId)
			)
			.unique()

		return session ?? null
	},
})

export const listByUser = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx)

		const sessions = await ctx.db
			.query('flashcardSessions')
			.withIndex('byUserId', (q) => q.eq('userId', user._id))
			.collect()

		return sessions.sort((a, b) => b.lastStudiedAt - a.lastStudiedAt)
	},
})
