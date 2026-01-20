export type FlashcardDifficulty = 'easy' | 'medium' | 'hard'

export interface Flashcard {
	front: string
	back: string
}

export interface FlashcardGroupFrontmatter {
	id: string
	category: string
	subcategory: string
	difficulty: FlashcardDifficulty
	tags: string[]
	version: string
}

export interface FlashcardGroup extends FlashcardGroupFrontmatter {
	filePath: string
	cards: Flashcard[]
}
