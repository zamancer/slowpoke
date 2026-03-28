import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { FlashcardGroup } from '@/types/content'
import { api } from '../../../convex/_generated/api'

interface FlashcardGroupListProps {
	groups: FlashcardGroup[]
}

const difficultyColors: Record<string, string> = {
	easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	medium:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export const FlashcardGroupList = ({ groups }: FlashcardGroupListProps) => {
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [removingId, setRemovingId] = useState<string | null>(null)
	const [deleteError, setDeleteError] = useState<string | null>(null)
	const removeGroup = useMutation(api.flashcardContent.remove)

	const handleDelete = async (contentId: string) => {
		setRemovingId(contentId)
		setDeleteError(null)
		try {
			await removeGroup({ contentId })
		} catch (err) {
			setDeleteError(
				err instanceof Error ? err.message : 'Failed to delete group.',
			)
		} finally {
			setRemovingId(null)
			setConfirmingId(null)
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Flashcard Groups</h1>
					<Link
						to="/flashcards/history"
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						View History →
					</Link>
				</div>
				<p className="text-muted-foreground">
					Select a group to study. Each group contains related flashcards.
				</p>
			</div>

			{deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{groups.map((group) => (
					<div
						key={group.id}
						className={cn(
							'flex flex-col gap-3 p-5 rounded-lg border border-border',
							'bg-card hover:shadow-md hover:border-primary/30 transition-all',
						)}
					>
						<Link
							to="/flashcards/$groupId"
							params={{ groupId: group.id }}
							className="flex flex-col gap-3"
						>
							<div className="flex items-start justify-between gap-2">
								<h2 className="text-lg font-semibold">{group.title}</h2>
								<span
									className={cn(
										'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
										difficultyColors[group.difficulty],
									)}
								>
									{group.difficulty}
								</span>
							</div>

							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>{group.cards.length} cards</span>
								<span>·</span>
								<span className="capitalize">
									{group.category.replace('-', ' ')}
								</span>
							</div>

							<div className="flex flex-wrap gap-1">
								{group.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
									>
										{tag}
									</span>
								))}
							</div>
						</Link>

						{group.source === 'convex' && (
							<div className="flex items-center gap-2 pt-1 border-t border-border">
								{confirmingId === group.id ? (
									<>
										<button
											type="button"
											onClick={() => void handleDelete(group.id)}
											disabled={removingId === group.id}
											className="px-2 py-1 rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
										>
											{removingId === group.id
												? 'Deleting...'
												: 'Confirm delete'}
										</button>
										<button
											type="button"
											onClick={() => setConfirmingId(null)}
											disabled={removingId === group.id}
											className="px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
										>
											Cancel
										</button>
									</>
								) : (
									<button
										type="button"
										onClick={() => setConfirmingId(group.id)}
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
