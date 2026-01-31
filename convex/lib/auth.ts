import { ConvexError } from 'convex/values'
import type { QueryCtx, MutationCtx } from '../_generated/server'

export const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) {
		throw new ConvexError('Not authenticated')
	}

	const user = await ctx.db
		.query('users')
		.withIndex('byClerkId', (q) => q.eq('clerkId', identity.subject))
		.unique()

	if (!user) {
		throw new ConvexError('User not found in database')
	}

	return user
}

export const getOptionalUser = async (ctx: QueryCtx | MutationCtx) => {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) {
		return null
	}

	return await ctx.db
		.query('users')
		.withIndex('byClerkId', (q) => q.eq('clerkId', identity.subject))
		.unique()
}
