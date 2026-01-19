import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-8">
			<h1 className="text-4xl font-bold mb-4">Welcome to Slowpoke</h1>
			<p className="text-gray-500">Your app starts here.</p>
		</div>
	)
}
