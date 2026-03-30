import { createClerkClient } from '@clerk/backend'
import { chat } from '@tanstack/ai'
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

const OutputSchema = z.object({
	title: z.string().min(1),
	type: z.string().min(1),
	category: z.string().min(1),
	subcategory: z.string().min(1),
	difficulty: z.enum(['easy', 'medium', 'hard']),
	tags: z.array(z.string()),
	questions: z
		.array(
			z.object({
				question: z.string().min(1),
				options: z
					.array(z.object({ label: z.string(), text: z.string() }))
					.min(4)
					.max(4),
				answer: z.string().min(1),
				explanation: z.string().min(1),
				mistakes: z.string().optional(),
			}),
		)
		.min(1),
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

				const adapter = anthropicText(MODEL as 'claude-sonnet-4')
				const prompt = buildQuizGenerationPrompt(parsedInput.data)

				let result: z.infer<typeof OutputSchema>
				try {
					result = await chat({
						adapter,
						messages: [{ role: 'user', content: prompt }],
						systemPrompts: [QUIZ_GENERATION_SYSTEM_PROMPT],
						maxTokens: MAX_TOKENS,
						outputSchema: OutputSchema,
					})
				} catch {
					return jsonError('Quiz generation failed', 500)
				}

				return new Response(JSON.stringify(result), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			},
		},
	},
})
