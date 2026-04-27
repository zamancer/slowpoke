'use node'

import { ConvexError, v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'
import {
	buildQuizGenerationPrompt,
	buildVariantGenerationPrompt,
	QUIZ_GENERATION_SYSTEM_PROMPT,
} from '../src/lib/prompts/quiz-generation'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 8192

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')

const extractJson = (text: string): string => {
	const start = text.indexOf('{')
	const end = text.lastIndexOf('}')
	if (start === -1 || end === -1 || end < start) return text
	return text.slice(start, end + 1)
}

type AnthropicMessage = {
	content: Array<{ type: string; text: string }>
	error?: { message?: string }
}

type QuizJson = {
	type: string
	subcategory: string
	category: string
	difficulty: 'easy' | 'medium' | 'hard'
	tags: string[]
	title: string
	questions: Array<{
		question: string
		options: { label: string; text: string }[]
		answer: string
		explanation: string
		mistakes?: string
	}>
}

export const generate = action({
	args: {
		prompt: v.string(),
		sourceText: v.optional(v.string()),
		questionCount: v.number(),
		difficulty: v.optional(
			v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
		),
		category: v.optional(v.string()),
		subcategory: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		quizType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new ConvexError('Not authenticated')

		const apiKey = process.env.ANTHROPIC_API_KEY
		if (!apiKey) throw new ConvexError('ANTHROPIC_API_KEY not configured')

		const userPrompt = buildQuizGenerationPrompt({
			prompt: args.prompt,
			sourceText: args.sourceText,
			questionCount: args.questionCount,
			difficulty: args.difficulty,
			category: args.category,
			subcategory: args.subcategory,
			tags: args.tags,
			quizType: args.quizType,
		})

		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01',
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				model: MODEL,
				max_tokens: MAX_TOKENS,
				system: QUIZ_GENERATION_SYSTEM_PROMPT,
				messages: [{ role: 'user', content: userPrompt }],
			}),
		})

		if (!response.ok) {
			const err = (await response.json().catch(() => ({}))) as AnthropicMessage
			throw new ConvexError(err.error?.message ?? 'AI generation failed')
		}

		const data = (await response.json()) as AnthropicMessage
		const rawText = data.content.find((c) => c.type === 'text')?.text ?? ''
		const cleanedJson = extractJson(rawText.trim())

		let quiz: QuizJson
		try {
			quiz = JSON.parse(cleanedJson) as QuizJson
		} catch {
			throw new ConvexError('Failed to parse generated quiz — please try again')
		}

		const contentId = `${slugify(quiz.type)}-${slugify(quiz.subcategory)}-${Date.now()}`

		await ctx.runMutation(api.quizContent.create, {
			contentId,
			type: quiz.type,
			category: quiz.category,
			subcategory: quiz.subcategory,
			difficulty: quiz.difficulty,
			tags: quiz.tags,
			version: '1.0.0',
			title: quiz.title,
			questions: quiz.questions,
			sourcePrompt: args.prompt,
		})

		return contentId
	},
})

export const generateVariant = action({
	args: {
		contentId: v.string(),
		questionCount: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new ConvexError('Not authenticated')

		const apiKey = process.env.ANTHROPIC_API_KEY
		if (!apiKey) throw new ConvexError('ANTHROPIC_API_KEY not configured')

		const original = await ctx.runQuery(api.quizContent.getByContentId, {
			contentId: args.contentId,
		})
		if (!original) throw new ConvexError('Quiz not found')

		const sourcePrompt = original.sourcePrompt ?? original.title
		const existingQuestions = original.questions.map((q) => q.question)

		const userPrompt = buildVariantGenerationPrompt({
			sourcePrompt,
			questionCount: args.questionCount,
			existingQuestions,
			difficulty: original.difficulty,
			category: original.category,
			subcategory: original.subcategory,
			tags: original.tags,
			quizType: original.type,
		})

		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01',
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				model: MODEL,
				max_tokens: MAX_TOKENS,
				system: QUIZ_GENERATION_SYSTEM_PROMPT,
				messages: [{ role: 'user', content: userPrompt }],
			}),
		})

		if (!response.ok) {
			const err = (await response.json().catch(() => ({}))) as AnthropicMessage
			throw new ConvexError(err.error?.message ?? 'AI generation failed')
		}

		const data = (await response.json()) as AnthropicMessage
		const rawText = data.content.find((c) => c.type === 'text')?.text ?? ''
		const cleanedJson = extractJson(rawText.trim())

		let quiz: QuizJson
		try {
			quiz = JSON.parse(cleanedJson) as QuizJson
		} catch {
			throw new ConvexError('Failed to parse generated quiz — please try again')
		}

		const newContentId = `${slugify(quiz.type)}-${slugify(quiz.subcategory)}-${Date.now()}`

		await ctx.runMutation(api.quizContent.create, {
			contentId: newContentId,
			type: quiz.type,
			category: quiz.category,
			subcategory: quiz.subcategory,
			difficulty: quiz.difficulty,
			tags: quiz.tags,
			version: '1.0.0',
			title: quiz.title,
			questions: quiz.questions,
			sourcePrompt,
		})

		return newContentId
	},
})
