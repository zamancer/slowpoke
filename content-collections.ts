import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'
import { parseCardSections, parseQuizQuestions } from './src/lib/content/parsers'

const DifficultySchema = z.enum(['easy', 'medium', 'hard'])
const FlashcardDifficultySchema = DifficultySchema

const QuizTypeSchema = z.string()

const getGroupTitle = (subcategory: string, id: string): string => {
	const subcategoryTitle = subcategory
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

	const isFirstGroup = id.endsWith('001')
	return `${subcategoryTitle} ${isFirstGroup ? 'Fundamentals' : 'Applications'}`
}

const getQuizTitle = (subcategory: string, type: string): string => {
	const subcategoryTitle = subcategory
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

	const typeLabel = type === 'pattern-selection' ? 'Pattern Selection'
		: type === 'anti-patterns' ? 'Anti-Patterns'
		: type === 'big-o' ? 'Big O Analysis'
		: type

	return `${subcategoryTitle}: ${typeLabel}`
}

const flashcardGroups = defineCollection({
	name: 'flashcardGroups',
	directory: 'content/flashcards',
	include: '**/*.md',
	schema: z.object({
		id: z.string(),
		category: z.string(),
		subcategory: z.string(),
		difficulty: FlashcardDifficultySchema,
		tags: z.array(z.string()),
		version: z.string(),
		content: z.string(),
	}),
	transform: (document) => {
		const cards = parseCardSections(document.content)
		const title = getGroupTitle(document.subcategory, document.id)

		return {
			...document,
			cards,
			title,
		}
	},
})

const quizzes = defineCollection({
	name: 'quizzes',
	directory: 'content/quizzes',
	include: '**/*.md',
	schema: z.object({
		id: z.string(),
		type: QuizTypeSchema,
		category: z.string(),
		subcategory: z.string(),
		difficulty: DifficultySchema,
		tags: z.array(z.string()),
		version: z.string(),
		content: z.string(),
	}),
	transform: (document) => {
		const questions = parseQuizQuestions(document.content)
		const title = getQuizTitle(document.subcategory, document.type)

		return {
			...document,
			questions,
			title,
		}
	},
})

export default defineConfig({
	collections: [flashcardGroups, quizzes],
})
