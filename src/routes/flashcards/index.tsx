import { allFlashcardGroups } from 'content-collections'
import { createFileRoute } from '@tanstack/react-router'
import { FlashcardGroupList } from '@/components/flashcard/FlashcardGroupList'

export const Route = createFileRoute('/flashcards/')({
	loader: () => allFlashcardGroups,
	component: FlashcardsPage,
})

function FlashcardsPage() {
	const groups = Route.useLoaderData()

	return (
		<div className="container mx-auto py-8 px-4">
			<FlashcardGroupList groups={groups} />
		</div>
	)
}
