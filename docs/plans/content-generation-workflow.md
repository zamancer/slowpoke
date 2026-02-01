# Content Generation Workflow

Generate flashcards and quizzes from any source material using AI.

## Quick Start

1. Copy a prompt from `docs/prompts/`
2. Paste your source content (PDF text, markdown, notes)
3. Fill in the parameters
4. Run with any AI (Claude, ChatGPT, Gemini, etc.)
5. Save the output as a `.md` file in the appropriate `content/` folder

## Available Prompts

| Prompt | Use Case |
|--------|----------|
| `flashcard-generation-prompt.md` | Generate flashcards only |
| `quiz-generation-prompt.md` | Generate quiz only |
| `combined-generation-prompt.md` | Generate both at once |

## Learning Progression

```
Source Material → Flashcards → Quiz
                  (Learn)      (Verify Understanding)
```

- **Flashcards**: Simple, atomic concepts for initial learning
- **Quizzes**: Application questions that test deep understanding

## Content Structure

### Where to Save Files

```
content/
├── flashcards/
│   └── {category}/
│       └── {subcategory}-{number}.md
└── quizzes/
    └── {type}/
        └── {subcategory}-{number}.md
```

### Flashcard Format

```yaml
---
id: {category}-{subcategory}-group-{number}
category: cooking
subcategory: knife-skills
difficulty: easy
tags: [techniques, basics]
version: 1.0.0
---
```

```markdown
## Card 1
### Front
[Question triggering recall]

### Back
[Complete answer]
```

### Quiz Format

```yaml
---
id: {type}-{subcategory}-{number}
type: problem-solving
category: cooking
subcategory: knife-skills
difficulty: medium
tags: [techniques, safety]
version: 1.0.0
---
```

```markdown
## Question 1

[Scenario requiring application]

### Options

- A: [Option]
- B: [Option]
- C: [Option]
- D: [Option]

### Answer

B

### Explanation

[Why correct - used for AI verification of student justifications]

### Mistakes

[Why wrong answers seem appealing]
```

## Parameters Reference

### Categories & Subcategories

These are flexible - use whatever makes sense for your content:

| Category | Example Subcategories |
|----------|----------------------|
| programming | python-basics, database-design, api-design |
| data-structures | heaps, graphs, trees |
| algorithms | sorting, searching, dynamic-programming |
| cooking | knife-skills, baking, sauces |
| medicine | cardiology, pharmacology, anatomy |

### Difficulty Levels

| Level | Flashcards | Quiz |
|-------|------------|------|
| easy | Definitions, "what is" | Clear-cut scenarios |
| medium | How/why, comparisons | Trade-off analysis |
| hard | Edge cases, trade-offs | Nuanced choices |

### Quiz Types

| Type | Purpose |
|------|---------|
| concept-application | Apply concepts to new situations |
| problem-solving | Choose best approach |
| analysis | Analyze and identify issues |
| comparison | Compare and contrast |
| troubleshooting | Find and fix problems |

## Workflow Example

### 1. Prepare Source Material

Extract text from your PDF, copy your notes, or use existing markdown.

### 2. Choose Parameters

```
Category: programming
Subcategory: python-decorators
Difficulty: medium
```

### 3. Generate Content

Open the prompt from `docs/prompts/`, fill in parameters, paste source, run with AI.

### 4. Save Output

Save flashcards to:
```
content/flashcards/programming/python-decorators-001.md
```

Save quiz to:
```
content/quizzes/concept-application/python-decorators-001.md
```

### 5. Validate

```bash
pnpm build
```

## Best Practices

### Flashcards
- 6-10 cards per group
- One concept per card
- Backs should be complete enough to learn from

### Quizzes
- 10 questions per quiz
- Focus on application, not recall
- Detailed explanations (AI uses these to verify student justifications)
- Document common mistakes

### Review Checklist
- [ ] Facts and explanations are accurate
- [ ] Difficulty matches the target level
- [ ] No overlap with existing content
- [ ] Quiz explanations detailed enough for AI verification
