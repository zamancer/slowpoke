'use client'

import { useState } from 'react'
import type { Flashcard } from '@/lib/common/flashcard-common-types'
import { cn } from '@/lib/utils'

interface FlashcardCardProps {
	card: Flashcard
	index: number
}

export const FlashcardCard = ({ card, index }: FlashcardCardProps) => {
	const [isRevealed, setIsRevealed] = useState(false)

	return (
		<button
			type="button"
			onClick={() => setIsRevealed((prev) => !prev)}
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
