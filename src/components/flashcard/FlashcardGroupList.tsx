import { Link } from '@tanstack/react-router'
import { getGroupTitle } from '@/lib/common/flashcard-common-fns'
import type { FlashcardGroup } from '@/lib/common/flashcard-common-types'
import { cn } from '@/lib/utils'

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
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Flashcard Groups</h1>
				<p className="text-muted-foreground">
					Select a group to study. Each group contains 6 related flashcards.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{groups.map((group) => {
					const title = getGroupTitle(group)

					return (
						<Link
							key={group.id}
							to="/flashcards/$groupId"
							params={{ groupId: group.id }}
							className={cn(
								'flex flex-col gap-3 p-5 rounded-lg border border-border',
								'bg-card hover:shadow-md hover:border-primary/30 transition-all',
							)}
						>
							<div className="flex items-start justify-between gap-2">
								<h2 className="text-lg font-semibold">{title}</h2>
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
					)
				})}
			</div>
		</div>
	)
}
