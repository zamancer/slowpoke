---
id: pattern-selection-sliding-window-001
type: pattern-selection
category: algorithms
subcategory: sliding-window
difficulty: medium
tags: [sliding-window, arrays, optimization]
version: 1.0.0
---

## Question 1

Find the maximum sum of any contiguous subarray of size k in an array of integers. What's the optimal approach?

### Options

- A: Nested loops checking all subarrays
- B: Fixed-size Sliding Window
- C: Dynamic Programming
- D: Two Pointers from both ends

### Answer

B

### Explanation

Fixed-size Sliding Window is optimal: maintain a running sum of k elements, slide by subtracting the leaving element and adding the entering element. Time: O(n), Space: O(1). This is the canonical sliding window problem.

### Mistakes

Nested loops give O(n*k). DP is overcomplicated for this. Two pointers from both ends doesn't make sense for contiguous subarrays of fixed size.

## Question 2

Find the length of the longest substring without repeating characters. What pattern should you use?

### Options

- A: Fixed-size Sliding Window
- B: Variable-size Sliding Window with HashSet
- C: Binary Search
- D: Divide and Conquer

### Answer

B

### Explanation

Variable-size Sliding Window: expand right pointer, when duplicate found, shrink from left until valid. Use a HashSet to track characters in window. Time: O(n), Space: O(min(n, alphabet)). Classic example of dynamic window sizing based on constraints.

### Mistakes

Fixed-size window doesn't work because the optimal length is unknown. The key insight is that window size varies based on the uniqueness constraint.

## Question 3

Given a string s and a pattern p, find the smallest substring in s that contains all characters of p. What approach is optimal?

### Options

- A: Generate all substrings and check
- B: Variable-size Sliding Window with frequency maps
- C: KMP Pattern Matching
- D: Rolling Hash

### Answer

B

### Explanation

This is the "Minimum Window Substring" problem. Use two frequency maps: one for pattern, one for current window. Expand right to include all characters, then shrink left to minimize. Track the minimum valid window found. Time: O(n + m).

### Mistakes

Generating all substrings is O(n²). KMP and rolling hash find exact matches, not character coverage. The variable window shrinks when constraint is satisfied.

## Question 4

Count the number of subarrays with exactly k distinct elements. What's the clever approach?

### Options

- A: Count all subarrays with at most k distinct minus at most k-1 distinct
- B: Fixed-size Sliding Window of size k
- C: Generate all subarrays and count
- D: Binary Search on answer

### Answer

A

### Explanation

"Exactly k" problems are solved by: atMost(k) - atMost(k-1). For "at most k distinct", use sliding window: expand right, when distinct > k shrink left. Count valid windows as (right - left + 1) at each step. This transforms a hard constraint into two easier ones.

### Mistakes

Fixed-size window confuses "k elements" with "k distinct values". This counting trick is essential for "exactly k" style problems.

## Question 5

Given an array of 0s and 1s, find the maximum number of consecutive 1s if you can flip at most k 0s. What pattern applies?

### Options

- A: Dynamic Programming with flip states
- B: Greedy flip from left
- C: Sliding Window tracking zero count
- D: Two separate passes

### Answer

C

### Explanation

Sliding Window: expand right, count zeros in window. When zeros > k, shrink left until zeros <= k. Track maximum window size. The window represents a valid segment after optimal flips. Time: O(n).

### Mistakes

DP is overcomplicated. The insight is that flipping is equivalent to "allow at most k zeros in window". Window validity = zeros in window <= k.

## Question 6

Find the maximum number of fruits you can collect in two baskets, where each basket can only hold one type of fruit. Array represents fruits at each tree position. What pattern?

### Options

- A: Greedy take first two types seen
- B: Sliding Window with at most 2 distinct
- C: Sort and pick two most common
- D: Dynamic Programming

### Answer

B

### Explanation

This is "longest subarray with at most 2 distinct elements" disguised. Sliding window: track fruit types in window using map/counter. When distinct > 2, shrink left. Track maximum window length. Time: O(n).

### Mistakes

Sorting loses positional information (contiguous requirement). The "two baskets" constraint maps to "at most 2 distinct values".

## Question 7

Given two strings s1 and s2, return true if s2 contains a permutation of s1. What's the optimal approach?

### Options

- A: Generate all permutations of s1 and search
- B: Fixed-size Sliding Window with frequency comparison
- C: Sort both and compare
- D: Longest Common Subsequence

### Answer

B

### Explanation

Fixed-size Sliding Window of length len(s1): compare character frequencies of window with s1's frequency. Slide window and update frequencies incrementally. A permutation has the same character frequencies. Time: O(n).

### Mistakes

Generating permutations is O(m!). The key insight is that permutation = same frequency counts, and window size is fixed at len(s1).

## Question 8

Find the length of the longest subarray with sum at most k (array has positive integers only). What approach works?

### Options

- A: Prefix sums with binary search
- B: Variable-size Sliding Window
- C: Dynamic Programming
- D: Two pointer from both ends

### Answer

B

### Explanation

With positive integers, window sum only increases when expanding right and decreases when shrinking left. This monotonic property enables sliding window: expand right, when sum > k shrink left. Track maximum valid window length. Time: O(n).

### Mistakes

For arrays with negative numbers, sliding window doesn't work (sum isn't monotonic). Positive integers guarantee the monotonic property needed.

## Question 9

Find the number of subarrays with product less than k. What pattern and counting trick?

### Options

- A: Generate all subarrays and multiply
- B: Sliding Window, count subarrays ending at each right
- C: Prefix products with binary search
- D: Dynamic Programming

### Answer

B

### Explanation

Sliding Window: maintain product of window. When product >= k, shrink left (divide). At each position, subarrays ending at right pointer = (right - left + 1). Sum these counts. This counting trick captures all valid subarrays without enumeration.

### Mistakes

The insight is counting subarrays ending at current position. Each valid window of size w contributes w new subarrays (those ending at right).

## Question 10

Given a string, find the length of the longest substring that contains at most k distinct characters. What's the pattern?

### Options

- A: Fixed-size Window of size k
- B: Variable-size Sliding Window with character count map
- C: Binary Search on answer length
- D: Divide and Conquer

### Answer

B

### Explanation

Variable-size Sliding Window: use a HashMap to track character frequencies in window. Expand right, when distinct characters > k, shrink left until <= k. Track maximum window size throughout. Time: O(n), Space: O(k).

### Mistakes

Fixed-size confuses k characters with k distinct. Binary search would require O(n) validation at each step. The variable window naturally finds the maximum.
