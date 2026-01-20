import * as Sentry from '@sentry/tanstackstart-react'
import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Initialize Sentry once at module load (server-side)
let serverSentryInitialized = false

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		context: {},

		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	})

	if (!router.isServer) {
		// Client-side initialization
		Sentry.init({
			dsn: import.meta.env.VITE_SENTRY_DSN,
			integrations: [],
			tracesSampleRate: 1.0,
			sendDefaultPii: true,
		})
	} else if (!serverSentryInitialized) {
		// Server-side initialization (only once)
		const dsn = import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN
		if (dsn) {
			Sentry.init({
				dsn,
				sendDefaultPii: true,
				tracesSampleRate: 1.0,
			})
			serverSentryInitialized = true
		}
	}

	return router
}
