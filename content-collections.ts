import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const FlashcardDifficultySchema = z.enum(['easy', 'medium', 'hard'])

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

export default defineConfig({
	collections: [flashcardGroups],
})
