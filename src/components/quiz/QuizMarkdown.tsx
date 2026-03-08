'use client'

import { Streamdown } from 'streamdown'

interface QuizMarkdownProps {
	content: string
	className?: string
}

export const QuizMarkdown = ({ content, className }: QuizMarkdownProps) => (
	<div className={className ?? 'prose prose-sm dark:prose-invert max-w-none'}>
		<Streamdown mode="static">{content}</Streamdown>
	</div>
)
