# Content Generation Workflow

This document describes the process for generating flashcards and quizzes from source material using AI.

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

## Generation Workflow

### Step 1: Prepare Source Material

Gather source content in any format:
- PDF documents
- Markdown notes
- Plain text files
- Code examples

Extract the relevant text content. For PDFs, use a tool to convert to text first.

### Step 2: Determine Content Parameters

| Parameter | Description |
|-----------|-------------|
| `category` | Broad topic (e.g., `data-structures`, `algorithms`) |
| `subcategory` | Specific topic (e.g., `heaps`, `graphs`, `sorting`) |
| `difficulty` | Target level: `easy`, `medium`, or `hard` |
| `quizType` | For quizzes: `pattern-selection`, `anti-patterns`, or `big-o` |

### Step 3: Generate Flashcards First

Use the flashcard generation prompt:

```typescript
import { buildFlashcardGenerationPrompt } from '@/lib/prompts/flashcard-generation'

const { system, user } = buildFlashcardGenerationPrompt({
  sourceContent: '...your content...',
  category: 'data-structures',
  subcategory: 'heaps',
  difficulty: 'easy',
  targetCardCount: 6
})
```

Send to Claude and save the output as a markdown file.

### Step 4: Generate Quizzes

Use the quiz generation prompt:

```typescript
import { buildQuizGenerationPrompt } from '@/lib/prompts/quiz-generation'

const { system, user } = buildQuizGenerationPrompt({
  sourceContent: '...your content...',
  quizType: 'pattern-selection',
  category: 'algorithms',
  subcategory: 'heaps',
  difficulty: 'medium',
  targetQuestionCount: 10
})
```

### Step 5: Review and Edit

AI-generated content should be reviewed for:

1. **Accuracy**: Verify all facts, complexities, and explanations
2. **Clarity**: Ensure questions and answers are unambiguous
3. **Difficulty alignment**: Confirm content matches target difficulty
4. **Uniqueness**: Check for overlap with existing content
5. **AI verification compatibility**: Ensure explanations are detailed enough for justification checking

### Step 6: Add Metadata and Save

Add the YAML frontmatter and save to the appropriate location:

```
content/
├── flashcards/
│   └── {category}/
│       └── {subcategory}-{number}.md
└── quizzes/
    └── {type}/
        └── {subcategory}-{number}.md
```

### Step 7: Validate

Run the build to ensure content-collections parses the new content:

```bash
pnpm build
```

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

## Example: Creating Heap Content

### Input Source

```
A heap is a complete binary tree that satisfies the heap property...
Time complexity: insert O(log n), extract-min O(log n), peek O(1)...
Use heaps for: priority queues, finding k largest elements...
```

### Output Flashcards (excerpt)

```markdown
## Card 1
### Front
What are the time complexities of core heap operations?

### Back
- **Insert (push):** O(log n) - Add element at end and bubble up
- **Extract-min/max (pop):** O(log n) - Remove root, move last to root, bubble down
- **Peek (get min/max):** O(1) - Root is always the min/max
```

### Output Quiz (excerpt)

```markdown
## Question 1

You need to find the k largest elements from a stream of n elements where k << n.
Which approach is optimal?

### Options

- A: Max Heap of size n
- B: Min Heap of size k
- C: Sort the array and take last k elements
- D: Binary Search Tree

### Answer

B

### Explanation

A Min Heap of size k is optimal because it maintains only k elements. When a new
element arrives, if it's larger than the heap's minimum, remove the min and insert
the new element. This gives O(n log k) time and O(k) space.

### Mistakes

Using a Max Heap of size n would require O(n) space and O(n log n) to extract k
elements. Sorting requires storing all elements first and doesn't work for streams.
```

## Prompt Files

- Flashcard generation: `src/lib/prompts/flashcard-generation.ts`
- Quiz generation: `src/lib/prompts/quiz-generation.ts`
- Quiz verification (runtime): `src/lib/prompts/quiz-verification.ts`
