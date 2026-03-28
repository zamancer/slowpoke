import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('quizContent').collect()
	},
})

export const getByContentId = query({
	args: {
		contentId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()
	},
})

export const create = mutation({
	args: {
		contentId: v.string(),
		type: v.union(
			v.literal('pattern-selection'),
			v.literal('anti-patterns'),
			v.literal('big-o'),
		),
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
		questions: v.array(
			v.object({
				question: v.string(),
				options: v.array(v.object({ label: v.string(), text: v.string() })),
				answer: v.string(),
				explanation: v.string(),
				mistakes: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		return await ctx.db.insert('quizContent', {
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
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (!content) {
			throw new ConvexError('Quiz not found')
		}

		const sessions = await ctx.db
			.query('quizSessions')
			.filter((q) => q.eq(q.field('quizId'), args.contentId))
			.collect()

		for (const session of sessions) {
			const answers = await ctx.db
				.query('quizAnswers')
				.withIndex('bySessionId', (q) => q.eq('sessionId', session._id))
				.collect()

			for (const answer of answers) {
				await ctx.db.delete(answer._id)
			}

			await ctx.db.delete(session._id)
		}

		await ctx.db.delete(content._id)
	},
})
