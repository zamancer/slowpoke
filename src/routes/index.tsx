import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, ListChecks } from 'lucide-react'
import { ActivityStreak } from '@/components/activity/ActivityStreak'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: Home })

const cardClass =
	'rounded-lg border border-border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all'

function Home() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-2xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold">Slowpoke</h1>
					<p className="text-muted-foreground text-lg">
						Learn at your own pace
					</p>
				</div>

				<SignedOut>
					<div className={cn(cardClass, 'text-center space-y-3')}>
						<p className="text-sm text-muted-foreground">
							Sign in to save your progress across sessions
						</p>
						<SignInButton mode="modal">
							<Button>Sign in</Button>
						</SignInButton>
					</div>
				</SignedOut>

				<SignedIn>
					<ActivityStreak />
				</SignedIn>

				<div className="grid gap-4 sm:grid-cols-2">
					<Link to="/quizzes" className={cn(cardClass, 'block')}>
						<div className="flex items-center gap-3 mb-2">
							<ListChecks className="text-primary" size={24} />
							<h2 className="text-lg font-semibold">Quizzes</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							Test your knowledge with multiple-choice questions
						</p>
					</Link>

					<Link to="/flashcards" className={cn(cardClass, 'block')}>
						<div className="flex items-center gap-3 mb-2">
							<BookOpen className="text-primary" size={24} />
							<h2 className="text-lg font-semibold">Flashcards</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							Review concepts with interactive flashcards
						</p>
					</Link>
				</div>
			</div>
		</div>
	)
}
