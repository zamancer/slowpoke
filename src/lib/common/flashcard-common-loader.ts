import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseFlashcardGroup } from './flashcard-common-fns'
import type { FlashcardGroup } from './flashcard-common-types'

const FLASHCARDS_DIR = join(process.cwd(), 'content', 'flashcards')

const findMarkdownFiles = async (dir: string): Promise<string[]> => {
	const entries = await readdir(dir, { withFileTypes: true })
	const files: string[] = []

	for (const entry of entries) {
		const fullPath = join(dir, entry.name)
		if (entry.isDirectory()) {
			const subFiles = await findMarkdownFiles(fullPath)
			files.push(...subFiles)
		} else if (entry.name.endsWith('.md')) {
			files.push(fullPath)
		}
	}

	return files
}

export const loadAllFlashcardGroups = async (): Promise<FlashcardGroup[]> => {
	const files = await findMarkdownFiles(FLASHCARDS_DIR)
	const groups: FlashcardGroup[] = []

	for (const filePath of files) {
		const content = await readFile(filePath, 'utf-8')
		const relativePath = filePath.replace(FLASHCARDS_DIR, '').replace(/^\//, '')
		const group = parseFlashcardGroup(content, relativePath)
		groups.push(group)
	}

	return groups
}

export const loadFlashcardGroupById = async (
	groupId: string,
): Promise<FlashcardGroup | undefined> => {
	const groups = await loadAllFlashcardGroups()
	return groups.find((group) => group.id === groupId)
}
