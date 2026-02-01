'use client'

import type { FlashcardGroup } from 'content-collections'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useState } from 'react'
import { useConvexUser } from '@/hooks/useConvexUser'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { FlashcardCard } from './FlashcardCard'

interface FlashcardGridProps {
	group: FlashcardGroup
}

export const FlashcardGrid = ({ group }: FlashcardGridProps) => {
	const { user: convexUser, isLoading: isUserLoading } = useConvexUser()
	const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set())
	const [sessionId, setSessionId] = useState<Id<'flashcardSessions'> | null>(
		null,
	)
	const [isInitialized, setIsInitialized] = useState(false)

	const activeSession = useQuery(
		api.flashcardSessions.getActiveSession,
		convexUser ? { groupId: group.id } : 'skip',
	)

	const sessionReveals = useQuery(
		api.flashcardReveals.listBySession,
		sessionId ? { sessionId } : 'skip',
	)

	const startSession = useMutation(api.flashcardSessions.start)
	const revealCardMutation = useMutation(api.flashcardReveals.revealCard)

	useEffect(() => {
		if (isInitialized || isUserLoading) return

		if (!convexUser) {
			setIsInitialized(true)
			return
		}

		if (activeSession === undefined) return

		const initSession = async () => {
			if (activeSession) {
				setSessionId(activeSession._id)
			} else {
				const newSessionId = await startSession({
					groupId: group.id,
					totalCards: group.cards.length,
				})
				setSessionId(newSessionId)
			}
			setIsInitialized(true)
		}

		initSession()
	}, [
		convexUser,
		activeSession,
		isUserLoading,
		isInitialized,
		startSession,
		group.id,
		group.cards.length,
	])

	useEffect(() => {
		if (sessionReveals) {
			const revealedIndices = new Set(sessionReveals.map((r) => r.cardIndex))
			setRevealedCards(revealedIndices)
		}
	}, [sessionReveals])

	const handleReveal = useCallback(
		(cardIndex: number) => {
			setRevealedCards((prev) => new Set(prev).add(cardIndex))

			if (sessionId) {
				revealCardMutation({ sessionId, cardIndex })
			}
		},
		[sessionId, revealCardMutation],
	)

	const revealedCount = revealedCards.size
	const totalCards = group.cards.length
	const progressPercent =
		totalCards > 0 ? Math.round((revealedCount / totalCards) * 100) : 0

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

			<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
				<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
				<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
					{revealedCount}/{totalCards} revealed
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{group.cards.map((card, index) => (
					<FlashcardCard
						key={`${group.id}-card-${index}`}
						card={card}
						index={index}
						isRevealed={revealedCards.has(index)}
						onReveal={() => handleReveal(index)}
					/>
				))}
			</div>
		</div>
	)
}
