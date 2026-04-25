import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { extractTextFromPdf } from '@/lib/pdf/extract-text'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/generate/quiz/')({
	validateSearch: (search: Record<string, unknown>) => ({
		prompt: typeof search.prompt === 'string' ? search.prompt : '',
	}),
	component: QuizGeneratorPage,
})

type Difficulty = 'easy' | 'medium' | 'hard'

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')

function QuizGeneratorPage() {
	return (
		<div className="container mx-auto py-8 px-4 max-w-2xl">
			<SignedOut>
				<div className="flex flex-col items-center gap-4 py-12">
					<p className="text-muted-foreground">Sign in to generate quizzes.</p>
					<SignInButton mode="modal">
						<Button>Sign In</Button>
					</SignInButton>
				</div>
			</SignedOut>
			<SignedIn>
				<QuizGenerateForm />
			</SignedIn>
		</div>
	)
}

function QuizGenerateForm() {
	const navigate = useNavigate()
	const { prompt: initialPrompt } = Route.useSearch()
	const promptId = useId()
	const sourceTextId = useId()
	const sourceFileId = useId()

	const [prompt, setPrompt] = useState(initialPrompt)
	const [sourceText, setSourceText] = useState('')
	const [questionCount, setQuestionCount] = useState(10)
	const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
	const [quizType, setQuizType] = useState('')
	const [category, setCategory] = useState('')
	const [subcategory, setSubcategory] = useState('')
	const [tags, setTags] = useState('')
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [isExtracting, setIsExtracting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createQuiz = useMutation(api.quizContent.create)

	const handleSourceFile = async (file: File) => {
		setIsExtracting(true)
		try {
			if (
				file.type === 'application/pdf' ||
				file.name.toLowerCase().endsWith('.pdf')
			) {
				setSourceText(await extractTextFromPdf(file))
				return
			}
			setSourceText(await file.text())
		} catch {
			setError('Could not read this file.')
		} finally {
			setIsExtracting(false)
		}
	}

	const handleGenerate = async () => {
		setError(null)
		if (!prompt.trim()) {
			setError('Please enter a prompt describing the quiz you want.')
			return
		}

		setIsGenerating(true)

		try {
			const parsedTags = tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean)

			const body: Record<string, unknown> = {
				prompt: prompt.trim(),
				questionCount,
			}
			if (sourceText.trim()) body.sourceText = sourceText.trim()
			if (difficulty) body.difficulty = difficulty
			if (category.trim()) body.category = slugify(category)
			if (subcategory.trim()) body.subcategory = slugify(subcategory)
			if (parsedTags.length > 0) body.tags = parsedTags.map(slugify)
			if (quizType.trim()) body.quizType = slugify(quizType)

			const res = await fetch('/api/ai/quiz-generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(
					(data as { error?: string }).error ?? 'Generation failed',
				)
			}

			const quiz = await res.json()
			const contentId = `${slugify(quiz.type)}-${slugify(quiz.subcategory)}-${Date.now()}`

			await createQuiz({
				contentId,
				type: quiz.type,
				category: quiz.category,
				subcategory: quiz.subcategory,
				difficulty: quiz.difficulty,
				tags: quiz.tags,
				version: '1.0.0',
				title: quiz.title,
				questions: quiz.questions,
				sourcePrompt: prompt.trim(),
			})

			navigate({
				to: '/generate/quiz/preview/$contentId',
				params: { contentId },
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Generation failed')
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Generate Quiz</h1>
				<p className="text-muted-foreground">
					Describe the quiz you want and we&apos;ll generate it. Optionally
					provide source material and settings.
				</p>
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor={promptId}>Prompt</Label>
					<Textarea
						id={promptId}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder='e.g. "Basic multiplication for 3rd graders" or "DSA sliding window patterns with edge cases"'
						rows={3}
						disabled={isGenerating}
					/>
				</div>

				<div className="flex items-center gap-2">
					<Label>Questions</Label>
					<Input
						type="number"
						min={1}
						max={25}
						value={questionCount}
						onChange={(e) =>
							setQuestionCount(
								Math.max(1, Math.min(25, Number(e.target.value))),
							)
						}
						className="w-20"
						disabled={isGenerating}
					/>
				</div>

				<button
					type="button"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors self-start"
				>
					{showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					Advanced Settings
				</button>

				{showAdvanced && (
					<div className="flex flex-col gap-4 pl-4 border-l-2 border-border">
						<div className="flex flex-col gap-2">
							<Label>Difficulty</Label>
							<Select
								value={difficulty}
								onValueChange={(v) => setDifficulty(v as Difficulty | '')}
								disabled={isGenerating}
							>
								<SelectTrigger className="w-48">
									<SelectValue placeholder="Let AI decide" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Let AI decide</SelectItem>
									<SelectItem value="easy">Easy</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="hard">Hard</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label>Quiz Type</Label>
								<Input
									value={quizType}
									onChange={(e) => setQuizType(e.target.value)}
									placeholder="e.g. multiplication, sliding-window"
									disabled={isGenerating}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Category</Label>
								<Input
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									placeholder="e.g. math, algorithms"
									disabled={isGenerating}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label>Subcategory</Label>
								<Input
									value={subcategory}
									onChange={(e) => setSubcategory(e.target.value)}
									placeholder="e.g. fractions, binary-search"
									disabled={isGenerating}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Tags</Label>
								<Input
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									placeholder="comma-separated"
									disabled={isGenerating}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor={sourceFileId}>Source Material (optional)</Label>
							<input
								id={sourceFileId}
								type="file"
								accept=".pdf,.md,.txt,.text"
								disabled={isExtracting || isGenerating}
								onChange={(e) => {
									const file = e.target.files?.[0]
									if (file) void handleSourceFile(file)
								}}
								className="text-sm"
							/>
							<Textarea
								id={sourceTextId}
								value={sourceText}
								onChange={(e) => setSourceText(e.target.value)}
								placeholder="Paste source text here, or upload a file above..."
								rows={4}
								disabled={isExtracting || isGenerating}
							/>
						</div>
					</div>
				)}

				{error && <p className="text-sm text-destructive">{error}</p>}

				<Button
					onClick={() => void handleGenerate()}
					disabled={isGenerating || !prompt.trim()}
					className="self-start"
				>
					{isGenerating ? (
						'Generating...'
					) : (
						<>
							<Sparkles size={16} className="mr-2" />
							Generate Quiz
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
