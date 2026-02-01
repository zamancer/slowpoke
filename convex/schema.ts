import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	products: defineTable({
		title: v.string(),
		imageId: v.string(),
		price: v.number(),
	}),

	users: defineTable({
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
	}).index('byClerkId', ['clerkId']),

	quizSessions: defineTable({
		userId: v.id('users'),
		quizId: v.string(),
		contentHash: v.string(),
		status: v.union(
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('abandoned')
		),
		questionOrder: v.array(v.number()),
		currentQuestionIndex: v.number(),
		totalQuestions: v.number(),
		correctCount: v.number(),
		verificationEnabled: v.boolean(),
		completedAt: v.optional(v.number()),
	})
		.index('byUserId', ['userId'])
		.index('byUserIdAndQuizId', ['userId', 'quizId'])
		.index('byUserIdAndStatus', ['userId', 'status']),

	quizAnswers: defineTable({
		sessionId: v.id('quizSessions'),
		userId: v.id('users'),
		questionIndex: v.number(),
		orderPosition: v.number(),
		selectedAnswer: v.string(),
		justification: v.string(),
		isCorrect: v.boolean(),
		aiVerification: v.optional(
			v.object({
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
		),
	})
		.index('bySessionId', ['sessionId'])
		.index('bySessionIdAndQuestionIndex', ['sessionId', 'questionIndex'])
		.index('bySessionIdAndOrderPosition', ['sessionId', 'orderPosition']),

	flashcardSessions: defineTable({
		userId: v.id('users'),
		groupId: v.string(),
		totalCards: v.number(),
		revealedCount: v.number(),
		lastStudiedAt: v.number(),
	})
		.index('byUserId', ['userId'])
		.index('byUserIdAndGroupId', ['userId', 'groupId']),

	flashcardReveals: defineTable({
		sessionId: v.id('flashcardSessions'),
		userId: v.id('users'),
		cardIndex: v.number(),
		revealedAt: v.number(),
	})
		.index('bySessionId', ['sessionId'])
		.index('bySessionIdAndCardIndex', ['sessionId', 'cardIndex']),

	dailyActivity: defineTable({
		userId: v.id('users'),
		date: v.string(),
		quizCompleted: v.boolean(),
	})
		.index('byUserId', ['userId'])
		.index('byUserIdAndDate', ['userId', 'date']),
})
