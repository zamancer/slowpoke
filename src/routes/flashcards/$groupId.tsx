import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { allFlashcardGroups } from 'content-collections'
import { FlashcardGrid } from '@/components/flashcard/FlashcardGrid'

export const Route = createFileRoute('/flashcards/$groupId')({
	loader: ({ params }) => {
		const group = allFlashcardGroups.find((g) => g.id === params.groupId)
		if (!group) {
			throw notFound()
		}
		return group
	},
	component: FlashcardGroupPage,
	notFoundComponent: NotFoundPage,
})

function FlashcardGroupPage() {
	const group = Route.useLoaderData()

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
