## Product Overview

A focused web application for learning and studying reinforcement that implements spaced repetition through flashcards and active recall through pattern-based quizzes with mandatory justifications.

Initially, this app will be focused on DSA learning and pattern practice.

## Core Features

1. Flashcards Module
   Purpose: Reinforce theoretical DSA concepts through spaced repetition
   Key Features:
   _ Simple card interface (front: question/concept, back: answer)
   _ On user click, card revelas answer. \* Randomization: on rendering, the cards are shuffled and presented differently every time.

Card example:
Front: "When should you use a Trie over a Hash Map?"
Back: "Use Trie when you need prefix-based operations (autocomplete,
prefix matching) or when you want to save space with many shared
prefixes. Hash Map is better for exact key lookups."

Flashcards would be grouped in collections of 6 at a time, presented in a grid.

2. Quiz Module with Justification
   Purpose: Practice pattern recognition with forced articulation of reasoning
   Quiz Types:
   Type 1: Pattern Selection
   ∙ Question: Problem description
   ∙ Options: 4 possible algorithmic patterns (Sliding Window, Two Pointers, DFS, etc.)
   ∙ Required: Select answer + write “Why” explanation (min 50 characters)
   ∙ Feedback: Show correct answer, and expert explanation
   Type 2: Anti-Pattern Recognition
   ∙ Question: Problem + proposed solution approach
   ∙ Options: 4 reasons why the approach is suboptimal
   ∙ Required: Select answer + explain why it fails or is inefficient
   ∙ Feedback: Compare with optimal approach

Type 3: Big O Determination
∙ Question: Code snippet or algorithm description
∙ Options: Different complexity options (Example: O(n), O(n log n), O(n²), etc.)
∙ Required: Select answer + explain roughly how you calculated it (loops, recursion depth, etc.)
∙ Feedback: Step-by-step complexity analysis at a high level. 3. Spaced Repetition Scheduler
Purpose: Review timing for both flashcards and quizzes
Features:
∙ Daily queue of items to review
∙ Algorithm adjusts intervals based on performance
∙ “Study Session” view showing today’s pending reviews
∙ Statistics: retention rate, streak days, items mastered

### High level notes:

For both cards and quizes modules, the system should support the following:

- Spaced repetition algorhitm (1 day → 3 days → 7 days → 14 days).
- Categories: Data Structures, Algorithms, Time and Space Complexity.
- Progress tracking per category.
- Verfication with AI. At the beginning of the study session, the app will let you choose with or without verification (quizes only). When the verification is turned off, the explanation of the quizes is not mandatory, and the IA submission + output is omitted. This is the contraty when the verification is turned ON.

### IA Verification

When the verification is turned on for a study session (default), the app would proceed to submit the user’s answer explanation to an LLM like Claude Opus. The produced output should be presented back to the user along with the answer result to enrich the user understanding of the output.

## Tech Stack

**Core Framework & Backend**
∙ TanStack Start - Full-stack React framework with SSR
∙ Convex - Real-time backend-as-a-service with reactive queries
∙ React - UI library
**Styling & UI**
∙ Shadcn - Accessible component library
∙ Tailwind CSS - Utility-first CSS framework
∙ Tremor - Data visualization components
∙ Lucide React - Icon library
**Data & Validation**
∙ Zod - Schema validation (client & server)
**Content & Animations**
∙ react-markdown - Markdown rendering for DSA problems
∙ Framer Motion - Animation library for UI transitions
**Testing**
∙ Vitest - Unit testing framework
∙ Playwright - End-to-end testing
**Developer Tools**
∙ Biome - Fast linter and formatter
∙ TypeScript - Type safety​​​​​​​​​​​​​​​​

## Deployment

The deployment will be conducted via self hosting on a VPS. We can use a n8n workflow to trigger deployments off of the latest from the main branch.

## Content Strategy

The contents of this learning platform, aka, the question bank will be saved as markdown files, stored directly on the codebase repository. This will ease the process of authoring new questions with versioning, plus enable the platform to be self-contained. The user data such as answers, progress tracking, or other session state required will be stored in the data layer hosted in Convex.

For this reason, every markdown should have a naming schema and content format which will ease the process of parsing and conversion for loading and preparing the data to be presented in a study session.

### File Structure & Organization

Content stored as markdown in `/content` directory with clear separation between flashcards and quizzes.

Directory structure:

- /content
  - /flashcards
    - /data-structures
    - /algorithms
    - /complexity
  - /quizzes
    - /pattern-selection
    - /anti-patterns
    - /big-o

**One file = One card/quiz** - Each markdown file represents a single learning item for atomic version control and easier authoring.

### Naming Convention

`{subcategory}-{sequential-number}.md`

Examples:

- `arrays-001.md`
- `sliding-window-001.md`
- `time-analysis-001.md`

Sequential numbering within each subcategory provides natural indexing and ordering.

### Flashcard Format

```markdown
---
id: data-structures-arrays-001
category: data-structures
subcategory: arrays
difficulty: easy
tags: [fundamentals, memory]
version: 1.0.0
estimatedMinutes: 2
---

# Front

When should you use a Trie over a Hash Map?

# Back

Use Trie when you need prefix-based operations (autocomplete, prefix matching)
or when you want to save space with many shared prefixes. Hash Map is better
for exact key lookups.
```

### Quiz Format

```markdown
---
id: pattern-selection-sliding-window-001
type: pattern-selection
category: algorithms
subcategory: sliding-window
difficulty: medium
tags: [arrays, optimization]
version: 1.0.0
estimatedMinutes: 5
---

# Question

Find the maximum sum of any contiguous subarray of size k.

# Options

- A: Sliding Window
- B: Two Pointers
- C: Binary Search
- D: Dynamic Programming

# Correct Answer

A

# Expert Explanation

Sliding Window is optimal because we can maintain a running sum of k elements
and slide the window one position at a time, achieving O(n) instead of O(n\*k)
with a naive approach.

# Common Mistakes

Dynamic Programming is overcomplicated for this fixed-size subarray problem.
Two Pointers typically works on sorted arrays with specific constraints.
```

### Challenges

With this content approach, we face the following challenges.

- Choosing between build time vs runtime parsing of markdown files.
- Progress tracking difficulties on Convex when relating study session with problem id.
- Issues when loading content with invalid structure.
