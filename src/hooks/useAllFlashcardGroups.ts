import { allFlashcardGroups } from 'content-collections'
import { useQuery } from 'convex/react'
import { useMemo } from 'react'
import {
	mapConvexFlashcardGroup,
	mapStaticFlashcardGroup,
} from '@/lib/content/mappers'
import type { FlashcardGroup } from '@/types/content'
import { api } from '../../convex/_generated/api'

const staticGroups = allFlashcardGroups.map(mapStaticFlashcardGroup)

export const useAllFlashcardGroups = (): {
	groups: FlashcardGroup[]
	isLoading: boolean
} => {
	const convexGroups = useQuery(api.flashcardContent.list)

	const merged = useMemo(() => {
		const dynamic = (convexGroups ?? []).map(mapConvexFlashcardGroup)
		const convexIds = new Set(dynamic.map((g) => g.id))
		const filtered = staticGroups.filter((g) => !convexIds.has(g.id))
		return [...filtered, ...dynamic]
	}, [convexGroups])

	return { groups: merged, isLoading: convexGroups === undefined }
}
