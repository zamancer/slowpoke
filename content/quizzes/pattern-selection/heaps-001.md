---
id: pattern-selection-heaps-001
type: pattern-selection
category: algorithms
subcategory: heaps
difficulty: medium
tags: [heaps, priority-queue, data-structures]
version: 1.0.0
---

## Question 1

You need to find the k largest elements from a stream of n elements where k << n. Which approach is optimal?

### Options

- A: Max Heap of size n
- B: Min Heap of size k
- C: Sort the array and take last k elements
- D: Binary Search Tree

### Answer

B

### Explanation

A Min Heap of size k is optimal because it maintains only k elements. When a new element arrives, if it's larger than the heap's minimum, remove the min and insert the new element. This gives O(n log k) time and O(k) space, much better than sorting O(n log n) or using a max heap of size n.

### Mistakes

Using a Max Heap of size n would require O(n) space and O(n log n) to extract k elements. Sorting requires storing all elements first and doesn't work for streams.

## Question 2

You need to continuously find the median of a data stream. What data structure combination is most efficient?

### Options

- A: Single Max Heap
- B: Sorted Array with binary search
- C: Two Heaps (Max Heap + Min Heap)
- D: Binary Search Tree

### Answer

C

### Explanation

Two heaps approach: a Max Heap stores the smaller half and a Min Heap stores the larger half. The median is either the top of one heap or the average of both tops. Insert is O(log n) and finding median is O(1). This is the classic solution for the "Find Median from Data Stream" problem.

### Mistakes

A sorted array would require O(n) insertion time. A single heap cannot efficiently track the median. BST could work but requires self-balancing to guarantee O(log n).

## Question 3

You need to merge k sorted arrays of total n elements into one sorted array. What's the most efficient approach?

### Options

- A: Concatenate and sort
- B: Min Heap with k elements
- C: Merge two at a time
- D: Max Heap with n elements

### Answer

B

### Explanation

Use a Min Heap of size k containing one element from each array (with array index). Extract min, add to result, then insert next element from that array. Time: O(n log k), Space: O(k). This is optimal because we only compare k elements at a time.

### Mistakes

Concatenating and sorting is O(n log n). Merging two at a time is O(nk). A max heap doesn't give us the smallest element efficiently.

## Question 4

You need to find the kth smallest element in an unsorted array of n elements. What's the best average-case approach?

### Options

- A: Sort and index
- B: Max Heap of size k
- C: Quickselect algorithm
- D: Min Heap of size n

### Answer

C

### Explanation

Quickselect has O(n) average time complexity, making it optimal for single queries. It partitions like QuickSort but only recurses into the partition containing k. For multiple queries or streaming data, heaps are better.

### Mistakes

Sorting is O(n log n). Max Heap of size k works but is O(n log k). The question asks for the best approach, and Quickselect is theoretically optimal at O(n) average.

## Question 5

You're implementing a task scheduler where tasks have priorities and you need to always execute the highest priority task next. Which data structure is most appropriate?

### Options

- A: Queue (FIFO)
- B: Stack (LIFO)
- C: Max Heap / Priority Queue
- D: Sorted Linked List

### Answer

C

### Explanation

A Max Heap (Priority Queue) provides O(log n) insertion and O(log n) extraction of the maximum priority element, with O(1) peek. This is the textbook use case for heaps - implementing priority queues for task schedulers.

### Mistakes

A sorted linked list has O(n) insertion. Queue and Stack don't respect priorities. This is literally why priority queues exist.

## Question 6

Given n ropes with different lengths, you need to connect all ropes into one with minimum total cost. Connecting two ropes of lengths x and y costs x + y. What approach minimizes total cost?

### Options

- A: Always connect the two longest ropes
- B: Always connect the two shortest ropes (Min Heap)
- C: Connect ropes in the order given
- D: Sort descending and connect sequentially

### Answer

B

### Explanation

This is the "Connect Ropes" problem. Using a Min Heap: always extract and connect the two smallest ropes, then insert the result back. This minimizes cost because smaller ropes get added multiple times to subsequent sums. Time: O(n log n).

### Mistakes

Connecting longest ropes first is the opposite of optimal - it maximizes cost. The greedy approach of always picking the smallest works because smaller values get reused in more additions.

## Question 7

You need to find all elements greater than or equal to the kth largest element in an array. What's the most efficient approach?

### Options

- A: Sort and slice
- B: Min Heap of size k, then filter
- C: Max Heap of all elements
- D: Binary Search

### Answer

B

### Explanation

Build a Min Heap of size k from the first k elements. For remaining elements, if larger than heap min, remove min and insert element. The heap min is the kth largest. Then scan array once more to collect all elements >= this value. Total: O(n log k + n) = O(n log k).

### Mistakes

Sorting is O(n log n). Max Heap of all elements then extracting k times is also O(n log n). Binary search requires sorted data.

## Question 8

You're designing a system to track the top 100 trending hashtags from millions of tweets per hour. What data structure is most suitable?

### Options

- A: HashMap with full sorting every hour
- B: Min Heap of size 100 with HashMap counts
- C: Max Heap of all hashtags
- D: Sorted Array of all hashtags

### Answer

B

### Explanation

Use a HashMap to count frequencies and a Min Heap of size 100 to track the top hashtags. When a hashtag's count is updated, check if it should be in the top 100 (compare with heap min). This gives O(1) count updates and O(log 100) = O(1) heap operations.

### Mistakes

Full sorting is expensive at O(n log n). Max Heap of all hashtags uses too much memory. The key insight is that we only need to track k items, not all items.

## Question 9

You need to implement a "Last K elements" query on a stream where you can efficiently get the maximum of the last K elements at any time. What approach works best?

### Options

- A: Circular buffer with linear scan for max
- B: Max Heap with lazy deletion
- C: Monotonic Deque (Decreasing)
- D: Binary Search Tree with size limit

### Answer

C

### Explanation

A Monotonic Decreasing Deque maintains elements in decreasing order while respecting the K-element window. The front always has the maximum. Insert and remove are amortized O(1). This is optimal for sliding window maximum problems.

### Mistakes

While a heap seems natural for max queries, handling element expiration from the window is tricky and requires lazy deletion with O(log n) operations. The deque solution is simpler and faster.

## Question 10

In a system processing events with timestamps, you need to output events in timestamp order but events may arrive out of order (within a 5-second window). What's the best approach?

### Options

- A: Buffer all events and sort periodically
- B: Min Heap ordered by timestamp with watermark
- C: Linked List sorted by insertion order
- D: Hash Map with timestamp keys

### Answer

B

### Explanation

Use a Min Heap ordered by timestamp. Buffer events and only output when you're confident no earlier events will arrive (watermark = current time - 5 seconds). Extract from heap while timestamp < watermark. This is the standard "event time processing" pattern in stream systems like Flink.

### Mistakes

Buffering and periodic sorting adds latency and isn't continuous. The heap naturally orders events while allowing for the out-of-order window.
