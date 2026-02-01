# Authentication Gaps — Backlog

## Overview

This document captures known authentication-related gaps in the slowpoke app. These items are deferred for future sprints but documented here to inform planning.

No code changes are included in this document.

---

## Current State

### Auth Entry Points

| Location | Component | Behavior |
|----------|-----------|----------|
| Quiz UI | `QuizVerificationToggle.tsx` | SignInButton (modal mode) appears when unauthenticated user tries to enable AI verification |
| Sidebar footer | `header-user.tsx` | SignInButton/UserButton at bottom of mobile nav |

### Auth-Aware Features

| Feature | Auth Status | Notes |
|---------|-------------|-------|
| Quiz sessions | ✅ Integrated | Full persistence with `useConvexUser()` |
| AI verification | ✅ Integrated | Gated on `convexUser` |
| Flashcards | ❌ Not integrated | Schema exists (`flashcardSessions`, `flashcardReveals`), components have no auth |
| Progress/History | ❌ No UI | Backend queries exist (`listByUser`), no routes/components |

---

## Backlog Items

### 1. Global Sign-In Visibility

**Priority:** Medium
**Impact:** User awareness, onboarding

**Problem:**
Sign-in is hidden. Users only discover it when:
- Scrolling to sidebar footer
- Attempting to toggle AI verification in quiz

Most users browsing quizzes won't know authentication exists or that they can save progress.

**Suggested approach:**
Add sign-in button to main header bar (not just buried in sidebar). Consider showing "Sign in to save progress" contextually.

**Files:**
- `src/components/Header.tsx`
- `src/integrations/clerk/header-user.tsx`

---

### 2. Progress/History Dashboard

**Priority:** Medium
**Impact:** Feature completeness

**Problem:**
Quiz sessions are persisted to Convex but users have no way to:
- View completed quizzes
- See scores and history
- Access active/abandoned sessions

Backend is ready:
- `quizSessions.listByUser()`
- `quizSessions.listByUserAndQuiz()`

History routes were designed in `study-session-persistence.md` but not implemented.

**Suggested approach:**
Implement Phase 7 from the study session persistence plan:
- `/quizzes/history` — list of completed sessions
- `/quizzes/history/$sessionId` — session review page

**Files:**
- New: `src/routes/quizzes/history/index.tsx`
- New: `src/routes/quizzes/history/$sessionId.tsx`
- New: `src/components/quiz/QuizHistory.tsx`
- New: `src/components/quiz/QuizSessionReview.tsx`

---

### 3. Flashcard Auth Integration

**Priority:** High (blocks flashcard persistence)
**Impact:** Feature parity with quizzes

**Problem:**
Schema exists but components have zero auth integration:
- `FlashcardGrid.tsx` — no `useConvexUser`
- `FlashcardCard.tsx` — no session tracking
- `convex/flashcardSessions.ts` — not created
- `convex/flashcardReveals.ts` — not created

When session persistence is added, this will break without proper auth gating.

**Suggested approach:**
Implement Phase 5 from the study session persistence plan:
1. Create Convex functions for flashcard sessions/reveals
2. Refactor `FlashcardCard` to controlled component
3. Refactor `FlashcardGrid` to manage session + reveals
4. Mirror the quiz pattern with `useConvexUser()`

**Files:**
- New: `convex/flashcardSessions.ts`
- New: `convex/flashcardReveals.ts`
- Modify: `src/components/flashcards/FlashcardGrid.tsx`
- Modify: `src/components/flashcards/FlashcardCard.tsx`

---

### 4. Sign-In Prompt Before Quiz Start

**Priority:** Low
**Impact:** UX, data loss prevention

**Problem:**
Users can start a quiz anonymously, answer several questions, then realize progress won't be saved. This creates frustration when they've invested time.

**Suggested approach:**
Show gentle prompt when starting quiz for unauthenticated users:
- "Sign in to save your progress"
- "Continue without signing in" option
- Non-blocking, dismissable

**Files:**
- `src/components/quiz/QuizContainer.tsx` or new `QuizStartPrompt.tsx`

---

### 5. Consistent Auth UI Pattern

**Priority:** Low
**Impact:** UX consistency

**Problem:**
Two different sign-in experiences:
- Modal mode (quiz verification toggle)
- Button mode (sidebar)

This creates inconsistent UX.

**Suggested approach:**
Standardize on one approach. Modal is less disruptive for inline prompts; redirect may be better for header CTA. Choose based on overall auth strategy.

**Files:**
- `src/components/quiz/QuizVerificationToggle.tsx`
- `src/integrations/clerk/header-user.tsx`

---

## Summary

| Item | Priority | Blocks |
|------|----------|--------|
| Global sign-in visibility | Medium | — |
| Progress dashboard | Medium | — |
| Flashcard auth integration | **High** | Flashcard persistence |
| Sign-in prompt before quiz | Low | — |
| Consistent auth UI | Low | — |

---

## Related Documents

- `docs/plans/study-session-persistence.md` — Full design for session persistence (Phases 1-7)
