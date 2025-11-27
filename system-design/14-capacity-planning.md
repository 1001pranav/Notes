# Capacity Planning and Performance

## Table of Contents
- [Capacity Planning Fundamentals](#capacity-planning-fundamentals)
- [Performance Testing](#performance-testing)
- [Benchmarking](#benchmarking)
- [Bottleneck Identification](#bottleneck-identification)
- [Resource Estimation](#resource-estimation)
- [Cost Optimization](#cost-optimization)
- [Performance Metrics](#performance-metrics)
- [Scalability Testing](#scalability-testing)

---

## Capacity Planning Fundamentals

### What is Capacity Planning?

Determining the resources needed to meet current and future demand.

**Questions to answer:**
- How many servers do we need?
- How much database storage?
- What network bandwidth?
- How much will it cost?
- When will we run out of capacity?

### Planning Process

```
1. Gather Requirements
   ↓
2. Measure Current Usage
   ↓
3. Forecast Growth
   ↓
4. Calculate Resources Needed
   ↓
5. Plan for Peak Load
   ↓
6. Add Buffer (headroom)
   ↓
7. Monitor and Adjust
```

### Example Calculation

**Requirements:**
- 1 million daily active users
- Each user makes 20 requests/day
- Peak traffic: 3x average
- Response time: < 200ms

**Calculations:**
```
Daily requests: 1,000,000 users × 20 requests = 20,000,000 requests
Average QPS: 20,000,000 / 86,400 seconds = 231 QPS
Peak QPS: 231 × 3 = 693 QPS

Server capacity: 100 QPS per server
Servers needed: 693 / 100 = 7 servers
With 20% buffer: 7 × 1.2 = 9 servers

Database writes: 10% of requests = 69 writes/sec
Database reads: 90% of requests = 624 reads/sec
```

---

## Performance Testing

### Types of Performance Tests

#### 1. Load Testing

Test system under expected load.

```javascript
// Using k6 load testing tool
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const response = http.get('https://api.example.com/products');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Goal:** Verify system handles expected load

#### 2. Stress Testing

Test system beyond normal load to find breaking point.

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Normal load
    { duration: '5m', target: 500 },   // Stress
    { duration: '5m', target: 1000 },  // Heavy stress
    { duration: '5m', target: 2000 },  // Find breaking point
    { duration: '5m', target: 0 },     // Recovery
  ],
};
```

**Goal:** Find maximum capacity, identify bottlenecks

#### 3. Spike Testing

Sudden extreme load increase.

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Normal
    { duration: '30s', target: 2000 }, // Sudden spike!
    { duration: '3m', target: 2000 },  // Sustained
    { duration: '1m', target: 100 },   // Back to normal
  ],
};
```

**Goal:** Test auto-scaling, cache warmup

#### 4. Soak Testing (Endurance Testing)

Sustained load over extended period.

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 400 },   // Ramp up
    { duration: '24h', target: 400 },  // Sustained for 24 hours!
    { duration: '2m', target: 0 },     // Ramp down
  },
};
```

**Goal:** Find memory leaks, resource exhaustion

### Example Load Test Results

```
Scenario: Load Test
Duration: 10 minutes
Virtual Users: 100

Results:
✓ http_req_duration: avg=150ms p95=380ms p99=850ms
✓ http_req_failed: 0.05% (50 failed out of 100,000)
✓ http_reqs: 10,000 requests/minute
✓ data_received: 500 MB
✓ iterations: 100,000

Bottlenecks identified:
⚠ Database connection pool saturated at 95 concurrent
⚠ p99 latency exceeds target (850ms > 500ms target)
```

---

## Benchmarking

### Database Benchmarking

```javascript
const { performance } = require('perf_hooks');

async function benchmarkDatabase() {
  const operations = 10000;
  const results = {
    inserts: [],
    reads: [],
    updates: []
  };

  // Benchmark inserts
  for (let i = 0; i < operations; i++) {
    const start = performance.now();
    await db.insert({ name: `User ${i}`, email: `user${i}@example.com` });
    results.inserts.push(performance.now() - start);
  }

  // Benchmark reads
  for (let i = 0; i < operations; i++) {
    const start = performance.now();
    await db.findById(i);
    results.reads.push(performance.now() - start);
  }

  // Benchmark updates
  for (let i = 0; i < operations; i++) {
    const start = performance.now();
    await db.update(i, { email: `updated${i}@example.com` });
    results.updates.push(performance.now() - start);
  }

  return {
    inserts: calculateStats(results.inserts),
    reads: calculateStats(results.reads),
    updates: calculateStats(results.updates)
  };
}

function calculateStats(timings) {
  const sorted = timings.sort((a, b) => a - b);
  return {
    avg: timings.reduce((a, b) => a + b) / timings.length,
    p50: sorted[Math.floor(timings.length * 0.5)],
    p95: sorted[Math.floor(timings.length * 0.95)],
    p99: sorted[Math.floor(timings.length * 0.99)],
    max: sorted[sorted.length - 1]
  };
}

// Results:
// Inserts: avg=15ms, p95=45ms, p99=120ms
// Reads:   avg=5ms,  p95=12ms, p99=28ms
// Updates: avg=18ms, p95=52ms, p99=135ms
```

### API Benchmarking

```bash
# Apache Bench (ab)
ab -n 10000 -c 100 http://api.example.com/products
# -n: total requests
# -c: concurrent requests

# wrk
wrk -t12 -c400 -d30s http://api.example.com/products
# -t: threads
# -c: connections
# -d: duration

# Results:
# Requests/sec: 5,432
# Latency: avg=18ms, p99=125ms
# Transfer/sec: 2.5 MB
```

### Caching Benchmark

```javascript
async function benchmarkCache() {
  const iterations = 100000;

  // Without cache
  const start1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    await db.query('SELECT * FROM users WHERE id = ?', [i % 1000]);
  }
  const dbTime = performance.now() - start1;

  // With cache
  const start2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const cached = await cache.get(`user:${i % 1000}`);
    if (!cached) {
      const user = await db.query('SELECT * FROM users WHERE id = ?', [i % 1000]);
      await cache.set(`user:${i % 1000}`, user, 3600);
    }
  }
  const cacheTime = performance.now() - start2;

  console.log(`Without cache: ${dbTime}ms`);
  console.log(`With cache: ${cacheTime}ms`);
  console.log(`Speedup: ${(dbTime / cacheTime).toFixed(2)}x`);

  // Results:
  // Without cache: 45,000ms
  // With cache: 2,500ms
  // Speedup: 18x
}
```

---

## Bottleneck Identification

### Common Bottlenecks

#### 1. CPU Bottleneck

**Symptoms:**
- High CPU usage (> 80%)
- Request queue building up
- Slow response times

**Diagnosis:**
```javascript
// CPU profiling in Node.js
const v8Profiler = require('v8-profiler-next');

// Start profiling
v8Profiler.startProfiling('CPU profile');

// Run operations
await performExpensiveOperation();

// Stop and analyze
const profile = v8Profiler.stopProfiling('CPU profile');
profile.export((error, result) => {
  // Analyze which functions are CPU-intensive
});
```

**Solutions:**
- Optimize algorithms
- Add more servers (horizontal scaling)
- Use caching
- Offload to background jobs

#### 2. Memory Bottleneck

**Symptoms:**
- High memory usage
- Frequent garbage collection
- Out of memory errors
- Swap usage

**Diagnosis:**
```javascript
// Memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log({
    rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`
  });
}, 5000);
```

**Solutions:**
- Fix memory leaks
- Reduce in-memory data
- Use streams for large data
- Add more RAM
- Implement pagination

#### 3. Database Bottleneck

**Symptoms:**
- Slow queries
- Connection pool exhausted
- High database CPU/IO

**Diagnosis:**
```sql
-- PostgreSQL: Find slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- MySQL: Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Queries > 1 second
```

**Solutions:**
- Add indexes
- Optimize queries
- Use connection pooling
- Add read replicas
- Implement caching
- Database sharding

#### 4. Network Bottleneck

**Symptoms:**
- High network latency
- Packet loss
- Bandwidth saturation

**Diagnosis:**
```bash
# Network throughput
iperf3 -c server-ip

# Packet loss
ping -c 100 server-ip

# Bandwidth usage
iftop
```

**Solutions:**
- Use CDN for static assets
- Compress responses (gzip)
- Reduce payload size
- Upgrade network capacity
- Use HTTP/2 or HTTP/3

#### 5. I/O Bottleneck

**Symptoms:**
- High disk I/O wait
- Slow file operations

**Diagnosis:**
```bash
# Disk I/O stats
iostat -x 1

# Shows:
# %iowait: time waiting for I/O
# r/s: reads per second
# w/s: writes per second
```

**Solutions:**
- Use SSD instead of HDD
- Implement caching
- Optimize file access patterns
- Use async I/O
- Add more disks (RAID)

### Profiling Tools

```javascript
// Node.js profiling
node --inspect app.js
// Open chrome://inspect in Chrome
// Take heap snapshots, CPU profiles

// Express.js request timing
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path}: ${duration}ms`);

    if (duration > 1000) {
      console.warn('Slow request detected!');
    }
  });

  next();
});
```

---

## Resource Estimation

### Back-of-the-Envelope Calculations

**Example: Twitter-like Service**

**Requirements:**
- 100 million daily active users
- Each user posts 2 tweets/day
- Each user views 200 tweets/day
- Tweet size: 280 characters = ~280 bytes
- Store tweets for 5 years

**Traffic Estimates:**
```
Writes:
- 100M users × 2 tweets/day = 200M tweets/day
- 200M / 86,400 seconds ≈ 2,300 tweets/sec
- Peak (3x average) = 6,900 tweets/sec

Reads:
- 100M users × 200 views/day = 20B views/day
- 20B / 86,400 ≈ 231,000 views/sec
- Peak = 693,000 views/sec
```

**Storage Estimates:**
```
Daily storage:
- 200M tweets/day × 280 bytes = 56 GB/day
- With metadata (user ID, timestamp, etc.): ~100 GB/day

5-year storage:
- 100 GB/day × 365 days × 5 years = 182 TB
- With replication (3x): 546 TB
```

**Bandwidth Estimates:**
```
Incoming:
- 2,300 tweets/sec × 280 bytes = 644 KB/sec
- Peak: 1.9 MB/sec

Outgoing:
- 231,000 reads/sec × 280 bytes = 64 MB/sec
- Peak: 192 MB/sec
```

**Memory Estimates (Caching):**
```
Cache 20% of hot tweets:
- 200M tweets/day
- 20% = 40M tweets
- 40M × 280 bytes ≈ 11 GB
- With metadata: ~20 GB for cache
```

**Server Estimates:**
```
Read capacity per server: 10,000 req/sec
Servers needed for reads: 693,000 / 10,000 = 70 servers

Write capacity per server: 1,000 req/sec
Servers needed for writes: 6,900 / 1,000 = 7 servers

Total: 70 + 7 = 77 servers (add 20% buffer = 93 servers)
```

### Useful Numbers for Estimation

```
Time:
- L1 cache reference: 0.5 ns
- L2 cache reference: 7 ns
- RAM access: 100 ns
- SSD access: 150 μs (150,000 ns)
- HDD seek: 10 ms (10,000,000 ns)
- Network within datacenter: 0.5 ms
- Network across country: 150 ms

Throughput:
- RAM: 50 GB/sec
- SSD: 500 MB/sec
- HDD: 100 MB/sec
- 1 Gbps network: 125 MB/sec

Storage:
- Tweet: 280 bytes
- Profile picture: 100 KB
- HD video (1 min): 50 MB
```

---

## Cost Optimization

### Cloud Cost Optimization

#### 1. Right-sizing Instances

```
Current: 10 × t3.xlarge ($0.166/hour)
Cost: 10 × $0.166 × 24 × 30 = $1,195/month

After analysis: CPU usage only 30%
Downsize to: 10 × t3.large ($0.083/hour)
New cost: $597/month
Savings: $598/month (50%)
```

#### 2. Reserved Instances

```
On-demand: $0.166/hour
1-year reserved: $0.098/hour (41% savings)
3-year reserved: $0.065/hour (61% savings)

10 servers × $0.065 × 24 × 30 = $468/month
Savings: $727/month vs on-demand
```

#### 3. Spot Instances

```
On-demand: $0.166/hour
Spot price: $0.050/hour (70% savings)

Use for:
- Batch processing
- Dev/test environments
- Fault-tolerant workloads
```

#### 4. Auto-scaling

```
Before auto-scaling:
- 20 servers running 24/7
- Cost: 20 × $0.166 × 24 × 30 = $2,390/month

With auto-scaling:
- Peak: 20 servers (8 hours/day)
- Normal: 10 servers (16 hours/day)
- Average: (20×8 + 10×16) / 24 = 13.3 servers
- Cost: 13.3 × $0.166 × 24 × 30 = $1,590/month
- Savings: $800/month (33%)
```

#### 5. S3 Storage Classes

```
100 TB storage:

S3 Standard: $2,300/month
S3 Infrequent Access: $1,250/month (for rarely accessed data)
S3 Glacier: $400/month (for archived data)

Strategy:
- Hot data (accessed daily): 10 TB Standard = $230
- Warm data (accessed monthly): 30 TB IA = $375
- Cold data (archived): 60 TB Glacier = $240
Total: $845/month
Savings: $1,455/month (63%)
```

### Database Cost Optimization

```javascript
// Use connection pooling
const pool = new Pool({
  max: 20,  // Max 20 connections (instead of creating new each time)
  idleTimeoutMillis: 30000
});

// Reduces database instance size needed
// Before: db.r5.4xlarge ($4.32/hour)
// After: db.r5.2xlarge ($2.16/hour)
// Savings: $1,555/month
```

### Caching for Cost Reduction

```
Without cache:
- 1M requests/hour to database
- db.r5.4xlarge required
- Cost: $4.32/hour = $3,110/month

With Redis cache (90% hit rate):
- 100K requests/hour to database
- db.r5.xlarge sufficient
- Cost: $1.08/hour = $778/month
- Redis: cache.r5.large = $0.238/hour = $171/month
Total: $949/month
Savings: $2,161/month (69%)
```

---

## Performance Metrics

### Key Performance Indicators

#### 1. Response Time Percentiles

```
p50 (median): 50% of requests complete within this time
p90: 90% of requests
p95: 95% of requests
p99: 99% of requests
p99.9: 99.9% of requests

Example:
p50 = 100ms  ← Half of users see ≤100ms
p95 = 250ms  ← 95% of users see ≤250ms
p99 = 800ms  ← 1% of users see >800ms (outliers)
```

**Why p99 matters:**
```
User makes 10 API calls per page load
Each call p99 = 1 second

Probability user hits p99:
1 - (0.99)^10 = 9.6%

Nearly 10% of users experience slow page loads!
```

#### 2. Throughput

```javascript
// Requests per second
const requestsPerSecond = totalRequests / durationInSeconds;

// Example:
// 100,000 requests in 1 minute = 1,667 RPS
```

#### 3. Error Rate

```javascript
const errorRate = (failedRequests / totalRequests) * 100;

// Target: < 0.1% error rate
// Example: 50 errors out of 100,000 requests = 0.05%
```

#### 4. Apdex Score

Application Performance Index - User satisfaction metric.

```
Satisfied: Response time ≤ T (target time)
Tolerating: Response time between T and 4T
Frustrated: Response time > 4T

Apdex = (Satisfied + Tolerating/2) / Total

Example (T = 500ms):
- 700 satisfied (≤500ms)
- 200 tolerating (500-2000ms)
- 100 frustrated (>2000ms)

Apdex = (700 + 200/2) / 1000 = 0.8
```

**Scale:**
- 1.00 - 0.94: Excellent
- 0.93 - 0.85: Good
- 0.84 - 0.70: Fair
- 0.69 - 0.50: Poor
- < 0.50: Unacceptable

---

## Scalability Testing

### Load Testing Strategy

```javascript
// Gradual ramp-up test
export const options = {
  stages: [
    { duration: '5m', target: 100 },    // Warm-up
    { duration: '10m', target: 200 },   // Baseline
    { duration: '10m', target: 500 },   // Normal load
    { duration: '10m', target: 1000 },  // Peak load
    { duration: '10m', target: 2000 },  // Stress
    { duration: '5m', target: 0 },      // Cool down
  ],
};

// Observe at each stage:
// - Response times
// - Error rates
// - Resource usage (CPU, memory)
// - Database connections
```

### Identifying Scaling Limits

```
Results:
100 users:  p95=150ms, 0% errors ✓
200 users:  p95=180ms, 0% errors ✓
500 users:  p95=250ms, 0% errors ✓
1000 users: p95=500ms, 0.1% errors ⚠
2000 users: p95=1500ms, 5% errors ❌

Conclusion:
- System handles 500 users comfortably
- Degradation starts at 1000 users
- Breaks at 2000 users

Bottleneck: Database connection pool (max 100)
Solution: Increase pool size or add read replicas
```

### Auto-scaling Configuration

```javascript
// AWS Auto Scaling Policy
{
  "ScalingPolicies": [
    {
      "PolicyName": "Scale Up",
      "ScalingAdjustment": 2,  // Add 2 instances
      "Cooldown": 300,
      "Alarms": [
        {
          "MetricName": "CPUUtilization",
          "Threshold": 70,
          "ComparisonOperator": "GreaterThanThreshold"
        }
      ]
    },
    {
      "PolicyName": "Scale Down",
      "ScalingAdjustment": -1,  // Remove 1 instance
      "Cooldown": 300,
      "Alarms": [
        {
          "MetricName": "CPUUtilization",
          "Threshold": 30,
          "ComparisonOperator": "LessThanThreshold"
        }
      ]
    }
  ],
  "MinSize": 2,
  "MaxSize": 20
}
```

---

## Summary

**Capacity Planning:**
- Estimate current and future load
- Calculate required resources
- Add 20-30% buffer
- Plan for peak load (3-5x average)

**Performance Testing:**
- Load testing: Expected load
- Stress testing: Find limits
- Spike testing: Sudden increases
- Soak testing: Memory leaks

**Optimization:**
- Identify bottlenecks (profiling)
- Right-size resources
- Use caching
- Optimize queries
- Reduce costs (reserved instances, auto-scaling)

**Key Metrics:**
- Response time (p50, p95, p99)
- Throughput (RPS)
- Error rate (%)
- Resource utilization (CPU, memory)

**Remember:**
- Measure before optimizing
- Optimize the biggest bottleneck first
- Monitor continuously
- Plan for growth

**Next:** [System Design Interview Guide](./15-interview-guide.md)
