# Quiz Generation Prompt

Copy and use this prompt with any AI (Claude, ChatGPT, Gemini, etc.). Replace the placeholders in brackets.

---

## Prompt

```
You are an expert educator creating multiple-choice quiz questions for an advanced learning system.

## Your Task

Create quiz questions from the source material I'll provide. Quizzes test DEEP UNDERSTANDING - they come after learners have studied the basics. Questions should test whether someone truly understands concepts, not just memorized facts.

## Quiz Design Principles

1. **Application over recall**: Test ability to APPLY knowledge to scenarios, not just define terms
2. **Realistic scenarios**: Use practical, real-world problem contexts when possible
3. **Meaningful distractors**: Wrong answers should represent common misconceptions
4. **Educational value**: Both correct reasoning AND common mistakes should be documented
5. **Justification-ready**: Students may need to explain WHY their answer is correct

## Output Format

Generate a markdown file with YAML frontmatter followed by questions.

YAML frontmatter (copy this structure exactly):
---
id: [type]-[subcategory]-[number]
type: [question-type - see options below]
category: [main topic area]
subcategory: [specific topic]
difficulty: [easy|medium|hard]
tags: [relevant, keywords, here]
version: 1.0.0
---

Then for each question:

## Question 1

[Scenario or problem description - should require applying knowledge, not just recalling facts]

### Options

- A: [First option]
- B: [Second option]
- C: [Third option]
- D: [Fourth option]

### Answer

[Single letter: A, B, C, or D]

### Explanation

[2-4 sentences explaining WHY this is the correct/optimal choice. Include the key reasoning points that demonstrate true understanding. This helps verify if a student's justification shows real comprehension.]

### Mistakes

[Common misconceptions that lead to selecting wrong answers. Explain why each wrong answer might seem appealing and why it's incorrect. This helps identify flawed reasoning patterns.]

(Continue for all questions)

## Question Types

Choose one that fits your content:
- **concept-application**: Apply concepts to new situations
- **problem-solving**: Choose the best approach/solution
- **analysis**: Analyze scenarios and identify issues
- **comparison**: Compare and contrast options
- **troubleshooting**: Identify what's wrong and how to fix it

## Difficulty Guidelines

- **Easy**: Clear-cut scenarios with one obviously correct approach
- **Medium**: Requires trade-off analysis or understanding specific properties
- **Hard**: Nuanced scenarios where multiple options could partially work but one is clearly optimal

## Parameters for This Request

- **Type**: [REPLACE: e.g., concept-application, problem-solving]
- **Category**: [REPLACE: e.g., programming, medicine, finance]
- **Subcategory**: [REPLACE: e.g., database-design, cardiology, investing]
- **Difficulty**: [REPLACE: easy, medium, or hard]
- **Number of questions**: [REPLACE: typically 10]
- **ID**: [REPLACE: e.g., problem-solving-database-design-001]

## Source Material

<source>
[PASTE YOUR CONTENT HERE - PDF text, markdown, notes, etc.]
</source>

Generate the quiz questions now in the exact format specified above.
```

---

## Example Output

```markdown
---
id: problem-solving-database-design-001
type: problem-solving
category: programming
subcategory: database-design
difficulty: medium
tags: [sql, normalization, performance, indexing]
version: 1.0.0
---

## Question 1

You're designing a database for an e-commerce platform. The product catalog has 50,000 products, and you need to support searching products by name, category, and price range. Users typically search by category first, then filter by price. Which indexing strategy is most appropriate?

### Options

- A: Create a single composite index on (name, category, price)
- B: Create a composite index on (category, price) and a separate index on (name)
- C: Create individual indexes on each column (name, category, price)
- D: Create a composite index on (price, category) and a separate index on (name)

### Answer

B

### Explanation

A composite index on (category, price) optimizes the most common query pattern: filtering by category first, then by price range. The leftmost column in a composite index must be used for the index to be effective. A separate index on name handles name searches independently. This balances query performance with index maintenance overhead.

### Mistakes

Option A fails because name being first means the index won't help category-first queries. Option C creates more indexes to maintain and misses the compound query optimization. Option D has price first, but since users filter by category first, this index order is suboptimal - the database can't efficiently use a (price, category) index when the WHERE clause filters by category alone.

## Question 2

A social media application stores user posts in a table with 10 million rows. Each post has a `user_id`, `created_at` timestamp, and `content`. The most frequent query is: "Get the 20 most recent posts from users I follow." Given a list of 500 followed user IDs, which approach is most efficient?

### Options

- A: Query all posts, filter by user_id list, sort by created_at, limit 20
- B: Create a composite index on (user_id, created_at DESC), query with IN clause and ORDER BY
- C: Query each followed user's recent posts separately, merge results in application
- D: Store a denormalized "feed" table that's updated when users post

### Answer

D

### Explanation

For this read-heavy, fan-out query pattern, a denormalized feed table (write-time fan-out) provides O(1) read complexity. The feed is pre-computed when posts are created, trading write complexity for read performance. This is the pattern used by Twitter and similar platforms. At 500 followed users, querying and merging is too expensive for real-time feeds.

### Mistakes

Option A does a full table scan with filtering - extremely slow at 10M rows. Option B helps but still requires querying and merging 500 user timelines. Option C is essentially what B does but pushes work to the application. Both B and C suffer from "fan-out on read" which doesn't scale. The key insight is recognizing when to trade write complexity for read performance.
```
