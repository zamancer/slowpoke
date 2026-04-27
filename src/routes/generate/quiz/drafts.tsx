import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/generate/quiz/drafts')({
	component: QuizDraftsPage,
})

const difficultyColors: Record<string, string> = {
	easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	medium:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
	hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

function QuizDraftsPage() {
	return (
		<div className="container mx-auto py-8 px-4 max-w-3xl">
			<SignedOut>
				<div className="flex flex-col items-center gap-4 py-12">
					<p className="text-muted-foreground">Sign in to view your drafts.</p>
					<SignInButton mode="modal">
						<Button>Sign In</Button>
					</SignInButton>
				</div>
			</SignedOut>
			<SignedIn>
				<DraftsList />
			</SignedIn>
		</div>
	)
}

function DraftsList() {
	const drafts = useQuery(api.quizContent.listDrafts)

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold">Quiz Drafts</h1>
					<p className="text-muted-foreground">
						Review and publish your generated quizzes.
					</p>
				</div>
				<Button asChild variant="outline" size="sm">
					<Link to="/generate/quiz" search={{ prompt: '' }}>
						<Plus size={16} className="mr-1" />
						New Quiz
					</Link>
				</Button>
			</div>

			{drafts === undefined && (
				<p className="text-muted-foreground">Loading drafts...</p>
			)}

			{drafts && drafts.length === 0 && (
				<div className="flex flex-col items-center gap-4 py-12 text-center">
					<FileText size={48} className="text-muted-foreground/40" />
					<p className="text-muted-foreground">
						No drafts yet. Generate a quiz to get started.
					</p>
					<Button asChild>
						<Link to="/generate/quiz" search={{ prompt: '' }}>
							Generate Quiz
						</Link>
					</Button>
				</div>
			)}

			{drafts && drafts.length > 0 && (
				<div className="grid grid-cols-1 gap-3">
					{drafts.map((draft) => (
						<Link
							key={draft.contentId}
							to="/generate/quiz/preview/$contentId"
							params={{ contentId: draft.contentId }}
							className={cn(
								'flex items-center justify-between gap-4 p-4 rounded-lg border border-border',
								'bg-card hover:shadow-md hover:border-primary/30 transition-all',
							)}
						>
							<div className="flex flex-col gap-1 min-w-0">
								<h2 className="font-semibold truncate">{draft.title}</h2>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>{draft.questions.length} questions</span>
									<span>·</span>
									<span>{draft.type.replace(/-/g, ' ')}</span>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<span
									className={cn(
										'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
										difficultyColors[draft.difficulty],
									)}
								>
									{draft.difficulty}
								</span>
								<span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs font-medium">
									Draft
								</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
