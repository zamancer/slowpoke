# Study Session Persistence — Design Document

## Overview

This document describes a Convex persistence layer for quizzes and flashcards, enabling:

- **Real-time quiz answer persistence** — each answer saved as you go
- **Quiz backtracking** — navigate to previous questions, change answers
- **Quiz resume** — close tab mid-quiz, reopen to pick up where you left off
- **Historical view** — browse past quiz attempts with full detail
- **Flashcard session tracking** — session completes when all cards are revealed
- **Daily activity / streaks** — Duolingo-style consecutive-day tracking

No code changes are included in this document. Implementation will be tracked as separate work items against this design.

---

## Scope Notes

### In Scope
- All phases 1-7 as documented
- Historical view with retry capability (see New History Routes section)

### Explicitly Out of Scope
- **Streak UI components**: The backend (`dailyActivity.getStreak`, `getRecentActivity`) will be implemented, but no UI to display streaks. Streak visualization can be built on top of this foundation in a future iteration.

---

## Current State

### Provider hierarchy (`__root.tsx`)

```
ClerkProvider -> ConvexProvider -> App
```

`ConvexProvider` (`src/integrations/convex/provider.tsx`) uses a plain `ConvexProvider` from `convex/react` with a `ConvexQueryClient` from `@convex-dev/react-query`. There is no Clerk-to-Convex auth integration — Convex calls are unauthenticated.

### Schema (`convex/schema.ts`)

Placeholder tables only:

```ts
products: defineTable({ title, imageId, price })
todos: defineTable({ text, completed })
```

### Quiz flow (`QuizContainer.tsx`)

- Questions are shuffled on mount via `useMemo` (lost on refresh).
- Answers accumulate in local `results[]` state.
- AI verification is streamed per-answer via `useQuizVerification` hook.
- There is no backtracking — questions advance forward only.
- On completion, `QuizResults` renders from local state — nothing is persisted.

### Flashcard flow (`FlashcardGrid.tsx` / `FlashcardCard.tsx`)

- `FlashcardCard` manages its own `isRevealed` state internally.
- `FlashcardGrid` renders cards in a grid; there is no session concept.
- No persistence or completion tracking.

---

## Schema Design

### Tables

#### `users`

Links Clerk identity to Convex. Created/updated on sign-in.

| Field | Type | Notes |
|-------|------|-------|
| `clerkId` | `v.string()` | Clerk user ID |
| `email` | `v.optional(v.string())` | |
| `name` | `v.optional(v.string())` | |
| `imageUrl` | `v.optional(v.string())` | Avatar |

**Indices:** `byClerkId` on `['clerkId']`

#### `quizSessions`

One row per quiz attempt. Created when a user starts (or resumes) a quiz.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `v.id('users')` | FK to users |
| `quizId` | `v.string()` | Content-collection quiz slug |
| `contentHash` | `v.string()` | Hash of quiz content at session start |
| `status` | `v.union(v.literal('in_progress'), v.literal('completed'), v.literal('abandoned'))` | |
| `questionOrder` | `v.array(v.number())` | Shuffled indices into the quiz's question array |
| `currentQuestionIndex` | `v.number()` | Index into `questionOrder` (0-based position) |
| `totalQuestions` | `v.number()` | Length of `questionOrder` |
| `correctCount` | `v.number()` | Denormalized; computed on completion |
| `verificationEnabled` | `v.boolean()` | Whether AI verification was on |
| `completedAt` | `v.optional(v.number())` | Epoch ms |

**Indices:**
- `byUserId` on `['userId']`
- `byUserIdAndQuizId` on `['userId', 'quizId']`
- `byUserIdAndStatus` on `['userId', 'status']`

#### `quizAnswers`

One row per question per session. Upserted when the user answers or changes an answer on backtrack.

| Field | Type | Notes |
|-------|------|-------|
| `sessionId` | `v.id('quizSessions')` | FK to quizSessions |
| `userId` | `v.id('users')` | Denormalized for access control |
| `questionIndex` | `v.number()` | Original index in the quiz's question array |
| `orderPosition` | `v.number()` | Position within the session's `questionOrder` |
| `selectedAnswer` | `v.string()` | Option label (e.g. "A") |
| `justification` | `v.string()` | Free-text justification |
| `isCorrect` | `v.boolean()` | Based on answer key (pre-AI) |
| `aiVerification` | `v.optional(v.object({ verdict: v.union(v.literal('PASS'), v.literal('FAIL')), explanation: v.string(), status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('complete'), v.literal('error')), error: v.optional(v.string()) }))` | Mirrors `AiVerification` type |

**Indices:**
- `bySessionId` on `['sessionId']`
- `bySessionIdAndQuestionIndex` on `['sessionId', 'questionIndex']`
- `bySessionIdAndOrderPosition` on `['sessionId', 'orderPosition']`

#### `flashcardSessions`

One row per flashcard group study attempt. Sessions do not "complete" — they are indefinitely resumable.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `v.id('users')` | FK to users |
| `groupId` | `v.string()` | Content-collection group slug |
| `totalCards` | `v.number()` | Total cards in the group |
| `revealedCount` | `v.number()` | Denormalized count of reveals |
| `lastStudiedAt` | `v.number()` | Epoch ms — updated on each reveal |

**Indices:**
- `byUserId` on `['userId']`
- `byUserIdAndGroupId` on `['userId', 'groupId']`

#### `flashcardReveals`

One row per card revealed per session. Idempotent — re-revealing is a no-op.

| Field | Type | Notes |
|-------|------|-------|
| `sessionId` | `v.id('flashcardSessions')` | FK |
| `userId` | `v.id('users')` | Denormalized for access control |
| `cardIndex` | `v.number()` | Index in the group's card array |
| `revealedAt` | `v.number()` | Epoch ms |

**Indices:**
- `bySessionId` on `['sessionId']`
- `bySessionIdAndCardIndex` on `['sessionId', 'cardIndex']`

#### `dailyActivity`

One row per user per calendar day. Written on quiz completion only (flashcards do not complete — see A6).

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `v.id('users')` | FK |
| `date` | `v.string()` | `YYYY-MM-DD` in user's local timezone |
| `quizCompleted` | `v.boolean()` | At least one quiz completed today |

**Indices:**
- `byUserId` on `['userId']`
- `byUserIdAndDate` on `['userId', 'date']`

### Key Design Decisions

1. **Separate `quizAnswers` table** (not an embedded array on the session): Avoids read-modify-write races when saving answers in real time. Enables atomic upsert when backtracking to change a previous answer without touching the session document.

2. **`questionOrder` stored on session**: A small array (4-10 items) that fully reconstructs the shuffled presentation order. The client generates the shuffle and writes it once at session start. On resume, the client reads it back instead of re-shuffling.

3. **`dailyActivity` denormalized table**: Computing streaks by scanning all sessions would be expensive. A single row per day makes streak calculation a simple backwards walk.

4. **`revealedCount` denormalized on flashcard session**: Avoids a count query on every reveal. The `revealCard` mutation atomically increments this. Sessions do not "complete" — they are indefinitely resumable.

6. **`contentHash` on quiz session**: Enables detection of quiz content changes between session start and resume. If content has changed, the session is abandoned and user starts fresh.

5. **`userId` denormalized on answer/reveal rows**: Allows server-side access control checks without joining back to the parent session.

---

## Auth Integration (Clerk to Convex)

The current setup has Clerk and Convex as separate, unlinked providers. To authenticate Convex mutations/queries with the signed-in user:

### Step 1: Clerk JWT Template

In the Clerk dashboard, create a JWT template named `"convex"` that includes the standard claims Convex expects (`sub`, `iss`, `aud`). The issuer domain should match what Convex is configured to trust.

### Step 2: Convex Auth Config

Create `convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: "https://<clerk-issuer-domain>",
      applicationID: "convex",
    },
  ],
}
```

### Step 3: Switch Provider

Modify `src/integrations/convex/provider.tsx` to use `ConvexProviderWithClerk` from `convex/react-clerk`. This wraps the existing `ConvexReactClient` and injects Clerk's `useAuth` for automatic JWT forwarding:

```tsx
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(CONVEX_URL)
const convexQueryClient = new ConvexQueryClient(convex)

// Wrap children with ConvexProviderWithClerk using useAuth
```

The `ConvexQueryClient` must be created from the same `ConvexReactClient` instance so that TanStack Query and direct Convex subscriptions share auth state.

### Step 4: User Sync Hook

Create `src/hooks/useConvexUser.ts`:

```ts
// On sign-in, call users.upsertFromClerk mutation
// Run in a layout-level component (e.g. __root.tsx or a layout route)
// Returns the Convex user record for downstream use
```

---

## Server Functions

### `convex/lib/auth.ts` — Shared Auth Helper

A helper that extracts the authenticated user from the Convex context and throws if unauthenticated. Used by all mutations/queries that require auth.

```ts
// getAuthenticatedUser(ctx): looks up user by identity's tokenIdentifier
// Throws ConvexError if not authenticated
```

### `convex/users.ts`

| Function | Type | Description |
|----------|------|-------------|
| `upsertFromClerk` | mutation | Upsert user by `clerkId`. Takes `clerkId`, `email?`, `name?`, `imageUrl?`. |
| `current` | query | Returns the authenticated user's record. |

### `convex/quizSessions.ts`

| Function | Type | Description |
|----------|------|-------------|
| `start` | mutation | Create a new `in_progress` session. Args: `quizId`, `questionOrder`, `totalQuestions`, `verificationEnabled`, `contentHash`. |
| `getActiveSession` | query | Find the most recent `in_progress` session for `(userId, quizId)`. Returns `null` if none. Used for resume. |
| `getSession` | query | Get session by `_id`. Auth-guarded (must be owner). |
| `complete` | mutation | Set `status: 'completed'`, compute `correctCount` from answers, set `completedAt`. Also calls `dailyActivity.recordQuizCompletion` internally. |
| `abandon` | mutation | Set `status: 'abandoned'`. Called when user explicitly restarts instead of resuming. |
| `updateProgress` | mutation | Update `currentQuestionIndex`. Called as user navigates. |
| `listByUser` | query | All completed sessions for the authenticated user (history). |
| `listByUserAndQuiz` | query | Completed sessions for a specific quiz (per-quiz history). |

### `convex/quizAnswers.ts`

| Function | Type | Description |
|----------|------|-------------|
| `saveAnswer` | mutation | Upsert by `(sessionId, questionIndex)`. On backtrack+re-answer, this overwrites the previous answer. Resets `aiVerification` if answer changed. |
| `updateAiVerification` | mutation | Patch the `aiVerification` field on an existing answer. Called after AI verification completes or errors. |
| `listBySession` | query | All answers for a session, ordered by `orderPosition`. |
| `getBySessionAndQuestion` | query | Single answer lookup by `(sessionId, questionIndex)`. |

### `convex/flashcardSessions.ts`

| Function | Type | Description |
|----------|------|-------------|
| `start` | mutation | Create `in_progress` session with `totalCards`, `revealedCount: 0`. |
| `getActiveSession` | query | Find in-progress session for `(userId, groupId)`. |
| `listByUser` | query | Completed flashcard sessions for history. |

### `convex/flashcardReveals.ts`

| Function | Type | Description |
|----------|------|-------------|
| `revealCard` | mutation | Idempotent. If not already revealed, insert row, increment `revealedCount`, and update `lastStudiedAt` on session. |
| `listBySession` | query | All reveals for a session. |

### `convex/dailyActivity.ts`

| Function | Type | Description |
|----------|------|-------------|
| `recordQuizCompletion` | mutation (internal) | Upsert today's row, set `quizCompleted: true`. |
| `getStreak` | query | Walk backwards from today counting consecutive days where `quizCompleted: true`. |
| `getRecentActivity` | query | Last N days for calendar/heatmap display. |

---

## Data Flows

### Quiz: Start or Resume

```
User opens /quizzes/:quizId
  |
  +--> QuizContainer mounts
  |      |
  |      +--> useQuery(quizSessions.getActiveSession, { quizId })
  |             |
  |             +--> Session found (in_progress):
  |             |      Compare session.contentHash with current quiz content
  |             |      |
  |             |      +--> Hash matches:
  |             |      |      Load questionOrder from session
  |             |      |      Load all answers via quizAnswers.listBySession
  |             |      |      Reset any 'streaming' AI verifications to 'pending'
  |             |      |      Set currentQuestionIndex from session
  |             |      |      Populate local results[] from answers
  |             |      |      Show "Restart Quiz" button
  |             |      |      --> AUTO-RESUME
  |             |      |
  |             |      +--> Hash mismatch:
  |             |             Abandon stale session (content changed)
  |             |             --> START FRESH (below)
  |             |
  |             +--> No session found:
  |                    Shuffle questions on client
  |                    Compute contentHash from quiz content
  |                    Call quizSessions.start with questionOrder + contentHash
  |                    --> START FRESH
```

### Quiz: Answer Submit

```
User selects answer + writes justification, clicks Submit
  |
  +--> Update local results[] (immediate UI feedback)
  |
  +--> Fire quizAnswers.saveAnswer mutation (fire-and-forget)
  |      Args: sessionId, questionIndex, orderPosition,
  |            selectedAnswer, justification, isCorrect
  |
  +--> If AI verification enabled:
         Start streaming verification
         On complete/error: call quizAnswers.updateAiVerification
```

### Quiz: Backtrack and Change Answer

```
User clicks "Previous" button (visible when currentQuestionIndex > 0)
  |
  +--> Decrement currentQuestionIndex locally
  |
  +--> Call updateProgress mutation to persist new index
  |
  +--> Display previously saved answer (form pre-filled from local results[])
  |
  +--> If user re-submits with different answer:
         quizAnswers.saveAnswer upserts (overwrites previous)
         Update local results[] at that index
         Re-trigger AI verification if enabled
```

### Quiz: Complete

```
User answers final question, clicks Finish
  |
  +--> Call quizSessions.complete mutation
  |      Server-side:
  |        1. Query all answers for session
  |        2. Compute correctCount (accounting for AI verdicts if enabled)
  |        3. Set status: 'completed', completedAt
  |        4. Upsert dailyActivity for today
  |
  +--> Show QuizResults (from local state, backed by Convex)
```

### Quiz: Tab Close / Refresh (Resume)

```
User closes tab while quiz is in_progress
  |
  +--> Session remains in_progress in Convex
  |    All answered questions are already persisted
  |
  +--> User reopens /quizzes/:quizId
         getActiveSession finds the in_progress session
         Client reconstructs from session + answers
         User continues from where they left off
```

### Flashcard: Reveal

```
User clicks a flashcard
  |
  +--> FlashcardGrid calls flashcardReveals.revealCard
  |      Server-side (idempotent):
  |        1. Check if already revealed -> no-op
  |        2. Insert reveal row
  |        3. Increment session.revealedCount
  |        4. Update session.lastStudiedAt
  |        (No completion logic — sessions are indefinitely resumable)
  |
  +--> Update local revealed state (immediate UI feedback)
```

---

## Client Integration Changes

### QuizContainer (`src/components/quiz/QuizContainer.tsx`)

**Current:** All state is local. Questions shuffled in `useMemo`. Results in `useState`. No persistence.

**Changes:**
- Add Convex queries: `getActiveSession`, `listBySession` (answers)
- Add Convex mutations: `start`, `saveAnswer`, `updateAiVerification`, `updateProgress`, `complete`, `abandon`
- On mount: check for active session, compare contentHash, auto-resume or start fresh (A1, A4)
- On resume: reset any `streaming` AI verifications to `pending`
- On answer submit: save to Convex alongside local state update
- On AI verification result: call `updateAiVerification`
- On complete: call `complete` mutation
- Add "Previous" button visible when `currentQuestionIndex > 0`
- On backtrack + re-answer: upsert via `saveAnswer`
- Add "Restart Quiz" button visible when resuming an existing session
- On restart: call `abandon` on current session, then `start` new one

**Local state remains primary for UI responsiveness.** Convex is the durability layer. The pattern is optimistic — local state updates immediately, mutations fire in the background.

### FlashcardGrid (`src/components/flashcard/FlashcardGrid.tsx`)

**Current:** Renders cards, each managing their own revealed state.

**Changes:**
- Manage `revealedCards: Set<number>` state at grid level
- On mount: check for active session, load existing reveals
- Pass `isRevealed` and `onReveal` props down to each card
- On reveal: call `revealCard` mutation, update local set
- Show progress indicator (e.g., "8/12 cards revealed")

### FlashcardCard (`src/components/flashcard/FlashcardCard.tsx`)

**Current:** Uncontrolled — manages its own `isRevealed` state.

**Changes:**
- Become controlled: accept `isRevealed: boolean` and `onReveal: () => void` props
- Remove internal `useState`
- Call `onReveal` on click (only if not already revealed)

### New History Routes

#### `/quizzes/history` — Quiz History List

**Component:** `QuizHistory`

**Layout:** Lightweight scrollable list of completed sessions

**Per-session card content:**
- Quiz title (from content collection)
- Score displayed as fraction (e.g., "4/5")
- Completion date (formatted relative or absolute)
- **"Retry" button** — starts a fresh session for that quiz

**Sorting:** Most recent first (by `completedAt` descending)

**Empty state:** Message when no completed quizzes exist

#### `/quizzes/history/$sessionId` — Quiz Session Review

**Component:** `QuizSessionReview`

**Layout:** Single scrollable page (NOT question-by-question navigation)

**Header section:**
- Quiz title
- Final score (e.g., "4/5 correct")
- Completion date
- **"Retry Quiz" button**

**Questions section** (all questions rendered in order):
Each question block contains:
- Question number and text
- Answer options with user's selection highlighted:
  - Green highlight/checkmark if correct
  - Red highlight/X if incorrect
- User's justification text
- AI verification result (if enabled for that session):
  - Verdict badge (PASS/FAIL)
  - AI explanation text
  - Graceful handling if verification was `error` or `pending`

**Behavior:**
- Completely read-only — no editing of past answers
- "Retry Quiz" abandons nothing; it simply starts a new session via `quizSessions.start`

#### `/flashcards/history` — Flashcard History List

**Component:** `FlashcardHistory`

**Layout:** Lightweight scrollable list of flashcard sessions (sessions do not "complete" — see A6)

**Per-session card content:**
- Flashcard group title
- Progress (e.g., "8/12 cards revealed")
- Last studied date

**"Continue" button** navigates to the session to resume studying

---

## Implementation Sequencing

### Phase 1: Auth Integration

1. Create `convex/auth.config.ts` with Clerk issuer
2. Configure Clerk JWT template (`"convex"`) in Clerk dashboard
3. Add `users` table to `convex/schema.ts`
4. Create `convex/users.ts` (upsertFromClerk, current)
5. Create `convex/lib/auth.ts` (shared auth helper)
6. Switch `src/integrations/convex/provider.tsx` to `ConvexProviderWithClerk`
7. Create `src/hooks/useConvexUser.ts` and wire into layout
8. Verify: sign in, confirm user record appears in Convex dashboard

### Phase 2: Schema Deployment

1. Replace `convex/schema.ts` with full schema (all 6 tables)
2. Delete `convex/todos.ts` (placeholder)
3. Run `npx convex dev` to deploy schema
4. Verify: no deployment errors, all indices created

### Phase 3: Quiz Persistence

1. Create `convex/quizSessions.ts` (start, getActiveSession, getSession, complete, abandon, updateProgress, listByUser, listByUserAndQuiz)
2. Create `convex/quizAnswers.ts` (saveAnswer, updateAiVerification, listBySession, getBySessionAndQuestion)
3. Integrate into `QuizContainer`:
   - Session start/resume on mount
   - Answer persistence on submit
   - AI verification persistence
   - Session completion
4. Verify: complete quiz, check Convex dashboard for session + answers

### Phase 4: Quiz Backtracking

1. Add previous-question navigation UI to `QuizContainer`
2. Wire `updateProgress` mutation on navigation
3. Handle answer change: upsert via `saveAnswer`, reset AI verification
4. Verify: backtrack, change answer, confirm upsert (no duplicates)

### Phase 5: Flashcard Persistence

1. Create `convex/flashcardSessions.ts` (start, getActiveSession, listByUser)
2. Create `convex/flashcardReveals.ts` (revealCard, listBySession)
3. Refactor `FlashcardCard` to controlled component
4. Refactor `FlashcardGrid` to manage session + reveals
5. Verify: reveal cards, confirm persistence and `lastStudiedAt` updates

### Phase 6: Daily Activity / Streaks

1. Create `convex/dailyActivity.ts` (recordQuizCompletion, getStreak, getRecentActivity)
2. Wire into quiz `complete` mutation
3. Verify: complete quiz, check daily activity row created

### Phase 7: History Views

1. Create `/quizzes/history` route and `QuizHistory` component
   - Display completed sessions in reverse chronological order
   - Each session card shows title, score (as fraction), date, and retry button
   - Clicking retry calls `quizSessions.start` to begin a new session
2. Create `/quizzes/history/$sessionId` route and `QuizSessionReview` component
   - Single scrollable page showing all questions (not question-by-question navigation)
   - Header with quiz title, score, date, and "Retry Quiz" button
   - Each question block displays: question text, answer options with correct/incorrect indicators, user's justification, and AI verification results (if enabled)
   - Green indicator for correct answers, red for incorrect
   - AI verification shows verdict badge and explanation inline
   - Graceful handling for `error` or `pending` verification states
3. Create `/flashcards/history` route and `FlashcardHistory` component
   - Display sessions with group title, progress (e.g., "8/12"), and last studied date
   - "Continue" button navigates to resume studying
4. Add navigation links to history from quiz/flashcard index pages

---

## Files to Create / Modify

| File | Action | Phase |
|------|--------|-------|
| `convex/auth.config.ts` | Create | 1 |
| `convex/lib/auth.ts` | Create | 1 |
| `convex/users.ts` | Create | 1 |
| `src/integrations/convex/provider.tsx` | Modify | 1 |
| `src/hooks/useConvexUser.ts` | Create | 1 |
| `convex/schema.ts` | Modify (replace) | 2 |
| `convex/todos.ts` | Delete | 2 |
| `convex/quizSessions.ts` | Create | 3 |
| `convex/quizAnswers.ts` | Create | 3 |
| `src/components/quiz/QuizContainer.tsx` | Modify | 3, 4 |
| `convex/flashcardSessions.ts` | Create | 5 |
| `convex/flashcardReveals.ts` | Create | 5 |
| `src/components/flashcard/FlashcardCard.tsx` | Modify | 5 |
| `src/components/flashcard/FlashcardGrid.tsx` | Modify | 5 |
| `convex/dailyActivity.ts` | Create | 6 |
| `src/routes/quizzes/history/index.tsx` | Create | 7 |
| `src/routes/quizzes/history/$sessionId.tsx` | Create | 7 |
| `src/routes/flashcards/history/index.tsx` | Create | 7 |

---

## Verification Checklist

- [ ] `npx convex dev` deploys schema without errors
- [ ] `pnpm build` passes with no type errors
- [ ] `pnpm test` — existing tests pass
- [ ] Complete a quiz — session and answers appear in Convex dashboard
- [ ] Close tab mid-quiz — reopen — quiz auto-resumes with "Restart Quiz" button visible
- [ ] Modify quiz content — resume shows fresh start (contentHash mismatch abandons session)
- [ ] Close tab during AI streaming — resume — stuck verifications reset to pending
- [ ] Backtrack and change answer — answer is upserted, no duplicate rows
- [ ] Toggle AI verification off/on mid-quiz — answers persist correctly
- [ ] Reveal flashcards — `revealedCount` and `lastStudiedAt` update correctly
- [ ] Close tab mid-flashcard session — reopen — reveals are preserved
- [ ] Complete quiz — daily activity row created
- [ ] Streak query returns correct count after consecutive days of quiz completion
- [ ] History routes display completed sessions with full detail
- [ ] `/quizzes/history` displays completed sessions in reverse chronological order
- [ ] Each session card shows title, score, date, and retry button
- [ ] Clicking retry starts a new session and navigates to the quiz
- [ ] `/quizzes/history/$sessionId` shows all questions on a single scrollable page
- [ ] Correct answers show green indicator, incorrect show red
- [ ] AI verification results display inline with verdict and explanation
- [ ] Retry button on detail page works correctly

---

## Open Questions / Future Considerations

1. **Abandoned session cleanup**: Should a cron job mark stale `in_progress` sessions as `abandoned` after N days? Or leave them indefinitely for resume?
2. **Multiple in-progress sessions**: The design allows only one active session per `(userId, quizId)`. If the user wants to start fresh, the current session must be explicitly abandoned. This matches the resume UX.
3. **Timezone for daily activity**: The `date` field uses the client's local date (`YYYY-MM-DD`). This means streak calculation is timezone-aware from the user's perspective but could shift if they travel. Acceptable tradeoff for simplicity.
4. **Rate limiting / abuse**: Convex mutations are authenticated but not rate-limited. For AI verification calls, the existing server-side rate limiting on the `/api/ai/quiz-verify` endpoint covers this. Convex mutations themselves are lightweight.

---

## Deferred Concerns (P2/P3)

These items were identified during review but deferred for post-MVP:

| Priority | Concern | Notes |
|----------|---------|-------|
| P2 | **Pagination for history queries** | `listByUser` queries return all results. Add `cursor`/`limit` params when user volume grows. |
| P2 | **Mid-quiz navigation guard** | Browser back/link clicks leave session as `in_progress` silently. Add confirmation prompt as UX polish. |
| P2 | **History empty state CTA** | Specify the call-to-action for empty history (e.g., "Take your first quiz →"). |
| P2 | **AI verification error display** | Define "graceful handling" — suggest: "Verification unavailable" text with no retry. |
| P3 | **Client-side shuffle timing** | Ensure shuffle happens after auth/session confirmation to avoid race conditions. |
| P3 | **Timezone documentation** | Document that streak is "user-perceived" based on client timezone, not server-absolute. |
