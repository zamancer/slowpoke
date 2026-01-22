import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const DifficultySchema = z.enum(['easy', 'medium', 'hard'])
const FlashcardDifficultySchema = DifficultySchema

const QuizTypeSchema = z.enum(['pattern-selection', 'anti-patterns', 'big-o'])

const CardSchema = z.object({
	front: z.string().min(1, 'Card front cannot be empty'),
	back: z.string().min(1, 'Card back cannot be empty'),
})

type Card = z.infer<typeof CardSchema>

const parseCardSections = (content: string): Card[] => {
	const cardSections = content.split(/^## Card \d+$/m).filter(Boolean)

	return cardSections.map((section, index) => {
		const frontMatch = section.match(/### Front\s*\n([\s\S]*?)(?=### Back|$)/)
		const backMatch = section.match(/### Back\s*\n([\s\S]*)$/)

		const card = {
			front: frontMatch?.[1]?.trim() ?? '',
			back: backMatch?.[1]?.trim() ?? '',
		}

		const result = CardSchema.safeParse(card)
		if (!result.success) {
			throw new Error(
				`Invalid card ${index + 1}: ${result.error.issues.map((e) => e.message).join(', ')}`,
			)
		}

		return result.data
	})
}

const getGroupTitle = (subcategory: string, id: string): string => {
	const subcategoryTitle = subcategory
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

	const isFirstGroup = id.endsWith('001')
	return `${subcategoryTitle} ${isFirstGroup ? 'Fundamentals' : 'Applications'}`
}

const QuestionSchema = z.object({
	question: z.string().min(1, 'Question cannot be empty'),
	options: z.array(z.object({
		label: z.string(),
		text: z.string(),
	})).min(2, 'At least 2 options required'),
	answer: z.string().min(1, 'Answer cannot be empty'),
	explanation: z.string().min(1, 'Explanation cannot be empty'),
	mistakes: z.string().optional(),
})

type Question = z.infer<typeof QuestionSchema>

const parseQuizQuestions = (content: string): Question[] => {
	const questionSections = content.split(/^## Question \d+\s*$/m).filter(Boolean)

	return questionSections.map((section, index) => {
		const questionMatch = section.match(/([\s\S]*?)(?=\n### Options)/)
		const optionsMatch = section.match(/### Options\s*\n([\s\S]*?)(?=\n### Answer)/)
		const answerMatch = section.match(/### Answer\s*\n([\s\S]*?)(?=\n### Explanation)/)
		const explanationMatch = section.match(/### Explanation\s*\n([\s\S]*?)(?=\n### Mistakes|\n## Question|$)/)
		const mistakesMatch = section.match(/### Mistakes\s*\n([\s\S]*?)(?=\n## Question|$)/)

		const optionsText = optionsMatch?.[1]?.trim() ?? ''
		const options = optionsText
			.split(/\n/)
			.filter((line) => line.trim().match(/^- [A-D]:/))
			.map((line) => {
				const match = line.match(/^- ([A-D]):\s*(.+)$/)
				return {
					label: match?.[1] ?? '',
					text: match?.[2]?.trim() ?? '',
				}
			})

		const question = {
			question: questionMatch?.[1]?.trim() ?? '',
			options,
			answer: answerMatch?.[1]?.trim() ?? '',
			explanation: explanationMatch?.[1]?.trim() ?? '',
			mistakes: mistakesMatch?.[1]?.trim(),
		}

		const result = QuestionSchema.safeParse(question)
		if (!result.success) {
			throw new Error(
				`Invalid question ${index + 1}: ${result.error.issues.map((e) => e.message).join(', ')}`,
			)
		}

		return result.data
	})
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
