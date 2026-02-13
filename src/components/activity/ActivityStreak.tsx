import { useQuery } from 'convex/react'
import { Flame } from 'lucide-react'
import { useMemo } from 'react'
import { api } from '../../../convex/_generated/api'
import { useConvexUser } from '@/hooks/useConvexUser'
import { getLocalTodayStr } from '@/lib/common/date-common-fns'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const SKELETON_KEYS = Array.from({ length: 14 }, (_, i) => `s${i}`)

const getDayLabel = (dateStr: string) => {
	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(year, month - 1, day)
	return DAY_LABELS[date.getDay()]
}

export const ActivityStreak = () => {
	const { isSignedIn, isLoading: isUserLoading } = useConvexUser()
	const clientToday = useMemo(() => getLocalTodayStr(), [])

	const streak = useQuery(
		api.dailyActivity.getStreak,
		isSignedIn ? { clientToday } : 'skip',
	)
	const recentActivity = useQuery(
		api.dailyActivity.getRecentActivity,
		isSignedIn ? { days: 14, clientToday } : 'skip',
	)

	if (isUserLoading) return null

	const isLoading = streak === undefined || recentActivity === undefined

	if (isLoading) {
		return (
			<div className="rounded-lg border border-border bg-card p-4 animate-pulse">
				<div className="flex items-center gap-2 mb-3">
					<div className="h-5 w-5 rounded bg-muted" />
					<div className="h-5 w-24 rounded bg-muted" />
				</div>
				<div className="flex gap-1.5 justify-center">
					{SKELETON_KEYS.map((key) => (
						<div key={key} className="flex flex-col items-center gap-1">
							<div className="h-3 w-3 rounded-full bg-muted" />
							<div className="h-3 w-3" />
						</div>
					))}
				</div>
			</div>
		)
	}

	const hasStreak = streak > 0
	const dots = [...recentActivity].reverse()

	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<div className="flex items-center gap-2 mb-3">
				<Flame
					size={20}
					className={cn(
						hasStreak ? 'text-orange-500' : 'text-muted-foreground',
					)}
				/>
				{hasStreak ? (
					<span className="font-medium">{streak}-day streak</span>
				) : (
					<span className="text-muted-foreground">No streak yet</span>
				)}
			</div>

			<div className="flex gap-1.5 justify-center">
				{dots.map((day) => {
					const isToday = day.date === clientToday
					return (
						<div key={day.date} className="flex flex-col items-center gap-1">
							<div
								className={cn(
									'h-3 w-3 rounded-full',
									day.quizCompleted ? 'bg-primary' : 'bg-secondary',
									isToday && 'ring-2 ring-primary/30',
								)}
							/>
							<span className="text-[10px] text-muted-foreground leading-none">
								{getDayLabel(day.date)}
							</span>
						</div>
					)
				})}
			</div>

			{!hasStreak && (
				<p className="text-xs text-muted-foreground text-center mt-2">
					Complete a quiz to start your streak
				</p>
			)}
		</div>
	)
}
