import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useState } from 'react'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { useQuizById } from '@/hooks/useQuizById'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/quizzes/$quizId')({
	component: QuizPage,
})

function QuizPage() {
	const { quizId } = Route.useParams()
	const { quiz, isLoading } = useQuizById(quizId)
	const navigate = useNavigate()
	const generateVariant = useAction(api.quizGeneration.generateVariant)
	const [isGenerating, setIsGenerating] = useState(false)
	const [variantError, setVariantError] = useState<string | null>(null)

	const handleGenerateVariant = async () => {
		if (!quiz) return
		setIsGenerating(true)
		setVariantError(null)
		try {
			const newContentId = await generateVariant({
				contentId: quiz.id,
				questionCount: quiz.questions.length,
			})
			navigate({
				to: '/generate/quiz/preview/$contentId',
				params: { contentId: newContentId },
			})
		} catch (err) {
			setVariantError(
				err instanceof Error ? err.message : 'Failed to generate variant',
			)
			setIsGenerating(false)
		}
	}

	if (isLoading && !quiz) {
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
			<div className="mb-6 flex items-center justify-between">
				<Link
					to="/quizzes"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to all quizzes
				</Link>
				{quiz.source === 'convex' && (
					<div className="flex flex-col items-end gap-1">
						<button
							type="button"
							onClick={handleGenerateVariant}
							disabled={isGenerating}
							className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isGenerating && (
								<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
							)}
							{isGenerating ? 'Generating variant…' : 'Generate Variant'}
						</button>
						{variantError && (
							<span className="text-xs text-destructive">{variantError}</span>
						)}
					</div>
				)}
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
