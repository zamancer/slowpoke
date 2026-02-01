import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

const aiVerificationValidator = v.object({
	verdict: v.union(v.literal('PASS'), v.literal('FAIL')),
	explanation: v.string(),
	status: v.union(
		v.literal('pending'),
		v.literal('streaming'),
		v.literal('complete'),
		v.literal('error')
	),
	error: v.optional(v.string()),
})

export const saveAnswer = mutation({
	args: {
		sessionId: v.id('quizSessions'),
		questionIndex: v.number(),
		orderPosition: v.number(),
		selectedAnswer: v.string(),
		justification: v.string(),
		isCorrect: v.boolean(),
		aiVerification: v.optional(aiVerificationValidator),
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

		if (session.status !== 'in_progress') {
			throw new ConvexError('Session is not in progress')
		}

		if (session.questionOrder[args.orderPosition] !== args.questionIndex) {
			throw new ConvexError('Invalid answer mapping: orderPosition does not match questionIndex')
		}

		const existingAnswer = await ctx.db
			.query('quizAnswers')
			.withIndex('bySessionIdAndQuestionIndex', (q) =>
				q.eq('sessionId', args.sessionId).eq('questionIndex', args.questionIndex)
			)
			.unique()

		if (existingAnswer) {
			await ctx.db.patch(existingAnswer._id, {
				selectedAnswer: args.selectedAnswer,
				justification: args.justification,
				isCorrect: args.isCorrect,
				aiVerification: args.aiVerification,
			})
			return existingAnswer._id
		}

		return await ctx.db.insert('quizAnswers', {
			sessionId: args.sessionId,
			userId: user._id,
			questionIndex: args.questionIndex,
			orderPosition: args.orderPosition,
			selectedAnswer: args.selectedAnswer,
			justification: args.justification,
			isCorrect: args.isCorrect,
			aiVerification: args.aiVerification,
		})
	},
})

export const updateAiVerification = mutation({
	args: {
		sessionId: v.id('quizSessions'),
		questionIndex: v.number(),
		aiVerification: aiVerificationValidator,
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

		const answer = await ctx.db
			.query('quizAnswers')
			.withIndex('bySessionIdAndQuestionIndex', (q) =>
				q.eq('sessionId', args.sessionId).eq('questionIndex', args.questionIndex)
			)
			.unique()

		if (!answer) {
			throw new ConvexError('Answer not found')
		}

		await ctx.db.patch(answer._id, {
			aiVerification: args.aiVerification,
		})
	},
})

export const listBySession = query({
	args: {
		sessionId: v.id('quizSessions'),
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

		const answers = await ctx.db
			.query('quizAnswers')
			.withIndex('bySessionIdAndOrderPosition', (q) =>
				q.eq('sessionId', args.sessionId)
			)
			.collect()

		return answers.sort((a, b) => a.orderPosition - b.orderPosition)
	},
})

export const getBySessionAndQuestion = query({
	args: {
		sessionId: v.id('quizSessions'),
		questionIndex: v.number(),
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

		return await ctx.db
			.query('quizAnswers')
			.withIndex('bySessionIdAndQuestionIndex', (q) =>
				q.eq('sessionId', args.sessionId).eq('questionIndex', args.questionIndex)
			)
			.unique()
	},
})
