---
id: numbers-to-know-systems-design-002
type: pattern-selection
category: systems-design
subcategory: estimations
difficulty: medium
tags: [capacity-planning, scaling, hardware-limits, caching, databases, message-queues]
version: 1.0.0
---

## Question 1

You're designing a system to store 15M user profiles, each approximately 2KB in size. A teammate suggests immediately implementing database sharding. What's the best response?

### Options

- A: Agree—15M records is too many for a single database to handle efficiently
- B: Disagree—the total data is only ~30GB, well within single-instance capacity
- C: Agree—sharding is necessary whenever you exceed 10M records
- D: Disagree—but suggest using a message queue to buffer the writes instead

### Answer

B

### Explanation

15M profiles × 2KB = 30GB of data. Modern single PostgreSQL/MySQL instances can handle up to 64 TiB of storage. At 30GB, you're orders of magnitude below the ~50 TiB threshold where sharding becomes necessary. Sharding adds significant complexity and should only be considered when actual scale demands it.

### Mistakes

- A is wrong because record count alone doesn't determine sharding need—total data size and throughput matter more
- C is wrong because there's no magic record count threshold; a single database handles tens of terabytes
- D is wrong because message queues solve throughput/decoupling problems, not storage problems, and 30GB doesn't require any special handling

---

## Question 2

Your e-commerce platform has 5,000 order writes per second during peak hours. A junior engineer proposes adding Kafka to buffer these writes. What's your assessment?

### Options

- A: Good idea—5k WPS requires write buffering to prevent database overload
- B: Unnecessary—a well-tuned Postgres instance handles 20k+ simple writes per second
- C: Good idea—message queues should always sit between applications and databases
- D: Unnecessary—but only because orders are read-heavy, not write-heavy

### Answer

B

### Explanation

A well-tuned PostgreSQL instance can handle 20k+ writes per second for simple inserts/updates with proper indexes. At 5k WPS, you're at 25% of capacity. Message queues add complexity and are justified for guaranteed delivery, event sourcing, spikes above 50k+ WPS, or producer-consumer decoupling—not for typical write loads.

### Mistakes

- A overestimates the difficulty of 5k WPS; modern databases handle this easily
- C is incorrect; blanket rules about architecture components ignore actual requirements
- D misidentifies the reasoning; the write throughput itself is the relevant factor, not read patterns

---

## Question 3

You're designing a leaderboard system with 50k competitions and up to 50k users per competition. Each entry stores a 36-byte ID and 4-byte score. Should you shard the Redis cache?

### Options

- A: Yes—50k × 50k entries requires distributed caching
- B: No—the total data is ~100GB, which fits on a single large cache instance
- C: Yes—the number of operations will exceed single-instance limits
- D: No—but you should use database storage instead of caching for this volume

### Answer

B

### Explanation

50k competitions × 50k users × (36B + 4B) = 50k × 50k × 40B = 100GB. Modern cache instances support up to 1TB of memory. At 100GB, you're at 10% of maximum capacity. Sharding would be premature optimization, adding complexity without benefit.

### Mistakes

- A incorrectly assumes large record counts require distribution; total size is what matters
- C makes an unsupported assumption about operations; the question is about data sizing
- D is wrong because caches are appropriate for leaderboards requiring fast reads; 100GB is well within cache capacity

---

## Question 4

A developer wants to add a Redis caching layer in front of your PostgreSQL database to reduce latency for simple user profile lookups by ID. Current latency is ~8ms. Is this justified?

### Options

- A: Yes—sub-millisecond cache reads are always better than database reads
- B: No—8ms for indexed lookups is already fast; caching adds complexity without meaningful benefit
- C: Yes—caching is essential for any read-heavy workload
- D: No—but only because Redis can't handle profile data effectively

### Answer

B

### Explanation

Simple key/row lookups from SSD take approximately 5-10ms with indexes. At 8ms, the database is performing normally. Adding a cache is justified for expensive computed queries, very high read throughput, or when sub-millisecond latency is a hard requirement—not for already-fast simple lookups. The added infrastructure complexity may not be worth marginal latency improvement.

### Mistakes

- A ignores the cost-benefit analysis; "always better" ignores operational complexity
- C is a blanket rule that ignores actual latency requirements and complexity trade-offs
- D is factually wrong; Redis handles profile data effectively; the issue is whether caching is necessary

---

## Question 5

Your system processes 600,000 messages per second through a single Kafka broker. Operations is concerned about scaling. What's the appropriate response?

### Options

- A: Immediately add more brokers—this exceeds safe operating capacity
- B: Monitor closely—you're approaching the ~800k msgs/sec threshold where scaling becomes necessary
- C: No concern—Kafka brokers handle up to 10 million messages per second
- D: Add more brokers only if consumer lag is growing consistently

### Answer

B

### Explanation

Modern Kafka brokers can process up to 1 million messages/second, with scaling considerations starting around 800k msgs/sec. At 600k msgs/sec, you're at 60% of maximum and 75% of the scaling threshold. This warrants monitoring but not immediate action. Consumer lag (option D) is also a valid trigger but doesn't address the throughput proximity to limits.

### Mistakes

- A overreacts; 600k is below the 800k threshold where scaling becomes necessary
- C overestimates Kafka capacity by 10x; the limit is ~1 million, not 10 million
- D is partially correct about lag being a trigger, but ignores that throughput itself is approaching limits

---

## Question 6

You're designing a social media feed service expecting 2TB of feed data. How should you approach the database architecture?

### Options

- A: Implement horizontal sharding immediately—2TB is beyond single-instance limits
- B: Use a single database instance—modern databases handle up to 64 TiB
- C: Use object storage (S3) for data this large
- D: Distribute across 4 database shards to ensure headroom

### Answer

B

### Explanation

Modern PostgreSQL/MySQL instances support up to 64 TiB of storage (Aurora up to 128 TiB). At 2TB, you're using only ~3% of available capacity. Sharding introduces complexity around cross-shard queries, transactions, and operations. Start simple and scale when approaching the 50 TiB range or when write throughput exceeds 10k TPS.

### Mistakes

- A dramatically underestimates modern database capacity (2TB vs 64 TiB limit)
- C is wrong because feeds require fast indexed queries, not object storage
- D adds unnecessary complexity; sharding for "headroom" at 3% utilization is premature optimization

---

## Question 7

Your application server fleet shows consistent 75% CPU utilization, response latency within SLA, and 45% memory usage. Which metric most strongly suggests scaling is needed?

### Options

- A: Memory at 45%—this indicates inefficient resource usage
- B: CPU at 75%—this exceeds the 70% threshold for scaling consideration
- C: Neither—all metrics are within acceptable ranges for normal operation
- D: Response latency—even meeting SLA, you should add headroom

### Answer

B

### Explanation

The scaling triggers for application servers are: CPU consistently above 70-80%, response latency exceeding SLA, memory trending above 80%, or connections approaching 100k/instance. CPU at 75% is in the threshold range (70-80%) where scaling should be considered. Memory at 45% and latency within SLA don't indicate issues.

### Mistakes

- A is wrong; 45% memory is healthy, not problematic; the threshold is 80%
- C ignores that 75% CPU is within the 70-80% range requiring attention
- D is incorrect; meeting SLA doesn't automatically require additional headroom unless approaching other limits

---

## Question 8

For a cache with 800GB of data, you're seeing 0.8ms average read latency and 95% hit rate. Should you scale or optimize?

### Options

- A: Scale—800GB is approaching the 1TB memory limit
- B: Optimize—0.8ms latency exceeds the 0.5ms threshold for sharding consideration
- C: Neither—all metrics are within healthy operating ranges
- D: Scale—95% hit rate indicates cache is undersized

### Answer

C

### Explanation

The cache scaling triggers are: dataset approaching 1TB, throughput exceeding 100k+ ops/sec, read latency consistently above 0.5ms, or cache churn/thrashing. At 800GB (80% of 1TB limit), 0.8ms latency (above 0.5ms but not severely), and 95% hit rate (healthy), monitoring is appropriate but immediate action isn't required. The 0.5ms threshold is for consistent issues, not occasional exceedance.

### Mistakes

- A overstates urgency; 800GB has headroom before the 1TB limit
- B takes the 0.5ms threshold too rigidly; the question shows average, not consistent latency issues
- D is wrong; 95% hit rate is excellent, not indicative of an undersized cache

---

## Question 9

You're calculating storage for a URL shortener with 1 billion URLs. Each URL mapping is approximately 500 bytes. What's the appropriate storage strategy?

### Options

- A: Single database—500GB total data fits easily within single-instance limits
- B: Sharded database—1 billion records requires horizontal scaling
- C: NoSQL database—relational databases can't handle this volume
- D: Object storage with database index—500GB is too large for traditional databases

### Answer

A

### Explanation

1 billion URLs × 500 bytes = 500GB of data. Modern single database instances handle up to 64 TiB. At 500GB, you're using less than 1% of available capacity. The number of records (1 billion) sounds large but total data size determines database architecture, not record count. Simple key-value lookups at this scale work well on a single indexed database.

### Mistakes

- B incorrectly focuses on record count rather than data size
- C is wrong; relational databases handle this volume easily—500GB is modest
- D dramatically underestimates database capacity; 500GB is routine for modern databases

---

## Question 10

During a system design interview, you're designing a review platform. After calculating 200GB of total data, what should you do before discussing sharding strategy?

### Options

- A: Proceed with sharding discussion—candidates should always cover horizontal scaling
- B: Calculate write throughput to determine if sharding is needed
- C: State that sharding isn't needed at this scale and focus on other optimizations
- D: Propose sharding by geographic region regardless of data size

### Answer

C

### Explanation

At 200GB, you're far below the ~50 TiB threshold where sharding becomes necessary. The biggest mistake candidates make is premature sharding. Instead of proposing sharding, demonstrate understanding of modern hardware limits by stating it's unnecessary at this scale, then focus on indexes, query optimization, caching strategies, or other relevant design considerations.

### Mistakes

- A perpetuates the "always discuss sharding" antipattern that the source material explicitly warns against
- B is a delaying tactic; at 200GB, write throughput would need to exceed 10k TPS to justify sharding, which should be estimated first
- D proposes unnecessary complexity; geographic distribution is a separate concern from data size sharding
