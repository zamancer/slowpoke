import { createClerkClient } from '@clerk/backend'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
	buildQuizGenerationPrompt,
	QUIZ_GENERATION_SYSTEM_PROMPT,
} from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-20250514' as const
const MAX_TOKENS = 8192

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

const InputSchema = z.object({
	prompt: z.string().min(1),
	sourceText: z.string().optional(),
	questionCount: z.number().int().min(1).max(25).default(10),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
	category: z.string().optional(),
	subcategory: z.string().optional(),
	tags: z.array(z.string()).optional(),
	quizType: z.string().optional(),
})

const jsonError = (message: string, status: number) =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

export const Route = createFileRoute('/api/ai/quiz-generate')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				console.log('[quiz-generate] handler invoked')

				const { isAuthenticated } = await clerk.authenticateRequest(request)
				if (!isAuthenticated) return jsonError('Unauthorized', 401)

				let body: unknown
				try {
					body = await request.json()
				} catch {
					return jsonError('Malformed JSON body', 400)
				}

				const parsedInput = InputSchema.safeParse(body)
				if (!parsedInput.success) {
					return jsonError('Invalid quiz generation request', 400)
				}

				console.log(
					`[quiz-generate] starting generation, questionCount=${parsedInput.data.questionCount}`,
				)

				const prompt = buildQuizGenerationPrompt(parsedInput.data)
				const adapter = anthropicText(MODEL as 'claude-sonnet-4')

				const stream = chat({
					adapter,
					messages: [{ role: 'user', content: prompt }],
					systemPrompts: [QUIZ_GENERATION_SYSTEM_PROMPT],
					maxTokens: MAX_TOKENS,
				})

				return toServerSentEventsResponse(stream)
			},
		},
	},
})
