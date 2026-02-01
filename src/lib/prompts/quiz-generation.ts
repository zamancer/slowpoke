export type QuizType = 'pattern-selection' | 'anti-patterns' | 'big-o'

export interface QuizGenerationInput {
	sourceContent: string
	quizType: QuizType
	category: string
	subcategory: string
	difficulty: 'easy' | 'medium' | 'hard'
	targetQuestionCount?: number
}

const QUIZ_TYPE_GUIDANCE: Record<QuizType, string> = {
	'pattern-selection': `**Pattern Selection Quiz**: Test the student's ability to choose the RIGHT approach for a problem.
- Present realistic scenarios or problem descriptions
- Options should be different data structures, algorithms, or approaches
- Correct answer should be clearly optimal (not subjective)
- Distractors should be plausible but suboptimal for specific reasons`,

	'anti-patterns': `**Anti-Patterns Quiz**: Test the student's ability to identify INCORRECT or suboptimal approaches.
- Present scenarios where common mistakes occur
- Options should include tempting but wrong approaches
- Focus on "what NOT to do" and why
- Highlight common misconceptions and pitfalls`,

	'big-o': `**Big-O Analysis Quiz**: Test understanding of time and space complexity.
- Present code snippets or algorithm descriptions
- Options should be different complexity classes
- Include questions about best/worst/average cases
- Test understanding of why certain complexities arise`,
}

const SYSTEM_PROMPT = `You are an expert educator creating multiple-choice quiz questions for an advanced learning system.

Quizzes are designed to PROBE DEEP UNDERSTANDING - they come after students have learned basics through flashcards. Each question should test whether the student truly understands concepts, not just memorized facts.

## Quiz Design Principles

1. **Application over recall**: Test ability to APPLY knowledge to scenarios
2. **Justify, don't just select**: Students must explain WHY their answer is correct (AI will verify their justification)
3. **Realistic scenarios**: Use practical, real-world problem contexts
4. **Meaningful distractors**: Wrong answers should represent common misconceptions
5. **Educational explanations**: Both correct reasoning AND common mistakes should be documented

## Question Structure

Each question must include:
- **Question**: A scenario or problem (not just "what is X?")
- **Options**: Four choices labeled A, B, C, D
- **Answer**: The correct option letter
- **Explanation**: Why the correct answer is optimal (this helps AI verify student justifications)
- **Mistakes**: Common misconceptions that lead to wrong answers (helps identify flawed reasoning)

## Difficulty Guidelines

- **Easy**: Clear-cut scenarios with one obviously correct approach
- **Medium**: Requires trade-off analysis or understanding of specific properties
- **Hard**: Nuanced scenarios where multiple approaches could work but one is clearly optimal

## Quality Criteria

- Questions should require THINKING, not pattern matching
- Each distractor should be wrong for a specific, teachable reason
- Explanations should be detailed enough for AI to evaluate student justifications
- Mistakes section should anticipate how students might go wrong

## Output Format

Generate questions in this exact markdown format:

\`\`\`markdown
## Question 1

[Scenario or problem description that requires applying knowledge]

### Options

- A: [First option]
- B: [Second option]
- C: [Third option]
- D: [Fourth option]

### Answer

[Single letter A, B, C, or D]

### Explanation

[2-4 sentences explaining why this is the optimal choice, including key reasoning points that students should demonstrate in their justifications]

### Mistakes

[Common misconceptions that lead to selecting wrong answers, helping identify flawed reasoning patterns]

## Question 2
...
\`\`\`

Continue this pattern for all questions.`

const buildUserPrompt = (input: QuizGenerationInput): string => {
	const questionCount = input.targetQuestionCount ?? 10
	const typeGuidance = QUIZ_TYPE_GUIDANCE[input.quizType]

	return `Create ${questionCount} quiz questions from the following source material.

**Quiz Type**: ${input.quizType}
**Category**: ${input.category}
**Subcategory**: ${input.subcategory}
**Target Difficulty**: ${input.difficulty}

${typeGuidance}

## Source Material

<source>
${input.sourceContent}
</source>

## Instructions

1. Create ${questionCount} questions appropriate for the "${input.difficulty}" difficulty level
2. Each question should test a distinct concept or application (minimize overlap)
3. Ensure scenarios are realistic and require applying knowledge
4. Write detailed explanations that AI can use to verify student justifications
5. Document common mistakes for each question
6. Order questions from more fundamental to more advanced applications

IMPORTANT: Students will need to JUSTIFY their answer selection. The AI will evaluate whether their reasoning demonstrates true understanding. Your explanations and mistakes sections are critical for this verification.

Generate the quiz questions now in the specified markdown format.`
}

export const buildQuizGenerationPrompt = (
	input: QuizGenerationInput,
): { system: string; user: string } => ({
	system: SYSTEM_PROMPT,
	user: buildUserPrompt(input),
})

export const getQuizSystemPrompt = (): string => SYSTEM_PROMPT
