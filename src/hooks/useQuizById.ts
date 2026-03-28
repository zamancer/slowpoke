import { allQuizzes } from 'content-collections'
import { useQuery } from 'convex/react'
import { useMemo } from 'react'
import { mapConvexQuiz, mapStaticQuiz } from '@/lib/content/mappers'
import type { Quiz } from '@/types/content'
import { api } from '../../convex/_generated/api'

export const useQuizById = (
	id: string,
): { quiz: Quiz | null; isLoading: boolean } => {
	const staticQuiz = allQuizzes.find((q) => q.id === id)
	const convexQuiz = useQuery(api.quizContent.getByContentId, {
		contentId: id,
	})

	const quiz = useMemo(() => {
		if (convexQuiz) return mapConvexQuiz(convexQuiz)
		if (staticQuiz) return mapStaticQuiz(staticQuiz)
		return null
	}, [staticQuiz, convexQuiz])

	return { quiz, isLoading: convexQuiz === undefined }
}
