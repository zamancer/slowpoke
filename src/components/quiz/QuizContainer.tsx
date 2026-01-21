'use client'

import { useState, useMemo } from 'react'
import type { Quiz } from 'content-collections'
import { QuizQuestion } from './QuizQuestion'
import { QuizProgress } from './QuizProgress'
import { QuizResults } from './QuizResults'

interface QuizContainerProps {
	quiz: Quiz
}

interface QuestionResult {
	questionIndex: number
	selectedAnswer: string
	justification: string
	isCorrect: boolean
}

const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

export const QuizContainer = ({ quiz }: QuizContainerProps) => {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [results, setResults] = useState<QuestionResult[]>([])
	const [isComplete, setIsComplete] = useState(false)

	const shuffledQuestions = useMemo(
		() => shuffleArray(quiz.questions),
		[quiz.questions],
	)

	const currentQuestion = shuffledQuestions[currentQuestionIndex]
	const totalQuestions = shuffledQuestions.length
	const correctCount = results.filter((r) => r.isCorrect).length

	const handleAnswerSubmit = (selectedAnswer: string, justification: string) => {
		const isCorrect = selectedAnswer === currentQuestion.answer

		setResults((prev) => [
			...prev,
			{
				questionIndex: currentQuestionIndex,
				selectedAnswer,
				justification,
				isCorrect,
			},
		])
	}

	const handleNextQuestion = () => {
		if (currentQuestionIndex < totalQuestions - 1) {
			setCurrentQuestionIndex((prev) => prev + 1)
		} else {
			setIsComplete(true)
		}
	}

	const handleRestart = () => {
		setCurrentQuestionIndex(0)
		setResults([])
		setIsComplete(false)
	}

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
			/>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{quiz.title}</h1>
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
			/>
		</div>
	)
}
