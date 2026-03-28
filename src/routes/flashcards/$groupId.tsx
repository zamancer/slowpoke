import { createFileRoute, Link } from '@tanstack/react-router'
import { FlashcardGrid } from '@/components/flashcard/FlashcardGrid'
import { useFlashcardGroupById } from '@/hooks/useFlashcardGroupById'

export const Route = createFileRoute('/flashcards/$groupId')({
	component: FlashcardGroupPage,
	notFoundComponent: NotFoundPage,
})

function FlashcardGroupPage() {
	const { groupId } = Route.useParams()
	const { group, isLoading } = useFlashcardGroupById(groupId)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		)
	}

	if (!group) {
		return <NotFoundPage />
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Link
					to="/flashcards"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to all groups
				</Link>
			</div>
			<FlashcardGrid group={group} />
		</div>
	)
}

function NotFoundPage() {
	return (
		<div className="container mx-auto py-8 px-4 text-center">
			<h1 className="text-2xl font-bold mb-4">Flashcard Group Not Found</h1>
			<p className="text-muted-foreground mb-6">
				The requested flashcard group does not exist.
			</p>
			<Link to="/flashcards" className="text-primary hover:underline">
				← Back to all groups
			</Link>
		</div>
	)
}
