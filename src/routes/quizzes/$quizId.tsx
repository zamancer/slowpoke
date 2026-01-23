import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { allQuizzes } from 'content-collections'
import { QuizContainer } from '@/components/quiz/QuizContainer'

export const Route = createFileRoute('/quizzes/$quizId')({
	loader: ({ params }) => {
		const quiz = allQuizzes.find((q) => q.id === params.quizId)
		if (!quiz) {
			throw notFound()
		}
		return quiz
	},
	component: QuizPage,
	notFoundComponent: NotFoundPage,
})

function QuizPage() {
	const quiz = Route.useLoaderData()

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Link
					to="/quizzes"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to all quizzes
				</Link>
			</div>
			<QuizContainer quiz={quiz} />
		</div>
	)
}

function NotFoundPage() {
	return (
		<div className="container mx-auto py-8 px-4 text-center">
			<h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
			<p className="text-muted-foreground mb-6">
				The requested quiz does not exist.
			</p>
			<Link to="/quizzes" className="text-primary hover:underline">
				← Back to all quizzes
			</Link>
		</div>
	)
}
