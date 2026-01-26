export interface VerificationPayload {
	question: string
	options: { label: string; text: string }[]
	correctAnswer: string
	selectedAnswer: string
	justification: string
	explanation: string
	quizType: 'pattern-selection' | 'anti-patterns' | 'big-o'
}

export interface AiVerification {
	verdict: 'PASS' | 'FAIL'
	explanation: string
	status: 'pending' | 'streaming' | 'complete' | 'error'
	error?: string
}

export interface QuestionResult {
	questionIndex: number
	selectedAnswer: string
	justification: string
	isCorrect: boolean
	aiVerification?: AiVerification
}

export interface VerificationError {
	type: 'network' | 'rate_limit' | 'server' | 'timeout'
	message: string
	retryable: boolean
}
