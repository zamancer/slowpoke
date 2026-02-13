import { createFileRoute, Link } from '@tanstack/react-router'
import { allQuizzes } from 'content-collections'
import { useQuery } from 'convex/react'
import { useConvexUser } from '@/hooks/useConvexUser'
import { cn } from '@/lib/utils'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/quizzes/history/')({
	component: QuizHistoryPage,
})

const formatDate = (timestamp: number) => {
	const date = new Date(timestamp)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) {
		return 'Today'
	}
	if (diffDays === 1) {
		return 'Yesterday'
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`
	}

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	})
}

const getScoreColor = (correct: number, total: number) => {
	const percentage = total > 0 ? (correct / total) * 100 : 0
	if (percentage >= 80) return 'text-green-600 dark:text-green-400'
	if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-red-600 dark:text-red-400'
}

function QuizHistoryPage() {
	const { isSignedIn, isLoading: isUserLoading } = useConvexUser()
	const sessions = useQuery(
		api.quizSessions.listByUser,
		isSignedIn ? {} : 'skip',
	)

	if (isUserLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center min-h-[200px]">
					<div className="text-muted-foreground">Loading...</div>
				</div>
			</div>
		)
	}

	if (!isSignedIn) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="mb-6">
					<Link
						to="/quizzes"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						← Back to all quizzes
					</Link>
				</div>
				<div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
					<h1 className="text-2xl font-bold">Quiz History</h1>
					<p className="text-muted-foreground">
						Sign in to view your quiz history.
					</p>
				</div>
			</div>
		)
	}

	if (sessions === undefined) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-center min-h-[200px]">
					<div className="text-muted-foreground">Loading history...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Link
					to="/quizzes"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to all quizzes
				</Link>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold">Quiz History</h1>
					<p className="text-muted-foreground">
						Review your past quiz attempts and track your progress.
					</p>
				</div>

				{sessions.length === 0 ? (
					<div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8 rounded-lg border border-border bg-card">
						<p className="text-muted-foreground text-center">
							You haven't completed any quizzes yet.
						</p>
						<Link
							to="/quizzes"
							className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Take your first quiz
						</Link>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{sessions.map((session) => {
							const quiz = allQuizzes.find((q) => q.id === session.quizId)
							const quizTitle = quiz?.title ?? 'Unknown Quiz'

							return (
								<div
									key={session._id}
									className={cn(
										'flex flex-col gap-3 p-5 rounded-lg border border-border',
										'bg-card hover:shadow-md hover:border-primary/30 transition-all',
									)}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex flex-col gap-1 min-w-0">
											<h2 className="text-lg font-semibold truncate">
												{quizTitle}
											</h2>
											<span className="text-sm text-muted-foreground">
												{session.completedAt
													? formatDate(session.completedAt)
													: 'Unknown date'}
											</span>
										</div>
										<div className="flex flex-col items-end gap-1 shrink-0">
											<span
												className={cn(
													'text-xl font-bold',
													getScoreColor(
														session.correctCount,
														session.totalQuestions,
													),
												)}
											>
												{session.correctCount}/{session.totalQuestions}
											</span>
											<span className="text-xs text-muted-foreground">
												{session.verificationEnabled
													? 'AI verified'
													: 'Standard'}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Link
											to="/quizzes/history/$sessionId"
											params={{ sessionId: session._id }}
											className="px-3 py-1.5 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
										>
											View Details
										</Link>
										<Link
											to="/quizzes/$quizId"
											params={{ quizId: session.quizId }}
											className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
										>
											Retry Quiz
										</Link>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
