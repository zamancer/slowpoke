import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

/**
 * Hook that syncs the authenticated Clerk user to Convex.
 * Should be used in a layout-level component to ensure user sync on sign-in.
 * Returns the Convex user record for downstream use.
 */
export const useConvexUser = () => {
	const { user: clerkUser, isSignedIn, isLoaded } = useUser()
	const upsertUser = useMutation(api.users.upsertFromClerk)
	const convexUser = useQuery(api.users.current, isSignedIn ? {} : 'skip')
	const hasSynced = useRef(false)

	useEffect(() => {
		if (!isLoaded || !isSignedIn || !clerkUser || hasSynced.current) {
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
				hasSynced.current = true
			} catch (error) {
				console.error('Failed to sync user to Convex:', error)
			}
		}

		syncUser()
	}, [isLoaded, isSignedIn, clerkUser, upsertUser])

	useEffect(() => {
		if (!isSignedIn) {
			hasSynced.current = false
		}
	}, [isSignedIn])

	return {
		user: convexUser,
		isLoading: !isLoaded || (isSignedIn && convexUser === undefined),
		isSignedIn,
	}
}
