import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './lib/auth'

export const upsertFromClerk = mutation({
	args: {
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query('users')
			.withIndex('byClerkId', (q) => q.eq('clerkId', args.clerkId))
			.unique()

		if (existingUser) {
			await ctx.db.patch(existingUser._id, {
				email: args.email,
				name: args.name,
				imageUrl: args.imageUrl,
			})
			return existingUser._id
		}

		return await ctx.db.insert('users', {
			clerkId: args.clerkId,
			email: args.email,
			name: args.name,
			imageUrl: args.imageUrl,
		})
	},
})

export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getAuthenticatedUser(ctx)
	},
})
