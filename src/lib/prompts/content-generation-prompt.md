# Combined Flashcard + Quiz Generation Prompt

Copy and use this prompt with any AI (Claude, ChatGPT, Gemini, etc.). This generates both flashcards AND a quiz from the same source material. Replace the placeholders in brackets.

---

## Prompt

```
You are an expert educator creating learning content for a spaced repetition and quiz system.

## Your Task

From the source material I'll provide, create TWO files:
1. **Flashcards** - Core concepts for initial learning
2. **Quiz** - Application questions to verify deep understanding

The learning progression is: Flashcards teach the basics → Quiz tests if they truly understand.

---

## PART 1: FLASHCARDS

### Flashcard Design Principles

- **Atomic**: One concept per card
- **Active recall**: Front prompts thinking, not recognition
- **Standalone backs**: Learner can understand the concept from the back alone
- **Progressive order**: Foundational concepts first

### Flashcard Format

---
id: [category]-[subcategory]-group-[number]
category: [main topic area]
subcategory: [specific topic]
difficulty: [easy|medium|hard]
tags: [keywords]
version: 1.0.0
---

## Card 1
### Front
[Question or prompt]

### Back
[Complete answer with key details]

(Continue for all cards)

---

## PART 2: QUIZ

### Quiz Design Principles

- **Application over recall**: Test ability to APPLY knowledge
- **Realistic scenarios**: Use practical contexts
- **Meaningful distractors**: Wrong answers = common misconceptions
- **Justification-ready**: Include detailed explanations

### Quiz Format

---
id: [type]-[subcategory]-[number]
type: [question-type]
category: [main topic area]
subcategory: [specific topic]
difficulty: [easy|medium|hard]
tags: [keywords]
version: 1.0.0
---

## Question 1

[Scenario requiring application of knowledge]

### Options

- A: [Option]
- B: [Option]
- C: [Option]
- D: [Option]

### Answer

[Letter]

### Explanation

[Why this is correct - detailed enough to verify student justifications]

### Mistakes

[Why wrong answers seem appealing but are incorrect]

(Continue for all questions)

---

## Difficulty Guidelines

| Level | Flashcards | Quiz |
|-------|------------|------|
| Easy | Definitions, basic properties | Clear-cut scenarios |
| Medium | How/why, comparisons | Trade-off analysis |
| Hard | Edge cases, trade-offs | Nuanced optimization |

---

## Parameters for This Request

**Flashcards:**
- Category: [REPLACE]
- Subcategory: [REPLACE]
- Difficulty: [REPLACE: easy, medium, or hard]
- Number of cards: [REPLACE: typically 6-10]
- ID: [REPLACE: e.g., category-subcategory-group-001]

**Quiz:**
- Type: [REPLACE: concept-application, problem-solving, analysis, comparison, troubleshooting]
- Category: [REPLACE]
- Subcategory: [REPLACE]
- Difficulty: [REPLACE: typically one level higher than flashcards]
- Number of questions: [REPLACE: typically 10]
- ID: [REPLACE: e.g., type-subcategory-001]

---

## Source Material

<source>
[PASTE YOUR CONTENT HERE]
</source>

---

Generate both files now. Output the flashcard file first (labeled "FLASHCARDS FILE"), then the quiz file (labeled "QUIZ FILE").
```

---

## Example Usage

**Your input:**

```
Parameters:

Flashcards:
- Category: cooking
- Subcategory: knife-skills
- Difficulty: easy
- Number of cards: 6
- ID: cooking-knife-skills-group-001

Quiz:
- Type: problem-solving
- Category: cooking
- Subcategory: knife-skills
- Difficulty: medium
- Number of questions: 5
- ID: problem-solving-knife-skills-001

Source Material:
<source>
[Your notes about knife skills, cutting techniques, etc.]
</source>
```

**AI outputs two complete files ready to use.**
