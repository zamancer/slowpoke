export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuizType = string

export type QuizStatus = 'draft' | 'published'

export type ContentSource = 'static' | 'convex'

export type QuizQuestion = {
	question: string
	options: { label: string; text: string }[]
	answer: string
	explanation: string
	mistakes?: string
}

export type Quiz = {
	id: string
	type: QuizType
	category: string
	subcategory: string
	difficulty: Difficulty
	tags: string[]
	version: string
	title: string
	questions: QuizQuestion[]
	source: ContentSource
	status?: QuizStatus
}

export type FlashcardCard = {
	front: string
	back: string
}

export type FlashcardGroup = {
	id: string
	category: string
	subcategory: string
	difficulty: Difficulty
	tags: string[]
	version: string
	title: string
	cards: FlashcardCard[]
	source: ContentSource
}
