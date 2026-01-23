'use client'

import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Switch } from '@/components/ui/switch'

interface QuizVerificationToggleProps {
	enabled: boolean
	onToggle: (enabled: boolean) => void
}

export const QuizVerificationToggle = ({
	enabled,
	onToggle,
}: QuizVerificationToggleProps) => {
	const { isSignedIn, isLoaded } = useUser()

	const handleToggle = (checked: boolean) => {
		onToggle(checked)
	}

	return (
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-2">
				<Switch
					checked={enabled}
					onCheckedChange={handleToggle}
					aria-label="Toggle AI verification"
				/>
				<span className="text-sm font-medium">AI Verification</span>
			</div>

			{enabled && isLoaded && !isSignedIn && (
				<span className="text-xs text-muted-foreground">
					<SignInButton mode="modal">
						<button type="button" className="text-primary hover:underline">
							Sign in
						</button>
					</SignInButton>{' '}
					to enable AI verification
				</span>
			)}

			{isLoaded && isSignedIn && <UserButton afterSignOutUrl="/" />}
		</div>
	)
}
