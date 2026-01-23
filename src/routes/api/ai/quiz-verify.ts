import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { getSystemPrompt } from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024

export const APIRoute = createAPIFileRoute('/api/ai/quiz-verify')({
	POST: async ({ request }) => {
		const body = await request.json()
		const { messages } = body

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return new Response(JSON.stringify({ error: 'Messages are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const adapter = anthropicText(MODEL)

		const stream = chat({
			adapter,
			messages,
			systemPrompts: [getSystemPrompt()],
			maxTokens: MAX_TOKENS,
		})

		return toServerSentEventsResponse(stream)
	},
})
