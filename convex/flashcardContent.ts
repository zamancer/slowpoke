import { v } from 'convex/values'
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
