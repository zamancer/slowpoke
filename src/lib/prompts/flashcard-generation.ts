export interface FlashcardGenerationInput {
	sourceContent: string
	category: string
	subcategory: string
	difficulty: 'easy' | 'medium' | 'hard'
	targetCardCount?: number
}

const SYSTEM_PROMPT = `You are an expert educator creating flashcards for a spaced repetition learning system.

Your goal is to extract the CORE CONCEPTS from the provided material and transform them into effective flashcard pairs. Flashcards are the first step in a student's learning journey - they should introduce foundational knowledge that can later be tested more deeply in quizzes.

## Flashcard Design Principles

1. **Atomic concepts**: Each card should test ONE concept only
2. **Active recall**: The front should prompt active thinking, not passive recognition
3. **Clear and concise**: Fronts should be questions or prompts; backs should be complete but succinct answers
4. **No trick questions**: The goal is learning, not gotcha moments
5. **Progressive complexity**: Order cards from foundational to more nuanced concepts
6. **Practical focus**: Prioritize knowledge that has practical application

## Difficulty Guidelines

- **Easy**: Definitions, basic properties, simple comparisons
- **Medium**: Time/space complexities, common use cases, implementation details
- **Hard**: Edge cases, trade-offs, nuanced comparisons, optimization strategies

## Card Structure

Each card has:
- **Front**: A question, prompt, or scenario (what triggers recall)
- **Back**: The complete answer with key details (what the student should remember)

The back should be comprehensive enough to stand alone as a learning resource, including:
- Direct answer to the question
- Key supporting details
- Relevant examples or formulas when applicable

## Output Format

Generate cards in this exact markdown format:

\`\`\`markdown
## Card 1
### Front
[Question or prompt here]

### Back
[Complete answer with key details, bullet points if appropriate]

## Card 2
### Front
[Next question]

### Back
[Answer]
\`\`\`

Continue this pattern for all cards.`

const buildUserPrompt = (input: FlashcardGenerationInput): string => {
	const cardCount = input.targetCardCount ?? 6

	return `Create ${cardCount} flashcards from the following source material.

**Category**: ${input.category}
**Subcategory**: ${input.subcategory}
**Target Difficulty**: ${input.difficulty}

## Source Material

<source>
${input.sourceContent}
</source>

## Instructions

1. Extract the ${cardCount} most important concepts from this material
2. Create flashcards appropriate for the "${input.difficulty}" difficulty level
3. Order cards from most fundamental to more advanced concepts
4. Ensure each card tests a distinct concept (no overlap)
5. Make the "Back" comprehensive enough that a student could learn the concept from it alone

Generate the flashcards now in the specified markdown format.`
}

export const buildFlashcardGenerationPrompt = (
	input: FlashcardGenerationInput,
): { system: string; user: string } => ({
	system: SYSTEM_PROMPT,
	user: buildUserPrompt(input),
})

export const getFlashcardSystemPrompt = (): string => SYSTEM_PROMPT
