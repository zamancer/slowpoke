'use client'

import { cn } from '@/lib/utils'

interface Card {
	front: string
	back: string
}

interface FlashcardCardProps {
	card: Card
	index: number
	isRevealed: boolean
	onReveal: () => void
}

export const FlashcardCard = ({
	card,
	index,
	isRevealed,
	onReveal,
}: FlashcardCardProps) => {
	const handleClick = () => {
		if (!isRevealed) {
			onReveal()
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				'relative w-full min-h-48 p-4 rounded-lg border text-left transition-all duration-300',
				'bg-card hover:shadow-md cursor-pointer',
				isRevealed ? 'border-primary/50 bg-primary/5' : 'border-border',
			)}
		>
			<span className="absolute top-2 right-3 text-xs text-muted-foreground">
				{index + 1}
			</span>

			<div className="flex flex-col gap-3">
				<div className="text-sm font-medium leading-relaxed">{card.front}</div>

				{isRevealed && (
					<div className="pt-3 border-t border-border/50">
						<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
							{card.back}
						</div>
					</div>
				)}

				{!isRevealed && (
					<div className="text-xs text-muted-foreground mt-auto">
						Click to reveal answer
					</div>
				)}
			</div>
		</button>
	)
}
