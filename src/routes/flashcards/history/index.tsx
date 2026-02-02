import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { allFlashcardGroups } from 'content-collections'
import { api } from '../../../../convex/_generated/api'
import { useConvexUser } from '@/hooks/useConvexUser'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/flashcards/history/')({
	component: FlashcardHistoryPage,
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

const getProgressColor = (revealed: number, total: number) => {
	const percentage = total > 0 ? (revealed / total) * 100 : 0
	if (percentage >= 100) return 'text-green-600 dark:text-green-400'
	if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-muted-foreground'
}

function FlashcardHistoryPage() {
	const { isSignedIn, isLoading: isUserLoading } = useConvexUser()
	const sessions = useQuery(
		api.flashcardSessions.listByUser,
		isSignedIn ? {} : 'skip'
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
						to="/flashcards"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						← Back to all groups
					</Link>
				</div>
				<div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
					<h1 className="text-2xl font-bold">Study History</h1>
					<p className="text-muted-foreground">
						Sign in to view your study history.
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
					to="/flashcards"
					className="text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					← Back to all groups
				</Link>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold">Study History</h1>
					<p className="text-muted-foreground">
						Track your flashcard study progress and continue where you left off.
					</p>
				</div>

				{sessions.length === 0 ? (
					<div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8 rounded-lg border border-border bg-card">
						<p className="text-muted-foreground text-center">
							You haven't studied any flashcards yet.
						</p>
						<Link
							to="/flashcards"
							className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Start studying
						</Link>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{sessions.map((session) => {
							const group = allFlashcardGroups.find(
								(g) => g.id === session.groupId
							)
							const groupTitle = group?.title ?? 'Unknown Group'
							const isComplete = session.revealedCount >= session.totalCards

							return (
								<div
									key={session._id}
									className={cn(
										'flex flex-col gap-3 p-5 rounded-lg border border-border',
										'bg-card hover:shadow-md hover:border-primary/30 transition-all'
									)}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex flex-col gap-1 min-w-0">
											<h2 className="text-lg font-semibold truncate">
												{groupTitle}
											</h2>
											<span className="text-sm text-muted-foreground">
												Last studied {formatDate(session.lastStudiedAt)}
											</span>
										</div>
										<div className="flex flex-col items-end gap-1 shrink-0">
											<span
												className={cn(
													'text-xl font-bold',
													getProgressColor(
														session.revealedCount,
														session.totalCards
													)
												)}
											>
												{session.revealedCount}/{session.totalCards}
											</span>
											<span className="text-xs text-muted-foreground">
												cards revealed
											</span>
										</div>
									</div>

									{/* Progress bar */}
									<div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
										<div
											className={cn(
												'h-full rounded-full transition-all',
												isComplete ? 'bg-green-500' : 'bg-primary'
											)}
											style={{
												width: `${session.totalCards > 0 ? (session.revealedCount / session.totalCards) * 100 : 0}%`,
											}}
										/>
									</div>

									<div className="flex items-center gap-2">
										<Link
											to="/flashcards/$groupId"
											params={{ groupId: session.groupId }}
											className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
										>
											{isComplete ? 'Study Again' : 'Continue'}
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
