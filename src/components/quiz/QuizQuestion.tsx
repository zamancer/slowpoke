'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

interface Option {
	label: string
	text: string
}

interface Question {
	question: string
	options: Option[]
	answer: string
	explanation: string
	mistakes?: string
}

interface QuizQuestionProps {
	question: Question
	questionNumber: number
	onSubmit: (selectedAnswer: string, justification: string) => void
	onNext: () => void
	hasAnswered: boolean
	selectedAnswer?: string
	isCorrect?: boolean
	showEvaluation?: boolean
	isLastQuestion: boolean
	showJustification?: boolean
}

const MIN_JUSTIFICATION_LENGTH = 50

export const QuizQuestion = ({
	question,
	questionNumber,
	onSubmit,
	onNext,
	hasAnswered,
	selectedAnswer,
	isCorrect = false,
	showEvaluation = true,
	isLastQuestion,
	showJustification = true,
}: QuizQuestionProps) => {
	const [selected, setSelected] = useState<string | null>(null)
	const [justification, setJustification] = useState('')
	const [showError, setShowError] = useState(false)
	const justificationId = useId()

	const correctAnswerButFailedJustification =
		!isCorrect && selectedAnswer === question.answer
	const canSubmit = showJustification
		? selected !== null && justification.length >= MIN_JUSTIFICATION_LENGTH
		: selected !== null

	const handleSubmit = () => {
		if (!canSubmit) {
			setShowError(true)
			return
		}
		setShowError(false)
		if (selected) onSubmit(selected, justification)
	}

	const handleNext = () => {
		setSelected(null)
		setJustification('')
		setShowError(false)
		onNext()
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="p-6 rounded-lg border border-border bg-card">
				<div className="flex flex-col gap-4">
					<div className="flex items-start gap-3">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
							{questionNumber}
						</span>
						<p className="text-lg leading-relaxed pt-1">{question.question}</p>
					</div>

					<div className="flex flex-col gap-2 mt-2">
						{question.options.map((option) => {
							const isSelected = hasAnswered
								? selectedAnswer === option.label
								: selected === option.label
							const isCorrectOption = option.label === question.answer
							const showCorrectHighlight =
								showEvaluation && hasAnswered && isCorrectOption
							const showIncorrectHighlight =
								showEvaluation && hasAnswered && isSelected && !isCorrectOption
							const showNeutralHighlight =
								!showEvaluation && hasAnswered && isSelected

							return (
								<button
									key={option.label}
									type="button"
									disabled={hasAnswered}
									onClick={() => setSelected(option.label)}
									className={cn(
										'flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
										'hover:border-primary/50 hover:bg-primary/5',
										hasAnswered && 'cursor-default hover:bg-transparent',
										!hasAnswered &&
											isSelected &&
											'border-primary bg-primary/10',
										showNeutralHighlight && 'border-primary bg-primary/10',
										showCorrectHighlight &&
											'border-green-500 bg-green-50 dark:bg-green-950',
										showIncorrectHighlight &&
											'border-red-500 bg-red-50 dark:bg-red-950',
									)}
								>
									<span
										className={cn(
											'flex items-center justify-center w-7 h-7 rounded-full border text-sm font-medium shrink-0',
											!hasAnswered && isSelected
												? 'border-primary bg-primary text-primary-foreground'
												: 'border-border',
											showNeutralHighlight &&
												'border-primary bg-primary text-primary-foreground',
											showCorrectHighlight &&
												'border-green-500 bg-green-500 text-white',
											showIncorrectHighlight &&
												'border-red-500 bg-red-500 text-white',
										)}
									>
										{option.label}
									</span>
									<span className="pt-0.5">{option.text}</span>
								</button>
							)
						})}
					</div>
				</div>
			</div>

			{!hasAnswered && showJustification && (
				<div className="p-6 rounded-lg border border-border bg-card">
					<div className="flex flex-col gap-3">
						<label htmlFor={justificationId} className="font-medium">
							Justify your answer{' '}
							<span className="text-muted-foreground font-normal">
								(minimum {MIN_JUSTIFICATION_LENGTH} characters)
							</span>
						</label>
						<textarea
							id={justificationId}
							value={justification}
							onChange={(e) => setJustification(e.target.value)}
							placeholder="Explain why you chose this answer..."
							className={cn(
								'w-full min-h-32 p-3 rounded-lg border border-border bg-background',
								'focus:outline-none focus:ring-2 focus:ring-primary/50',
								'resize-y',
								showError &&
									justification.length < MIN_JUSTIFICATION_LENGTH &&
									'border-red-500',
							)}
						/>
						<div className="flex items-center justify-between text-sm">
							<span
								className={cn(
									'text-muted-foreground',
									justification.length >= MIN_JUSTIFICATION_LENGTH &&
										'text-green-600 dark:text-green-400',
									showError &&
										justification.length < MIN_JUSTIFICATION_LENGTH &&
										'text-red-500',
								)}
							>
								{justification.length}/{MIN_JUSTIFICATION_LENGTH} characters
							</span>
							{showError && !selected && (
								<span className="text-red-500">Please select an answer</span>
							)}
						</div>
					</div>
				</div>
			)}

			{hasAnswered && !showEvaluation && (
				<output className="block p-6 rounded-lg border border-border bg-card">
					<div className="flex items-center gap-3">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<span className="text-muted-foreground">
							Evaluating your answer...
						</span>
					</div>
				</output>
			)}

			{hasAnswered && showEvaluation && (
				<div
					className={cn(
						'p-6 rounded-lg border',
						isCorrect
							? 'border-green-500 bg-green-50 dark:bg-green-950/50'
							: 'border-red-500 bg-red-50 dark:bg-red-950/50',
					)}
				>
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<span
								className={cn(
									'text-lg font-semibold',
									isCorrect
										? 'text-green-700 dark:text-green-300'
										: 'text-red-700 dark:text-red-300',
								)}
							>
								{isCorrect ? 'Correct!' : 'Incorrect'}
							</span>
							{!isCorrect && !correctAnswerButFailedJustification && (
								<span className="text-muted-foreground">
									The correct answer is {question.answer}
								</span>
							)}
						</div>

						{correctAnswerButFailedJustification && (
							<p className="text-sm text-amber-600 dark:text-amber-400">
								Correct answer, but justification did not demonstrate
								understanding
							</p>
						)}

						<div className="flex flex-col gap-2">
							<h4 className="font-medium">Expert Explanation</h4>
							<p className="text-muted-foreground leading-relaxed">
								{question.explanation}
							</p>
						</div>

						{question.mistakes && (
							<div className="flex flex-col gap-2">
								<h4 className="font-medium">Common Mistakes</h4>
								<p className="text-muted-foreground leading-relaxed">
									{question.mistakes}
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			<div className="flex justify-end">
				{!hasAnswered ? (
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!canSubmit}
						className={cn(
							'px-6 py-2 rounded-lg font-medium transition-colors',
							canSubmit
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'bg-muted text-muted-foreground cursor-not-allowed',
						)}
					>
						Submit Answer
					</button>
				) : (
					<button
						type="button"
						onClick={handleNext}
						className="px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						{isLastQuestion ? 'See Results' : 'Next Question'}
					</button>
				)}
			</div>
		</div>
	)
}
