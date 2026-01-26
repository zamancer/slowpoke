import { createClerkClient } from '@clerk/backend'
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { createFileRoute } from '@tanstack/react-router'
import { getSystemPrompt } from '@/lib/prompts'

// Full model ID required by API, but not in @tanstack/ai-anthropic types yet
const MODEL = 'claude-sonnet-4-20250514' as const
const MAX_TOKENS = 1024

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

const jsonError = (message: string, status: number) =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

export const Route = createFileRoute('/api/ai/quiz-verify')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const { isAuthenticated } = await clerk.authenticateRequest(request)
				if (!isAuthenticated) {
					return jsonError('Unauthorized', 401)
				}

				let body: unknown
				try {
					body = await request.json()
				} catch {
					return jsonError('Malformed JSON body', 400)
				}

				const { messages } = body as { messages?: unknown }

				if (!messages || !Array.isArray(messages) || messages.length === 0) {
					return jsonError('Messages are required', 400)
				}

				// Type assertion needed until library types are updated
				const adapter = anthropicText(MODEL as 'claude-sonnet-4')

				const stream = chat({
					adapter,
					messages,
					systemPrompts: [getSystemPrompt()],
					maxTokens: MAX_TOKENS,
				})

				return toServerSentEventsResponse(stream)
			},
		},
	},
})
