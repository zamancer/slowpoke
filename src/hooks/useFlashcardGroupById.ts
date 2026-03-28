import { allFlashcardGroups } from 'content-collections'
import { useQuery } from 'convex/react'
import { useMemo } from 'react'
import {
	mapConvexFlashcardGroup,
	mapStaticFlashcardGroup,
} from '@/lib/content/mappers'
import type { FlashcardGroup } from '@/types/content'
import { api } from '../../convex/_generated/api'

export const useFlashcardGroupById = (
	id: string,
): { group: FlashcardGroup | null; isLoading: boolean } => {
	const staticGroup = allFlashcardGroups.find((g) => g.id === id)
	const convexGroup = useQuery(api.flashcardContent.getByContentId, {
		contentId: id,
	})

	const group = useMemo(() => {
		if (convexGroup) return mapConvexFlashcardGroup(convexGroup)
		if (staticGroup) return mapStaticFlashcardGroup(staticGroup)
		return null
	}, [staticGroup, convexGroup])

	return { group, isLoading: convexGroup === undefined }
}
