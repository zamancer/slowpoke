---
id: data-structures-heaps-group-002
category: data-structures
subcategory: heaps
difficulty: medium
tags: [applications, algorithms]
version: 1.0.0
---

## Card 1
### Front
What are common use cases for Priority Queues implemented with heaps?

### Back
**Common Priority Queue use cases:**

1. **Task scheduling:** Process highest-priority tasks first (OS schedulers)
2. **Event-driven simulation:** Process events in chronological order
3. **Huffman coding:** Build optimal prefix codes by combining lowest-frequency nodes
4. **A* pathfinding:** Expand most promising nodes first
5. **Network packet scheduling:** Prioritize real-time traffic
6. **Load balancing:** Route requests to least-loaded servers

## Card 2
### Front
How does Heap Sort work and what are its characteristics?

### Back
**Heap Sort algorithm:**
1. Build a max-heap from the array: O(n)
2. Repeatedly extract max and place at end:
   - Swap root with last unsorted element
   - Reduce heap size by 1
   - Sift-down the new root
   - Repeat until heap is empty

**Characteristics:**
- Time: O(n log n) in all cases
- Space: O(1) - in-place sorting
- Not stable (relative order of equal elements may change)
- Good when memory is constrained

## Card 3
### Front
How do you find the K largest (or smallest) elements using a heap?

### Back
**K largest elements - use a min-heap of size K:**
1. Add first K elements to min-heap
2. For each remaining element:
   - If element > heap's min, remove min and add element
3. Heap now contains K largest elements

Time: O(n log k) | Space: O(k)

**K smallest elements - use a max-heap of size K:**
Same approach but keep elements smaller than heap's max.

Alternative: Use a max-heap of all elements and extract K times: O(n + k log n)

## Card 4
### Front
How do you maintain a running median using two heaps?

### Back
**Running median with two heaps:**
- Max-heap for lower half of numbers
- Min-heap for upper half of numbers

**Invariants:**
- Max-heap size = Min-heap size OR Max-heap size = Min-heap size + 1
- All elements in max-heap ≤ all elements in min-heap

**Insert new number:**
1. If num ≤ max-heap's top, add to max-heap; else add to min-heap
2. Rebalance if sizes differ by more than 1

**Get median:**
- If sizes equal: average of both tops
- If unequal: top of larger heap

Time: O(log n) insert, O(1) median query

## Card 5
### Front
How do you merge K sorted lists using a heap?

### Back
**Merge K sorted lists using a min-heap:**

1. Create min-heap with first element from each list (store value and list index)
2. While heap is not empty:
   - Extract minimum element, add to result
   - If that list has more elements, add next element to heap
3. Return result

**Complexity:**
- Time: O(n log k) where n = total elements, k = number of lists
- Space: O(k) for the heap

**Why this works:** Heap always contains at most K elements (one from each list), so operations are O(log k). Each element is inserted and extracted once.

## Card 6
### Front
How are heaps used in Dijkstra's shortest path algorithm?

### Back
**Dijkstra's with a min-heap (priority queue):**

1. Initialize distances: source = 0, all others = ∞
2. Add (distance=0, source) to min-heap
3. While heap not empty:
   - Extract node with minimum distance
   - If already processed, skip
   - For each neighbor:
     - Calculate new distance through current node
     - If shorter, update distance and add to heap

**Complexity with binary heap:**
- Time: O((V + E) log V)
- The heap ensures we always process the closest unvisited node

**Optimization:** Fibonacci heap reduces to O(E + V log V) but has higher constant factors.
