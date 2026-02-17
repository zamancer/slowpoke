import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Sparkles } from 'lucide-react'
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

export const Route = createFileRoute('/generate/')({
	component: ContentGeneratorPage,
})

type Difficulty = 'easy' | 'medium' | 'hard'
type QuizType = 'pattern-selection' | 'anti-patterns' | 'big-o'

type GenerationResult = {
	flashcardsFileName: string
	quizFileName: string
	flashcardsMarkdown: string
	quizMarkdown: string
}

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')

const getSequenceFromId = (id: string): string => {
	const match = id.match(/-(\d+)$/)
	return match?.[1] ?? '001'
}

function ContentGeneratorPage() {
	const categoryId = useId()
	const subcategoryId = useId()
	const tagsId = useId()
	const cardCountId = useId()
	const questionCountId = useId()
	const sourceFileId = useId()
	const sourceTextId = useId()

	const [category, setCategory] = useState('algorithms')
	const [subcategory, setSubcategory] = useState('new-topic')
	const [tags, setTags] = useState('fundamentals')
	const [flashcardDifficulty, setFlashcardDifficulty] =
		useState<Difficulty>('easy')
	const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('medium')
	const [quizType, setQuizType] = useState<QuizType>('pattern-selection')
	const [cardCount, setCardCount] = useState(8)
	const [questionCount, setQuestionCount] = useState(10)
	const [sourceText, setSourceText] = useState('')
	const [isExtracting, setIsExtracting] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [saveMessage, setSaveMessage] = useState<string | null>(null)
	const [result, setResult] = useState<GenerationResult | null>(null)

	const normalizedCategory = slugify(category)
	const normalizedSubcategory = slugify(subcategory)
	const flashcardId = `${normalizedCategory}-${normalizedSubcategory}-group-001`
	const quizId = `${quizType}-${normalizedSubcategory}-001`
	const flashcardFileName = `${normalizedSubcategory}-${getSequenceFromId(flashcardId)}.md`
	const quizFileName = `${normalizedSubcategory}-${getSequenceFromId(quizId)}.md`

	const parseTags = () =>
		tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean)

	const handleSourceFile = async (file: File) => {
		setError(null)
		setIsExtracting(true)

		try {
			if (
				file.type === 'application/pdf' ||
				file.name.toLowerCase().endsWith('.pdf')
			) {
				const text = await extractTextFromPdf(file)
				setSourceText(text)
				return
			}

			const text = await file.text()
			setSourceText(text)
		} catch {
			setError('Could not read this file. Try a different PDF/markdown file.')
		} finally {
			setIsExtracting(false)
		}
	}

	const downloadFile = (filename: string, content: string) => {
		const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		a.remove()
		URL.revokeObjectURL(url)
	}

	const copyText = async (content: string) => {
		await navigator.clipboard.writeText(content)
	}

	const handleGenerate = async () => {
		setError(null)
		setSaveMessage(null)
		setResult(null)

		const cleanedTags = parseTags()
		if (sourceText.trim().length < 80) {
			setError(
				'Source text is too short. Add richer content before generating.',
			)
			return
		}

		if (cleanedTags.length === 0) {
			setError('Add at least one tag.')
			return
		}

		setIsGenerating(true)

		try {
			const response = await fetch('/api/ai/content-generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: slugify(category),
					subcategory: slugify(subcategory),
					tags: cleanedTags.map(slugify),
					flashcardDifficulty,
					quizDifficulty,
					quizType,
					flashcardId,
					quizId,
					cardCount,
					questionCount,
					sourceText: sourceText.trim(),
				}),
			})

			const data = (await response.json()) as
				| GenerationResult
				| { error?: string }

			if (!response.ok) {
				setError(data.error ?? 'Generation failed.')
				return
			}

			setResult(data as GenerationResult)
		} catch {
			setError('Request failed. Please try again.')
		} finally {
			setIsGenerating(false)
		}
	}

	const handleSaveToContentFolder = async () => {
		if (!result) return

		setError(null)
		setSaveMessage(null)
		setIsSaving(true)

		try {
			const response = await fetch('/api/ai/content-save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: normalizedCategory,
					subcategory: normalizedSubcategory,
					quizType,
					flashcardsMarkdown: result.flashcardsMarkdown,
					quizMarkdown: result.quizMarkdown,
					flashcardFileName,
					quizFileName,
				}),
			})

			const data = (await response.json()) as
				| { flashcardsPath: string; quizPath: string }
				| { error?: string }

			if (!response.ok) {
				setError(data.error ?? 'Save failed.')
				return
			}

			setSaveMessage(`Saved files: ${data.flashcardsPath} and ${data.quizPath}`)
		} catch {
			setError('Save request failed. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center gap-3">
					<Sparkles className="text-primary" size={24} />
					<div>
						<h1 className="text-2xl font-bold">Content Generator</h1>
						<p className="text-sm text-muted-foreground">
							Generate flashcard and quiz markdown files directly in-app.
						</p>
					</div>
				</div>

				<SignedOut>
					<div className="rounded-lg border p-6 bg-card space-y-3">
						<p className="text-sm text-muted-foreground">
							Sign in to generate content.
						</p>
						<SignInButton mode="modal">
							<Button>Sign in</Button>
						</SignInButton>
					</div>
				</SignedOut>

				<SignedIn>
					<div className="grid gap-6 lg:grid-cols-2">
						<section className="rounded-lg border p-5 bg-card space-y-4">
							<h2 className="font-semibold">Inputs</h2>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor={categoryId}>Category</Label>
									<Input
										id={categoryId}
										value={category}
										onChange={(e) => setCategory(e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={subcategoryId}>Subcategory</Label>
									<Input
										id={subcategoryId}
										value={subcategory}
										onChange={(e) => setSubcategory(e.target.value)}
									/>
								</div>
								<div className="space-y-1.5 sm:col-span-2">
									<Label htmlFor={tagsId}>Tags (comma separated)</Label>
									<Input
										id={tagsId}
										value={tags}
										onChange={(e) => setTags(e.target.value)}
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label>Flashcard difficulty</Label>
									<Select
										value={flashcardDifficulty}
										onValueChange={(value) =>
											setFlashcardDifficulty(value as Difficulty)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="easy">Easy</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="hard">Hard</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label>Quiz difficulty</Label>
									<Select
										value={quizDifficulty}
										onValueChange={(value) =>
											setQuizDifficulty(value as Difficulty)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="easy">Easy</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="hard">Hard</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label>Quiz type</Label>
									<Select
										value={quizType}
										onValueChange={(value) => setQuizType(value as QuizType)}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pattern-selection">
												Pattern Selection
											</SelectItem>
											<SelectItem value="anti-patterns">
												Anti-patterns
											</SelectItem>
											<SelectItem value="big-o">Big-O</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor={cardCountId}>Card count</Label>
									<Input
										id={cardCountId}
										type="number"
										min={1}
										max={20}
										value={cardCount}
										onChange={(e) =>
											setCardCount(
												Math.max(1, Math.min(20, Number(e.target.value) || 1)),
											)
										}
									/>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor={questionCountId}>Question count</Label>
									<Input
										id={questionCountId}
										type="number"
										min={1}
										max={25}
										value={questionCount}
										onChange={(e) =>
											setQuestionCount(
												Math.max(1, Math.min(25, Number(e.target.value) || 1)),
											)
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor={sourceFileId}>Source file (PDF, MD, TXT)</Label>
								<Input
									id={sourceFileId}
									type="file"
									accept=".pdf,.md,.markdown,.txt,text/markdown,text/plain,application/pdf"
									onChange={(e) => {
										const file = e.target.files?.[0]
										if (file) {
											void handleSourceFile(file)
										}
									}}
								/>
								{isExtracting ? (
									<p className="text-xs text-muted-foreground">
										Extracting text...
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor={sourceTextId}>Source text</Label>
								<Textarea
									id={sourceTextId}
									value={sourceText}
									onChange={(e) => setSourceText(e.target.value)}
									className="min-h-64"
									placeholder="Paste notes or load a file above."
								/>
							</div>

							<div className="rounded-md bg-muted px-3 py-2 text-xs space-y-1">
								<div>
									<FileText className="inline mr-2" size={14} />
									Flashcard ID: <code>{flashcardId}</code>
								</div>
								<div>
									<FileText className="inline mr-2" size={14} />
									Quiz ID: <code>{quizId}</code>
								</div>
								<div>
									<FileText className="inline mr-2" size={14} />
									Flashcard file: <code>{flashcardFileName}</code>
								</div>
								<div>
									<FileText className="inline mr-2" size={14} />
									Quiz file: <code>{quizFileName}</code>
								</div>
							</div>

							{error ? (
								<p className="text-sm text-destructive">{error}</p>
							) : null}
							{saveMessage ? (
								<p className="text-sm text-primary">{saveMessage}</p>
							) : null}

							<Button
								onClick={() => void handleGenerate()}
								disabled={isGenerating}
							>
								{isGenerating ? 'Generating...' : 'Generate Markdown Files'}
							</Button>
						</section>

						<section className="rounded-lg border p-5 bg-card space-y-4">
							<div className="flex items-center justify-between gap-3">
								<h2 className="font-semibold">Generated Files</h2>
								<Button
									variant="outline"
									onClick={() => void handleSaveToContentFolder()}
									disabled={!result || isSaving}
								>
									{isSaving ? 'Saving...' : 'Save to content folder'}
								</Button>
							</div>
							{result ? (
								<div className="space-y-5">
									<div className="space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<p className="text-sm font-medium">
												{result.flashcardsFileName}
											</p>
											<Button
												size="sm"
												variant="outline"
												onClick={() => copyText(result.flashcardsMarkdown)}
											>
												Copy
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													downloadFile(
														result.flashcardsFileName,
														result.flashcardsMarkdown,
													)
												}
											>
												Download
											</Button>
										</div>
										<Textarea
											readOnly
											value={result.flashcardsMarkdown}
											className="min-h-56 font-mono text-xs"
										/>
									</div>

									<div className="space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<p className="text-sm font-medium">
												{result.quizFileName}
											</p>
											<Button
												size="sm"
												variant="outline"
												onClick={() => copyText(result.quizMarkdown)}
											>
												Copy
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													downloadFile(result.quizFileName, result.quizMarkdown)
												}
											>
												Download
											</Button>
										</div>
										<Textarea
											readOnly
											value={result.quizMarkdown}
											className="min-h-56 font-mono text-xs"
										/>
									</div>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									Generated files will appear here.
								</p>
							)}
						</section>
					</div>
				</SignedIn>
			</div>
		</div>
	)
}
