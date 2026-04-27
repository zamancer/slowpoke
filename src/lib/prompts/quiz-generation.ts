export type QuizGenerationInput = {
	prompt: string
	sourceText?: string
	questionCount: number
	difficulty?: 'easy' | 'medium' | 'hard'
	category?: string
	subcategory?: string
	tags?: string[]
	quizType?: string
}

export type QuizVariantInput = {
	sourcePrompt: string
	questionCount: number
	existingQuestions: string[]
	difficulty: 'easy' | 'medium' | 'hard'
	category: string
	subcategory: string
	tags: string[]
	quizType: string
}

export const QUIZ_GENERATION_SYSTEM_PROMPT = `You are an expert educator creating quiz content for a learning platform.

You generate high-quality multiple-choice quizzes on any topic, from simple math to complex computer science.

CRITICAL: Your entire response must be a single raw JSON object. Start your response with { and end with }. No text before, no text after, no markdown, no code fences, no explanations outside the JSON.

When metadata fields (category, subcategory, tags, difficulty, type) are not provided, infer them from the user's prompt. Choose values that accurately describe the quiz content.

Difficulty calibration:
- easy: foundational recall, single-step reasoning, straightforward definitions
- medium: applied knowledge, multi-step reasoning, comparing related concepts
- hard: nuanced edge cases, synthesis across topics, tricky distractors that require deep understanding

Every question must have exactly 4 options (A, B, C, D) with exactly one correct answer. Explanations should teach, not just state the answer. Mistakes should explain why each wrong option is appealing.
`

const escapeForSentinel = (text: string): string => text.replace(/<\//g, '<\\/')

const JSON_SHAPE_SECTION = `Return JSON with this exact shape:
{
  "title": "descriptive quiz title",
  "type": "quiz type slug (e.g. multiplication, sliding-window, vocabulary)",
  "category": "broad category slug (e.g. math, algorithms, language)",
  "subcategory": "specific subcategory slug (e.g. fractions, binary-search)",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "question": "question text",
      "options": [
        { "label": "A", "text": "option text" },
        { "label": "B", "text": "option text" },
        { "label": "C", "text": "option text" },
        { "label": "D", "text": "option text" }
      ],
      "answer": "A",
      "explanation": "why the correct answer is correct",
      "mistakes": "why each wrong option is appealing"
    }
  ]
}`

export const buildQuizGenerationPrompt = (
	input: QuizGenerationInput,
): string => {
	const sections: string[] = [
		`Generate a quiz based on the following prompt:\n<prompt>\n${escapeForSentinel(input.prompt)}\n</prompt>`,
		`Generate exactly ${input.questionCount} questions.`,
	]

	if (input.difficulty) {
		sections.push(`Target difficulty: ${input.difficulty}`)
	}
	if (input.category) {
		sections.push(`Category: ${input.category}`)
	}
	if (input.subcategory) {
		sections.push(`Subcategory: ${input.subcategory}`)
	}
	if (input.tags && input.tags.length > 0) {
		sections.push(`Tags: [${input.tags.join(', ')}]`)
	}
	if (input.quizType) {
		sections.push(`Quiz type: ${input.quizType}`)
	}

	if (!input.difficulty || !input.category || !input.quizType) {
		sections.push(
			'For any metadata not provided above, infer appropriate values from the prompt context.',
		)
	}

	if (input.sourceText) {
		sections.push(
			`Use the following source material as reference for generating questions:\n<source>\n${escapeForSentinel(input.sourceText)}\n</source>`,
		)
	}

	sections.push(JSON_SHAPE_SECTION)

	return sections.join('\n\n')
}

export const buildVariantGenerationPrompt = (
	input: QuizVariantInput,
): string => {
	const sections: string[] = [
		`Generate a quiz variant based on the following original topic prompt:\n<prompt>\n${escapeForSentinel(input.sourcePrompt)}\n</prompt>`,
		`Generate exactly ${input.questionCount} questions.`,
		`Target difficulty: ${input.difficulty}`,
		`Category: ${input.category}`,
		`Subcategory: ${input.subcategory}`,
		`Tags: [${input.tags.join(', ')}]`,
		`Quiz type: ${input.quizType}`,
	]

	if (input.existingQuestions.length > 0) {
		const numbered = input.existingQuestions
			.map((q, i) => `${i + 1}. ${q}`)
			.join('\n')
		sections.push(
			`IMPORTANT: Do NOT repeat or rephrase any of these existing questions. Generate completely different questions that cover other aspects of the topic:\n<existing_questions>\n${escapeForSentinel(numbered)}\n</existing_questions>`,
		)
	}

	sections.push(JSON_SHAPE_SECTION)

	return sections.join('\n\n')
}
