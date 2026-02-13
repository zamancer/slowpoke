import { Switch } from '@/components/ui/switch'

interface QuizVerificationToggleProps {
	enabled: boolean
	onToggle: (enabled: boolean) => void
}

export const QuizVerificationToggle = ({
	enabled,
	onToggle,
}: QuizVerificationToggleProps) => {
	return (
		<div className="flex items-center gap-2">
			<Switch
				checked={enabled}
				onCheckedChange={onToggle}
				aria-label="Toggle AI verification"
			/>
			<span className="text-sm font-medium">AI Verification</span>
		</div>
	)
}
