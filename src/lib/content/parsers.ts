import { z } from 'zod'

const CardSchema = z.object({
	front: z.string().min(1, 'Card front cannot be empty'),
	back: z.string().min(1, 'Card back cannot be empty'),
})

export type ParsedCard = z.infer<typeof CardSchema>

const QuestionSchema = z.object({
	question: z.string().min(1, 'Question cannot be empty'),
	options: z
		.array(
			z.object({
				label: z.string(),
				text: z.string(),
			}),
		)
		.min(2, 'At least 2 options required'),
	answer: z.string().min(1, 'Answer cannot be empty'),
	explanation: z.string().min(1, 'Explanation cannot be empty'),
	mistakes: z.string().optional(),
})

export type ParsedQuestion = z.infer<typeof QuestionSchema>

export const parseCardSections = (content: string): ParsedCard[] => {
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

export const parseQuizQuestions = (content: string): ParsedQuestion[] => {
	const questionSections = content
		.split(/^## Question \d+\s*$/m)
		.filter(Boolean)

	return questionSections.map((section, index) => {
		const questionMatch = section.match(/([\s\S]*?)(?=\n### Options)/)
		const optionsMatch = section.match(
			/### Options\s*\n([\s\S]*?)(?=\n### Answer)/,
		)
		const answerMatch = section.match(
			/### Answer\s*\n([\s\S]*?)(?=\n### Explanation)/,
		)
		const explanationMatch = section.match(
			/### Explanation\s*\n([\s\S]*?)(?=\n### Mistakes|\n## Question|$)/,
		)
		const mistakesMatch = section.match(
			/### Mistakes\s*\n([\s\S]*?)(?=\n## Question|$)/,
		)

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

export const parseFrontmatter = (
	markdown: string,
): { metadata: Record<string, string | string[]>; content: string } => {
	const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
	if (!match) {
		return { metadata: {}, content: markdown }
	}

	const metadata: Record<string, string | string[]> = {}
	for (const line of match[1].split('\n')) {
		const kv = line.match(/^(\w+):\s*(.+)$/)
		if (kv) {
			const value = kv[2].trim()
			if (value.startsWith('[') && value.endsWith(']')) {
				metadata[kv[1]] = value
					.slice(1, -1)
					.split(',')
					.map((t) => t.trim())
			} else {
				metadata[kv[1]] = value
			}
		}
	}

	return { metadata, content: match[2] }
}
