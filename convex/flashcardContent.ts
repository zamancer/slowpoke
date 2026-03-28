import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('flashcardContent').collect()
	},
})

export const getByContentId = query({
	args: {
		contentId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('flashcardContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()
	},
})

export const create = mutation({
	args: {
		contentId: v.string(),
		category: v.string(),
		subcategory: v.string(),
		difficulty: v.union(
			v.literal('easy'),
			v.literal('medium'),
			v.literal('hard'),
		),
		tags: v.array(v.string()),
		version: v.string(),
		title: v.string(),
		cards: v.array(
			v.object({ front: v.string(), back: v.string() }),
		),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		return await ctx.db.insert('flashcardContent', {
			...args,
			createdBy: user._id,
		})
	},
})

export const remove = mutation({
	args: {
		contentId: v.string(),
	},
	handler: async (ctx, args) => {
		await getAuthenticatedUser(ctx)

		const content = await ctx.db
			.query('flashcardContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (!content) {
			throw new ConvexError('Flashcard group not found')
		}

		const sessions = await ctx.db
			.query('flashcardSessions')
			.filter((q) => q.eq(q.field('groupId'), args.contentId))
			.collect()

		for (const session of sessions) {
			const reveals = await ctx.db
				.query('flashcardReveals')
				.withIndex('bySessionId', (q) => q.eq('sessionId', session._id))
				.collect()

			for (const reveal of reveals) {
				await ctx.db.delete(reveal._id)
			}

			await ctx.db.delete(session._id)
		}

		await ctx.db.delete(content._id)
	},
})
