import { createFileRoute, Link } from '@tanstack/react-router'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { useQuizById } from '@/hooks/useQuizById'

export const Route = createFileRoute('/quizzes/$quizId')({
	component: QuizPage,
	notFoundComponent: NotFoundPage,
})

function QuizPage() {
	const { quizId } = Route.useParams()
	const { quiz, isLoading } = useQuizById(quizId)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		)
	}

	if (!quiz) {
		return <NotFoundPage />
	}

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
