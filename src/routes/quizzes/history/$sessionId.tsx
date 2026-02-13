import { createFileRoute, Link } from '@tanstack/react-router'
import { allQuizzes } from 'content-collections'
import { useQuery } from 'convex/react'
import { useConvexUser } from '@/hooks/useConvexUser'
import { cn } from '@/lib/utils'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/quizzes/history/$sessionId')({
	component: QuizSessionReviewPage,
})

const formatDate = (timestamp: number) => {
	const date = new Date(timestamp)
	return date.toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
}

const getScoreColor = (correct: number, total: number) => {
	const percentage = total > 0 ? (correct / total) * 100 : 0
	if (percentage >= 80) return 'text-green-600 dark:text-green-400'
	if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-red-600 dark:text-red-400'
}

const getScoreMessage = (correct: number, total: number) => {
	const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
	if (percentage >= 90) return 'Excellent!'
	if (percentage >= 70) return 'Good job!'
	if (percentage >= 50) return 'Keep practicing!'
	return 'Review and try again'
}

const VerdictBadge = ({
	verdict,
	status,
}: {
	verdict?: 'PASS' | 'FAIL'
	status?: 'pending' | 'streaming' | 'complete' | 'error'
}) => {
	if (status === 'error') {
		return (
			<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
				Verification unavailable
			</span>
		)
	}

	if (status === 'pending' || status === 'streaming') {
		return (
			<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
				Verification pending
			</span>
		)
	}

	if (!verdict) return null

	return (
		<span
			className={cn(
				'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
				verdict === 'PASS'
					? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
					: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			)}
		>
			{verdict}
		</span>
	)
}

function QuizSessionReviewPage() {
	const { sessionId } = Route.useParams()
	const { isSignedIn, isLoading: isUserLoading } = useConvexUser()

	const session = useQuery(
		api.quizSessions.getSession,
		isSignedIn ? { sessionId: sessionId as Id<'quizSessions'> } : 'skip',
	)

	const answers = useQuery(
		api.quizAnswers.listBySession,
		isSignedIn && session
			? { sessionId: sessionId as Id<'quizSessions'> }
			: 'skip',
	)

	if (isUserLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center min-h-[200px]">
					<div className="text-muted-foreground">Loading...</div>
				</div>
			</div>
		)
	}

	if (!isSignedIn) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="mb-6">
					<Link
						to="/quizzes/history"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						← Back to history
					</Link>
				</div>
				<div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
					<h1 className="text-2xl font-bold">Session Review</h1>
					<p className="text-muted-foreground">
						Sign in to view this quiz session.
					</p>
				</div>
			</div>
		)
	}

	if (session === null) {
		return (
			<div className="container mx-auto py-8 px-4 text-center">
				<h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
				<p className="text-muted-foreground mb-6">
					This quiz session does not exist or you don't have permission to view
					it.
				</p>
				<Link to="/quizzes/history" className="text-primary hover:underline">
					← Back to history
				</Link>
			</div>
		)
	}

	if (session === undefined || answers === undefined) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center min-h-[200px]">
					<div className="text-muted-foreground">Loading session...</div>
				</div>
			</div>
		)
	}

	const quiz = allQuizzes.find((q) => q.id === session.quizId)
	const quizTitle = quiz?.title ?? 'Unknown Quiz'
	const questions = quiz?.questions ?? []

	// Build a map of answers by questionIndex for quick lookup
	const answersByQuestionIndex = new Map(
		answers.map((a) => [a.questionIndex, a]),
	)

	// Get questions in the order they were presented (using questionOrder)
	const orderedQuestions = session.questionOrder.map((questionIndex) => ({
		questionIndex,
		question: questions[questionIndex],
		answer: answersByQuestionIndex.get(questionIndex),
	}))

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Link
					to="/quizzes/history"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to history
				</Link>
			</div>

			<div className="flex flex-col gap-6">
				{/* Header Section */}
				<div className="p-6 rounded-lg border border-border bg-card">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
							<div className="flex flex-col gap-1">
								<h1 className="text-2xl font-bold">{quizTitle}</h1>
								<span className="text-sm text-muted-foreground">
									{session.completedAt
										? formatDate(session.completedAt)
										: 'Unknown date'}
								</span>
							</div>
							<div className="flex flex-col items-start sm:items-end gap-1">
								<span
									className={cn(
										'text-3xl font-bold',
										getScoreColor(session.correctCount, session.totalQuestions),
									)}
								>
									{session.correctCount}/{session.totalQuestions}
								</span>
								<span className="text-sm font-medium">
									{getScoreMessage(
										session.correctCount,
										session.totalQuestions,
									)}
								</span>
								{session.verificationEnabled && (
									<span className="text-xs text-muted-foreground">
										AI verification enabled
									</span>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2 pt-2 border-t border-border">
							<Link
								to="/quizzes/$quizId"
								params={{ quizId: session.quizId }}
								className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Retry Quiz
							</Link>
						</div>
					</div>
				</div>

				{/* Questions Section */}
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">Question Review</h2>

					{orderedQuestions.map((item, orderIndex) => {
						const { questionIndex, question, answer } = item

						if (!question) {
							return (
								<div
									key={`question-${questionIndex}`}
									className="p-4 rounded-lg border border-border bg-muted/50"
								>
									<span className="text-muted-foreground">
										Question data unavailable
									</span>
								</div>
							)
						}

						const userAnswer = answer?.selectedAnswer ?? 'No answer'
						const isCorrect = answer?.isCorrect ?? false
						const justification = answer?.justification ?? ''
						const aiVerification = answer?.aiVerification

						// Check if user selected correct answer but failed AI verification
						const correctAnswerButFailedVerification =
							userAnswer === question.answer &&
							!isCorrect &&
							aiVerification?.status === 'complete'

						return (
							<div
								key={`question-${questionIndex}`}
								className={cn(
									'p-5 rounded-lg border',
									isCorrect
										? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/30'
										: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/30',
								)}
							>
								<div className="flex flex-col gap-4">
									{/* Question Header */}
									<div className="flex items-start gap-3">
										<span
											className={cn(
												'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0',
												isCorrect
													? 'bg-green-500 text-white'
													: 'bg-red-500 text-white',
											)}
										>
											{orderIndex + 1}
										</span>
										<div className="flex-1">
											<p className="font-medium text-base">
												{question.question}
											</p>
										</div>
										{session.verificationEnabled && aiVerification && (
											<VerdictBadge
												verdict={aiVerification.verdict}
												status={aiVerification.status}
											/>
										)}
									</div>

									{/* Correct answer but failed verification notice */}
									{correctAnswerButFailedVerification && (
										<div className="ml-11 text-sm text-amber-600 dark:text-amber-400">
											Correct answer selected, but justification did not pass AI
											verification
										</div>
									)}

									{/* Answer Options */}
									<div className="ml-11 flex flex-col gap-2">
										{question.options.map((option) => {
											const isSelected = option.label === userAnswer
											const isCorrectAnswer = option.label === question.answer
											const showAsCorrect =
												isCorrectAnswer && (isSelected ? isCorrect : true)
											const showAsIncorrect = isSelected && !isCorrect

											return (
												<div
													key={option.label}
													className={cn(
														'flex items-start gap-2 p-2 rounded-md text-sm',
														showAsCorrect &&
															'bg-green-100/50 dark:bg-green-900/30',
														showAsIncorrect &&
															!isCorrectAnswer &&
															'bg-red-100/50 dark:bg-red-900/30',
														!isSelected &&
															!isCorrectAnswer &&
															'bg-background/50',
													)}
												>
													<span
														className={cn(
															'font-medium shrink-0',
															showAsCorrect &&
																'text-green-600 dark:text-green-400',
															showAsIncorrect &&
																!isCorrectAnswer &&
																'text-red-600 dark:text-red-400',
														)}
													>
														{option.label}.
													</span>
													<span
														className={cn(
															showAsCorrect &&
																'text-green-700 dark:text-green-300',
															showAsIncorrect &&
																!isCorrectAnswer &&
																'text-red-700 dark:text-red-300',
														)}
													>
														{option.text}
													</span>
													{isSelected && (
														<span
															className={cn(
																'ml-auto text-xs font-medium shrink-0',
																isCorrect
																	? 'text-green-600 dark:text-green-400'
																	: 'text-red-600 dark:text-red-400',
															)}
														>
															Your answer
														</span>
													)}
													{isCorrectAnswer && !isSelected && (
														<span className="ml-auto text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
															Correct
														</span>
													)}
												</div>
											)
										})}
									</div>

									{/* User's Justification */}
									{justification && (
										<div className="ml-11 p-3 rounded-md bg-background/50 border border-border/50">
											<span className="text-xs text-muted-foreground block mb-1">
												Your justification:
											</span>
											<p className="text-sm italic">{justification}</p>
										</div>
									)}

									{/* AI Verification Explanation */}
									{session.verificationEnabled &&
										aiVerification?.status === 'complete' &&
										aiVerification.explanation && (
											<div className="ml-11 p-3 rounded-md bg-background/50 border border-border/50">
												<span className="text-xs text-muted-foreground block mb-1">
													AI feedback:
												</span>
												<p className="text-sm text-muted-foreground">
													{aiVerification.explanation}
												</p>
											</div>
										)}

									{/* Explanation from quiz content */}
									{question.explanation && (
										<div className="ml-11 p-3 rounded-md bg-primary/5 border border-primary/10">
											<span className="text-xs text-muted-foreground block mb-1">
												Explanation:
											</span>
											<p className="text-sm">{question.explanation}</p>
										</div>
									)}
								</div>
							</div>
						)
					})}
				</div>

				{/* Bottom Retry Button */}
				<div className="flex justify-center pt-4">
					<Link
						to="/quizzes/$quizId"
						params={{ quizId: session.quizId }}
						className="px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						Retry Quiz
					</Link>
				</div>
			</div>
		</div>
	)
}
