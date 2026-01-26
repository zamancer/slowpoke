# Quiz AI Verification Plan

## Overview

This plan describes the implementation of AI-powered verification of quiz justifications using Claude. When enabled, the user's written justification is submitted to Claude for evaluation, providing richer feedback beyond the simple answer-key comparison currently in place.

Per the master plan, AI verification is toggled per study session (default: ON for authenticated users, OFF for unauthenticated users). The toggle is always visible at the top of the quiz UI, giving the user full control over when to activate or deactivate verification. When OFF (or when unauthenticated), the justification textbox is hidden and the AI submission is skipped entirely—the quiz operates in simple answer-key mode.

---

## 1. Passing Question Context to the AI Model

### Problem

Quiz content lives in Markdown files processed by `@content-collections/core` at build time. The resulting typed data (`allQuizzes`) is available as a static import. We need to send question context (question text, options, correct answer, expert explanation) to the AI without breaking this build-time pattern.

### Solution

The content-collections pattern stays untouched. At runtime, when the user submits an answer, we construct a prompt payload from the already-parsed question object available in the component state. The server endpoint receives this payload and forwards it to Claude.

**Prompt structure sent to the API endpoint:**

```typescript
interface VerificationPayload {
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  selectedAnswer: string;
  justification: string;
  explanation: string; // expert explanation from content
  quizType: "pattern-selection" | "anti-patterns" | "big-o";
}
```

**Why this works with content-collections:**

- No runtime file-system reads needed; the question data is already in memory as typed objects.
- The build-time validation (Zod schemas in `content-collections.ts`) guarantees all fields exist.
- The server only needs the specific question context for the current submission, not the entire quiz collection.

**System prompt construction on the server:**

The server endpoint builds a system prompt that frames Claude's role as a DSA tutor evaluating a student's reasoning. The question context is injected into the user message:

```text
You are a DSA (Data Structures & Algorithms) tutor evaluating a student's justification for a quiz answer.

Question: {question}
Options: {formatted options}
Correct Answer: {correctAnswer}
Student's Answer: {selectedAnswer}
Student's Justification: {justification}

Expert Explanation: {explanation}

Evaluate the student's justification. Consider:
1. Does the justification demonstrate correct understanding of WHY the answer is right/wrong?
2. Is the reasoning technically sound, even if the selected answer is incorrect?
3. Are there misconceptions that need correction?

Respond with:
- A verdict: PASS or FAIL (the justification quality, independent of the selected answer)
- A brief explanation of your evaluation (2-4 sentences)
- If FAIL: what the student should focus on to improve their understanding
```

**Prompt file organization:**

This system prompt (and future specialized prompts) will live in a dedicated directory rather than being inlined in the API route handler. This keeps prompts version-controlled, reviewable, and easy to iterate on independently from code logic.

```text
src/lib/prompts/
├── quiz-verification.ts   ← exported as a template function
└── index.ts               ← barrel export
```

Each prompt file exports a function that accepts the dynamic context and returns the final prompt string:

```typescript
// src/lib/prompts/quiz-verification.ts
import type { VerificationPayload } from "@/types/quiz";

export const buildQuizVerificationPrompt = (
  payload: VerificationPayload,
): string => {
  // Returns the formatted system + user prompt
};
```

The API route then imports and calls this function, keeping the handler focused on transport and auth concerns. As more prompts are added (e.g., flashcard generation, study plan suggestions), they follow the same pattern in this directory.

---

## 2. Reusing @tanstack/ai

### Current State

The codebase already has:

- `@tanstack/ai-anthropic` (v0.2.0) installed
- `@tanstack/ai-react` (v0.2.2) with `useChat` hook
- `src/lib/ai-hook.ts` with a configured `useAIChat` hook pointing to `/api/ai/chat`
- `streamdown` (v1.6.5) installed for rendering streamed Markdown

### Can We Reuse It?

**Yes, partially.** The existing `useAIChat` hook from `src/lib/ai-hook.ts` is designed for a general-purpose chat interface (conversational, multi-turn). Quiz verification has different requirements:

| Concern         | Chat (useAIChat)          | Quiz Verification                     |
| --------------- | ------------------------- | ------------------------------------- |
| Interaction     | Multi-turn conversation   | Single request/response               |
| Streaming       | Continuous stream display | Stream into a contained feedback area |
| Context         | User-driven               | System-constructed from question data |
| Response format | Free-form Markdown        | Structured (verdict + explanation)    |

### Recommended Approach

Create a **dedicated hook** (`useQuizVerification`) that uses the same underlying `@tanstack/ai-react` primitives but with quiz-specific configuration:

```typescript
// src/hooks/useQuizVerification.ts
import {
  createChatClientOptions,
  fetchServerSentEvents,
  useChat,
} from "@tanstack/ai-react";

const verificationOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/ai/quiz-verify"),
});

export const useQuizVerification = () => useChat(verificationOptions);
```

**Server endpoint:** Create a TanStack Start API route at `src/routes/api/ai/quiz-verify.ts` that:

1. Receives the `VerificationPayload`
2. Constructs the system + user prompt
3. Calls Claude via `@tanstack/ai-anthropic`
4. Streams the response back via SSE

This approach:

- Reuses the installed `@tanstack/ai-react` and `@tanstack/ai-anthropic` packages
- Keeps quiz verification isolated from the general chat functionality
- Uses the same SSE transport pattern already configured
- Allows independent evolution of both features

### Server-Side Implementation

The API route at `src/routes/api/ai/quiz-verify.ts` uses `chat()` with `anthropicText` adapter and `toServerSentEventsResponse()` from `@tanstack/ai` (rather than the `createChatHandler` shorthand originally planned). The system prompt is injected via `getSystemPrompt()` from the prompts module.

### Environment Variables

Required in `.env.local`:

```text
ANTHROPIC_API_KEY=sk-ant-...
```

Validate with `@t3-oss/env-core` (already in dependencies) to fail fast on missing keys.

---

## 3. Displaying the AI Response

### Verdict Logic

The AI response includes a verdict (`PASS` or `FAIL`). This verdict evaluates the **quality of the justification**, independent of whether the selected answer was correct:

| Selected Answer | Justification Verdict | Final Result                         |
| --------------- | --------------------- | ------------------------------------ |
| Correct         | PASS                  | Correct                              |
| Correct         | FAIL                  | **Failed** (wrong reasoning)         |
| Incorrect       | PASS                  | Incorrect (but good reasoning noted) |
| Incorrect       | FAIL                  | Incorrect                            |

A correct answer with a failed justification is marked as **failed** because the student couldn't articulate valid reasoning, suggesting they may have guessed.

### QuestionResult Type

See `src/types/quiz.ts` for the full type definitions (`QuestionResult`, `AiVerification`, `VerificationPayload`).

`isCorrect` is the **single source of truth** for correctness. When AI verification is enabled, `QuizContainer` updates `isCorrect` in-place when verification resolves — downgrading it from `true` to `false` if the answer key matched but the AI verdict was `FAIL`. No separate derived concept (e.g. `isTrulyCorrect`) is needed.

### UI Placement

The AI verification feedback renders as a separate card **after** the QuizQuestion component in the QuizContainer layout. When AI verification is enabled, the evaluation banner inside QuizQuestion is **deferred** until verification completes — showing a spinner ("Evaluating your answer...") in the meantime. When verification is OFF, the banner renders immediately.

```text
┌─────────────────────────────────────┐  ← QuizQuestion
│ Question + Options                  │
│ [Justification textbox]             │  ← hidden when toggle OFF
│ [Evaluating... / Correct/Incorrect] │  ← deferred when AI verification active
│ Expert Explanation: ...             │  ← shown with evaluation banner
│ Common Mistakes: ...                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐  ← QuizAIFeedback (sibling)
│ AI Verification                     │
│ [Streaming Markdown response]       │
│ Verdict: PASS/FAIL badge            │
└─────────────────────────────────────┘
```

### Streaming Display

Use the installed `streamdown` package to render the AI response as it streams in. This provides real-time feedback while maintaining proper Markdown formatting.

### Component Structure

`QuizAIFeedback` is a **sibling** component to `QuizQuestion`, not nested inside it. Both live in `src/components/quiz/` and are orchestrated by `QuizContainer`:

```text
QuizContainer (orchestrator)
├── QuizVerificationToggle (top-level toggle, always visible)
├── QuizQuestion (question + options + justification input)
├── QuizAIFeedback (verification result, shown after submit)
│   ├── Streaming Markdown area (streamdown)
│   ├── Verdict badge (PASS/FAIL)
│   └── Error/retry UI (if applicable)
└── QuizResults (final summary)
```

`QuizAIFeedback` receives its props from `QuizContainer` state (verification status, streamed content, error info). It cannot function standalone without quiz context, so bundling it in the same `quiz/` directory is appropriate, but it renders as a sibling to `QuizQuestion` in the DOM—not inside it.

### QuizResults Integration

In `QuizResults.tsx`, each result entry gains an AI verification summary:

- Show the verdict badge (green PASS / red FAIL) next to the question result
- If the answer was correct but justification failed: override the result indicator to red with a tooltip explaining "Correct answer, but justification did not pass AI verification"
- Expand/collapse the full AI explanation per question

---

## 4. Loading States, Network Issues, and Rate Limits

### Loading State (Waiting for AI)

When the user submits their answer with AI verification **enabled**:

1. **Defer the evaluation banner** inside QuizQuestion — show a spinner with "Evaluating your answer..." instead of Correct/Incorrect. Options show a neutral highlight (primary color) on the selected answer, no green/red yet.
2. **Show AI feedback section** (`QuizAIFeedback` sibling card) in a loading state:
   - Skeleton loader (3 animated lines)
   - The "Next Question" button remains **enabled** (user can proceed without waiting)
3. **Stream begins**: Replace skeleton with streaming Markdown as tokens arrive
4. **Stream complete**: Show final verdict badge in the AI card. Update `isCorrect` on the result. The evaluation banner in QuizQuestion now renders with green/red highlighting and the Correct/Incorrect verdict.

When AI verification is **OFF**, the evaluation banner shows immediately based on the answer key (no deferral).

### Network Error Handling

```typescript
interface VerificationError {
  type: "network" | "rate_limit" | "server" | "timeout";
  message: string;
  retryable: boolean;
}
```

**On network failure:**

- Show a muted error card: "Could not verify your justification. This doesn't affect your quiz score."
- Provide a "Retry" button that re-triggers the verification request
- The answer result (correct/incorrect from answer key) is unaffected
- If the verification never completes, the result defaults to the answer-key comparison only (no verdict override)

**Retry strategy:**

- Maximum 2 automatic retries with 2s/4s delays
- After exhausting retries, show the manual "Retry" button
- Store the payload in component state so retries don't require user re-input

### Rate Limit Handling (Claude API 429)

When the server receives a 429 from the Anthropic API:

1. **Server-side**: Return a structured error with `retry-after` header value if available
2. **Client-side**: Display a specific message:
   - "AI verification is temporarily unavailable due to high demand. Your answer has been recorded."
   - If `retry-after` is available, show: "Try again in X seconds" with a countdown
3. **Graceful degradation**: The quiz continues without AI verification for that question. The result uses answer-key comparison only.

### Timeout Handling

- Client-side timeout: 30 seconds for the full SSE stream
- If the stream doesn't start within 10 seconds, show a warning but keep waiting
- On timeout: treat as a network error (show error card with retry option)

### Session-Level Degradation

The verification toggle at the top of the quiz UI (see Component Structure) is always available for the user to manually enable/disable AI verification at any point.

If 3+ consecutive verification requests fail (any error type):

1. Show a brief toast/banner notification: "AI verification is experiencing issues."
2. Automatically flip the verification toggle to OFF (which also hides the justification textbox for subsequent questions)
3. The user can manually re-enable the toggle at any time if they want to try again

This approach avoids introducing a separate degradation UI—the existing toggle handles both user preference and degradation recovery in one place.

---

## Implementation Order

1. **MVP Auth on quiz page**: Add Clerk `<SignInButton>`/`<UserButton>` to the quiz page so users can authenticate (required for the API endpoint). See section below.
2. **API Route**: Create `src/routes/api/ai/quiz-verify.ts` with Clerk session validation and Claude integration
3. **Hook**: Create `src/hooks/useQuizVerification.ts` with the dedicated chat options
4. **QuizVerificationToggle component**: Top-level toggle rendered by QuizContainer, controls whether justification input and AI feedback are active
5. **QuizAIFeedback component**: Sibling to QuizQuestion, handles streaming display with verdict badge, loading, and error states
6. **QuizContainer updates**: Orchestrate toggle state, update `QuestionResult` type, conditionally show/hide justification in QuizQuestion, wire up the hook on answer submit, handle degradation (auto-disable toggle after 3 failures)
7. **QuizQuestion updates**: Accept a prop to show/hide justification textbox based on toggle state
8. **QuizResults updates**: Show AI verdict badges, handle the "correct answer but failed justification" case
9. **Environment & deployment**: Document `ANTHROPIC_API_KEY` requirement, add to deployment config

---

## Model Selection

Use `claude-sonnet-4-20250514` for verification:

- Fast enough for interactive feedback (streaming)
- Capable of nuanced evaluation of technical justifications
- Cost-effective for per-question evaluations (short prompts, short responses)

Avoid Opus for this use case as the latency and cost are unnecessary for structured evaluation of 50-200 character justifications.

---

## MVP Authentication on Quiz Page

The login/signup UI was previously removed from the app while the overall navigation is being designed. Since the AI verification endpoint requires authentication (to prevent abuse and enforce rate limits), we need a minimal auth presence on the quiz page.

### Approach

Use Clerk's pre-built components directly on the quiz page:

- **Signed out**: Show a `<SignInButton>` in the quiz header area (near the verification toggle). When verification is toggled ON without being signed in, prompt the user to sign in with a brief inline message: "Sign in to enable AI verification of your answers."
- **Signed in**: Show a `<UserButton>` in the same location for session management.

This keeps auth minimal and scoped to the quiz page without requiring global navigation changes. The overall app navigation and auth UX can be designed independently later.

### Component Placement

Auth UI (`<SignInButton>` / `<UserButton>`) is embedded inside the `QuizVerificationToggle` component itself, rather than as a separate sibling in the header:

```text
QuizContainer
├── Quiz header bar
│   ├── Quiz title / progress
│   └── QuizVerificationToggle (includes Clerk auth UI)
├── QuizQuestion
├── QuizAIFeedback
└── QuizResults
```

### Behavior When Not Authenticated

- The verification toggle is visible but shows a lock/sign-in prompt when activated without auth
- The quiz itself works fully without auth (answer-key mode, no justification)
- Only the AI verification feature is gated behind authentication

---

## Security Considerations

- The API route must validate the incoming payload shape (Zod schema)
- Rate-limit the endpoint per-user (e.g., max 20 verifications per minute per session)
- Never expose the `ANTHROPIC_API_KEY` to the client
- Sanitize user justification text before injecting into the prompt (prevent prompt injection by framing it in a clearly delimited block)
- The endpoint should require authentication (Clerk session validation) before processing requests
