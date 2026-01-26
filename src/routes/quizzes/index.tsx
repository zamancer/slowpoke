import { createFileRoute } from '@tanstack/react-router'
import { allQuizzes } from 'content-collections'
import { QuizList } from '@/components/quiz/QuizList'

export const Route = createFileRoute('/quizzes/')({
	loader: () => allQuizzes,
	component: QuizzesPage,
})

function QuizzesPage() {
	const quizzes = Route.useLoaderData()

	return (
		<div className="container mx-auto py-8 px-4">
			<QuizList quizzes={quizzes} />
		</div>
	)
}
