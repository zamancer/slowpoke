import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser, getOptionalUser } from './lib/auth'

export const start = mutation({
	args: {
		quizId: v.string(),
		questionOrder: v.array(v.number()),
		totalQuestions: v.number(),
		verificationEnabled: v.boolean(),
		contentHash: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const sessionId = await ctx.db.insert('quizSessions', {
			userId: user._id,
			quizId: args.quizId,
			contentHash: args.contentHash,
			status: 'in_progress',
			questionOrder: args.questionOrder,
			currentQuestionIndex: 0,
			totalQuestions: args.totalQuestions,
			correctCount: 0,
			verificationEnabled: args.verificationEnabled,
		})

		return sessionId
	},
})

export const getActiveSession = query({
	args: {
		quizId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getOptionalUser(ctx)
		if (!user) {
			return null
		}

		const sessions = await ctx.db
			.query('quizSessions')
			.withIndex('byUserIdAndQuizId', (q) =>
				q.eq('userId', user._id).eq('quizId', args.quizId)
			)
			.collect()

		const activeSession = sessions.find((s) => s.status === 'in_progress')
		return activeSession ?? null
	},
})

export const getSession = query({
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

		return session
	},
})

export const complete = mutation({
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

		if (session.status !== 'in_progress') {
			throw new ConvexError('Session is not in progress')
		}

		const answers = await ctx.db
			.query('quizAnswers')
			.withIndex('bySessionId', (q) => q.eq('sessionId', args.sessionId))
			.collect()

		const correctCount = answers.filter((a) => {
			if (session.verificationEnabled && a.aiVerification?.status === 'complete') {
				return a.aiVerification.verdict === 'PASS'
			}
			return a.isCorrect
		}).length

		await ctx.db.patch(args.sessionId, {
			status: 'completed',
			correctCount,
			completedAt: Date.now(),
		})

		const today = new Date().toISOString().split('T')[0]
		const existingActivity = await ctx.db
			.query('dailyActivity')
			.withIndex('byUserIdAndDate', (q) =>
				q.eq('userId', user._id).eq('date', today)
			)
			.unique()

		if (existingActivity) {
			await ctx.db.patch(existingActivity._id, { quizCompleted: true })
		} else {
			await ctx.db.insert('dailyActivity', {
				userId: user._id,
				date: today,
				quizCompleted: true,
			})
		}

		return { correctCount }
	},
})

export const abandon = mutation({
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

		await ctx.db.patch(args.sessionId, {
			status: 'abandoned',
		})
	},
})

export const updateProgress = mutation({
	args: {
		sessionId: v.id('quizSessions'),
		currentQuestionIndex: v.number(),
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

		await ctx.db.patch(args.sessionId, {
			currentQuestionIndex: args.currentQuestionIndex,
		})
	},
})

export const listByUser = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx)

		const sessions = await ctx.db
			.query('quizSessions')
			.withIndex('byUserId', (q) => q.eq('userId', user._id))
			.collect()

		return sessions
			.filter((s) => s.status === 'completed')
			.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
	},
})

export const listByUserAndQuiz = query({
	args: {
		quizId: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthenticatedUser(ctx)

		const sessions = await ctx.db
			.query('quizSessions')
			.withIndex('byUserIdAndQuizId', (q) =>
				q.eq('userId', user._id).eq('quizId', args.quizId)
			)
			.collect()

		return sessions
			.filter((s) => s.status === 'completed')
			.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
	},
})
