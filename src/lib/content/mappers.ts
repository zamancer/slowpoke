import type {
	FlashcardGroup as StaticFlashcardGroup,
	Quiz as StaticQuiz,
} from 'content-collections'
import type { FlashcardGroup, Quiz } from '@/types/content'
import type { Doc } from '../../convex/_generated/dataModel'

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
	status: 'published',
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

export const mapConvexQuiz = (doc: Doc<'quizContent'>): Quiz => ({
	id: doc.contentId,
	type: doc.type,
	category: doc.category,
	subcategory: doc.subcategory,
	difficulty: doc.difficulty,
	tags: doc.tags,
	version: doc.version,
	title: doc.title,
	questions: doc.questions,
	source: 'convex',
	status: doc.status ?? 'published',
})

export const mapConvexFlashcardGroup = (
	doc: Doc<'flashcardContent'>,
): FlashcardGroup => ({
	id: doc.contentId,
	category: doc.category,
	subcategory: doc.subcategory,
	difficulty: doc.difficulty,
	tags: doc.tags,
	version: doc.version,
	title: doc.title,
	cards: doc.cards,
	source: 'convex',
})
