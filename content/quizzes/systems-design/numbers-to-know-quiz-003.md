---
id: numbers-to-know-systems-design-003
type: pattern-selection
category: systems-design
subcategory: estimations
difficulty: medium
tags: [back-of-envelope, estimation, capacity-planning, scaling, bandwidth, storage, throughput]
version: 1.0.0
---

## Question 1

A social media platform has 200 million daily active users (DAU). Each user makes an average of 10 API requests per day. What is the approximate average QPS (queries per second)?

### Options

- A: ~2,300 QPS
- B: ~23,000 QPS
- C: ~230,000 QPS
- D: ~2,300,000 QPS

### Answer

B

### Explanation

Total daily requests = 200M × 10 = 2 billion = 2 × 10⁹. There are 86,400 seconds in a day, which we round to ~10⁵ for estimation. So QPS ≈ 2 × 10⁹ / 10⁵ = 2 × 10⁴ = ~20,000, closest to 23,000. Shortcut to memorize: 86,400 sec/day ≈ ~100K (10⁵) for quick division.

### Mistakes

- A is off by 10× (dividing by 10⁶ instead of 10⁵)
- C is off by 10× the other way (multiplying instead of dividing correctly)
- D is off by two orders of magnitude

---

## Question 2

You need to transfer 5 TB of data over a network link rated at 10 Gbps. Assuming full utilization, approximately how long will this transfer take?

### Options

- A: ~7 minutes
- B: ~1 hour
- C: ~4,000 seconds (~67 minutes)
- D: ~8 hours

### Answer

C

### Explanation

5 TB = 5 × 10¹² bytes = 40 × 10¹² bits (multiply bytes by 8). 10 Gbps = 10 × 10⁹ bits/sec = 10¹⁰ bits/sec. Time = 40 × 10¹² / 10¹⁰ = 4,000 seconds ≈ 67 minutes ≈ just over 1 hour. Key reminder: always convert bytes to bits when working with bandwidth — multiply by 8.

### Mistakes

- A forgets the ×8 bytes-to-bits conversion
- B (1 hour) is close but 4,000 seconds is the most precise answer
- D overestimates by roughly 8× — likely a unit conversion error in the other direction

---

## Question 3

A messaging service stores each message as 200 bytes on average. The service handles 50 billion messages per day. How much raw storage per day is needed?

### Options

- A: ~1 TB/day
- B: ~10 TB/day
- C: ~100 TB/day
- D: ~1 PB/day

### Answer

B

### Explanation

50 × 10⁹ messages × 200 bytes = 10 × 10¹² bytes = 10 TB. Shortcut: when multiplying, handle the coefficient and power of 10 separately — 5 × 10¹⁰ × 2 × 10² = 10 × 10¹² = 10¹³ bytes = 10 TB.

### Mistakes

- A is off by 10× (likely dropped a zero in multiplication)
- C (100 TB) is a common error from miscounting a power of 10
- D (1 PB) is 100× too high

---

## Question 4

A service has a p99 latency of 150ms for a single backend call. A user-facing page requires 4 sequential backend calls (each to a different service). What is the worst-case page load time for the slowest 1% of users?

### Options

- A: ~150ms
- B: ~300ms
- C: ~600ms
- D: ~600ms or more, but the exact worst case is hard to bound

### Answer

C

### Explanation

If each call has p99 = 150ms, then for the slowest 1% of requests on each call, the latency is 150ms. With 4 sequential calls, in the worst case for the page, each call hits its p99. So worst-case ≈ 4 × 150ms = 600ms. In reality, the probability that all 4 hit p99 simultaneously is lower than 1%, so the actual p99 of the page is likely less than 600ms, but 600ms is the right upper-bound estimate. Interview tip: sequential calls multiply latency; parallel calls take the max.

### Mistakes

- A only accounts for a single call's p99, ignoring that there are 4 sequential calls
- B only accounts for 2 of the 4 calls
- D sounds tempting but 600ms is a reasonable bounded estimate and interviewers expect this answer

---

## Question 5

Each user profile in a large-scale application is 8 KB. The platform has 1 billion registered users. If you want to cache 20% of profiles (the active set) in memory, how much RAM do you need across your cache cluster?

### Options

- A: ~160 GB
- B: ~1.6 TB
- C: ~16 TB
- D: ~160 TB

### Answer

B

### Explanation

20% of 1 billion = 200 million users. Each profile = 8 KB = 8 × 10³ bytes. Total = 2 × 10⁸ × 8 × 10³ = 16 × 10¹¹ = 1.6 × 10¹² bytes = 1.6 TB. Shortcut: 200M × 8KB — think of it as 200 × 10⁶ × 8 × 10³ = 1,600 × 10⁹ = 1.6 × 10¹² = 1.6 TB. In practice, you'd add ~30% overhead for hash table structure in a cache like Redis.

### Mistakes

- A (160 GB) is off by 10× — a common mistake from dropping a zero
- C (16 TB) is off by 10× in the other direction
- D (160 TB) is off by 100×

---

## Question 6

An e-commerce platform has 50M DAU. On average, each user views 20 pages per day. Each page view generates a 2 KB log entry. How much log storage is generated per year?

### Options

- A: ~700 TB/year
- B: ~70 TB/year
- C: ~7 TB/year
- D: ~7 PB/year

### Answer

A

### Explanation

Daily page views = 50 × 10⁶ × 20 = 10⁹ = 1 billion. Daily log data = 10⁹ × 2 KB = 2 × 10¹² bytes = 2 TB/day. Yearly = 2 TB × 365 ≈ 730 TB ≈ ~700 TB. Shortcut: there are ~365 days/year, which is close to 400 for easy rounding, or use 350 to stay conservative. Either way you land at ~700 TB.

### Mistakes

- B forgets to multiply by 365 (or divides by 10 accidentally)
- C is off by 100× — likely a cascading arithmetic error
- D (7 PB) is 10× too high

---

## Question 7

You're designing a photo storage service. Each photo averages 2 MB. Users upload 5 million photos per day. What's the approximate daily and annual raw storage requirement?

### Options

- A: 10 TB/day, ~3.6 PB/year
- B: 1 TB/day, ~365 TB/year
- C: 100 TB/day, ~36 PB/year
- D: 10 TB/day, ~36 PB/year

### Answer

A

### Explanation

Daily storage = 5 × 10⁶ photos × 2 MB = 10 × 10⁶ MB = 10⁷ MB. Convert: 10⁷ MB ÷ 10⁶ = 10 TB/day (since 1 TB = 10⁶ MB). Annual = 10 TB × 365 = 3,650 TB ≈ 3.6 PB. Shortcut: remember 1 TB = 10⁶ MB = 10⁹ KB. This chain (each step is ×1,000) is essential for storage estimation.

### Mistakes

- B underestimates daily storage by 10× (likely a unit conversion error)
- C overestimates daily storage by 10×
- D has the correct daily figure but miscalculates the annual figure by a factor of 10

---

## Question 8

Your system handles an average QPS of 5,000 for write operations. Each write produces a 1 KB record in the database. If you maintain 3 replicas of all data, how much total storage do your writes consume per day?

### Options

- A: ~430 GB/day
- B: ~1.3 TB/day
- C: ~4.3 TB/day
- D: ~13 TB/day

### Answer

B

### Explanation

Daily writes = 5,000 QPS × 86,400 sec/day ≈ 5,000 × 10⁵ = 5 × 10⁸ = ~430 million writes. Storage per day (single copy) = 430 × 10⁶ × 1 KB = 430 × 10⁹ bytes = 430 GB. With 3 replicas = 430 GB × 3 = ~1.3 TB/day. Gotcha: replication factor is easy to forget! Always ask yourself "how many copies?" in an interview. Standard replication factors are 3 for distributed databases (Cassandra, HDFS) and 2-3 for relational replicas.

### Mistakes

- A ignores the replication factor (only accounts for a single copy)
- C multiplies by 10 somewhere, likely a unit conversion error
- D is off by 10× from the correct answer

---

## Question 9

A video streaming service delivers content at an average bitrate of 5 Mbps per stream. At peak, 10 million users are streaming simultaneously. What is the total peak egress bandwidth required?

### Options

- A: ~5 Tbps
- B: ~50 Tbps
- C: ~500 Gbps
- D: ~500 Tbps

### Answer

B

### Explanation

Total bandwidth = 10⁷ users × 5 Mbps = 5 × 10⁷ Mbps. Convert to Tbps: 5 × 10⁷ Mbps ÷ 10⁶ = 50 Tbps (since 1 Tbps = 10⁶ Mbps). Shortcut for the conversion chain: 1 Tbps = 1,000 Gbps = 1,000,000 Mbps = 10⁶ Mbps. This is why CDNs are essential — no single data center can serve 50 Tbps.

### Mistakes

- A is off by 10× (common from rounding 10M to 1M)
- C (500 Gbps) is off by 100× — a major unit conversion error
- D (500 Tbps) is off by 10× in the other direction

---

## Question 10

A notification system needs to send 500 million push notifications within a 1-hour window. If each notification request takes 5ms to process (including network I/O), how many parallel worker threads/processes do you need at minimum?

### Options

- A: ~70
- B: ~700
- C: ~7,000
- D: ~70,000

### Answer

B

### Explanation

1 hour = 3,600 seconds. Each worker can handle 1 request per 5ms = 200 requests/sec. Total throughput needed = 500 × 10⁶ / 3,600 ≈ ~139,000 requests/sec. Workers needed = 139,000 / 200 ≈ ~695 ≈ ~700. Step by step: first get required QPS (÷ 3600), then get per-worker throughput (1000ms ÷ 5ms = 200/sec), then divide. In practice, you'd add headroom (maybe 1,000 workers) to handle variance and failures.

### Mistakes

- A is off by 10× — likely a miscalculation in per-worker throughput
- C (7,000) might come from miscalculating per-worker throughput as 20/sec instead of 200
- D (70,000) is off by 100× — possibly from using 1 request per 5ms as 1 per 50ms

---

## Question 11

A chat application stores messages for 10 years. It processes 20 billion messages per day, each message averaging 100 bytes. What is the approximate total storage needed for 10 years of messages (single copy, no replication)?

### Options

- A: ~7.3 PB
- B: ~73 PB
- C: ~730 PB
- D: ~7.3 EB (exabytes)

### Answer

A

### Explanation

Daily storage = 20 × 10⁹ messages × 100 bytes = 2 × 10¹² bytes = 2 TB/day. Annual = 2 TB × 365 ≈ 730 TB/year. Over 10 years = 7,300 TB ≈ 7.3 PB. Shortcut: chain the multiplications — daily → yearly (×365 ≈ ×400 for quick math), then scale by retention period. At scale like this, compression (often 3-5×) would meaningfully reduce the actual footprint.

### Mistakes

- B (73 PB) is a 10× error, likely from miscounting a power of 10
- C (730 PB) comes from treating daily storage as 20 TB instead of 2 TB
- D (7.3 EB) is off by 1,000× — a major unit conversion error

---

## Question 12

An image CDN serves 100,000 requests per second. Average image size is 500 KB. What bandwidth must the CDN support?

### Options

- A: ~50 Gbps
- B: ~400 Gbps
- C: ~50 TBps
- D: ~5 Gbps

### Answer

B

### Explanation

Data rate = 10⁵ req/sec × 500 KB = 10⁵ × 5 × 10⁵ bytes = 5 × 10¹⁰ bytes/sec = 50 GB/sec. Convert to bits: 50 GB/sec × 8 = 400 Gbps. Don't forget the ×8 bytes-to-bits conversion — this is the most common mistake in bandwidth questions. Shortcut: 1 GB/s = 8 Gbps. Memorize this equivalence.

### Mistakes

- A (50 Gbps) is exactly the trap — it's the answer you get if you forget to multiply by 8
- C uses wrong units entirely (TBps instead of Gbps)
- D (5 Gbps) is off by nearly 100× — multiple errors compounded

---

## Question 13

Your system has an average QPS of 1,000, but you know the peak-to-average ratio is typically 4× for your workload (due to traffic spikes during business hours). If each request consumes 50 KB of bandwidth, what peak bandwidth should you provision for?

### Options

- A: ~400 Mbps
- B: ~1.6 Gbps
- C: ~4 Gbps
- D: ~16 Gbps

### Answer

B

### Explanation

Peak QPS = 1,000 × 4 = 4,000 QPS. Bandwidth per second = 4,000 × 50 KB = 200,000 KB/sec = 200 MB/sec. Convert to bits: 200 MB/sec × 8 = 1,600 Mbps = 1.6 Gbps. Capacity gotcha: always provision for peak, not average. In interviews, explicitly state your peak-to-average multiplier (common values: 2× for uniform traffic, 3-5× for bursty consumer apps, up to 10× for event-driven spikes like flash sales).

### Mistakes

- A ignores the peak multiplier (calculates for average QPS only)
- C forgets the step of converting bytes to bits
- D is off by 10× — likely a compounding of multiple errors

---

## Question 14

A search engine indexes 10 billion web pages. Each page's index entry (after compression) is 500 bytes. The index is stored with a replication factor of 3 and distributed across shards. What is the total storage footprint of the index?

### Options

- A: ~1.5 TB
- B: ~5 TB
- C: ~15 TB
- D: ~50 TB

### Answer

C

### Explanation

Raw index size = 10 × 10⁹ × 500 bytes = 5 × 10¹² bytes = 5 TB. With replication factor 3 = 5 TB × 3 = 15 TB. This is a classic capacity estimation gotcha: the raw data size is 5 TB, but replication triples it. In an interview, always mention replication and whether your estimate includes it or not — it shows infrastructure awareness. Tip: for distributed stores, total physical storage = raw data × replication factor × (1 + overhead for indexes/metadata, typically 10-30%).

### Mistakes

- A (1.5 TB) likely miscalculated the base size
- B (5 TB) is the raw/unreplicated number — forgot to multiply by the replication factor
- D (50 TB) likely comes from miscomputing the base size as 16.7 TB

---

## Question 15

You're building a ride-sharing service. It has 30 million DAU, each user opens the app 3 times per day, and each session sends GPS location updates every 4 seconds for an average of 5 minutes. Each GPS update is 50 bytes. What is the approximate QPS for location updates and daily storage?

### Options

- A: ~190,000 QPS, ~800 GB/day
- B: ~19,000 QPS, ~80 GB/day
- C: ~1.9 million QPS, ~8 TB/day
- D: ~190,000 QPS, ~80 GB/day

### Answer

A

### Explanation

Sessions per day = 30M × 3 = 90 million sessions. Each session: 5 min = 300 seconds. Updates per session = 300 / 4 = 75 updates. Total daily updates = 90 × 10⁶ × 75 = 6.75 × 10⁹ ≈ 6.75 billion. Average QPS = 6.75 × 10⁹ / 86,400 ≈ ~78,000. Adjusting for non-uniform traffic (sessions cluster during commute hours, roughly 10 hours of activity instead of 24), effective peak QPS ≈ 78,000 × (24/10) ≈ ~190,000. Daily storage = 6.75 × 10⁹ × 50 bytes = 337.5 GB, plus metadata overhead and indexing (roughly 2-2.5×) ≈ ~800 GB. The lesson: real-world estimates need adjustments for non-uniform distribution and storage overhead. In interviews, state your assumptions explicitly.

### Mistakes

- B is 10× too low on both QPS and storage
- C is 10× too high on both metrics
- D pairs the right QPS with the wrong storage figure (missing overhead adjustment)
