---
id: numbers-to-know-systems-design-001
category: systems-design
subcategory: estimations
difficulty: medium
tags: [capacity-planning, scaling, hardware-limits, caching, databases, message-queues]
version: 1.1.0
---

## Card 1
### Front
What read latency and memory capacity can you expect from a single modern Redis instance?

### Back
Read latency: **< 1 ms** (same region). Memory: up to **1 TB** on memory-optimized instances. Throughput: **100k+ ops/second**. This means you can often cache entire working datasets on a single node before considering distributed caching.

---

## Card 2
### Front
At what data size should you consider sharding a relational database?

### Back
Consider sharding at **~50 TiB** of data or when write throughput consistently exceeds **10k TPS**. Single PostgreSQL instances support up to **64 TiB** storage. Always calculate actual data size (record count × record size) before proposing sharding.

---

## Card 3
### Front
How many writes per second can a well-tuned single PostgreSQL instance handle?

### Back
A well-tuned PostgreSQL instance handles **20,000+ simple writes/second** (inserts and updates with proper indexing). This means most applications with typical write loads (under 10k WPS) don't need write replicas or message queue buffering.

---

## Card 4
### Front
What is the typical latency for a simple key or row lookup from SSD storage?

### Back
Approximately **10 ms or less** for a simple indexed row lookup. This is fast enough that caching is often unnecessary for basic indexed reads — caching provides more value for expensive computed or aggregated queries.

---

## Card 5
### Front
What are the key network performance numbers within and across datacenters?

### Back
Same-datacenter bandwidth: **10 Gbps** (up to 25 Gbps for high-performance instances). Latency: **1–2 ms same region**, **50–150 ms cross-region**. These numbers are critical for estimating data transfer times and service-to-service call overhead.

---

## Card 6
### Front
What throughput can a single modern Kafka broker handle?

### Back
A single Kafka broker can process up to **1 million messages/second** with **1–5 ms end-to-end latency** within a region. Storage: up to **50 TB per broker** with weeks of retention. Plan to scale when throughput nears **800k msgs/sec** per broker.
