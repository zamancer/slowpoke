import { allQuizzes } from 'content-collections'
import { useQuery } from 'convex/react'
import { useMemo } from 'react'
import { mapConvexQuiz, mapStaticQuiz } from '@/lib/content/mappers'
import type { Quiz } from '@/types/content'
import { api } from '../../convex/_generated/api'

const staticQuizzes = allQuizzes.map(mapStaticQuiz)

export const useAllQuizzes = (): { quizzes: Quiz[]; isLoading: boolean } => {
	const convexQuizzes = useQuery(api.quizContent.list)

	const merged = useMemo(() => {
		const dynamic = (convexQuizzes ?? []).map(mapConvexQuiz)
		const convexIds = new Set(dynamic.map((q) => q.id))
		const filtered = staticQuizzes.filter((q) => !convexIds.has(q.id))
		return [...filtered, ...dynamic]
	}, [convexQuizzes])

	return { quizzes: merged, isLoading: convexQuizzes === undefined }
}
