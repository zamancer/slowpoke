import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { createFileRoute } from '@tanstack/react-router'
import { getSystemPrompt } from '@/lib/prompts'

// Full model ID required by API, but not in @tanstack/ai-anthropic types yet
const MODEL = 'claude-sonnet-4-20250514' as const
const MAX_TOKENS = 1024

export const Route = createFileRoute('/api/ai/quiz-verify')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json()
				const { messages } = body

				if (!messages || !Array.isArray(messages) || messages.length === 0) {
					return new Response(
						JSON.stringify({ error: 'Messages are required' }),
						{
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						},
					)
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
