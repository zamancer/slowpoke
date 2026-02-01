import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { useConvexUser } from '../hooks/useConvexUser'
import ClerkProvider from '../integrations/clerk/provider'
import ConvexProvider from '../integrations/convex/provider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: 'Slowpoke' },
		],
		links: [{ rel: 'stylesheet', href: appCss }],
	}),
	shellComponent: RootDocument,
})

const ConvexUserSync = ({ children }: { children: React.ReactNode }) => {
	useConvexUser()
	return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					<ConvexProvider>
						<ConvexUserSync>{children}</ConvexUserSync>
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	)
}
