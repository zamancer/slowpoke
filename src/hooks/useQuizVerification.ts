import {
	createChatClientOptions,
	fetchServerSentEvents,
	useChat,
} from '@tanstack/ai-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQuizVerificationPrompt } from '@/lib/prompts'
import type { AiVerification, VerificationPayload } from '@/types/quiz'

const STREAM_START_TIMEOUT_MS = 10000
const FULL_STREAM_TIMEOUT_MS = 30000

const verificationOptions = createChatClientOptions({
	connection: fetchServerSentEvents('/api/ai/quiz-verify'),
})

const parseVerdict = (text: string): 'PASS' | 'FAIL' | null => {
	const upperText = text.toUpperCase()
	if (
		upperText.includes('VERDICT') ||
		upperText.includes('PASS') ||
		upperText.includes('FAIL')
	) {
		if (upperText.includes('PASS')) return 'PASS'
		if (upperText.includes('FAIL')) return 'FAIL'
	}
	return null
}

const getAssistantText = (
	messages: Array<{
		role: string
		parts: Array<{ type: string; content?: string }>
	}>,
): string => {
	const assistantMessages = messages.filter((m) => m.role === 'assistant')
	if (assistantMessages.length === 0) return ''
	const lastAssistant = assistantMessages[assistantMessages.length - 1]
	return lastAssistant.parts
		.filter((p) => p.type === 'text')
		.map((p) => p.content ?? '')
		.join('')
}

export const useQuizVerification = () => {
	const { messages, sendMessage, isLoading, error, clear } =
		useChat(verificationOptions)
	const [verification, setVerification] = useState<AiVerification | null>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearTimeouts = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		if (startTimeoutRef.current) {
			clearTimeout(startTimeoutRef.current)
			startTimeoutRef.current = null
		}
	}, [])

	const assistantText = getAssistantText(
		messages as Array<{
			role: string
			parts: Array<{ type: string; content?: string }>
		}>,
	)

	useEffect(() => {
		if (
			!verification ||
			verification.status === 'complete' ||
			verification.status === 'error'
		) {
			return
		}

		if (isLoading && assistantText.length > 0) {
			clearTimeouts()
			setVerification((prev) =>
				prev
					? { ...prev, status: 'streaming', explanation: assistantText }
					: null,
			)
		}

		if (
			!isLoading &&
			assistantText.length > 0 &&
			verification.status !== 'complete'
		) {
			clearTimeouts()
			const verdict = parseVerdict(assistantText)
			setVerification({
				verdict: verdict ?? 'FAIL',
				explanation: assistantText,
				status: 'complete',
			})
		}
	}, [isLoading, assistantText, verification, clearTimeouts])

	useEffect(() => {
		if (error && verification?.status !== 'complete') {
			clearTimeouts()
			setVerification({
				verdict: 'FAIL',
				explanation: '',
				status: 'error',
				error: error.message || 'Verification failed',
			})
		}
	}, [error, verification?.status, clearTimeouts])

	const verify = useCallback(
		async (payload: VerificationPayload) => {
			clear()
			clearTimeouts()
			setVerification({
				verdict: 'FAIL',
				explanation: '',
				status: 'pending',
			})

			startTimeoutRef.current = setTimeout(() => {
				if (assistantText.length === 0) {
					setVerification((prev) =>
						prev?.status === 'pending'
							? { ...prev, status: 'error', error: 'Stream start timeout' }
							: prev,
					)
				}
			}, STREAM_START_TIMEOUT_MS)

			timeoutRef.current = setTimeout(() => {
				setVerification((prev) =>
					prev && prev.status !== 'complete'
						? { ...prev, status: 'error', error: 'Verification timed out' }
						: prev,
				)
			}, FULL_STREAM_TIMEOUT_MS)

			const prompt = buildQuizVerificationPrompt(payload)
			await sendMessage(prompt)
		},
		[sendMessage, clear, clearTimeouts, assistantText.length],
	)

	const reset = useCallback(() => {
		clearTimeouts()
		clear()
		setVerification(null)
	}, [clear, clearTimeouts])

	useEffect(() => {
		return () => clearTimeouts()
	}, [clearTimeouts])

	return {
		verification,
		verify,
		reset,
		isLoading,
		streamedText: assistantText,
	}
}
