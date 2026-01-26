import type { VerificationPayload } from '@/types/quiz'

const SYSTEM_PROMPT = `You are a DSA (Data Structures & Algorithms) tutor evaluating a student's justification for a quiz answer.

Evaluate the student's justification. Consider:
1. Does the justification demonstrate correct understanding of WHY the answer is right/wrong?
2. Is the reasoning technically sound, even if the selected answer is incorrect?
3. Are there misconceptions that need correction?

Respond with:
- A verdict: PASS or FAIL (the justification quality, independent of the selected answer)
- A brief explanation of your evaluation (2-4 sentences)
- If FAIL: what the student should focus on to improve their understanding`

const formatOptions = (options: { label: string; text: string }[]): string =>
	options.map((o) => `${o.label}: ${o.text}`).join('\n')

export const buildQuizVerificationPrompt = (
	payload: VerificationPayload,
): string => {
	const formattedOptions = formatOptions(payload.options)

	return `Question: ${payload.question}

Options:
${formattedOptions}

Correct Answer: ${payload.correctAnswer}
Student's Answer: ${payload.selectedAnswer}

Student's Justification:
<justification>
${payload.justification}
</justification>

Expert Explanation: ${payload.explanation}`
}

export const getSystemPrompt = (): string => SYSTEM_PROMPT
