---
id: numbers-to-know-systems-design-001
category: systems-design
subcategory: estimations
difficulty: medium
tags: [capacity-planning, scaling, hardware-limits, caching, databases, message-queues]
version: 1.0.0
---

## Card 1
### Front
What is the typical memory capacity of a modern in-memory cache instance, and what latency should you expect for reads?

### Back
Modern in-memory caches (like Redis) can handle up to **1TB of memory** on memory-optimized instances. Read latency is typically **< 1ms** within the same region. This means you can often cache entire datasets rather than implementing complex partial caching schemes.

---

## Card 2
### Front
At what dataset size should you consider sharding a relational database like PostgreSQL or MySQL?

### Back
Consider sharding when approaching or exceeding **50 TiB** of data. Single database instances can handle up to 64 TiB (or 128 TiB for Aurora). Other sharding triggers include: write throughput consistently exceeding 10k TPS, read latency requirements below 5ms for uncached data, or geographic distribution needs.

---

## Card 3
### Front
What write throughput can a well-tuned single PostgreSQL instance handle, and when should you add a message queue for writes?

### Back
A well-tuned Postgres instance handles **20k+ writes per second** for simple inserts/updates with proper indexes. Message queues become valuable when you need: guaranteed delivery, event sourcing, handling spikes above **50k+ WPS**, or decoupling producers from consumers—not for typical write loads of 5k WPS.

---

## Card 4
### Front
What are the key throughput numbers for modern message queues like Kafka?

### Back
Modern Kafka brokers can process up to **1 million messages/second** per broker with **1-5ms end-to-end latency** within a region. They can store up to 50TB per broker with weeks to months of retention. Consider scaling when throughput nears 800k msgs/sec or partition count approaches 200k per cluster.

---

## Card 5
### Front
What concurrent connection limits and memory capacity do modern application servers typically have?

### Back
Modern application servers support **100k+ concurrent connections** per instance, with **64-512GB RAM standard** (up to 2TB available). CPU (8-64 cores) is usually the first bottleneck, not memory. Consider scaling when CPU utilization exceeds 70-80%, response latency exceeds SLA, or memory usage trends above 80%.

---

## Card 6
### Front
What is the typical latency for database reads from disk (SSD) for simple key/row lookups?

### Back
Simple key or row lookups from SSD storage take approximately **10ms or less**. This is fast enough that adding a caching layer purely for latency reduction is often unnecessary for simple lookups. Caching becomes more valuable for expensive computed queries, not basic indexed lookups.

---

## Card 7
### Front
How would you estimate the storage needs for a system like Yelp with 10M businesses?

### Back
10M businesses × 1KB per business = **10GB of data**. Even with 10x multiplier for reviews stored in the same database, you're only at **100GB**—far below the 50+ TiB sharding threshold. This fits comfortably on a single database instance without sharding.

---

## Card 8
### Front
What are the key network bandwidth and latency numbers within a datacenter?

### Back
Within a datacenter: **10 Gbps standard** bandwidth (up to 20-25 Gbps for high-performance instances). Cross-zone bandwidth ranges from 100 Mbps to 1 Gbps. Latency is **1-2ms within a region** and **50-150ms cross-region**. These consistent numbers enable reliable distributed system design.

---

## Card 9
### Front
When should you consider sharding an in-memory cache?

### Back
Consider sharding a cache when: dataset size approaches **1TB**, sustained throughput exceeds **100k+ ops/second**, read latency consistently exceeds **0.5ms**, or you observe cache churn/thrashing. The bottleneck is usually operations per second or network bandwidth, not memory size.

---

## Card 10
### Front
What's the biggest mistake candidates make regarding database sharding in system design interviews?

### Back
**Premature sharding**—introducing sharding before doing the math. Candidates often propose sharding for datasets of 100GB-500GB or a few terabytes, when single databases can handle 50+ TiB. Always calculate actual data size first: (number of records × record size), then compare against modern hardware limits before proposing distributed solutions.
