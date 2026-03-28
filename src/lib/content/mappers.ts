import type {
	FlashcardGroup as StaticFlashcardGroup,
	Quiz as StaticQuiz,
} from 'content-collections'
import type { FlashcardGroup, Quiz } from '@/types/content'

export const mapStaticQuiz = (quiz: StaticQuiz): Quiz => ({
	id: quiz.id,
	type: quiz.type,
	category: quiz.category,
	subcategory: quiz.subcategory,
	difficulty: quiz.difficulty,
	tags: quiz.tags,
	version: quiz.version,
	title: quiz.title,
	questions: quiz.questions,
	source: 'static',
})

export const mapStaticFlashcardGroup = (
	group: StaticFlashcardGroup,
): FlashcardGroup => ({
	id: group.id,
	category: group.category,
	subcategory: group.subcategory,
	difficulty: group.difficulty,
	tags: group.tags,
	version: group.version,
	title: group.title,
	cards: group.cards,
	source: 'static',
})
