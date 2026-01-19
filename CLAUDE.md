# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production
pnpm test             # Run tests (vitest)
pnpm test -- path/to/file  # Run a single test file
pnpm lint             # Lint with Biome
pnpm format           # Format with Biome
pnpm check            # Run Biome check (lint + format)
pnpm commit           # Commitizen for conventional commits
```

**Convex development:** Run `npx convex dev` in a separate terminal to sync database schema and functions.

## Code Style

Formatting rules (configured in biome.json):
- Tab indentation, single quotes, no semicolons
- Commits follow conventional changelog format (enforced by commitlint)

## Coding Standards

### General Principles

- Functional style: no classes or object instantiation, but imperative patterns are acceptable
- Max 3 function parameters
- Max 300 lines per file (500 soft limit for React components)
- Single Responsibility and DRY
- Testability first: design for easy dependency injection and mocking
- Custom exceptions for business error cases
- No magic numbers: define constants
- Comments only when intent is unclear (provide context, not obvious descriptions)
- Name utilities "common" not "utils" (e.g., `src/lib/common/date-common-fns.ts`)

### TypeScript Specific

- TypeScript for all code unless third-party conflict
- Types in a common directory
- Use import aliases for shorter imports
- Avoid over-complicated typing (document if unavoidable)
- camelCase naming
- Prefer arrow functions over other functions  declarations

## Architecture

This is a TanStack Start application with file-based routing. Key directories:

- `src/routes/` - TanStack Router routes (file-based, auto-generates `routeTree.gen.ts`)
- `src/integrations/` - Third-party provider wrappers (Clerk auth, Convex database)
- `src/components/ui/` - Shadcn components
- `src/hooks/` - Custom hooks (audio recording, TTS, forms)
- `src/lib/` - Utilities and AI integration
- `convex/` - Database schema and server functions

Provider hierarchy in `__root.tsx`: ClerkProvider → ConvexProvider → App

## Sentry Instrumentation

Server functions should be instrumented with Sentry spans:

```tsx
import * as Sentry from '@sentry/tanstackstart-react'

Sentry.startSpan({ name: 'Operation description' }, async () => {
  // async operation
})
```

## Convex Schema Guidelines

Use `v` validators from `convex/values`. System fields `_id` and `_creationTime` are auto-generated—don't add indices for them. Example pattern:

```ts
import { v } from 'convex/values'

messages: defineTable({
  text: v.string(),
  userId: v.id('users'),
  status: v.optional(v.union(v.literal('draft'), v.literal('sent'))),
}).index('userId', ['userId'])
```

## Adding UI Components

```bash
pnpm dlx shadcn@latest add <component>
```
