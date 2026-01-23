'use client'

import { useUser } from '@clerk/clerk-react'
import type { Quiz } from 'content-collections'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuizVerification } from '@/hooks/useQuizVerification'
import type { QuestionResult, VerificationPayload } from '@/types/quiz'
import { QuizAIFeedback } from './QuizAIFeedback'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import { QuizVerificationToggle } from './QuizVerificationToggle'

interface QuizContainerProps {
	quiz: Quiz
}

const CONSECUTIVE_FAILURES_THRESHOLD = 3

const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

export const QuizContainer = ({ quiz }: QuizContainerProps) => {
	const { isSignedIn } = useUser()
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [results, setResults] = useState<QuestionResult[]>([])
	const [isComplete, setIsComplete] = useState(false)
	const [verificationEnabled, setVerificationEnabled] = useState(true)
	const consecutiveFailuresRef = useRef(0)
	const lastPayloadRef = useRef<VerificationPayload | null>(null)

	const { verification, verify, reset, streamedText } = useQuizVerification()

	const shuffledQuestions = useMemo(
		() => shuffleArray(quiz.questions),
		[quiz.questions],
	)

	const currentQuestion = shuffledQuestions[currentQuestionIndex]
	const totalQuestions = shuffledQuestions.length
	const correctCount = results.filter((r) => {
		if (r.aiVerification?.status === 'complete') {
			return r.isCorrect && r.aiVerification.verdict === 'PASS'
		}
		return r.isCorrect
	}).length

	const canVerify = verificationEnabled && isSignedIn

	useEffect(() => {
		if (verification?.status === 'error') {
			consecutiveFailuresRef.current += 1
			if (consecutiveFailuresRef.current >= CONSECUTIVE_FAILURES_THRESHOLD) {
				setVerificationEnabled(false)
				consecutiveFailuresRef.current = 0
			}
		}
		if (verification?.status === 'complete') {
			consecutiveFailuresRef.current = 0
		}
	}, [verification?.status])

	useEffect(() => {
		if (
			verification?.status === 'complete' ||
			verification?.status === 'error'
		) {
			setResults((prev) => {
				const lastIndex = prev.length - 1
				if (lastIndex < 0) return prev
				const lastResult = prev[lastIndex]
				if (lastResult.aiVerification?.status === verification.status)
					return prev
				const updated = [...prev]
				updated[lastIndex] = {
					...lastResult,
					aiVerification: verification,
				}
				return updated
			})
		}
	}, [verification])

	const handleAnswerSubmit = useCallback(
		(selectedAnswer: string, justification: string) => {
			const isCorrect = selectedAnswer === currentQuestion.answer

			const result: QuestionResult = {
				questionIndex: currentQuestionIndex,
				selectedAnswer,
				justification,
				isCorrect,
			}

			if (canVerify) {
				result.aiVerification = {
					verdict: 'FAIL',
					explanation: '',
					status: 'pending',
				}
			}

			setResults((prev) => [...prev, result])

			if (canVerify) {
				const payload: VerificationPayload = {
					question: currentQuestion.question,
					options: currentQuestion.options,
					correctAnswer: currentQuestion.answer,
					selectedAnswer,
					justification,
					explanation: currentQuestion.explanation,
					quizType: quiz.type as VerificationPayload['quizType'],
				}
				lastPayloadRef.current = payload
				verify(payload)
			}
		},
		[currentQuestion, currentQuestionIndex, canVerify, verify, quiz.type],
	)

	const handleRetry = useCallback(() => {
		if (lastPayloadRef.current) {
			verify(lastPayloadRef.current)
		}
	}, [verify])

	const handleNextQuestion = useCallback(() => {
		reset()
		lastPayloadRef.current = null
		if (currentQuestionIndex < totalQuestions - 1) {
			setCurrentQuestionIndex((prev) => prev + 1)
		} else {
			setIsComplete(true)
		}
	}, [currentQuestionIndex, totalQuestions, reset])

	const handleRestart = useCallback(() => {
		setCurrentQuestionIndex(0)
		setResults([])
		setIsComplete(false)
		reset()
		lastPayloadRef.current = null
		consecutiveFailuresRef.current = 0
	}, [reset])

	const handleToggle = useCallback((enabled: boolean) => {
		setVerificationEnabled(enabled)
		if (enabled) {
			consecutiveFailuresRef.current = 0
		}
	}, [])

	const currentResult = results.find(
		(r) => r.questionIndex === currentQuestionIndex,
	)
	const hasAnswered = !!currentResult

	if (isComplete) {
		return (
			<QuizResults
				quiz={quiz}
				results={results}
				shuffledQuestions={shuffledQuestions}
				onRestart={handleRestart}
				verificationEnabled={verificationEnabled}
			/>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">{quiz.title}</h1>
					<QuizVerificationToggle
						enabled={verificationEnabled}
						onToggle={handleToggle}
					/>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="capitalize">{quiz.difficulty}</span>
					<span>·</span>
					<span>{totalQuestions} questions</span>
					<span>·</span>
					<div className="flex gap-1">
						{quiz.tags.map((tag) => (
							<span
								key={tag}
								className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>

			<QuizProgress
				current={currentQuestionIndex + 1}
				total={totalQuestions}
				correct={correctCount}
				answered={results.length}
			/>

			<QuizQuestion
				question={currentQuestion}
				questionNumber={currentQuestionIndex + 1}
				onSubmit={handleAnswerSubmit}
				onNext={handleNextQuestion}
				hasAnswered={hasAnswered}
				selectedAnswer={currentResult?.selectedAnswer}
				isLastQuestion={currentQuestionIndex === totalQuestions - 1}
				showJustification={canVerify}
			/>

			{hasAnswered && canVerify && (
				<QuizAIFeedback
					verification={verification}
					streamedText={streamedText}
					onRetry={handleRetry}
				/>
			)}
		</div>
	)
}
