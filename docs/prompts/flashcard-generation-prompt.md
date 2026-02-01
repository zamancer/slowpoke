# Flashcard Generation Prompt

Copy and use this prompt with any AI (Claude, ChatGPT, Gemini, etc.). Replace the placeholders in brackets.

---

## Prompt

```
You are an expert educator creating flashcards for a spaced repetition learning system.

## Your Task

Create flashcards from the source material I'll provide. Flashcards should capture the CORE CONCEPTS - these are for initial learning, not deep testing.

## Flashcard Design Principles

1. **Atomic**: Each card tests ONE concept only
2. **Active recall**: Front should prompt thinking, not passive recognition
3. **Clear and concise**: Fronts are questions/prompts; backs are complete but succinct
4. **No tricks**: The goal is learning, not gotcha moments
5. **Progressive**: Order from foundational to more nuanced
6. **Standalone backs**: A learner should be able to learn the concept from the back alone

## Output Format

Generate a markdown file with YAML frontmatter followed by cards.

YAML frontmatter (copy this structure exactly):
---
id: [category]-[subcategory]-group-[number]
category: [main topic area]
subcategory: [specific topic]
difficulty: [easy|medium|hard]
tags: [relevant, keywords, here]
version: 1.0.0
---

Then for each card:

## Card 1
### Front
[Question or prompt that triggers recall]

### Back
[Complete answer with key details - can use bullet points, bold, code blocks as needed]

## Card 2
### Front
[Next question]

### Back
[Answer]

(Continue for all cards)

## Difficulty Guidelines

- **Easy**: Definitions, basic properties, simple "what is" questions
- **Medium**: How/why questions, comparisons, practical applications
- **Hard**: Edge cases, trade-offs, nuanced distinctions, optimization strategies

## Parameters for This Request

- **Category**: [REPLACE: e.g., programming, biology, history]
- **Subcategory**: [REPLACE: e.g., python-basics, cell-biology, world-war-2]
- **Difficulty**: [REPLACE: easy, medium, or hard]
- **Number of cards**: [REPLACE: typically 6-10]
- **ID**: [REPLACE: e.g., programming-python-basics-group-001]

## Source Material

<source>
[PASTE YOUR CONTENT HERE - PDF text, markdown, notes, etc.]
</source>

Generate the flashcards now in the exact format specified above.
```

---

## Example Output

```markdown
---
id: programming-python-basics-group-001
category: programming
subcategory: python-basics
difficulty: easy
tags: [python, variables, data-types, fundamentals]
version: 1.0.0
---

## Card 1
### Front
What are Python's four basic data types for storing single values?

### Back
- **int**: Whole numbers (e.g., `42`, `-7`)
- **float**: Decimal numbers (e.g., `3.14`, `-0.5`)
- **str**: Text strings (e.g., `"hello"`, `'world'`)
- **bool**: Boolean values (`True` or `False`)

## Card 2
### Front
How do you create a variable in Python, and what makes Python's approach different from languages like Java?

### Back
Simply assign a value: `name = "Alice"` or `count = 10`

Python uses **dynamic typing** - you don't declare the type. The type is inferred from the value. You can even reassign to a different type:

```python
x = 5       # x is int
x = "five"  # x is now str
```

## Card 3
### Front
What is the difference between `=` and `==` in Python?

### Back
- `=` is **assignment**: stores a value in a variable
  - `x = 5` means "set x to 5"
- `==` is **comparison**: checks if two values are equal
  - `x == 5` returns `True` or `False`

Common mistake: using `=` in conditions instead of `==`
```
