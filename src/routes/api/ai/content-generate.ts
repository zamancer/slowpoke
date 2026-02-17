import { createClerkClient } from '@clerk/backend'
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
	buildContentGenerationPrompt,
	CONTENT_GENERATION_SYSTEM_PROMPT,
} from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-20250514' as const
const MAX_TOKENS = 8192

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

const InputSchema = z.object({
	category: z.string().min(1),
	subcategory: z.string().min(1),
	tags: z.array(z.string().min(1)).min(1),
	flashcardDifficulty: z.enum(['easy', 'medium', 'hard']),
	quizDifficulty: z.enum(['easy', 'medium', 'hard']),
	quizType: z.enum(['pattern-selection', 'anti-patterns', 'big-o']),
	flashcardId: z.string().min(1),
	quizId: z.string().min(1),
	cardCount: z.number().int().min(1).max(20),
	questionCount: z.number().int().min(1).max(25),
	sourceText: z.string().min(80),
})

const OutputSchema = z.object({
	flashcardsFileName: z.string().min(1),
	quizFileName: z.string().min(1),
	flashcardsMarkdown: z.string().min(1),
	quizMarkdown: z.string().min(1),
})

const jsonError = (message: string, status: number) =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

const looksLikeFlashcardsMarkdown = (markdown: string): boolean => {
	if (!markdown.includes('---')) return false
	if (!markdown.match(/^id:\s.+$/m)) return false
	if (!markdown.match(/^category:\s.+$/m)) return false
	if (!markdown.match(/^subcategory:\s.+$/m)) return false
	if (!markdown.match(/^difficulty:\s(easy|medium|hard)$/m)) return false
	if (!markdown.match(/^tags:\s\[(.*)\]$/m)) return false
	if (!markdown.match(/^version:\s1\.0\.0$/m)) return false
	if (!markdown.match(/^## Card 1$/m)) return false
	if (!markdown.match(/^### Front$/m)) return false
	if (!markdown.match(/^### Back$/m)) return false
	return true
}

const looksLikeQuizMarkdown = (markdown: string): boolean => {
	if (!markdown.includes('---')) return false
	if (!markdown.match(/^id:\s.+$/m)) return false
	if (!markdown.match(/^type:\s(pattern-selection|anti-patterns|big-o)$/m)) {
		return false
	}
	if (!markdown.match(/^category:\s.+$/m)) return false
	if (!markdown.match(/^subcategory:\s.+$/m)) return false
	if (!markdown.match(/^difficulty:\s(easy|medium|hard)$/m)) return false
	if (!markdown.match(/^tags:\s\[(.*)\]$/m)) return false
	if (!markdown.match(/^version:\s1\.0\.0$/m)) return false
	if (!markdown.match(/^## Question 1$/m)) return false
	if (!markdown.match(/^### Options$/m)) return false
	if (!markdown.match(/^- A:\s.+$/m)) return false
	if (!markdown.match(/^- B:\s.+$/m)) return false
	if (!markdown.match(/^- C:\s.+$/m)) return false
	if (!markdown.match(/^- D:\s.+$/m)) return false
	if (!markdown.match(/^### Answer$/m)) return false
	if (!markdown.match(/^### Explanation$/m)) return false
	if (!markdown.match(/^### Mistakes$/m)) return false
	return true
}

export const Route = createFileRoute('/api/ai/content-generate')({
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
					return jsonError('Invalid content generation request', 400)
				}

				const adapter = anthropicText(MODEL as 'claude-sonnet-4')
				const prompt = buildContentGenerationPrompt(parsedInput.data)

				let result: z.infer<typeof OutputSchema>
				try {
					result = await chat({
						adapter,
						messages: [{ role: 'user', content: prompt }],
						systemPrompts: [CONTENT_GENERATION_SYSTEM_PROMPT],
						maxTokens: MAX_TOKENS,
						outputSchema: OutputSchema,
					})
				} catch {
					return jsonError('Content generation failed', 500)
				}

				if (!looksLikeFlashcardsMarkdown(result.flashcardsMarkdown)) {
					return jsonError('Generated flashcards markdown is invalid', 422)
				}

				if (!looksLikeQuizMarkdown(result.quizMarkdown)) {
					return jsonError('Generated quiz markdown is invalid', 422)
				}

				return new Response(
					JSON.stringify({
						...result,
					}),
					{
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					},
				)
			},
		},
	},
})
