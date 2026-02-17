import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClerkClient } from '@clerk/backend'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

const SaveRequestSchema = z.object({
	category: z.string().regex(/^[a-z0-9-]+$/),
	subcategory: z.string().regex(/^[a-z0-9-]+$/),
	quizType: z.enum(['pattern-selection', 'anti-patterns', 'big-o']),
	flashcardsMarkdown: z.string().min(1),
	quizMarkdown: z.string().min(1),
	flashcardFileName: z.string().regex(/^[a-z0-9-]+\.md$/),
	quizFileName: z.string().regex(/^[a-z0-9-]+\.md$/),
})

const parseAllowList = (raw: string | undefined): string[] =>
	(raw ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean)

const jsonError = (message: string, status: number) =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

const getPrimaryEmail = (
	user: Awaited<ReturnType<typeof clerk.users.getUser>>,
) =>
	user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
		?.emailAddress ?? null

const assertInside = (baseDir: string, targetPath: string): boolean => {
	const relative = path.relative(baseDir, targetPath)
	return (
		relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
	)
}

export const Route = createFileRoute('/api/ai/content-save')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const requestState = await clerk.authenticateRequest(request)
				if (!requestState.isAuthenticated) return jsonError('Unauthorized', 401)

				const auth = requestState.toAuth()
				const userId = auth?.userId
				if (!userId) return jsonError('Unauthorized', 401)

				const allowedUserIds = parseAllowList(
					process.env.CONTENT_SAVE_ALLOWED_USER_IDS,
				)
				const allowedEmails = parseAllowList(
					process.env.CONTENT_SAVE_ALLOWED_EMAILS,
				)

				if (allowedUserIds.length === 0 && allowedEmails.length === 0) {
					return jsonError(
						'Content save is not configured. Set CONTENT_SAVE_ALLOWED_USER_IDS or CONTENT_SAVE_ALLOWED_EMAILS.',
						403,
					)
				}

				const user = await clerk.users.getUser(userId)
				const primaryEmail = getPrimaryEmail(user)
				const isAllowedById = allowedUserIds.includes(userId)
				const isAllowedByEmail = primaryEmail
					? allowedEmails.includes(primaryEmail)
					: false

				if (!isAllowedById && !isAllowedByEmail) {
					return jsonError('Forbidden', 403)
				}

				let body: unknown
				try {
					body = await request.json()
				} catch {
					return jsonError('Malformed JSON body', 400)
				}

				const parsed = SaveRequestSchema.safeParse(body)
				if (!parsed.success) {
					return jsonError('Invalid save payload', 400)
				}

				const payload = parsed.data
				const expectedPrefix = `${payload.subcategory}-`
				if (
					!payload.flashcardFileName.startsWith(expectedPrefix) ||
					!payload.quizFileName.startsWith(expectedPrefix)
				) {
					return jsonError(
						'File names must start with the subcategory slug.',
						400,
					)
				}

				const projectRoot = process.cwd()
				const contentDir = path.resolve(projectRoot, 'content')
				const flashcardsDir = path.resolve(
					contentDir,
					'flashcards',
					payload.category,
				)
				const quizzesDir = path.resolve(contentDir, 'quizzes', payload.quizType)
				const flashcardsPath = path.resolve(
					flashcardsDir,
					payload.flashcardFileName,
				)
				const quizPath = path.resolve(quizzesDir, payload.quizFileName)

				const safeFlashcards = assertInside(contentDir, flashcardsPath)
				const safeQuiz = assertInside(contentDir, quizPath)
				if (!safeFlashcards || !safeQuiz) {
					return jsonError('Unsafe output path', 400)
				}

				await mkdir(flashcardsDir, { recursive: true })
				await mkdir(quizzesDir, { recursive: true })
				await writeFile(flashcardsPath, payload.flashcardsMarkdown, 'utf8')
				await writeFile(quizPath, payload.quizMarkdown, 'utf8')

				return new Response(
					JSON.stringify({
						flashcardsPath,
						quizPath,
					}),
					{
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					},
				)
			},
		},
	},
})
