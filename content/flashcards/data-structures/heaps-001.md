---
id: data-structures-heaps-group-001
category: data-structures
subcategory: heaps
difficulty: easy
tags: [fundamentals, priority-queue]
version: 1.0.0
---

## Card 1
### Front
When should you use a Heap instead of a sorted array?

### Back
Use a Heap when you need efficient access to the min/max element with frequent insertions and deletions. Heaps provide O(log n) insert and O(log n) delete-min/max, while sorted arrays require O(n) for insertions to maintain order.

Choose sorted arrays when you need random access by index or when data is static and you only need to find min/max once.

## Card 2
### Front
What are the time complexities of core heap operations?

### Back
- **Insert (push):** O(log n) - Add element at end and bubble up
- **Extract-min/max (pop):** O(log n) - Remove root, move last to root, bubble down
- **Peek (get min/max):** O(1) - Root is always the min/max
- **Heapify (build heap):** O(n) - Most nodes are near bottom and require fewer swaps

## Card 3
### Front
What is the min-heap property vs max-heap property?

### Back
**Min-heap property:** Every parent node is less than or equal to its children. The smallest element is always at the root.

**Max-heap property:** Every parent node is greater than or equal to its children. The largest element is always at the root.

Both properties must hold for every node in the tree, not just the root.

## Card 4
### Front
How is a heap represented as an array? What are the parent/child index formulas?

### Back
A heap is stored in a contiguous array with level-order traversal:

For 0-indexed array:
- **Parent of node i:** `(i - 1) / 2` (integer division)
- **Left child of node i:** `2i + 1`
- **Right child of node i:** `2i + 2`

For 1-indexed array:
- **Parent:** `i / 2`
- **Left child:** `2i`
- **Right child:** `2i + 1`

## Card 5
### Front
What is the heapify process and how does it work?

### Back
**Heapify** builds a valid heap from an unordered array in O(n) time.

Process (for max-heap):
1. Start from the last non-leaf node: index `(n/2) - 1`
2. For each node from this index down to 0, perform "sift-down"
3. Sift-down: compare node with children, swap with larger child if needed, repeat

Why O(n) not O(n log n)? Most nodes are near the bottom and only need a few swaps.

## Card 6
### Front
When should you use a Heap vs a Binary Search Tree (BST)?

### Back
**Use a Heap when:**
- You only need quick access to min OR max (not both)
- You need a simple priority queue
- Memory efficiency matters (array vs pointers)

**Use a BST when:**
- You need to search for arbitrary elements
- You need both min and max efficiently
- You need in-order traversal
- You need to find predecessors/successors

Heap: O(1) find-min, O(log n) insert/delete
BST: O(log n) for all operations (when balanced)
