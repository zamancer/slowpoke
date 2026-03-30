import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

export const list = query({
	args: {},
	handler: async (ctx) => {
		const all = await ctx.db.query('quizContent').collect()
		return all.filter((q) => q.status !== 'draft')
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

export const listDrafts = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx)
		const all = await ctx.db
			.query('quizContent')
			.withIndex('byStatus', (q) => q.eq('status', 'draft'))
			.collect()
		return all.filter((q) => q.createdBy === user._id)
	},
})

export const getDraft = query({
	args: {
		contentId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)
		const draft = await ctx.db
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (!draft || draft.status !== 'draft' || draft.createdBy !== user._id) {
			return null
		}

		return draft
	},
})

export const create = mutation({
	args: {
		contentId: v.string(),
		type: v.string(),
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
		status: v.optional(
			v.union(v.literal('draft'), v.literal('published')),
		),
		sourcePrompt: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const existing = await ctx.db
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (existing) {
			throw new ConvexError('A quiz with this content ID already exists')
		}

		return await ctx.db.insert('quizContent', {
			...args,
			status: args.status ?? 'draft',
			createdBy: user._id,
		})
	},
})

export const updateDraft = mutation({
	args: {
		contentId: v.string(),
		title: v.optional(v.string()),
		type: v.optional(v.string()),
		category: v.optional(v.string()),
		subcategory: v.optional(v.string()),
		difficulty: v.optional(
			v.union(
				v.literal('easy'),
				v.literal('medium'),
				v.literal('hard'),
			),
		),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)
		const draft = await ctx.db
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (!draft) {
			throw new ConvexError('Draft not found')
		}
		if (draft.status !== 'draft') {
			throw new ConvexError('Only drafts can be edited')
		}
		if (draft.createdBy !== user._id) {
			throw new ConvexError('Not authorized to edit this draft')
		}

		const { contentId: _, ...updates } = args
		const fieldsToUpdate = Object.fromEntries(
			Object.entries(updates).filter(([, v]) => v !== undefined),
		)

		await ctx.db.patch(draft._id, fieldsToUpdate)
	},
})

export const publish = mutation({
	args: {
		contentId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)
		const draft = await ctx.db
			.query('quizContent')
			.withIndex('byContentId', (q) => q.eq('contentId', args.contentId))
			.unique()

		if (!draft) {
			throw new ConvexError('Quiz not found')
		}
		if (draft.status !== 'draft') {
			throw new ConvexError('Only drafts can be published')
		}
		if (draft.createdBy !== user._id) {
			throw new ConvexError('Not authorized to publish this draft')
		}

		await ctx.db.patch(draft._id, { status: 'published' })
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
			.withIndex('byQuizId', (q) => q.eq('quizId', args.contentId))
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
