import type {
	Flashcard,
	FlashcardDifficulty,
	FlashcardGroup,
	FlashcardGroupFrontmatter,
} from './flashcard-common-types'

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---/

const parseFrontmatter = (content: string): FlashcardGroupFrontmatter => {
	const match = content.match(FRONTMATTER_REGEX)
	if (!match) {
		throw new Error('Invalid flashcard file: missing frontmatter')
	}

	const frontmatterText = match[1]
	const result: Record<string, unknown> = {}

	for (const line of frontmatterText.split('\n')) {
		const colonIndex = line.indexOf(':')
		if (colonIndex === -1) continue

		const key = line.slice(0, colonIndex).trim()
		let value: unknown = line.slice(colonIndex + 1).trim()

		if (
			typeof value === 'string' &&
			value.startsWith('[') &&
			value.endsWith(']')
		) {
			value = value
				.slice(1, -1)
				.split(',')
				.map((s) => s.trim())
		}

		result[key] = value
	}

	return {
		id: result.id as string,
		category: result.category as string,
		subcategory: result.subcategory as string,
		difficulty: result.difficulty as FlashcardDifficulty,
		tags: result.tags as string[],
		version: result.version as string,
	}
}

const parseCards = (content: string): Flashcard[] => {
	const contentWithoutFrontmatter = content
		.replace(FRONTMATTER_REGEX, '')
		.trim()
	const cardSections = contentWithoutFrontmatter
		.split(/^## Card \d+$/m)
		.filter(Boolean)

	return cardSections.map((section) => {
		const frontMatch = section.match(/### Front\s*\n([\s\S]*?)(?=### Back|$)/)
		const backMatch = section.match(/### Back\s*\n([\s\S]*)$/)

		return {
			front: frontMatch?.[1]?.trim() ?? '',
			back: backMatch?.[1]?.trim() ?? '',
		}
	})
}

export const parseFlashcardGroup = (
	content: string,
	filePath: string,
): FlashcardGroup => {
	const frontmatter = parseFrontmatter(content)
	const cards = parseCards(content)

	return {
		...frontmatter,
		filePath,
		cards,
	}
}

export const getGroupTitle = (group: FlashcardGroup): string => {
	const subcategoryTitle = group.subcategory
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

	const isFirstGroup = group.id.endsWith('001')
	return `${subcategoryTitle} ${isFirstGroup ? 'Fundamentals' : 'Applications'}`
}
