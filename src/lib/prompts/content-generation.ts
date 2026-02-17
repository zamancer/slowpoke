export type ContentGenerationInput = {
	category: string
	subcategory: string
	tags: string[]
	flashcardDifficulty: 'easy' | 'medium' | 'hard'
	quizDifficulty: 'easy' | 'medium' | 'hard'
	quizType: 'pattern-selection' | 'anti-patterns' | 'big-o'
	flashcardId: string
	quizId: string
	cardCount: number
	questionCount: number
	sourceText: string
}

export const CONTENT_GENERATION_SYSTEM_PROMPT = `You are an expert educator creating learning content for a spaced repetition and quiz system.

Output must be valid JSON only. Do not wrap JSON in markdown code fences.
`

export const buildContentGenerationPrompt = (
	input: ContentGenerationInput,
): string => `Create TWO markdown files from the source material.

Requirements:
- File 1: Flashcards markdown that matches this exact structure:
  - YAML frontmatter keys: id, category, subcategory, difficulty, tags, version
  - Then cards as:
    ## Card 1
    ### Front
    ...
    ### Back
    ...
- File 2: Quiz markdown that matches this exact structure:
  - YAML frontmatter keys: id, type, category, subcategory, difficulty, tags, version
  - Then questions as:
    ## Question 1
    [question text]
    ### Options
    - A: ...
    - B: ...
    - C: ...
    - D: ...
    ### Answer
    [single letter]
    ### Explanation
    ...
    ### Mistakes
    ...

Rules:
- Use version: 1.0.0 for both files.
- Output EXACTLY ${input.cardCount} flashcards and EXACTLY ${input.questionCount} quiz questions.
- Use realistic, high-quality questions and explanations.
- Ensure answer letters correspond to the provided options.
- Keep output compatible with parser rules above.
- Do not add extra sections or headings outside the required format.

Parameters:
- category: ${input.category}
- subcategory: ${input.subcategory}
- tags: [${input.tags.join(', ')}]
- flashcard difficulty: ${input.flashcardDifficulty}
- quiz difficulty: ${input.quizDifficulty}
- quiz type: ${input.quizType}
- flashcard id: ${input.flashcardId}
- quiz id: ${input.quizId}
- flashcard count: ${input.cardCount}
- quiz question count: ${input.questionCount}

Source material:
<source>
${input.sourceText}
</source>

Return JSON with this shape:
{
  "flashcardsFileName": "<slug>.md",
  "quizFileName": "<slug>.md",
  "flashcardsMarkdown": "<full markdown>",
  "quizMarkdown": "<full markdown>"
}
`
