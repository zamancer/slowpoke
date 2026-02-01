import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

export const revealCard = mutation({
	args: {
		sessionId: v.id('flashcardSessions'),
		cardIndex: v.number(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const session = await ctx.db.get(args.sessionId)
		if (!session) {
			throw new ConvexError('Session not found')
		}

		if (session.userId !== user._id) {
			throw new ConvexError('Unauthorized: not session owner')
		}

		if (args.cardIndex < 0 || args.cardIndex >= session.totalCards) {
			throw new ConvexError('Invalid card index: out of bounds')
		}

		const existingReveal = await ctx.db
			.query('flashcardReveals')
			.withIndex('bySessionIdAndCardIndex', (q) =>
				q.eq('sessionId', args.sessionId).eq('cardIndex', args.cardIndex)
			)
			.unique()

		if (existingReveal) {
			return existingReveal._id
		}

		const revealId = await ctx.db.insert('flashcardReveals', {
			sessionId: args.sessionId,
			userId: user._id,
			cardIndex: args.cardIndex,
			revealedAt: Date.now(),
		})

		await ctx.db.patch(args.sessionId, {
			revealedCount: session.revealedCount + 1,
			lastStudiedAt: Date.now(),
		})

		return revealId
	},
})

export const listBySession = query({
	args: {
		sessionId: v.id('flashcardSessions'),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const session = await ctx.db.get(args.sessionId)
		if (!session) {
			throw new ConvexError('Session not found')
		}

		if (session.userId !== user._id) {
			throw new ConvexError('Unauthorized: not session owner')
		}

		const reveals = await ctx.db
			.query('flashcardReveals')
			.withIndex('bySessionId', (q) => q.eq('sessionId', args.sessionId))
			.collect()

		return reveals.sort((a, b) => a.cardIndex - b.cardIndex)
	},
})
