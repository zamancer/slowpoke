import { useUser } from '@clerk/clerk-react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'

/**
 * Hook that syncs the authenticated Clerk user to Convex.
 * Should be used in a layout-level component to ensure user sync on sign-in.
 * Returns the Convex user record for downstream use.
 */
export const useConvexUser = () => {
	const { user: clerkUser, isSignedIn, isLoaded } = useUser()
	const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
	const upsertUser = useMutation(api.users.upsertFromClerk)
	const [hasSynced, setHasSynced] = useState(false)
	const [syncError, setSyncError] = useState<Error | null>(null)
	const convexUser = useQuery(
		api.users.current,
		isSignedIn && hasSynced ? {} : 'skip',
	)

	useEffect(() => {
		// Wait for BOTH Clerk to load AND Convex auth to be ready
		if (
			!isLoaded ||
			!isSignedIn ||
			!clerkUser ||
			!isConvexAuthenticated ||
			hasSynced
		) {
			return
		}

		const syncUser = async () => {
			try {
				await upsertUser({
					clerkId: clerkUser.id,
					email: clerkUser.primaryEmailAddress?.emailAddress,
					name: clerkUser.fullName ?? undefined,
					imageUrl: clerkUser.imageUrl,
				})
				setHasSynced(true)
			} catch (error) {
				console.error('Failed to sync user to Convex:', error)
				setSyncError(error instanceof Error ? error : new Error(String(error)))
			}
		}

		syncUser()
	}, [isLoaded, isSignedIn, clerkUser, upsertUser, hasSynced, isConvexAuthenticated])

	useEffect(() => {
		if (!isSignedIn) {
			setHasSynced(false)
			setSyncError(null)
		}
	}, [isSignedIn])

	return {
		user: convexUser,
		isLoading:
			!isLoaded ||
			(isSignedIn && !isConvexAuthenticated) ||
			(isSignedIn && !syncError && convexUser === undefined),
		isSignedIn,
		syncError,
	}
}
