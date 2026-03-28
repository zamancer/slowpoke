import { createFileRoute } from '@tanstack/react-router'
import { QuizList } from '@/components/quiz/QuizList'
import { useAllQuizzes } from '@/hooks/useAllQuizzes'

export const Route = createFileRoute('/quizzes/')({
	component: QuizzesPage,
})

function QuizzesPage() {
	const { quizzes } = useAllQuizzes()

	return (
		<div className="container mx-auto py-8 px-4">
			<QuizList quizzes={quizzes} />
		</div>
	)
}
