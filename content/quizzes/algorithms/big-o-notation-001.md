---
id: big-o-notation-algorithms-001
type: pattern-selection
category: algorithms
subcategory: big-o
difficulty: medium
tags: [big-o, time-complexity, space-complexity, recursion, data-structures, sorting, hashing]
version: 1.0.0
---

## Question 1

What is the time complexity of the following pseudocode?

```
def process(arr):
    n = len(arr)
    i = 1
    while i < n:
        j = 0
        while j < i:
            // O(1) work
            j += 1
        i *= 2
```

### Options

- A: O(n log n)
- B: O(n)
- C: O(n²)
- D: O(log²n)

### Answer

B

### Explanation

The outer loop runs O(log n) times because `i` doubles each iteration (1, 2, 4, 8, …, n). The inner loop runs `i` times for each outer iteration. The total work is 1 + 2 + 4 + … + n/2 + n = 2n − 1 = O(n). This is the geometric series pattern — when you sum powers of 2 up to n, the sum is dominated by the last term.

### Mistakes

- A is wrong because it multiplies the outer loop count (log n) by the worst-case inner loop (n), but the inner loop doesn't always run n times
- C is wrong because the doubling of i means the inner loop iterations form a geometric series, not an arithmetic one
- D is wrong because it ignores the inner loop work entirely

---

## Question 2

You have an unsorted array of n integers. You need to answer m queries, each asking whether a given value exists in the array. You decide to sort the array first, then use binary search for each query. What is the total time complexity?

### Options

- A: O(n log n + m log n)
- B: O(m · n log n)
- C: O((n + m) log n)
- D: O(n log n · m log n)

### Answer

A

### Explanation

Sorting costs O(n log n) and is done once. Each binary search query costs O(log n), and there are m queries, so all queries cost O(m log n). The total is O(n log n + m log n). A and C are actually equivalent expressions, but A is the clearest breakdown. A common mistake is to re-sort for each query (option B) or to multiply instead of add the independent phases.

### Mistakes

- B incorrectly re-sorts for each query, multiplying instead of adding the phases
- C is mathematically equivalent to A but less clear as a breakdown
- D multiplies two independent phases together, vastly overestimating

---

## Question 3

What is the **space** complexity of running a standard recursive merge sort on an array of n elements?

### Options

- A: O(1)
- B: O(log n)
- C: O(n)
- D: O(n log n)

### Answer

C

### Explanation

Merge sort requires O(n) auxiliary space for the temporary arrays used during merging. The recursion stack adds O(log n) depth, but since O(n) dominates O(log n), the total space is O(n). In a proper implementation, the merge buffers across any single level total at most n, and levels are processed sequentially (stack-based), so the peak space at any point is O(n) auxiliary plus O(log n) stack.

### Mistakes

- A is wrong because merge sort cannot be done in-place without significant complexity trade-offs
- B only accounts for the recursion stack depth, ignoring the merge buffer
- D incorrectly reasons that each of the log n recursion levels creates an n-sized array, but the buffers are reused across levels

---

## Question 4

What is the time complexity of building a max-heap from an unsorted array of n elements using the standard bottom-up `heapify` procedure (Floyd's algorithm)?

### Options

- A: O(n log n)
- B: O(n)
- C: O(n²)
- D: O(log n)

### Answer

B

### Explanation

The naive analysis says there are n nodes, each sifting down in O(log n), giving O(n log n). But the tighter analysis recognizes that most nodes are near the bottom and have very little to sift. About n/2 nodes are leaves (0 work), n/4 nodes sift down 1 level, n/8 sift down 2 levels, and so on. The sum n/4·1 + n/8·2 + n/16·3 + … converges to O(n).

### Mistakes

- A applies the naive analysis without recognizing that most nodes sift very little
- C vastly overestimates — even the naive analysis gives O(n log n), not O(n²)
- D only accounts for a single sift-down operation, not building the entire heap

---

## Question 5

What is the time complexity of the following pseudocode?

```
def solve(arr):
    n = len(arr)
    result = 0
    for i in range(n):
        j = i
        while j > 0:
            result += arr[j]
            j = j // 2
    return result
```

### Options

- A: O(n²)
- B: O(n√n)
- C: O(n log n)
- D: O(n)

### Answer

C

### Explanation

The outer loop runs n times. For each value of `i`, the inner while loop starts at `j = i` and halves `j` each iteration until it reaches 0. This means the inner loop runs O(log i) times. The total work is Σ log(i) for i from 1 to n, which is O(n log n) by Stirling's approximation (log(1) + log(2) + … + log(n) = log(n!) ≈ n log n).

### Mistakes

- A confuses this with a pattern where `j` decrements by 1 instead of halving
- B has no basis in the loop structure — √n doesn't appear in the analysis
- D underestimates by ignoring the inner loop's log factor

---

## Question 6

You need to find the k-th largest element in an unsorted array of n elements. Consider two approaches:

- **Approach A:** Sort the array, then return the element at index n − k. Uses a comparison-based sort.
- **Approach B:** Use a min-heap of size k. Iterate through the array; if an element is larger than the heap's root, replace the root and heapify.

Which statement about time complexity is correct?

### Options

- A: A is O(n log n), B is O(n log k). B is always better or equal.
- B: A is O(n log n), B is O(n log n). They are equivalent.
- C: A is O(n log n), B is O(n log k). A is better when k ≈ n.
- D: A is O(n log n), B is O(nk). A is better for large k.

### Answer

A

### Explanation

Approach A is O(n log n) for sorting. Approach B iterates through n elements and each heap operation on a heap of size k costs O(log k), giving O(n log k). Since k ≤ n, we have log k ≤ log n, so B is always ≤ A in time complexity. Even when k = n, O(n log k) = O(n log n), which equals A.

### Mistakes

- B incorrectly claims they are equivalent — B is better when k < n
- C incorrectly thinks B degrades when k approaches n, but log k simply approaches log n, making them equal, never worse
- D incorrectly states the heap approach is O(nk) — heap operations are O(log k), not O(k)

---

## Question 7

What is the **space** complexity of an iterative BFS on a graph with V vertices and E edges, using an adjacency list representation that is already given to you?

### Options

- A: O(V)
- B: O(E)
- C: O(V + E)
- D: O(V²)

### Answer

A

### Explanation

BFS uses a queue and a visited set (or array). The queue can hold at most O(V) vertices at any time. The visited structure is also O(V). The adjacency list is input, not auxiliary space, so it is not counted. Total auxiliary space is O(V).

### Mistakes

- B incorrectly focuses on edges, but BFS auxiliary structures track vertices, not edges
- C counts the adjacency list as part of BFS's space, but the question specifies the graph is already given
- D assumes an adjacency matrix representation, which is not what's described

---

## Question 8

What is the time complexity of the following recursive pseudocode?

```
def generate(s, open, close, n):
    if len(s) == 2 * n:
        result.append(s)
        return
    if open < n:
        generate(s + "(", open + 1, close, n)
    if close < open:
        generate(s + ")", open, close + 1, n)
```

Called initially as `generate("", 0, 0, n)`.

### Options

- A: O(2²ⁿ)
- B: O(4ⁿ / √n)
- C: O(n · 2ⁿ)
- D: O(n!)

### Answer

B

### Explanation

This generates all valid combinations of n pairs of parentheses. The number of valid combinations is the n-th Catalan number, which is C(2n, n) / (n + 1) ≈ 4ⁿ / (n√n). Each valid string has length 2n and costs O(n) to copy/store. Multiplying the number of results by the per-result copy cost gives O(n × 4ⁿ / (n√n)) = O(4ⁿ / √n). The n in the numerator and denominator cancel, yielding the final bound.

### Mistakes

- A equals O(4ⁿ), which ignores the pruning done by the `close < open` constraint that eliminates a significant fraction of branches
- C doesn't match the Catalan number growth pattern for this problem
- D (factorial growth) is far too large — factorials grow much faster than exponentials for this structure

---

## Question 9

What is the time complexity of inserting an element at index 0 (the beginning) of a Python list (dynamic array) of size n?

### Options

- A: O(1) amortized
- B: O(log n)
- C: O(n)
- D: O(1)

### Answer

C

### Explanation

Python lists are backed by dynamic arrays (contiguous memory). Inserting at the beginning requires shifting all n existing elements one position to the right to make room at index 0, which costs O(n). This is fundamentally different from appending to the end, which is O(1) amortized because no shifting is needed. If you need O(1) insertion at both ends, use `collections.deque`.

### Mistakes

- A confuses list insert at index 0 with append at the end, which is O(1) amortized
- B has no basis — binary search isn't involved in insertion
- D confuses O(1) indexing (read access) with insertion, which requires shifting

---

## Question 10

You are given a stream of n integers and need to continuously report the median. You use two heaps: a max-heap for the lower half and a min-heap for the upper half, rebalancing after each insertion. What is the total time complexity for processing all n elements?

### Options

- A: O(n)
- B: O(n log n)
- C: O(n²)
- D: O(n log² n)

### Answer

B

### Explanation

For each of the n elements, you insert into one of the heaps (O(log n)), potentially rebalance by moving one element between heaps (O(log n)), and report the median (O(1)). Each insertion costs O(log n), and there are n insertions, so total is O(n log n). This is a composed-operations analysis: per-operation cost × number of operations.

### Mistakes

- A confuses this with Floyd's heap-build algorithm, which is a very different procedure
- C overestimates — heap operations are O(log n), not O(n)
- D introduces an extra log factor that doesn't exist in the per-element processing

---

## Question 11

What is the **space** complexity of the following pseudocode that finds all subsets of an array of n distinct elements?

```
def subsets(nums):
    result = []
    def backtrack(start, current):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    backtrack(0, [])
    return result
```

### Options

- A: O(n) (excluding output)
- B: O(2ⁿ) (excluding output)
- C: O(n · 2ⁿ) (including output)
- D: Both A and C are correct depending on how you measure

### Answer

D

### Explanation

If you exclude the output (`result`), the auxiliary space is O(n): the recursion stack goes at most n levels deep, and `current` holds at most n elements. If you include the output, there are 2ⁿ subsets, and the average subset size is n/2, so total output space is O(n · 2ⁿ). In an interview, you should clarify whether the interviewer wants space including or excluding output.

### Mistakes

- A is only correct when excluding output — it's incomplete as a sole answer
- B confuses the number of recursive calls (2ⁿ) with simultaneous stack depth (n); the stack frames don't all exist at once due to backtracking
- C is only correct when including output — it's incomplete as a sole answer

---

## Question 12

Consider the problem of finding all pairs in an array that sum to a target value.

- **Approach A:** Sort the array, then use two pointers (one at each end) moving inward.
- **Approach B:** Use a hash set — for each element, check if (target − element) is in the set, then add the element.

Which statement is correct?

### Options

- A: A is O(n log n) time and O(1) space; B is O(n) time and O(n) space. B is better in time, A is better in space.
- B: Both are O(n log n) time. They are equivalent.
- C: A is O(n log n) time and O(n) space; B is O(n) time and O(n) space. B is better in time.
- D: A is O(n) time and O(1) space; B is O(n) time and O(n) space. They are equivalent in time.

### Answer

A

### Explanation

Approach A requires O(n log n) for sorting. If you sort in-place (e.g., heapsort), the two-pointer scan is O(n) with O(1) extra space, so total is O(n log n) time, O(1) auxiliary space. Approach B does a single pass with hash set lookups averaging O(1), so it's O(n) time but O(n) space for the set. This is a classic time-space tradeoff.

### Mistakes

- B incorrectly claims both are O(n log n) — the hash set approach is O(n)
- C incorrectly says sorting takes O(n) space — in-place sorts like heapsort exist
- D incorrectly claims the sort-based approach is O(n) — comparison-based sorting has a lower bound of O(n log n)

---

## Question 13

What is the time complexity of the following pseudocode?

```
def mystery(n):
    if n <= 1:
        return 1
    return mystery(n - 1) + mystery(n - 1)
```

### Options

- A: O(n)
- B: O(n log n)
- C: O(2ⁿ)
- D: O(n²)

### Answer

C

### Explanation

At each call, the function makes 2 recursive calls, each reducing n by 1. This creates a complete binary recursion tree of depth n. Level 0 has 1 call, level 1 has 2, level 2 has 4, …, level n has 2ⁿ. Total calls: 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1 = O(2ⁿ). This is the branching-factor-and-depth pattern: branching factor 2, depth n → O(2ⁿ).

### Mistakes

- A incorrectly assumes the two calls are "the same computation" and could be cached, but without memoization both branches fully execute
- B doesn't match any recursion tree pattern for this branching structure
- D underestimates — polynomial growth is far slower than the exponential growth here

---

## Question 14

What is the average and worst-case time complexity of lookup in a Python dictionary (hash map) with n entries?

### Options

- A: Average O(1), worst-case O(1)
- B: Average O(1), worst-case O(n)
- C: Average O(log n), worst-case O(n)
- D: Average O(1), worst-case O(log n)

### Answer

B

### Explanation

Hash maps provide O(1) average-case lookup through the hash function mapping keys directly to buckets. However, in the worst case, all n keys hash to the same bucket (hash collision), degenerating into a long probe sequence requiring O(n) to search. In practice this almost never happens with a good hash function, which is why we typically treat it as O(1). The correct answer in interviews is to distinguish average from worst case.

### Mistakes

- A incorrectly assumes hash maps are always O(1) — worst-case collisions exist
- C incorrectly states the average case is O(log n) — hash functions provide direct O(1) access on average
- D incorrectly bounds the worst case at O(log n) — that would require a balanced tree structure, not a hash table

---

## Question 15

You need to process a string of length n using a sliding window. Inside the window, you maintain a `Counter` dictionary (hash map) tracking character frequencies, and at each step you add one character and remove one character. What is the total time complexity?

### Options

- A: O(n · k) where k is the window size
- B: O(n²)
- C: O(n)
- D: O(n log n)

### Answer

C

### Explanation

The window slides across the string in n steps. At each step, you perform exactly one hash map insertion (incrementing a count) and one deletion (decrementing a count), each costing O(1) average. Total: n steps × O(1) per step = O(n). The key insight is the "each element enters and leaves the window exactly once" pattern, and each enter/leave operation is O(1).

### Mistakes

- A would apply if you recomputed the entire window contents from scratch at each step, but the sliding window technique specifically avoids this by incrementally updating
- B vastly overestimates — there is no nested linear scan happening
- D introduces a log factor that doesn't exist — no sorting or tree operations are involved
