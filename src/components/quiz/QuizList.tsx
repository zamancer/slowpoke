import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Quiz } from '@/types/content'
import { api } from '../../../convex/_generated/api'

interface QuizListProps {
	quizzes: Quiz[]
}

const difficultyColors: Record<string, string> = {
	easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	medium:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const typeColors: Record<string, string> = {
	'pattern-selection':
		'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	'anti-patterns':
		'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
	'big-o':
		'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export const QuizList = ({ quizzes }: QuizListProps) => {
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [removingId, setRemovingId] = useState<string | null>(null)
	const removeQuiz = useMutation(api.quizContent.remove)

	const handleDelete = async (contentId: string) => {
		setRemovingId(contentId)
		try {
			await removeQuiz({ contentId })
		} finally {
			setRemovingId(null)
			setConfirmingId(null)
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Quizzes</h1>
					<Link
						to="/quizzes/history"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						View History →
					</Link>
				</div>
				<p className="text-muted-foreground">
					Test your pattern recognition skills. Each quiz requires you to
					justify your answers.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{quizzes.map((quiz) => (
					<div
						key={quiz.id}
						className={cn(
							'flex flex-col gap-3 p-5 rounded-lg border border-border',
							'bg-card hover:shadow-md hover:border-primary/30 transition-all',
						)}
					>
						<Link
							to="/quizzes/$quizId"
							params={{ quizId: quiz.id }}
							className="flex flex-col gap-3"
						>
							<div className="flex items-start justify-between gap-2">
								<h2 className="text-lg font-semibold">{quiz.title}</h2>
								<span
									className={cn(
										'px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0',
										difficultyColors[quiz.difficulty],
									)}
								>
									{quiz.difficulty}
								</span>
							</div>

							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>{quiz.questions.length} questions</span>
								<span>·</span>
								<span
									className={cn(
										'px-2 py-0.5 rounded-full text-xs font-medium',
										typeColors[quiz.type],
									)}
								>
									{quiz.type.replace('-', ' ')}
								</span>
							</div>

							<div className="flex flex-wrap gap-1">
								{quiz.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
									>
										{tag}
									</span>
								))}
							</div>
						</Link>

						{quiz.source === 'convex' && (
							<div className="flex items-center gap-2 pt-1 border-t border-border">
								{confirmingId === quiz.id ? (
									<>
										<button
											type="button"
											onClick={() => void handleDelete(quiz.id)}
											disabled={removingId === quiz.id}
											className="px-2 py-1 rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
										>
											{removingId === quiz.id
												? 'Deleting...'
												: 'Confirm delete'}
										</button>
										<button
											type="button"
											onClick={() => setConfirmingId(null)}
											disabled={removingId === quiz.id}
											className="px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
										>
											Cancel
										</button>
									</>
								) : (
									<button
										type="button"
										onClick={() => setConfirmingId(quiz.id)}
										className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
									>
										<Trash2 size={12} />
										Delete
									</button>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
