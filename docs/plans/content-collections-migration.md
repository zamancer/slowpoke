# Content Collections Migration Plan

## Overview

This plan addresses the challenges outlined in the master plan regarding content loading:
- Build-time vs runtime parsing of markdown files
- Issues when loading content with invalid structure

The solution is to adopt **Content Collections** (`@content-collections/core`), the officially recommended approach for TanStack Start v1.121+ for handling static markdown content.

## Problem Statement

### Current Implementation Issues

1. **Runtime file I/O on every request** - `flashcard-common-loader.ts` reads the filesystem each time the `/flashcards/` route is accessed
2. **Custom regex-based parsing** - `flashcard-common-fns.ts` uses fragile regex for YAML frontmatter and card section extraction
3. **No validation** - Unsafe type casts (`as string`, `as FlashcardDifficulty`) with no error handling for malformed content
4. **Silent failures** - Malformed markdown files produce empty or incorrect data without clear errors

### Why Content Collections?

Content Collections is the framework-native solution for TanStack Start that:
- Processes markdown at **build time**, eliminating runtime file I/O
- Uses **Zod schemas** for validation (errors caught before deploy)
- Generates **typed TypeScript** imports with full type safety
- Has an official [TanStack Start integration guide](https://www.content-collections.dev/docs/quickstart/tanstack-start)
- Is used by the TanStack Start community (e.g., [tss-blog-starter](https://github.com/ally-ahmed/tss-blog-starter))

## Implementation Steps

### Phase 1: Setup Content Collections

#### 1.1 Install Dependencies

```bash
pnpm add @content-collections/core @content-collections/vite
```

#### 1.2 Configure TypeScript Paths

Update `tsconfig.json` to add the path alias for generated files:

```json
{
  "compilerOptions": {
    "paths": {
      "content-collections": ["./.content-collections/generated"]
    }
  }
}
```

#### 1.3 Configure Vite Plugin

Update `vite.config.ts` to include the Content Collections plugin:

```typescript
import contentCollections from '@content-collections/vite'

export default defineConfig({
  plugins: [
    contentCollections(),
    // ... existing plugins
  ],
})
```

#### 1.4 Update .gitignore

Add the generated directory:

```
.content-collections
```

### Phase 2: Define Collections Schema

#### 2.1 Create Collection Configuration

Create `content-collections.ts` at the project root:

```typescript
import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const FlashcardDifficultySchema = z.enum(['easy', 'medium', 'hard'])

const flashcardGroups = defineCollection({
  name: 'flashcardGroups',
  directory: 'content/flashcards',
  include: '**/*.md',
  schema: (z) => ({
    id: z.string(),
    category: z.string(),
    subcategory: z.string(),
    difficulty: FlashcardDifficultySchema,
    tags: z.array(z.string()),
    version: z.string(),
  }),
  transform: async (document) => {
    // Parse card sections from the markdown body
    const cards = parseCardSections(document.content)
    return {
      ...document,
      cards,
    }
  },
})

export default defineConfig({
  collections: [flashcardGroups],
})
```

#### 2.2 Card Section Parsing

The `transform` function will handle parsing `## Card N` sections from the markdown body. This logic can be extracted from the current `parseCards` function in `flashcard-common-fns.ts` but with added Zod validation:

```typescript
const CardSchema = z.object({
  front: z.string().min(1, 'Card front cannot be empty'),
  back: z.string().min(1, 'Card back cannot be empty'),
})

const parseCardSections = (content: string): Card[] => {
  const cardSections = content
    .split(/^## Card \d+$/m)
    .filter(Boolean)

  return cardSections.map((section, index) => {
    const frontMatch = section.match(/### Front\s*\n([\s\S]*?)(?=### Back|$)/)
    const backMatch = section.match(/### Back\s*\n([\s\S]*)$/)

    const card = {
      front: frontMatch?.[1]?.trim() ?? '',
      back: backMatch?.[1]?.trim() ?? '',
    }

    // Validate each card - throws with helpful error if invalid
    return CardSchema.parse(card)
  })
}
```

### Phase 3: Update Content Format (If Needed)

#### 3.1 Review Current Format

Current flashcard format groups multiple cards in one file:

```markdown
---
id: data-structures-heaps-group-001
category: data-structures
subcategory: heaps
difficulty: easy
tags: [fundamentals, priority-queue]
version: 1.0.0
---

## Card 1
### Front
Question here

### Back
Answer here

## Card 2
...
```

This format works with Content Collections - the frontmatter is handled automatically, and the `transform` function parses the card sections.

#### 3.2 Alternative: One Card Per File

The master plan suggests "One file = One card/quiz". If we want to align with this:

**Pros:**
- Simpler parsing (no card section extraction needed)
- Atomic version control per card
- Aligns with master plan vision

**Cons:**
- More files to manage
- Current implementation uses grouped format
- Migration effort for existing content

**Decision:** Keep the current grouped format for flashcards. The transform function handles the complexity cleanly, and grouping related cards (e.g., 6 cards about heaps) makes authoring easier.

### Phase 4: Refactor Routes

#### 4.1 Update Flashcards Index Route

Replace server function with static import:

```typescript
// Before (src/routes/flashcards/index.tsx)
import { loadAllFlashcardGroups } from '@/lib/common/flashcard-common-loader'

const getFlashcardGroups = createServerFn({ method: 'GET' }).handler(
  async () => loadAllFlashcardGroups()
)

// After
import { allFlashcardGroups } from 'content-collections'

export const Route = createFileRoute('/flashcards/')({
  loader: () => allFlashcardGroups,
  component: FlashcardsPage,
})
```

#### 4.2 Update Individual Group Route

```typescript
// Before (src/routes/flashcards/$groupId.tsx)
import { loadFlashcardGroupById } from '@/lib/common/flashcard-common-loader'

// After
import { allFlashcardGroups } from 'content-collections'

export const Route = createFileRoute('/flashcards/$groupId')({
  loader: ({ params }) => {
    const group = allFlashcardGroups.find(g => g.id === params.groupId)
    if (!group) throw notFound()
    return group
  },
  component: FlashcardGroupPage,
})
```

### Phase 5: Cleanup

#### 5.1 Remove Deprecated Files

After migration is complete and tested, remove:

- `src/lib/common/flashcard-common-loader.ts` - Runtime file loading
- `src/lib/common/flashcard-common-fns.ts` - Custom parsing (move card parsing to content-collections.ts)

#### 5.2 Update Types

Move or consolidate types in `flashcard-common-types.ts` to align with Content Collections generated types. The collection's schema will generate types automatically.

### Phase 6: Future - Quiz Collections

Once flashcards are migrated, apply the same pattern to quizzes:

```typescript
const quizzes = defineCollection({
  name: 'quizzes',
  directory: 'content/quizzes',
  include: '**/*.md',
  schema: (z) => ({
    id: z.string(),
    type: z.enum(['pattern-selection', 'anti-patterns', 'big-o']),
    category: z.string(),
    subcategory: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()),
    version: z.string(),
    estimatedMinutes: z.number(),
  }),
  transform: async (document) => {
    // Parse question, options, answer, explanation from body
    return parseQuizContent(document)
  },
})
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| Parsing | Runtime, every request | Build-time, once |
| Validation | None (unsafe casts) | Zod schemas with clear errors |
| Type Safety | Manual types | Auto-generated from schema |
| Error Detection | Runtime failures | Build-time failures |
| Cold Start | File I/O overhead | Zero (static imports) |
| Code Complexity | Custom regex parsing | Declarative schema config |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Content Collections version compatibility | Pin to stable version, test with TanStack Start version |
| Build time increases with more content | Minimal impact for <50 files; monitor if scaling |
| Learning curve for contributors | Document collection schema in CLAUDE.md |
| Transform function complexity | Keep parsing logic simple, well-tested |

## Testing Strategy

1. **Unit tests** for card section parsing logic
2. **Build verification** - Ensure `pnpm build` catches invalid content
3. **Type checking** - Verify generated types work correctly in routes
4. **Manual testing** - Verify flashcard UI renders correctly

## Success Criteria

- [ ] `pnpm build` fails with clear error if any markdown file has invalid frontmatter
- [ ] `pnpm build` fails with clear error if any card has empty front/back
- [ ] Routes load flashcard data without any runtime file I/O
- [ ] TypeScript provides full autocomplete for flashcard properties
- [ ] Existing flashcard UI continues to work unchanged
