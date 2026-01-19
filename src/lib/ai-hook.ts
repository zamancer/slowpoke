import type { InferChatMessages } from '@tanstack/ai-react'
import {
	createChatClientOptions,
	fetchServerSentEvents,
	useChat,
} from '@tanstack/ai-react'

// Configure your chat options here
// Add tools using clientTools() from @tanstack/ai-client as needed
const chatOptions = createChatClientOptions({
	connection: fetchServerSentEvents('/api/ai/chat'),
})

export type ChatMessages = InferChatMessages<typeof chatOptions>

export const useAIChat = () => useChat(chatOptions)
