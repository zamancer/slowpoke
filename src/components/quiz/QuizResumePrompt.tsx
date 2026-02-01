'use client'

import type { Quiz } from 'content-collections'

interface QuizResumePromptProps {
	quiz: Quiz
	answeredCount: number
	totalQuestions: number
	onResume: () => void
	onStartFresh: () => void
}

export const QuizResumePrompt = ({
	quiz,
	answeredCount,
	totalQuestions,
	onResume,
	onStartFresh,
}: QuizResumePromptProps) => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{quiz.title}</h1>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="capitalize">{quiz.difficulty}</span>
					<span>·</span>
					<span>{totalQuestions} questions</span>
				</div>
			</div>

			<div className="p-6 rounded-lg border border-border bg-card">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
							<svg
								className="w-5 h-5 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<h2 className="text-lg font-semibold">Resume your quiz?</h2>
							<p className="text-muted-foreground">
								You have an in-progress session with {answeredCount} of{' '}
								{totalQuestions} questions answered.
							</p>
						</div>
					</div>

					<div className="flex gap-3 justify-end">
						<button
							type="button"
							onClick={onStartFresh}
							className="px-4 py-2 rounded-lg font-medium border border-border hover:bg-secondary transition-colors"
						>
							Start Fresh
						</button>
						<button
							type="button"
							onClick={onResume}
							className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Resume Quiz
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
