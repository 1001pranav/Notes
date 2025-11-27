# Fault Tolerance and High Availability

## Table of Contents
- [Understanding Failures](#understanding-failures)
- [Redundancy Strategies](#redundancy-strategies)
- [Failover Mechanisms](#failover-mechanisms)
- [Circuit Breaker Pattern](#circuit-breaker-pattern)
- [Retry Strategies](#retry-strategies)
- [Bulkhead Pattern](#bulkhead-pattern)
- [Graceful Degradation](#graceful-degradation)
- [Chaos Engineering](#chaos-engineering)
- [Multi-Region Deployment](#multi-region-deployment)
- [Disaster Recovery](#disaster-recovery)
- [Health Checks and Heartbeats](#health-checks-and-heartbeats)

---

## Understanding Failures

### Types of Failures

#### 1. Hardware Failures
- Server crashes
- Disk failures
- Network outages
- Power failures

#### 2. Software Failures
- Application bugs
- Memory leaks
- Deadlocks
- Infinite loops

#### 3. Network Failures
- Packet loss
- High latency
- Network partitions
- DNS failures

#### 4. Human Errors
- Misconfigurations
- Accidental deletions
- Bad deployments
- Security breaches

### Murphy's Law in Distributed Systems

**"Anything that can go wrong will go wrong."**

```
In a system with:
- 100 servers
- Each with 99.9% uptime
- Probability all are up: 0.999^100 = 90.5%
- Expected failures: 9.5 servers down at any time
```

### Designing for Failure

**Assume:**
- Servers will crash
- Networks will partition
- Dependencies will fail
- Data will corrupt

**Therefore:**
- Build redundancy
- Implement retries
- Use circuit breakers
- Plan for degradation

---

## Redundancy Strategies

### 1. Active-Active Redundancy

Multiple instances actively serving traffic.

```
Request → Load Balancer
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
[Server A] [Server B] [Server C]
   All active, all serving traffic
```

**Implementation:**
```javascript
// All instances handle requests
const servers = [
  'http://server-a:3000',
  'http://server-b:3000',
  'http://server-c:3000'
];

function getHealthyServer() {
  // Return first healthy server
  for (const server of servers) {
    if (isHealthy(server)) {
      return server;
    }
  }
  throw new Error('No healthy servers');
}
```

**Pros:**
- No wasted resources
- Better performance (all servers utilized)
- No failover delay

**Cons:**
- More complex (data synchronization)
- Higher cost

### 2. Active-Passive Redundancy

Standby instances ready to take over.

```
Request → Load Balancer
              ↓
          [Primary]  ←→  [Standby]
         (Active)       (Passive)
```

**Implementation:**
```javascript
class FailoverManager {
  constructor() {
    this.primary = 'http://primary:3000';
    this.standby = 'http://standby:3000';
    this.currentServer = this.primary;

    setInterval(() => this.healthCheck(), 5000);
  }

  async healthCheck() {
    try {
      await fetch(`${this.primary}/health`, { timeout: 3000 });
      this.currentServer = this.primary;
    } catch (error) {
      console.log('Primary failed, switching to standby');
      this.currentServer = this.standby;
    }
  }

  async makeRequest(path) {
    return fetch(`${this.currentServer}${path}`);
  }
}
```

**Pros:**
- Simple failover
- Clear primary/backup roles

**Cons:**
- Wasted resources (standby idle)
- Failover delay
- Potential data loss during switch

### 3. Database Redundancy

#### Master-Slave Replication

```
Writes → [Master] → Async Replication → [Slave 1]
                                      ↘ [Slave 2]
                                      ↘ [Slave 3]

Reads ← [Load Balancer] ← [Slaves]
```

```javascript
const mysql = require('mysql2');

const master = mysql.createConnection({
  host: 'master.db.example.com',
  user: 'app',
  database: 'production'
});

const slaves = [
  mysql.createConnection({ host: 'slave1.db.example.com' }),
  mysql.createConnection({ host: 'slave2.db.example.com' }),
  mysql.createConnection({ host: 'slave3.db.example.com' })
];

function write(query) {
  return master.query(query);
}

function read(query) {
  const slave = slaves[Math.floor(Math.random() * slaves.length)];
  return slave.query(query);
}

// Usage
await write('INSERT INTO users (name) VALUES ("Alice")');
const users = await read('SELECT * FROM users');
```

#### Multi-Master Replication

```
Write → [Master A] ←→ [Master B] ← Write
         ↓                ↓
       Reads            Reads
```

**Conflict Resolution:**
```javascript
// Last Write Wins (LWW)
{
  id: 1,
  name: "Alice",
  updated_at: "2025-01-15T10:30:00Z",
  version: 5
}

// Master A update
{
  id: 1,
  name: "Alice Smith",
  updated_at: "2025-01-15T10:30:15Z",
  version: 6
}

// Master B update (concurrent)
{
  id: 1,
  name: "Alice Johnson",
  updated_at: "2025-01-15T10:30:10Z",  // Earlier timestamp
  version: 6
}

// Resolution: "Alice Smith" wins (later timestamp)
```

---

## Failover Mechanisms

### Automatic Failover

System automatically detects failure and switches.

```javascript
class AutomaticFailover {
  constructor(primary, backup) {
    this.primary = primary;
    this.backup = backup;
    this.current = primary;
    this.failedAttempts = 0;
    this.maxFailures = 3;
  }

  async execute(operation) {
    try {
      const result = await this.current.execute(operation);
      this.failedAttempts = 0;  // Reset on success
      return result;
    } catch (error) {
      this.failedAttempts++;

      if (this.failedAttempts >= this.maxFailures) {
        console.log('Max failures reached, switching to backup');
        this.current = this.backup;
        this.failedAttempts = 0;
      }

      // Retry with backup
      return this.backup.execute(operation);
    }
  }
}
```

### Manual Failover

Human intervention required.

**When to use:**
- Data integrity critical
- Complex state transitions
- Rare failures

**Process:**
1. Alert on-call engineer
2. Verify issue
3. Check data consistency
4. Execute failover
5. Verify new primary
6. Update DNS/load balancer

### DNS Failover

Update DNS to point to backup.

```
Primary fails
↓
Update DNS: api.example.com → backup-ip
↓
Wait for DNS propagation (30s - 5min)
↓
Traffic flows to backup
```

**Limitation:** DNS caching causes delay

---

## Circuit Breaker Pattern

Prevent cascading failures by stopping requests to failing service.

### How it Works

```
States:
┌──────────┐
│  CLOSED  │ ──(failures > threshold)──→ ┌──────┐
│ (normal) │                              │ OPEN │
└──────────┘ ←──(timer expires)────────── └──────┘
     ↑                                        ↓
     │                                (try request)
     │                                        ↓
     └────────(success)──────────── ┌──────────────┐
                                     │ HALF-OPEN    │
                                     └──────────────┘
```

**CLOSED**: Normal operation, requests pass through
**OPEN**: Failures exceeded threshold, reject requests immediately
**HALF-OPEN**: Test if service recovered, allow limited requests

### Implementation

```javascript
class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;  // 1 minute
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Transition to HALF-OPEN
      this.state = 'HALF-OPEN';
    }

    try {
      const result = await this.service[operation]();

      // Success
      this.failures = 0;
      if (this.state === 'HALF-OPEN') {
        this.state = 'CLOSED';
      }
      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.resetTimeout;
      }

      throw error;
    }
  }
}

// Usage
const paymentService = {
  processPayment: async () => {
    // Call external payment API
  }
};

const breaker = new CircuitBreaker(paymentService, {
  failureThreshold: 5,
  resetTimeout: 60000
});

try {
  await breaker.execute('processPayment');
} catch (error) {
  console.log('Payment service unavailable');
  // Handle gracefully
}
```

### Benefits

1. **Prevent cascading failures**: Don't overload failing service
2. **Fast failure**: Return error immediately when circuit open
3. **Automatic recovery**: Test service after timeout
4. **Resource protection**: Save threads/connections

---

## Retry Strategies

### 1. Immediate Retry

```javascript
async function retryImmediate(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}`);
    }
  }
}

// Usage
await retryImmediate(() => fetch('http://api.example.com/data'));
```

**Good for:** Transient network glitches
**Bad for:** Server overload (makes it worse)

### 2. Fixed Delay Retry

```javascript
async function retryWithDelay(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Good for:** Most cases
**Bad for:** High request volume (thundering herd)

### 3. Exponential Backoff

Increase delay exponentially after each failure.

```javascript
async function retryExponentialBackoff(fn, maxRetries = 5) {
  let delay = 1000;  // Start with 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);

      delay *= 2;  // Double the delay
      // Delays: 1s, 2s, 4s, 8s, 16s
    }
  }
}
```

**Good for:** Server overload situations
**Prevents:** Thundering herd problem

### 4. Exponential Backoff with Jitter

Add randomness to prevent synchronized retries.

```javascript
async function retryWithJitter(fn, maxRetries = 5) {
  let baseDelay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Add random jitter (0-100%)
      const jitter = Math.random() * baseDelay;
      const delay = baseDelay + jitter;

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay.toFixed(0)}ms`);
      await sleep(delay);

      baseDelay *= 2;
    }
  }
}

// Example delays: 1.3s, 2.7s, 6.2s, 10.5s...
// Different clients have different delays → spread load
```

**Best for:** Distributed systems with many clients

### 5. Conditional Retry

Only retry specific errors.

```javascript
async function retryConditional(fn, maxRetries = 3) {
  const retryableErrors = [
    'ECONNRESET',    // Connection reset
    'ETIMEDOUT',     // Timeout
    'ECONNREFUSED',  // Connection refused
    503,             // Service Unavailable
    504              // Gateway Timeout
  ];

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry = retryableErrors.some(code =>
        error.code === code || error.status === code
      );

      if (!shouldRetry || i === maxRetries - 1) {
        throw error;  // Don't retry
      }

      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

**Don't retry:**
- 400 Bad Request (client error)
- 401 Unauthorized (fix authentication)
- 404 Not Found (resource doesn't exist)
- 409 Conflict (business logic error)

**Do retry:**
- 429 Too Many Requests (wait and retry)
- 500 Internal Server Error (might be transient)
- 503 Service Unavailable (service might recover)
- Network errors (ECONNRESET, ETIMEDOUT)

---

## Bulkhead Pattern

Isolate resources to prevent cascade failures.

### Concept

Like ship compartments—if one compartment floods, others stay dry.

```
Resource Pool:
┌────────────────────────────────┐
│ Service A │ Service B │ Service C │
│  (10 conn) │ (10 conn) │ (10 conn) │
└────────────────────────────────┘

If Service B fails:
- Only 10 connections affected
- Service A and C still work
```

### Implementation

```javascript
class Bulkhead {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.currentRequests = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.currentRequests >= this.maxConcurrent) {
      // Wait in queue
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.currentRequests++;

    try {
      return await fn();
    } finally {
      this.currentRequests--;

      // Process next in queue
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
}

// Usage
const paymentBulkhead = new Bulkhead(10);  // Max 10 concurrent
const orderBulkhead = new Bulkhead(20);    // Max 20 concurrent

// Payment requests limited to 10 concurrent
await paymentBulkhead.execute(() => processPayment(orderId));

// Order requests limited to 20 concurrent
await orderBulkhead.execute(() => createOrder(data));
```

### Thread Pool Bulkheads

```javascript
// Separate thread pools for different services
const paymentPool = new ThreadPool(10);
const inventoryPool = new ThreadPool(15);
const shippingPool = new ThreadPool(5);

// If inventory service hangs, only 15 threads affected
```

---

## Graceful Degradation

Provide reduced functionality when systems fail.

### Examples

**E-commerce site:**
```javascript
async function getProductRecommendations(userId) {
  try {
    // Try ML recommendation service
    return await mlService.getRecommendations(userId);
  } catch (error) {
    // Fallback to popular products
    return await getPopularProducts();
  }
}

async function getPopularProducts() {
  try {
    // Try cache
    return await cache.get('popular_products');
  } catch (error) {
    // Fallback to static list
    return DEFAULT_PRODUCTS;
  }
}
```

**Search feature:**
```javascript
async function search(query) {
  try {
    // Try Elasticsearch
    return await elasticsearch.search(query);
  } catch (error) {
    // Fallback to database LIKE query (slower but works)
    return await db.query('SELECT * FROM products WHERE name LIKE ?', [`%${query}%`]);
  }
}
```

**User profile:**
```javascript
async function getUserProfile(userId) {
  const profile = { userId };

  // Try to load each section, but don't fail if one fails
  try {
    profile.basicInfo = await getBasicInfo(userId);
  } catch (error) {
    profile.basicInfo = { error: 'Unavailable' };
  }

  try {
    profile.recentOrders = await getRecentOrders(userId);
  } catch (error) {
    profile.recentOrders = [];  // Empty array instead of failing
  }

  try {
    profile.recommendations = await getRecommendations(userId);
  } catch (error) {
    profile.recommendations = [];
  }

  return profile;
}
```

### Degradation Levels

**Level 1**: Full functionality
**Level 2**: Reduce non-essential features
**Level 3**: Essential features only
**Level 4**: Read-only mode
**Level 5**: Maintenance page

```javascript
const DEGRADATION_LEVEL = {
  FULL: 0,
  REDUCED: 1,
  ESSENTIAL: 2,
  READ_ONLY: 3,
  MAINTENANCE: 4
};

let currentLevel = DEGRADATION_LEVEL.FULL;

app.post('/api/orders', (req, res) => {
  if (currentLevel >= DEGRADATION_LEVEL.READ_ONLY) {
    return res.status(503).json({
      error: 'System in read-only mode. Please try again later.'
    });
  }

  if (currentLevel >= DEGRADATION_LEVEL.REDUCED) {
    // Skip recommendation generation
    // Skip email notifications
    // Process order only
  }

  // Normal processing
});
```

---

## Chaos Engineering

Deliberately inject failures to test resilience.

### Netflix Chaos Monkey

Randomly terminates instances in production.

```javascript
class ChaosMonkey {
  constructor(instances, killProbability = 0.01) {
    this.instances = instances;
    this.killProbability = killProbability;

    setInterval(() => this.maybeKillInstance(), 60000);  // Every minute
  }

  maybeKillInstance() {
    if (Math.random() < this.killProbability) {
      const instance = this.instances[
        Math.floor(Math.random() * this.instances.length)
      ];

      console.log(`Chaos Monkey killing instance: ${instance.id}`);
      instance.terminate();
    }
  }
}
```

### Chaos Experiments

**1. Kill Random Server**
```bash
# Randomly kill a pod in Kubernetes
kubectl delete pod -l app=my-service --random
```

**2. Network Latency**
```bash
# Add 500ms latency to network
tc qdisc add dev eth0 root netem delay 500ms
```

**3. Packet Loss**
```bash
# Drop 10% of packets
tc qdisc add dev eth0 root netem loss 10%
```

**4. Fill Disk**
```bash
# Fill disk to 95%
dd if=/dev/zero of=/fillfile bs=1M count=1000
```

**5. CPU Spike**
```javascript
// Max out CPU
function cpuIntensive() {
  while (true) {
    Math.sqrt(Math.random());
  }
}
```

### Chaos Engineering Process

1. **Define steady state**: What "normal" looks like
2. **Hypothesize**: System should remain stable during failure
3. **Inject failure**: Kill server, add latency, etc.
4. **Observe**: Monitor metrics, logs, user impact
5. **Learn**: Find weaknesses, improve resilience

---

## Multi-Region Deployment

### Active-Active Multi-Region

```
Users in US → US Region (Primary)
Users in EU → EU Region (Primary)
Users in Asia → Asia Region (Primary)

Each region can handle full load
Data replicated across regions
```

**Implementation:**
```
Route 53 (Geo-routing)
    ↓
┌───────────┬───────────┬───────────┐
↓           ↓           ↓
US Region   EU Region   Asia Region
(Active)    (Active)    (Active)

Cross-region replication for data
```

### Active-Passive Multi-Region

```
Primary Region: US (handles all traffic)
Backup Region: EU (standby)

On failure:
1. Detect primary failure
2. Update DNS to point to EU
3. EU region takes over
```

### Data Replication

**Synchronous:**
```javascript
async function writeData(data) {
  await Promise.all([
    primaryRegion.write(data),
    secondaryRegion.write(data)
  ]);
  // Only succeed if both succeed
}
```

**Asynchronous:**
```javascript
async function writeData(data) {
  await primaryRegion.write(data);
  // Return immediately

  // Replicate in background
  replicationQueue.add({
    region: 'secondary',
    data
  });
}
```

---

## Disaster Recovery

### RPO and RTO

**RPO (Recovery Point Objective)**: Maximum acceptable data loss
**RTO (Recovery Time Objective)**: Maximum acceptable downtime

```
Incident occurs at 10:00 AM

RTO = 4 hours → Must be back online by 2:00 PM
RPO = 1 hour → Can lose max 1 hour of data (back to 9:00 AM)
```

### Backup Strategies

**Full Backup:**
```bash
# Daily full backup
mongodump --archive=backup-2025-01-15.gz

# Pros: Simple restore
# Cons: Large, slow
```

**Incremental Backup:**
```bash
# Full backup Sunday
# Incremental Mon-Sat (only changes)

# Pros: Fast, small
# Cons: Restore slower (need all incrementals)
```

**Continuous Backup:**
```javascript
// Database replication with point-in-time recovery
// Can restore to any point in time
```

### Disaster Recovery Plan

1. **Backup regularly**
   - Automated daily backups
   - Test restores monthly

2. **Store off-site**
   - Different region
   - Different cloud provider

3. **Document procedures**
   - Step-by-step recovery guide
   - Contact information
   - Access credentials (secured)

4. **Practice drills**
   - Quarterly DR tests
   - Measure RTO/RPO

---

## Health Checks and Heartbeats

### Passive Health Checks

Monitor actual traffic.

```javascript
// Mark server unhealthy after 3 failed requests
const serverHealth = new Map();

app.use((req, res, next) => {
  const server = req.server;

  res.on('finish', () => {
    if (res.statusCode >= 500) {
      const failures = (serverHealth.get(server) || 0) + 1;
      serverHealth.set(server, failures);

      if (failures >= 3) {
        markServerUnhealthy(server);
      }
    } else {
      serverHealth.set(server, 0);  // Reset on success
    }
  });

  next();
});
```

### Active Health Checks

Periodic test requests.

```javascript
class HealthChecker {
  constructor(servers) {
    this.servers = servers;
    setInterval(() => this.checkAll(), 10000);  // Every 10 seconds
  }

  async checkAll() {
    for (const server of this.servers) {
      try {
        const response = await fetch(`${server.url}/health`, {
          timeout: 5000
        });

        if (response.ok) {
          server.healthy = true;
        } else {
          server.healthy = false;
        }
      } catch (error) {
        server.healthy = false;
      }
    }
  }

  getHealthyServers() {
    return this.servers.filter(s => s.healthy);
  }
}
```

### Health Check Endpoint

```javascript
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    cache: false,
    queue: false
  };

  // Check database
  try {
    await db.query('SELECT 1');
    checks.database = true;
  } catch (error) {
    checks.database = false;
  }

  // Check Redis
  try {
    await redis.ping();
    checks.cache = true;
  } catch (error) {
    checks.cache = false;
  }

  // Check message queue
  try {
    await queue.ping();
    checks.queue = true;
  } catch (error) {
    checks.queue = false;
  }

  const healthy = Object.values(checks).every(v => v === true);

  if (healthy) {
    res.status(200).json({ status: 'healthy', checks });
  } else {
    res.status(503).json({ status: 'unhealthy', checks });
  }
});
```

### Heartbeat Pattern

Service sends periodic "I'm alive" signals.

```javascript
class HeartbeatMonitor {
  constructor(timeout = 30000) {
    this.services = new Map();
    this.timeout = timeout;

    setInterval(() => this.checkHeartbeats(), 10000);
  }

  recordHeartbeat(serviceId) {
    this.services.set(serviceId, Date.now());
  }

  checkHeartbeats() {
    const now = Date.now();

    for (const [serviceId, lastHeartbeat] of this.services) {
      if (now - lastHeartbeat > this.timeout) {
        console.log(`Service ${serviceId} missed heartbeat`);
        this.onServiceDown(serviceId);
      }
    }
  }

  onServiceDown(serviceId) {
    // Remove from load balancer
    // Send alert
    // Attempt restart
  }
}

// Service sends heartbeat
setInterval(() => {
  heartbeatMonitor.recordHeartbeat('service-1');
}, 10000);
```

---

## Summary

**Key Principles:**
1. **Assume failures will happen** - Design for it
2. **Add redundancy** - Multiple instances, regions
3. **Fail fast** - Circuit breakers, timeouts
4. **Retry intelligently** - Exponential backoff, jitter
5. **Isolate failures** - Bulkheads, circuit breakers
6. **Degrade gracefully** - Reduce features, don't crash
7. **Test failure scenarios** - Chaos engineering
8. **Monitor everything** - Health checks, metrics, alerts
9. **Have a recovery plan** - Backups, runbooks, drills

**Patterns:**
- Circuit Breaker
- Retry with exponential backoff
- Bulkhead
- Health checks
- Failover

**Next:** [Capacity Planning and Performance](./14-capacity-planning.md)
