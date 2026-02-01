'use client'

import type { Quiz } from 'content-collections'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvexUser } from '@/hooks/useConvexUser'
import { useQuizVerification } from '@/hooks/useQuizVerification'
import type {
	AiVerification,
	QuestionResult,
	VerificationPayload,
} from '@/types/quiz'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { QuizAIFeedback } from './QuizAIFeedback'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import { QuizResumePrompt } from './QuizResumePrompt'
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

const generateContentHash = (quiz: Quiz): string => {
	const content = JSON.stringify({
		questions: quiz.questions.map((q) => ({
			question: q.question,
			options: q.options,
			answer: q.answer,
		})),
	})
	let hash = 0
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash
	}
	return hash.toString(36)
}

export const QuizContainer = ({ quiz }: QuizContainerProps) => {
	const {
		user: convexUser,
		isSignedIn,
		isLoading: isUserLoading,
	} = useConvexUser()
	const [sessionId, setSessionId] = useState<Id<'quizSessions'> | null>(null)
	const [questionOrder, setQuestionOrder] = useState<number[] | null>(null)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [results, setResults] = useState<QuestionResult[]>([])
	const [isComplete, setIsComplete] = useState(false)
	const [verificationEnabled, setVerificationEnabled] = useState(true)
	const [isInitializing, setIsInitializing] = useState(true)
	const [showResumePrompt, setShowResumePrompt] = useState(false)
	const [sessionClaimed, setSessionClaimed] = useState(false)
	const [pendingSession, setPendingSession] = useState<{
		id: Id<'quizSessions'>
		questionOrder: number[]
		currentQuestionIndex: number
	} | null>(null)
	const consecutiveFailuresRef = useRef(0)
	const lastPayloadRef = useRef<VerificationPayload | null>(null)
	const verificationTokenRef = useRef(0)
	const activeTokenRef = useRef(0)
	const isVerifyingRef = useRef(false)
	const pendingResetRef = useRef(false)

	const { verification, verify, reset, streamedText } = useQuizVerification()

	const activeSession = useQuery(
		api.quizSessions.getActiveSession,
		convexUser ? { quizId: quiz._meta.path } : 'skip',
	)
	const effectiveSessionId = pendingSession?.id ?? sessionId
	const sessionAnswers = useQuery(
		api.quizAnswers.listBySession,
		effectiveSessionId ? { sessionId: effectiveSessionId } : 'skip',
	)

	const startSession = useMutation(api.quizSessions.start)
	const abandonSession = useMutation(api.quizSessions.abandon)
	const completeSession = useMutation(api.quizSessions.complete)
	const updateProgress = useMutation(api.quizSessions.updateProgress)
	const saveAnswer = useMutation(api.quizAnswers.saveAnswer)
	const updateAiVerification = useMutation(api.quizAnswers.updateAiVerification)

	const contentHash = useMemo(() => generateContentHash(quiz), [quiz])

	const shuffledQuestions = useMemo(() => {
		if (!questionOrder) return null
		return questionOrder.map((index) => quiz.questions[index])
	}, [questionOrder, quiz.questions])

	const currentQuestion = shuffledQuestions?.[currentQuestionIndex]
	const totalQuestions = quiz.questions.length
	const correctCount = results.filter((r) => r.isCorrect).length

	const canVerify = verificationEnabled && !!convexUser

	// biome-ignore lint/correctness/useExhaustiveDependencies: verificationEnabled is read but intentionally excluded - including it causes the toggle to reset when changed
	useEffect(() => {
		// Skip if session already initialized
		if (sessionClaimed) return

		// Wait for auth to fully load before deciding on auth state
		if (isUserLoading) return

		// For unauthenticated users, just shuffle locally
		if (!isSignedIn) {
			const order = shuffleArray(quiz.questions.map((_, i) => i))
			setQuestionOrder(order)
			setIsInitializing(false)
			setSessionClaimed(true)
			return
		}

		// Wait for Convex user to be synced before doing anything
		if (!convexUser) {
			return
		}

		// Now safe to query/mutate Convex
		if (activeSession === undefined) {
			return
		}

		if (activeSession === null) {
			const order = shuffleArray(quiz.questions.map((_, i) => i))
			setQuestionOrder(order)
			startSession({
				quizId: quiz._meta.path,
				questionOrder: order,
				totalQuestions: quiz.questions.length,
				verificationEnabled,
				contentHash,
			}).then((id) => {
				setSessionId(id)
				setIsInitializing(false)
				setSessionClaimed(true)
			})
			return
		}

		if (activeSession.contentHash !== contentHash) {
			abandonSession({ sessionId: activeSession._id }).then(() => {
				const order = shuffleArray(quiz.questions.map((_, i) => i))
				setQuestionOrder(order)
				startSession({
					quizId: quiz._meta.path,
					questionOrder: order,
					totalQuestions: quiz.questions.length,
					verificationEnabled,
					contentHash,
				}).then((id) => {
					setSessionId(id)
					setIsInitializing(false)
					setSessionClaimed(true)
				})
			})
			return
		}

		if (activeSession.currentQuestionIndex > 0 || sessionAnswers?.length) {
			setPendingSession({
				id: activeSession._id,
				questionOrder: activeSession.questionOrder,
				currentQuestionIndex: activeSession.currentQuestionIndex,
			})
			setShowResumePrompt(true)
			setIsInitializing(false)
		} else {
			setSessionId(activeSession._id)
			setQuestionOrder(activeSession.questionOrder)
			setVerificationEnabled(activeSession.verificationEnabled)
			setIsInitializing(false)
			setSessionClaimed(true)
		}
	}, [
		isUserLoading,
		isSignedIn,
		convexUser,
		activeSession,
		quiz,
		contentHash,
		startSession,
		abandonSession,
		sessionClaimed,
		sessionAnswers?.length,
	])

	const handleResume = useCallback(() => {
		if (!pendingSession || !sessionAnswers) return

		setSessionId(pendingSession.id)
		setQuestionOrder(pendingSession.questionOrder)
		setCurrentQuestionIndex(pendingSession.currentQuestionIndex)

		const restoredResults: QuestionResult[] = sessionAnswers.map((answer) => {
			let aiVerification = answer.aiVerification as AiVerification | undefined
			if (aiVerification?.status === 'streaming') {
				aiVerification = { ...aiVerification, status: 'pending' }
			}
			return {
				questionIndex: answer.orderPosition,
				selectedAnswer: answer.selectedAnswer,
				justification: answer.justification,
				isCorrect: answer.isCorrect,
				aiVerification,
			}
		})

		setResults(restoredResults)
		setShowResumePrompt(false)
		setPendingSession(null)
		setSessionClaimed(true)
	}, [pendingSession, sessionAnswers])

	const handleStartFresh = useCallback(async () => {
		if (!pendingSession) return

		await abandonSession({ sessionId: pendingSession.id })
		const order = shuffleArray(quiz.questions.map((_, i) => i))
		setQuestionOrder(order)
		const id = await startSession({
			quizId: quiz._meta.path,
			questionOrder: order,
			totalQuestions: quiz.questions.length,
			verificationEnabled,
			contentHash,
		})
		setSessionId(id)
		setCurrentQuestionIndex(0)
		setResults([])
		setShowResumePrompt(false)
		setPendingSession(null)
		setSessionClaimed(true)
	}, [
		pendingSession,
		abandonSession,
		startSession,
		quiz,
		verificationEnabled,
		contentHash,
	])

	useEffect(() => {
		if (!verificationEnabled) return
		if (activeTokenRef.current !== verificationTokenRef.current) return
		if (verification?.status === 'error') {
			consecutiveFailuresRef.current += 1
			if (consecutiveFailuresRef.current >= CONSECUTIVE_FAILURES_THRESHOLD) {
				setVerificationEnabled(false)
				consecutiveFailuresRef.current = 0
				isVerifyingRef.current = false
				pendingResetRef.current = false
			}
		}
		if (verification?.status === 'complete') {
			consecutiveFailuresRef.current = 0
		}
	}, [verification?.status, verificationEnabled])

	useEffect(() => {
		if (!verificationEnabled) return
		if (activeTokenRef.current !== verificationTokenRef.current) return
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
					isCorrect:
						lastResult.isCorrect && verification.status === 'complete'
							? verification.verdict === 'PASS'
							: lastResult.isCorrect,
				}
				return updated
			})

			if (sessionId && questionOrder) {
				const lastResultIndex = results.length - 1
				if (lastResultIndex >= 0) {
					const originalQuestionIndex =
						questionOrder[results[lastResultIndex].questionIndex]
					updateAiVerification({
						sessionId,
						questionIndex: originalQuestionIndex,
						aiVerification: verification,
					})
				}
			}

			isVerifyingRef.current = false
			if (pendingResetRef.current) {
				pendingResetRef.current = false
				reset()
			}
		}
	}, [
		verification,
		verificationEnabled,
		reset,
		sessionId,
		questionOrder,
		results,
		updateAiVerification,
	])

	const handleAnswerSubmit = useCallback(
		async (selectedAnswer: string, justification: string) => {
			if (!currentQuestion || !questionOrder) return

			const originalQuestionIndex = questionOrder[currentQuestionIndex]
			const isCorrect = selectedAnswer === currentQuestion.answer

			const existingResultIndex = results.findIndex(
				(r) => r.questionIndex === currentQuestionIndex,
			)
			const isBacktrackUpdate = existingResultIndex !== -1

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

			if (isBacktrackUpdate) {
				setResults((prev) => {
					const updated = [...prev]
					updated[existingResultIndex] = result
					return updated
				})
			} else {
				setResults((prev) => [...prev, result])
			}

			if (sessionId) {
				saveAnswer({
					sessionId,
					questionIndex: originalQuestionIndex,
					orderPosition: currentQuestionIndex,
					selectedAnswer,
					justification,
					isCorrect,
					aiVerification: canVerify
						? { verdict: 'FAIL', explanation: '', status: 'pending' }
						: undefined,
				})
			}

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
				activeTokenRef.current = verificationTokenRef.current
				isVerifyingRef.current = true
				verify(payload)
			}
		},
		[
			currentQuestion,
			currentQuestionIndex,
			questionOrder,
			canVerify,
			verify,
			quiz.type,
			sessionId,
			saveAnswer,
			results,
		],
	)

	const handleRetry = useCallback(() => {
		if (lastPayloadRef.current) {
			isVerifyingRef.current = true
			verify(lastPayloadRef.current)
		}
	}, [verify])

	const handleNextQuestion = useCallback(() => {
		if (isVerifyingRef.current) {
			pendingResetRef.current = true
		} else {
			reset()
		}
		lastPayloadRef.current = null
		if (currentQuestionIndex < totalQuestions - 1) {
			const nextIndex = currentQuestionIndex + 1
			setCurrentQuestionIndex(nextIndex)
			if (sessionId) {
				updateProgress({ sessionId, currentQuestionIndex: nextIndex })
			}
		} else {
			setIsComplete(true)
			if (sessionId) {
				completeSession({ sessionId })
			}
		}
	}, [
		currentQuestionIndex,
		totalQuestions,
		reset,
		sessionId,
		updateProgress,
		completeSession,
	])

	const handlePreviousQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			if (isVerifyingRef.current) {
				pendingResetRef.current = true
			} else {
				reset()
			}
			lastPayloadRef.current = null
			const prevIndex = currentQuestionIndex - 1
			setCurrentQuestionIndex(prevIndex)
			if (sessionId) {
				updateProgress({ sessionId, currentQuestionIndex: prevIndex })
			}
		}
	}, [currentQuestionIndex, reset, sessionId, updateProgress])

	const handleRestart = useCallback(async () => {
		if (sessionId) {
			await abandonSession({ sessionId })
		}
		const order = shuffleArray(quiz.questions.map((_, i) => i))
		setQuestionOrder(order)
		if (convexUser) {
			const id = await startSession({
				quizId: quiz._meta.path,
				questionOrder: order,
				totalQuestions: quiz.questions.length,
				verificationEnabled,
				contentHash,
			})
			setSessionId(id)
		}
		setCurrentQuestionIndex(0)
		setResults([])
		setIsComplete(false)
		reset()
		lastPayloadRef.current = null
		consecutiveFailuresRef.current = 0
		isVerifyingRef.current = false
		pendingResetRef.current = false
	}, [
		sessionId,
		abandonSession,
		startSession,
		quiz,
		verificationEnabled,
		contentHash,
		convexUser,
		reset,
	])

	const handleToggle = useCallback(
		(enabled: boolean) => {
			setVerificationEnabled(enabled)
			if (enabled) {
				consecutiveFailuresRef.current = 0
			} else {
				verificationTokenRef.current += 1
				isVerifyingRef.current = false
				pendingResetRef.current = false
				reset()
				setResults((prev) =>
					prev.map((r) => {
						if (!r.aiVerification) return r
						const originalCorrect =
							r.selectedAnswer === shuffledQuestions?.[r.questionIndex]?.answer
						return {
							...r,
							aiVerification: undefined,
							isCorrect: originalCorrect,
						}
					}),
				)
			}
		},
		[reset, shuffledQuestions],
	)

	if (showResumePrompt && pendingSession) {
		return (
			<QuizResumePrompt
				quiz={quiz}
				answeredCount={sessionAnswers?.length ?? 0}
				totalQuestions={totalQuestions}
				onResume={handleResume}
				onStartFresh={handleStartFresh}
			/>
		)
	}

	if (isInitializing || isUserLoading || !shuffledQuestions || !currentQuestion) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		)
	}

	const currentResult = results.find(
		(r) => r.questionIndex === currentQuestionIndex,
	)
	const hasAnswered = !!currentResult
	const showEvaluation =
		hasAnswered &&
		(!canVerify ||
			!currentResult?.aiVerification ||
			currentResult.aiVerification.status === 'complete' ||
			currentResult.aiVerification.status === 'error')

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
				onPrevious={
					currentQuestionIndex > 0 ? handlePreviousQuestion : undefined
				}
				hasAnswered={hasAnswered}
				selectedAnswer={currentResult?.selectedAnswer}
				justification={currentResult?.justification}
				isCorrect={currentResult?.isCorrect ?? false}
				showEvaluation={showEvaluation}
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
