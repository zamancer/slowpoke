import { cn } from '@/lib/utils'

interface QuizProgressProps {
	current: number
	total: number
	correct: number
	answered: number
}

export const QuizProgress = ({
	current,
	total,
	correct,
	answered,
}: QuizProgressProps) => {
	const progressPercentage = total > 0 ? (answered / total) * 100 : 0

	return (
		<div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">
					Question {current} of {total}
				</span>
				<span className="text-muted-foreground">
					{correct} correct / {answered} answered
				</span>
			</div>

			<div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
				<div
					className={cn(
						'h-full rounded-full transition-all duration-300',
						'bg-primary',
					)}
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>
		</div>
	)
}
