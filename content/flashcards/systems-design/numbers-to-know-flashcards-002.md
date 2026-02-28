---
id: numbers-to-know-systems-design-002
category: systems-design
subcategory: estimations
difficulty: easy
tags: [back-of-envelope, estimation, reference, unit-conversion, capacity-planning]
version: 1.0.0
---

## Card 1

### Front
Seconds in a day (estimation)?

### Back
86,400 ≈ **~10⁵** (use 10⁵ for quick division in estimation problems)

---

## Card 2

### Front
Seconds in a year (estimation)?

### Back
~31.5 million ≈ **~π × 10⁷**

---

## Card 3

### Front
How long is 1 million seconds?

### Back
≈ **11.5 days**

---

## Card 4

### Front
How long is 1 billion seconds?

### Back
≈ **31.7 years**

---

## Card 5

### Front
What is 1 GB/s in Gbps?

### Back
1 GB/s = **8 Gbps** (multiply bytes by 8 to convert to bits)

---

## Card 6

### Front
How many MB in a TB? How many KB in a TB?

### Back
1 TB = **10⁶ MB** = **10⁹ KB** (each step is ×1,000)

---

## Card 7

### Front
How many TB in a PB?

### Back
1 PB = **1,000 TB**

---

## Card 8

### Front
Typical replication factor for distributed databases?

### Back
**3×** (standard for Cassandra, HDFS, and most distributed stores)

---

## Card 9

### Front
Typical peak-to-average traffic ratio for consumer apps?

### Back
**2–5×** (use 2× for uniform traffic, 3–5× for bursty consumer apps, up to 10× for flash sales)

---

## Card 10

### Front
Days in a year (estimation shortcut)?

### Back
365 ≈ **400** (for quick rounding in capacity calculations)
