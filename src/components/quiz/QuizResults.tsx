import type { Quiz } from 'content-collections'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { QuestionResult } from '@/types/quiz'

interface Question {
	question: string
	options: { label: string; text: string }[]
	answer: string
	explanation: string
	mistakes?: string
}

interface QuizResultsProps {
	quiz: Quiz
	results: QuestionResult[]
	shuffledQuestions: Question[]
	onRestart: () => void
	verificationEnabled?: boolean
}

const VerdictBadge = ({ verdict }: { verdict: 'PASS' | 'FAIL' }) => (
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

export const QuizResults = ({
	quiz,
	results,
	shuffledQuestions,
	onRestart,
	verificationEnabled = false,
}: QuizResultsProps) => {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
	const correctCount = results.filter((r) => r.isCorrect).length
	const totalQuestions = results.length
	const percentage =
		totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

	const getScoreMessage = () => {
		if (percentage >= 90) return 'Excellent!'
		if (percentage >= 70) return 'Good job!'
		if (percentage >= 50) return 'Keep practicing!'
		return 'Review the material and try again'
	}

	const getScoreColor = () => {
		if (percentage >= 90) return 'text-green-600 dark:text-green-400'
		if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
		return 'text-red-600 dark:text-red-400'
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Quiz Complete!</h1>
				<p className="text-muted-foreground">{quiz.title}</p>
			</div>

			<div className="p-6 rounded-lg border border-border bg-card text-center">
				<div className="flex flex-col gap-2">
					<span className={cn('text-5xl font-bold', getScoreColor())}>
						{percentage}%
					</span>
					<span className="text-lg font-medium">{getScoreMessage()}</span>
					<span className="text-muted-foreground">
						{correctCount} out of {totalQuestions} questions correct
					</span>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold">Review Your Answers</h2>

				{results.map((result, index) => {
					const question = shuffledQuestions[result.questionIndex]

					if (!question) {
						return (
							<div
								key={`result-${result.questionIndex}`}
								className="p-4 rounded-lg border border-border bg-muted/50"
							>
								<span className="text-muted-foreground">
									Question data unavailable
								</span>
							</div>
						)
					}

					const selectedOption = question.options.find(
						(o) => o.label === result.selectedAnswer,
					)
					const correctOption = question.options.find(
						(o) => o.label === question.answer,
					)
					const correctAnswerButFailedJustification =
						result.selectedAnswer === question.answer &&
						!result.isCorrect &&
						result.aiVerification?.status === 'complete'
					const isExpanded = expandedIndex === index

					return (
						<div
							key={`result-${result.questionIndex}`}
							className={cn(
								'p-4 rounded-lg border',
								result.isCorrect
									? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/30'
									: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/30',
							)}
						>
							<div className="flex flex-col gap-3">
								<div className="flex items-start gap-3">
									<span
										className={cn(
											'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0',
											result.isCorrect
												? 'bg-green-500 text-white'
												: 'bg-red-500 text-white',
										)}
									>
										{index + 1}
									</span>
									<div className="flex-1">
										<p className="font-medium">{question.question}</p>
									</div>
									{verificationEnabled &&
										result.aiVerification?.status === 'complete' && (
											<VerdictBadge verdict={result.aiVerification.verdict} />
										)}
								</div>

								{correctAnswerButFailedJustification && (
									<div className="ml-9 text-xs text-amber-600 dark:text-amber-400">
										Correct answer, but justification did not pass AI
										verification
									</div>
								)}

								<div className="ml-9 flex flex-col gap-2 text-sm">
									<div>
										<span className="text-muted-foreground">Your answer: </span>
										<span
											className={cn(
												'font-medium',
												result.isCorrect ? 'text-green-600' : 'text-red-600',
											)}
										>
											{result.selectedAnswer}. {selectedOption?.text}
										</span>
									</div>

									{result.selectedAnswer !== question.answer && (
										<div>
											<span className="text-muted-foreground">
												Correct answer:{' '}
											</span>
											<span className="font-medium text-green-600">
												{question.answer}. {correctOption?.text}
											</span>
										</div>
									)}

									{result.justification && (
										<div className="mt-2 p-3 rounded bg-background/50">
											<span className="text-muted-foreground text-xs block mb-1">
												Your justification:
											</span>
											<p className="text-sm italic">{result.justification}</p>
										</div>
									)}

									{verificationEnabled &&
										result.aiVerification?.status === 'complete' &&
										result.aiVerification.explanation && (
											<div className="mt-1">
												<button
													type="button"
													onClick={() =>
														setExpandedIndex(isExpanded ? null : index)
													}
													className="text-xs text-primary hover:underline"
												>
													{isExpanded ? 'Hide AI feedback' : 'Show AI feedback'}
												</button>
												{isExpanded && (
													<div className="mt-2 p-3 rounded bg-background/50 text-sm text-muted-foreground">
														{result.aiVerification.explanation}
													</div>
												)}
											</div>
										)}
								</div>
							</div>
						</div>
					)
				})}
			</div>

			<div className="flex justify-center pt-4">
				<button
					type="button"
					onClick={onRestart}
					className="px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Retake Quiz
				</button>
			</div>
		</div>
	)
}
