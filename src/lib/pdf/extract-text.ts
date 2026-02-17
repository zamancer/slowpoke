const normalizeWhitespace = (text: string) =>
	text
		.split('\0')
		.join('')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()

export const extractTextFromPdf = async (file: File): Promise<string> => {
	const [{ getDocument, GlobalWorkerOptions }, workerModule] =
		await Promise.all([
			import('pdfjs-dist/legacy/build/pdf.mjs'),
			import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
		])

	GlobalWorkerOptions.workerSrc = workerModule.default

	const bytes = new Uint8Array(await file.arrayBuffer())
	const loadingTask = getDocument({ data: bytes })
	const pdf = await loadingTask.promise

	const pages: string[] = []
	for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
		const page = await pdf.getPage(pageIndex)
		const textContent = await page.getTextContent()
		const pageText = textContent.items
			.map((item) => ('str' in item ? item.str : ''))
			.join(' ')
		pages.push(pageText)
	}

	return normalizeWhitespace(pages.join('\n\n'))
}
