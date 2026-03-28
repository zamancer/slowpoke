import { createFileRoute } from '@tanstack/react-router'
import { FlashcardGroupList } from '@/components/flashcard/FlashcardGroupList'
import { useAllFlashcardGroups } from '@/hooks/useAllFlashcardGroups'

export const Route = createFileRoute('/flashcards/')({
	component: FlashcardsPage,
})

function FlashcardsPage() {
	const { groups } = useAllFlashcardGroups()

	return (
		<div className="container mx-auto py-8 px-4">
			<FlashcardGroupList groups={groups} />
		</div>
	)
}
