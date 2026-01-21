import type { FlashcardGroup } from 'content-collections'
import { FlashcardCard } from './FlashcardCard'

interface FlashcardGridProps {
	group: FlashcardGroup
}

export const FlashcardGrid = ({ group }: FlashcardGridProps) => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{group.title}</h1>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="capitalize">{group.difficulty}</span>
					<span>·</span>
					<span>{group.cards.length} cards</span>
					<span>·</span>
					<div className="flex gap-1">
						{group.tags.map((tag) => (
							<span
								key={tag}
								className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{group.cards.map((card, index) => (
					<FlashcardCard
						key={`${group.id}-card-${index}`}
						card={card}
						index={index}
					/>
				))}
			</div>
		</div>
	)
}
