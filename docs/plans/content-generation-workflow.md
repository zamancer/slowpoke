# Content Generation Workflow

This document describes the process for generating flashcards and quizzes from source material using Claude Code.

## Overview

The content generation system transforms educational source material (PDFs, markdown, plain text) into structured learning content:

1. **Flashcards**: Simple, atomic concepts for initial learning (spaced repetition)
2. **Quizzes**: Deeper comprehension tests with AI-verified justifications

## Learning Progression

```
Source Material → Flashcards → Quizzes
                  (Learn)      (Verify Understanding)
```

- **Flashcards first**: Students encounter core concepts through active recall
- **Quizzes second**: Students prove they understand by applying knowledge and justifying answers

## Content Structure

### Flashcard Groups

Located in: `content/flashcards/{category}/{id}.md`

```yaml
---
id: {category}-{subcategory}-group-{number}
category: data-structures
subcategory: heaps
difficulty: easy | medium | hard
tags: [tag1, tag2]
version: 1.0.0
---
```

Each card has:
- **Front**: Question or prompt triggering recall
- **Back**: Complete answer with supporting details

### Quizzes

Located in: `content/quizzes/{type}/{id}.md`

```yaml
---
id: {type}-{subcategory}-{number}
type: pattern-selection | anti-patterns | big-o
category: algorithms
subcategory: heaps
difficulty: easy | medium | hard
tags: [tag1, tag2]
version: 1.0.0
---
```

Each question has:
- **Question**: Scenario requiring application of knowledge
- **Options**: Four choices (A, B, C, D)
- **Answer**: Correct option letter
- **Explanation**: Why this is optimal (used by AI verification)
- **Mistakes**: Common misconceptions (used by AI verification)

## Quiz Types

| Type | Purpose | Question Style |
|------|---------|----------------|
| `pattern-selection` | Choose the RIGHT approach | "Which data structure is best for..." |
| `anti-patterns` | Identify WRONG approaches | "What mistake does this code make..." |
| `big-o` | Analyze complexity | "What is the time complexity of..." |

---

## Claude Code Workflow

This is the recommended way to generate content - directly through Claude Code.

### Step 1: Prepare Your Source Material

Place your source content in a file Claude Code can read:
- PDF documents (Claude Code can read these directly)
- Markdown or text files
- Or paste content directly in the chat

### Step 2: Generate Flashcards

Use this prompt template in Claude Code:

```
Read the file at [path/to/source.pdf] and generate flashcards for it.

Parameters:
- Category: [e.g., data-structures]
- Subcategory: [e.g., heaps]
- Difficulty: [easy/medium/hard]
- Number of cards: [6-10]

Save the flashcards to content/flashcards/[category]/[subcategory]-[number].md

Follow the flashcard format in src/lib/prompts/flashcard-generation.ts
```

**Example:**

```
Read the file at ~/notes/binary-trees.pdf and generate flashcards for it.

Parameters:
- Category: data-structures
- Subcategory: binary-trees
- Difficulty: easy
- Number of cards: 8

Save to content/flashcards/data-structures/binary-trees-001.md
```

### Step 3: Generate Quizzes

Use this prompt template:

```
Read the file at [path/to/source.pdf] and generate a quiz for it.

Parameters:
- Quiz type: [pattern-selection/anti-patterns/big-o]
- Category: [e.g., algorithms]
- Subcategory: [e.g., heaps]
- Difficulty: [easy/medium/hard]
- Number of questions: [10]

Save the quiz to content/quizzes/[type]/[subcategory]-[number].md

Follow the quiz format in src/lib/prompts/quiz-generation.ts
```

**Example:**

```
Read ~/notes/binary-trees.pdf and generate a pattern-selection quiz.

Parameters:
- Quiz type: pattern-selection
- Category: algorithms
- Subcategory: binary-trees
- Difficulty: medium
- Number of questions: 10

Save to content/quizzes/pattern-selection/binary-trees-001.md
```

### Step 4: Generate Both at Once

For efficiency, generate both flashcards and quiz in one request:

```
Read the file at [path/to/source.pdf] and generate learning content:

1. FLASHCARDS (learn the basics first):
   - Category: [category]
   - Subcategory: [subcategory]
   - Difficulty: easy
   - Cards: 6-8
   - Save to: content/flashcards/[category]/[subcategory]-001.md

2. QUIZ (test deeper understanding):
   - Type: pattern-selection
   - Category: [category]
   - Subcategory: [subcategory]
   - Difficulty: medium
   - Questions: 10
   - Save to: content/quizzes/pattern-selection/[subcategory]-001.md

Follow the formats defined in src/lib/prompts/
```

### Step 5: Review Generated Content

After Claude Code generates the files, review them:

```
Show me the flashcards you just created. Are there any overlapping concepts
I should consolidate?
```

```
Check the quiz explanations - are they detailed enough for AI verification
of student justifications?
```

### Step 6: Validate

Ask Claude Code to verify the content:

```
Run pnpm build to validate the new content files parse correctly.
```

---

## Quick Reference Prompts

### Flashcards from Pasted Content

```
Generate 6 easy flashcards from this content about [topic]:

[paste your content here]

Save to content/flashcards/[category]/[subcategory]-001.md
```

### Quiz from Existing Flashcards

```
Read the flashcards at content/flashcards/data-structures/heaps-001.md
and create a medium-difficulty pattern-selection quiz that tests deeper
understanding of these concepts.

Save to content/quizzes/pattern-selection/heaps-002.md
```

### Expand Existing Content

```
Read content/flashcards/data-structures/heaps-001.md and add 4 more
cards covering [specific topics]. Keep the same format and difficulty.
```

### Different Quiz Types from Same Source

```
I have flashcards at content/flashcards/algorithms/sorting-001.md.
Generate three quizzes from this content:

1. pattern-selection quiz (medium) → content/quizzes/pattern-selection/sorting-001.md
2. anti-patterns quiz (medium) → content/quizzes/anti-patterns/sorting-001.md
3. big-o quiz (hard) → content/quizzes/big-o/sorting-001.md
```

---

## Best Practices

### Flashcard Guidelines

- **Atomic**: One concept per card
- **6-10 cards** per group for manageable study sessions
- **Progressive**: Order from fundamental to nuanced
- **Standalone backs**: A student should be able to learn from the back alone

### Quiz Guidelines

- **Application-focused**: Test ability to apply, not just recall
- **10 questions** per quiz for comprehensive coverage
- **Detailed explanations**: AI needs these to verify student justifications
- **Document mistakes**: Helps identify flawed reasoning patterns

### Difficulty Calibration

| Level | Flashcards | Quizzes |
|-------|------------|---------|
| Easy | Definitions, basic properties | Clear-cut scenarios |
| Medium | Complexities, use cases | Trade-off analysis |
| Hard | Edge cases, trade-offs | Nuanced optimization choices |

---

## Example Session

Here's a complete example of generating content through Claude Code:

**You:**
```
Read ~/study-notes/graph-algorithms.md and generate learning content:

1. FLASHCARDS:
   - Category: algorithms
   - Subcategory: graphs
   - Difficulty: easy
   - Cards: 8
   - Save to: content/flashcards/algorithms/graphs-001.md

2. QUIZ:
   - Type: pattern-selection
   - Category: algorithms
   - Subcategory: graphs
   - Difficulty: medium
   - Questions: 10
   - Save to: content/quizzes/pattern-selection/graphs-001.md
```

**Claude Code:** *(reads file, generates content, saves both files)*

**You:**
```
Show me card 3 and question 5 - I want to verify the complexity analysis is correct.
```

**Claude Code:** *(displays the specific content for review)*

**You:**
```
The explanation for question 5 should mention that Dijkstra's doesn't work
with negative edges. Update it.
```

**Claude Code:** *(edits the file)*

**You:**
```
Run pnpm build to make sure everything parses correctly.
```

---

## Prompt Reference Files

The detailed prompt instructions that Claude Code follows are in:

- `src/lib/prompts/flashcard-generation.ts` - Flashcard design principles
- `src/lib/prompts/quiz-generation.ts` - Quiz design principles
- `src/lib/prompts/quiz-verification.ts` - Runtime verification prompt

These contain the full system prompts with guidelines for:
- Card/question structure
- Difficulty calibration
- Quality criteria
- Output format specifications
