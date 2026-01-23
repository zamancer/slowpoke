'use client'

import { Streamdown } from 'streamdown'
import { cn } from '@/lib/utils'
import type { AiVerification } from '@/types/quiz'

interface QuizAIFeedbackProps {
	verification: AiVerification | null
	streamedText: string
	onRetry: () => void
}

const VerdictBadge = ({ verdict }: { verdict: 'PASS' | 'FAIL' }) => (
	<span
		className={cn(
			'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
			verdict === 'PASS'
				? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
				: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		)}
	>
		{verdict}
	</span>
)

const LoadingSkeleton = () => (
	<div className="flex flex-col gap-2 animate-pulse">
		<div className="h-4 bg-muted rounded w-3/4" />
		<div className="h-4 bg-muted rounded w-1/2" />
		<div className="h-4 bg-muted rounded w-5/6" />
	</div>
)

export const QuizAIFeedback = ({
	verification,
	streamedText,
	onRetry,
}: QuizAIFeedbackProps) => {
	if (!verification) return null

	const isError = verification.status === 'error'
	const isComplete = verification.status === 'complete'
	const isPending = verification.status === 'pending'
	const isStreaming = verification.status === 'streaming'

	return (
		<div className="p-6 rounded-lg border border-border bg-card">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h4 className="font-medium text-sm text-muted-foreground">
						AI Verification
					</h4>
					{isComplete && <VerdictBadge verdict={verification.verdict} />}
				</div>

				{isPending && (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-muted-foreground">
							Evaluating your justification...
						</p>
						<LoadingSkeleton />
					</div>
				)}

				{(isStreaming || isComplete) && streamedText && (
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<Streamdown mode={isStreaming ? 'streaming' : 'static'}>
							{streamedText}
						</Streamdown>
					</div>
				)}

				{isError && (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-muted-foreground">
							Could not verify your justification. This doesn&apos;t affect your
							quiz score.
						</p>
						{verification.error && (
							<p className="text-xs text-muted-foreground">
								{verification.error}
							</p>
						)}
						<button
							type="button"
							onClick={onRetry}
							className="self-start px-4 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
