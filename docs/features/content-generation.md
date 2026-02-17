# Content Generation Feature

## Executive Summary

The in-app content generation feature lets signed-in users create flashcard and quiz markdown directly from source material (PDF, markdown, or plain text) without leaving Slowpoke.

At a high level:
- User uploads/pastes source content in `/generate`.
- Client can extract text from PDFs.
- Server calls the LLM with strict formatting instructions.
- The app returns two parser-compatible markdown outputs:
  - Flashcards markdown
  - Quiz markdown
- Users can copy/download files, or save both directly into the local `content/` folder (admin-gated).

This reduces manual prompt workflows and makes content production faster and more consistent with existing `content-collections` parsing rules.

## Current Architecture

- UI route: `src/routes/generate/index.tsx`
  - Collects generation parameters and source text.
  - Handles PDF text extraction on the client.
  - Calls generation and save APIs.

- PDF extraction: `src/lib/pdf/extract-text.ts`
  - Uses `pdfjs-dist` to extract text from uploaded PDF files.

- Prompt builder: `src/lib/prompts/content-generation.ts`
  - Encodes markdown structure constraints and output schema expectations.

- Generation API: `src/routes/api/ai/content-generate.ts`
  - Authenticated endpoint.
  - Calls Anthropic model through TanStack AI.
  - Validates structured output and markdown shape.

- Save API: `src/routes/api/ai/content-save.ts`
  - Authenticated endpoint with allowlist enforcement.
  - Writes generated markdown into `content/flashcards/...` and `content/quizzes/...`.
  - Guards against unsafe paths.

## Team Guidelines For Evolution

- Keep parser compatibility first:
  - Any prompt or schema changes must remain compatible with `content-collections.ts` parsing logic.
  - Treat markdown section headings and frontmatter keys as contracts.

- Prefer schema validation over string heuristics:
  - Continue using strict request/response schemas on server routes.
  - Add additional invariants (counts, option labels, answer consistency) in one place.

- Preserve security boundaries:
  - Keep direct filesystem writes admin-gated via environment allowlists.
  - Maintain path normalization and traversal protections.

- Keep UX fast and resilient:
  - Fail with actionable errors (bad source text, invalid model output, unauthorized save).
  - Avoid blocking user flows if save is unavailable; copy/download should still work.

- Add tests where regressions are likely:
  - Prompt-output parsing compatibility tests.
  - API validation tests for generation/save payloads.
  - Path safety tests for save route.
