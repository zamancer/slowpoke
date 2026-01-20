import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { FlashcardGroupList } from '@/components/flashcard/FlashcardGroupList'
import { loadAllFlashcardGroups } from '@/lib/common/flashcard-common-loader'

const getFlashcardGroups = createServerFn({ method: 'GET' }).handler(
	async () => {
		return loadAllFlashcardGroups()
	},
)

export const Route = createFileRoute('/flashcards/')({
	loader: () => getFlashcardGroups(),
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
