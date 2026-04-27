import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
	Check,
	ChevronDown,
	ChevronUp,
	Pencil,
	RotateCcw,
	Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { api } from '../../../../../convex/_generated/api'

export const Route = createFileRoute('/generate/quiz/preview/$contentId')({
	component: QuizPreviewPage,
})

type Difficulty = 'easy' | 'medium' | 'hard'

function QuizPreviewPage() {
	const { contentId } = Route.useParams()

	return (
		<div className="container mx-auto py-8 px-4 max-w-3xl">
			<SignedOut>
				<div className="flex flex-col items-center gap-4 py-12">
					<p className="text-muted-foreground">Sign in to view this draft.</p>
					<SignInButton mode="modal">
						<Button>Sign In</Button>
					</SignInButton>
				</div>
			</SignedOut>
			<SignedIn>
				<DraftPreview contentId={contentId} />
			</SignedIn>
		</div>
	)
}

function DraftPreview({ contentId }: { contentId: string }) {
	const navigate = useNavigate()
	const draft = useQuery(api.quizContent.getDraft, { contentId })
	const updateDraft = useMutation(api.quizContent.updateDraft)
	const publishQuiz = useMutation(api.quizContent.publish)
	const removeQuiz = useMutation(api.quizContent.remove)

	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPublishing, setIsPublishing] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

	const [editTitle, setEditTitle] = useState('')
	const [editType, setEditType] = useState('')
	const [editCategory, setEditCategory] = useState('')
	const [editSubcategory, setEditSubcategory] = useState('')
	const [editDifficulty, setEditDifficulty] = useState<Difficulty>('medium')
	const [editTags, setEditTags] = useState('')

	if (draft === undefined) {
		return <p className="text-muted-foreground">Loading draft...</p>
	}

	if (draft === null) {
		return (
			<div className="flex flex-col items-center gap-4 py-12">
				<p className="text-muted-foreground">
					This draft is no longer available. It may have been published or
					deleted.
				</p>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => navigate({ to: '/quizzes' })}
					>
						View Quizzes
					</Button>
					<Button
						variant="outline"
						onClick={() => navigate({ to: '/generate/quiz/drafts' })}
					>
						View Drafts
					</Button>
				</div>
			</div>
		)
	}

	const startEditing = () => {
		setEditTitle(draft.title)
		setEditType(draft.type)
		setEditCategory(draft.category)
		setEditSubcategory(draft.subcategory)
		setEditDifficulty(draft.difficulty)
		setEditTags(draft.tags.join(', '))
		setIsEditing(true)
	}

	const handleSave = async () => {
		setIsSaving(true)
		setError(null)
		try {
			const parsedTags = editTags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)

			await updateDraft({
				contentId,
				title: editTitle,
				type: editType,
				category: editCategory,
				subcategory: editSubcategory,
				difficulty: editDifficulty,
				tags: parsedTags,
			})
			setIsEditing(false)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save')
		} finally {
			setIsSaving(false)
		}
	}

	const handlePublish = async () => {
		if (isEditing) return
		setIsPublishing(true)
		setError(null)
		try {
			await publishQuiz({ contentId })
			navigate({ to: '/quizzes' })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to publish')
			setIsPublishing(false)
		}
	}

	const handleDelete = async () => {
		if (isEditing) return
		setIsDeleting(true)
		setError(null)
		try {
			await removeQuiz({ contentId })
			navigate({ to: '/generate/quiz/drafts' })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete')
			setIsDeleting(false)
			setConfirmDelete(false)
		}
	}

	const handleRegenerate = () => {
		if (isEditing) return
		navigate({
			to: '/generate/quiz',
			search: { prompt: draft.sourcePrompt ?? '' },
		})
	}

	const toggleQuestion = (index: number) => {
		setExpandedQuestion(expandedQuestion === index ? null : index)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Draft Preview</h1>
				<span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs font-medium">
					Draft
				</span>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}

			<MetadataSection
				draft={draft}
				isEditing={isEditing}
				isSaving={isSaving}
				editTitle={editTitle}
				editType={editType}
				editCategory={editCategory}
				editSubcategory={editSubcategory}
				editDifficulty={editDifficulty}
				editTags={editTags}
				onEditTitle={setEditTitle}
				onEditType={setEditType}
				onEditCategory={setEditCategory}
				onEditSubcategory={setEditSubcategory}
				onEditDifficulty={setEditDifficulty}
				onEditTags={setEditTags}
				onStartEditing={startEditing}
				onSave={() => void handleSave()}
				onCancel={() => setIsEditing(false)}
			/>

			<div className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">
					Questions ({draft.questions.length})
				</h2>
				{draft.questions.map((q, i) => (
					<QuestionCard
						key={`q-${q.answer}-${q.question.slice(0, 20)}`}
						index={i}
						question={q}
						isExpanded={expandedQuestion === i}
						onToggle={() => toggleQuestion(i)}
					/>
				))}
			</div>

			<div className="flex items-center gap-3 pt-4 border-t border-border">
				<Button
					onClick={() => void handlePublish()}
					disabled={isPublishing || isDeleting || isEditing}
				>
					{isPublishing ? (
						'Publishing...'
					) : (
						<>
							<Check size={16} className="mr-1" />
							Publish
						</>
					)}
				</Button>
				<Button
					variant="outline"
					onClick={handleRegenerate}
					disabled={isEditing}
				>
					<RotateCcw size={16} className="mr-1" />
					Regenerate
				</Button>
				{confirmDelete ? (
					<div className="flex items-center gap-2 ml-auto">
						<Button
							variant="destructive"
							size="sm"
							onClick={() => void handleDelete()}
							disabled={isDeleting || isEditing}
						>
							{isDeleting ? 'Deleting...' : 'Confirm Delete'}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setConfirmDelete(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
					</div>
				) : (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setConfirmDelete(true)}
						disabled={isEditing}
						className="ml-auto text-muted-foreground hover:text-destructive"
					>
						<Trash2 size={16} className="mr-1" />
						Delete
					</Button>
				)}
			</div>
		</div>
	)
}

type DraftDoc = {
	title: string
	type: string
	category: string
	subcategory: string
	difficulty: Difficulty
	tags: string[]
}

const MetadataSection = ({
	draft,
	isEditing,
	isSaving,
	editTitle,
	editType,
	editCategory,
	editSubcategory,
	editDifficulty,
	editTags,
	onEditTitle,
	onEditType,
	onEditCategory,
	onEditSubcategory,
	onEditDifficulty,
	onEditTags,
	onStartEditing,
	onSave,
	onCancel,
}: {
	draft: DraftDoc
	isEditing: boolean
	isSaving: boolean
	editTitle: string
	editType: string
	editCategory: string
	editSubcategory: string
	editDifficulty: Difficulty
	editTags: string
	onEditTitle: (v: string) => void
	onEditType: (v: string) => void
	onEditCategory: (v: string) => void
	onEditSubcategory: (v: string) => void
	onEditDifficulty: (v: Difficulty) => void
	onEditTags: (v: string) => void
	onStartEditing: () => void
	onSave: () => void
	onCancel: () => void
}) => {
	if (isEditing) {
		return (
			<div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
				<div className="flex flex-col gap-2">
					<Label>Title</Label>
					<Input
						value={editTitle}
						onChange={(e) => onEditTitle(e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-2">
						<Label>Type</Label>
						<Input
							value={editType}
							onChange={(e) => onEditType(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Difficulty</Label>
						<Select
							value={editDifficulty}
							onValueChange={(v) => onEditDifficulty(v as Difficulty)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="easy">Easy</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="hard">Hard</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-2">
						<Label>Category</Label>
						<Input
							value={editCategory}
							onChange={(e) => onEditCategory(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Subcategory</Label>
						<Input
							value={editSubcategory}
							onChange={(e) => onEditSubcategory(e.target.value)}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<Label>Tags (comma-separated)</Label>
					<Input
						value={editTags}
						onChange={(e) => onEditTags(e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={onSave} disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={onCancel}
						disabled={isSaving}
					>
						Cancel
					</Button>
				</div>
			</div>
		)
	}

	const difficultyColors: Record<string, string> = {
		easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		medium:
			'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	}

	return (
		<div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<h2 className="text-lg font-semibold">{draft.title}</h2>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>{draft.type.replace(/-/g, ' ')}</span>
						<span>·</span>
						<span>
							{draft.category} / {draft.subcategory}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span
						className={cn(
							'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
							difficultyColors[draft.difficulty],
						)}
					>
						{draft.difficulty}
					</span>
					<button
						type="button"
						onClick={onStartEditing}
						aria-label="Edit draft metadata"
						className="p-1 text-muted-foreground hover:text-primary transition-colors"
					>
						<Pencil size={14} />
					</button>
				</div>
			</div>
			{draft.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{draft.tags.map((tag) => (
						<span
							key={tag}
							className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	)
}

type QuestionData = {
	question: string
	options: { label: string; text: string }[]
	answer: string
	explanation: string
	mistakes?: string
}

const QuestionCard = ({
	index,
	question,
	isExpanded,
	onToggle,
}: {
	index: number
	question: QuestionData
	isExpanded: boolean
	onToggle: () => void
}) => (
	<div className="rounded-lg border border-border bg-card overflow-hidden">
		<button
			type="button"
			onClick={onToggle}
			className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors"
		>
			<span className="font-medium">
				<span className="text-muted-foreground mr-2">Q{index + 1}.</span>
				{question.question.length > 100
					? `${question.question.slice(0, 100)}...`
					: question.question}
			</span>
			{isExpanded ? (
				<ChevronUp size={16} className="shrink-0 text-muted-foreground" />
			) : (
				<ChevronDown size={16} className="shrink-0 text-muted-foreground" />
			)}
		</button>

		{isExpanded && (
			<div className="flex flex-col gap-3 px-4 pb-4 border-t border-border pt-3">
				<p className="text-sm">{question.question}</p>

				<div className="flex flex-col gap-1">
					{question.options.map((opt) => (
						<div
							key={opt.label}
							className={cn(
								'flex items-start gap-2 text-sm px-2 py-1 rounded',
								opt.label === question.answer &&
									'bg-green-50 dark:bg-green-950/30 font-medium',
							)}
						>
							<span className="font-mono text-muted-foreground shrink-0">
								{opt.label}.
							</span>
							<span>{opt.text}</span>
							{opt.label === question.answer && (
								<Check
									size={14}
									className="shrink-0 text-green-600 dark:text-green-400 mt-0.5"
								/>
							)}
						</div>
					))}
				</div>

				<div className="flex flex-col gap-1 text-sm">
					<span className="font-medium text-muted-foreground">Explanation</span>
					<p>{question.explanation}</p>
				</div>

				{question.mistakes && (
					<div className="flex flex-col gap-1 text-sm">
						<span className="font-medium text-muted-foreground">
							Common Mistakes
						</span>
						<p>{question.mistakes}</p>
					</div>
				)}
			</div>
		)}
	</div>
)
