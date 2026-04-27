type Segment =
	| { type: 'text'; content: string; id: number }
	| { type: 'code-block'; content: string; lang: string; id: number }
	| { type: 'inline-code'; content: string; id: number }

const parseInlineCode = (text: string, startId: number): [Segment[], number] => {
	const result: Segment[] = []
	let id = startId
	const regex = /`([^`\n]+)`/g
	let last = 0
	let m = regex.exec(text)
	while (m !== null) {
		if (m.index > last) result.push({ type: 'text', content: text.slice(last, m.index), id: id++ })
		result.push({ type: 'inline-code', content: m[1], id: id++ })
		last = m.index + m[0].length
		m = regex.exec(text)
	}
	if (last < text.length) result.push({ type: 'text', content: text.slice(last), id: id++ })
	return [result, id]
}

const parseText = (text: string): Segment[] => {
	const result: Segment[] = []
	let id = 0
	const regex = /```(\w*)\n?([\s\S]*?)```/g
	let last = 0
	let m = regex.exec(text)
	while (m !== null) {
		if (m.index > last) {
			const [segs, nextId] = parseInlineCode(text.slice(last, m.index), id)
			result.push(...segs)
			id = nextId
		}
		result.push({ type: 'code-block', content: m[2].trim(), lang: m[1] || '', id: id++ })
		last = m.index + m[0].length
		m = regex.exec(text)
	}
	if (last < text.length) {
		const [segs] = parseInlineCode(text.slice(last), id)
		result.push(...segs)
	}
	return result
}

interface InlineCodeProps {
	content: string
	variant: 'question' | 'option'
}

const InlineCode = ({ content, variant }: InlineCodeProps) =>
	variant === 'option' ? (
		<code className="px-1 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
			{content}
		</code>
	) : (
		<code className="px-1.5 py-0.5 rounded-md text-sm font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
			{content}
		</code>
	)

interface FormattedTextProps {
	text: string
	variant?: 'question' | 'option'
}

export const FormattedText = ({ text, variant = 'question' }: FormattedTextProps) => {
	const segments = parseText(text)

	return (
		<>
			{segments.map((seg) => {
				if (seg.type === 'code-block') {
					return (
						<div key={seg.id} className="my-3 rounded-lg overflow-hidden border border-zinc-700 dark:border-zinc-600">
							{seg.lang && (
								<div className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-mono border-b border-zinc-700">
									{seg.lang}
								</div>
							)}
							<pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
								<code>{seg.content}</code>
							</pre>
						</div>
					)
				}
				if (seg.type === 'inline-code') {
					return <InlineCode key={seg.id} content={seg.content} variant={variant ?? 'question'} />
				}
				return <span key={seg.id}>{seg.content}</span>
			})}
		</>
	)
}
