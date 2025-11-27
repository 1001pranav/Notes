# Core Concepts and Principles

## Table of Contents
- [CAP Theorem](#cap-theorem)
- [ACID vs BASE](#acid-vs-base)
- [Consistency Patterns](#consistency-patterns)
- [Partitioning and Sharding](#partitioning-and-sharding)
- [Replication Strategies](#replication-strategies)
- [Latency vs Throughput](#latency-vs-throughput)
- [Availability Patterns](#availability-patterns)

---

## CAP Theorem

The CAP theorem states that a distributed system can only guarantee **two out of three** properties:

### The Three Properties

**C - Consistency**
- Every read receives the most recent write or an error
- All nodes see the same data at the same time
- Example: Bank account balance must be accurate across all ATMs

**A - Availability**
- Every request receives a response (success or failure)
- System remains operational even if some nodes fail
- Example: Website stays up even if one server crashes

**P - Partition Tolerance**
- System continues to operate despite network failures between nodes
- Messages may be lost or delayed between nodes
- Example: Data center in US can't communicate with data center in Europe temporarily

### Why You Can Only Pick Two

When a network partition occurs, you must choose between:
- **Consistency**: Reject requests until partition is resolved (sacrifice Availability)
- **Availability**: Continue serving requests with potentially stale data (sacrifice Consistency)

### CAP Combinations

#### CP - Consistency + Partition Tolerance
**Sacrifices Availability**

When a partition occurs, the system becomes unavailable rather than risk returning incorrect data.

**Use Cases:**
- Banking systems
- Financial transactions
- Inventory management
- Any system where incorrect data is worse than no data

**Examples:**
- **MongoDB** (with appropriate settings)
- **HBase**
- **Redis** (with certain configurations)
- **Traditional RDBMS** with distributed setup

**Real-World Example:**
```
Bank Transfer System:
- Network partition occurs between data centers
- System refuses all transactions until partition resolves
- Better to show error than transfer money incorrectly
- User sees: "Service temporarily unavailable"
```

#### AP - Availability + Partition Tolerance
**Sacrifices Consistency**

When a partition occurs, the system remains available but may return stale or inconsistent data.

**Use Cases:**
- Social media feeds
- Product catalogs
- DNS
- Caching systems
- Real-time analytics (approximate)

**Examples:**
- **Cassandra**
- **DynamoDB**
- **CouchDB**
- **Riak**

**Real-World Example:**
```
Social Media Like Count:
- Network partition occurs
- Different users see different like counts
- Eventually all nodes sync up
- User experience not significantly impacted
- Temporary inconsistency is acceptable
```

#### CA - Consistency + Availability
**Sacrifices Partition Tolerance**

Only possible in single-node systems or when network failures never occur.

**Reality Check:**
- Network failures ALWAYS happen in distributed systems
- CA is not practically achievable in distributed systems
- Only single-node systems can be CA

**Examples:**
- **Traditional single-server RDBMS** (PostgreSQL, MySQL on one server)
- Not applicable to distributed systems

### CAP in Practice

Most modern systems use **tunable consistency**:

```javascript
// DynamoDB Example - Choose your trade-off per request

// Strong consistency (CP behavior)
const params = {
  TableName: 'Users',
  Key: { userId: '123' },
  ConsistentRead: true  // Wait for all replicas to sync
};

// Eventual consistency (AP behavior)
const params = {
  TableName: 'Users',
  Key: { userId: '123' },
  ConsistentRead: false  // Read from any replica
};
```

---

## ACID vs BASE

Two different approaches to data integrity in databases.

### ACID - Traditional RDBMS Model

**A - Atomicity**
- All operations in a transaction succeed or all fail
- No partial updates

```sql
-- Transfer money between accounts
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- If any operation fails, entire transaction rolls back
-- Money is never lost or created
```

**C - Consistency**
- Data must follow all defined rules and constraints
- Database moves from one valid state to another

```sql
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  balance DECIMAL(10,2) CHECK (balance >= 0)  -- Constraint
);

-- This will fail - maintains consistency
UPDATE accounts SET balance = -50 WHERE id = 1;  -- ❌ Violates constraint
```

**I - Isolation**
- Concurrent transactions don't interfere with each other
- Transactions appear to execute serially

```javascript
// Transaction 1: Transfer $100 from A to B
// Transaction 2: Transfer $50 from A to C
// Both execute simultaneously but isolated
// Final result is correct: A reduced by $150
```

**Isolation Levels:**

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|------------|---------------------|--------------|
| Read Uncommitted | ✅ Possible | ✅ Possible | ✅ Possible |
| Read Committed | ❌ Not Possible | ✅ Possible | ✅ Possible |
| Repeatable Read | ❌ Not Possible | ❌ Not Possible | ✅ Possible |
| Serializable | ❌ Not Possible | ❌ Not Possible | ❌ Not Possible |

**D - Durability**
- Completed transactions persist even after system failure
- Data written to disk, not just memory

```javascript
// After COMMIT returns successfully:
// - Data is on disk
// - Survives server crash
// - Survives power failure
```

### BASE - NoSQL Model

**BA - Basically Available**
- System guarantees availability
- Responses may not contain latest data

**S - Soft State**
- State of system may change over time, even without input
- System may have inconsistent copies temporarily

**E - Eventual Consistency**
- System will become consistent over time
- All nodes will eventually have the same data

**Real-World Example:**
```
Instagram Likes:
- User A likes a photo
- User B immediately views photo
- User B might see old like count
- Within seconds, like count updates
- Eventually consistent
```

### ACID vs BASE Comparison

| Aspect | ACID | BASE |
|--------|------|------|
| **Consistency** | Strong, immediate | Eventual |
| **Availability** | May sacrifice for consistency | Always available |
| **Use Case** | Financial, inventory | Social media, analytics |
| **Complexity** | Simpler | More complex |
| **Performance** | Lower for writes | Higher for reads |
| **Examples** | PostgreSQL, MySQL | Cassandra, DynamoDB |

### Choosing Between ACID and BASE

**Choose ACID when:**
- Data correctness is critical
- Transactions are essential
- Financial operations
- Inventory management
- User authentication

**Choose BASE when:**
- High availability is critical
- Scale is important
- Temporary inconsistency is acceptable
- Social media feeds
- Analytics dashboards
- Product catalogs

---

## Consistency Patterns

Different levels of consistency in distributed systems:

### 1. Strong Consistency

**Definition:** After a write completes, all subsequent reads will see that write.

**How it works:**
```
Client writes X = 5
  ↓
Write to all replicas
  ↓
Wait for all ACKs
  ↓
Return success
  ↓
All reads now return X = 5
```

**Pros:**
- Simple to reason about
- No surprises for users
- Data always accurate

**Cons:**
- Higher latency
- Lower availability during partitions
- Reduced scalability

**Use Cases:**
- Banking transactions
- Inventory reservations
- User authentication

**Example Implementation:**
```javascript
// Write to master
await database.write({ key: 'user:123', value: userData });

// Read from master (guaranteed latest)
const user = await database.read({ key: 'user:123', consistentRead: true });
```

### 2. Eventual Consistency

**Definition:** If no new updates are made, eventually all replicas will converge to the same value.

**How it works:**
```
Client writes X = 5
  ↓
Write to one node
  ↓
Return success immediately
  ↓
Async replication to other nodes
  ↓
Reads may return old value for a while
  ↓
Eventually all reads return X = 5
```

**Pros:**
- Low latency
- High availability
- Better scalability
- Works during network partitions

**Cons:**
- Complex to reason about
- Users may see stale data
- Conflict resolution needed

**Use Cases:**
- Social media feeds
- Product reviews
- Cache invalidation
- DNS records

**Example Implementation:**
```javascript
// Write to any node
await database.write({ key: 'post:123:likes', value: 42 });

// Different users might see different values temporarily
const likes1 = await database.read({ key: 'post:123:likes', region: 'US' });  // 42
const likes2 = await database.read({ key: 'post:123:likes', region: 'EU' });  // 40

// After replication completes (seconds/minutes), both show 42
```

### 3. Causal Consistency

**Definition:** Causally related operations appear in the same order to all nodes.

**How it works:**
```
User posts: "What's your favorite color?" (Operation A)
  ↓
User comments: "Mine is blue" (Operation B, depends on A)
  ↓
All users see post before comment (A before B)
But unrelated posts can appear in any order
```

**Example:**
```javascript
// Causal dependencies tracked
await createPost({ id: 'post1', content: 'Hello' });  // A
await createComment({
  id: 'comment1',
  postId: 'post1',  // Depends on post1
  content: 'Nice post!'
});  // B depends on A

// System ensures comment never appears before post
// But other unrelated posts can appear in any order
```

**Use Cases:**
- Comment threads
- Email replies
- Collaborative editing

### 4. Read-Your-Own-Writes Consistency

**Definition:** User always sees their own writes immediately.

```javascript
// User creates post
await createPost({ userId: '123', content: 'Hello world' });

// User refreshes page - MUST see their own post
const myPosts = await getMyPosts({ userId: '123' });
// Includes the new post immediately

// Other users might not see it immediately (eventual consistency)
```

**Implementation:**
```javascript
async function getMyPosts(userId) {
  // Read from same node/region where user wrote
  // Or include write timestamp and wait for replication
  const posts = await database.read({
    key: `user:${userId}:posts`,
    session: userSession  // Sticky session to same replica
  });
  return posts;
}
```

### 5. Monotonic Read Consistency

**Definition:** If a user reads value X, subsequent reads will never return an older value.

**Problem without it:**
```
User reads likes = 100
User refreshes
User reads likes = 95  // ❌ Went backwards!
```

**With monotonic reads:**
```
User reads likes = 100 (from Replica A)
User refreshes (reads from Replica B)
System ensures Replica B has at least version seen by user
User reads likes = 100 or higher  // ✅ Never goes backwards
```

**Implementation:**
```javascript
async function getPostWithMonotonicReads(postId, lastSeenVersion) {
  const post = await database.read({ key: `post:${postId}` });

  if (post.version < lastSeenVersion) {
    // Wait for replica to catch up or read from different replica
    await waitForVersion(lastSeenVersion);
    return getPostWithMonotonicReads(postId, lastSeenVersion);
  }

  return post;
}
```

---

## Partitioning and Sharding

Splitting data across multiple servers to scale beyond a single machine.

### What is Partitioning/Sharding?

**Partitioning:** Splitting a database into smaller pieces
**Sharding:** Distributing those pieces across multiple servers

```
Original Database (1TB):
Users: 10 million records

Sharded Database:
Shard 1: Users 0-2.5M     (250GB)
Shard 2: Users 2.5M-5M    (250GB)
Shard 3: Users 5M-7.5M    (250GB)
Shard 4: Users 7.5M-10M   (250GB)
```

### Partitioning Strategies

#### 1. Horizontal Partitioning (Sharding)

Split rows across multiple databases.

```sql
-- Shard 1: Users with ID 0-999999
SELECT * FROM users WHERE user_id = 500000;  -- Goes to Shard 1

-- Shard 2: Users with ID 1000000-1999999
SELECT * FROM users WHERE user_id = 1500000;  -- Goes to Shard 2
```

**Pros:**
- Scales writes and storage
- Each shard is smaller and faster

**Cons:**
- Complex queries across shards
- Rebalancing is difficult
- Join operations are expensive

#### 2. Vertical Partitioning

Split columns across multiple databases.

```sql
-- Database 1: User basic info
users: id, name, email, created_at

-- Database 2: User profile details
user_profiles: id, bio, avatar, preferences

-- Database 3: User activity
user_activity: id, last_login, post_count, follower_count
```

**Pros:**
- Isolates different access patterns
- Can optimize each database differently

**Cons:**
- Joins across databases needed
- Some queries need multiple databases

### Sharding Methods

#### 1. Range-Based Sharding

Partition by a range of values.

```javascript
function getShardByUserId(userId) {
  if (userId < 1000000) return 'shard1';
  if (userId < 2000000) return 'shard2';
  if (userId < 3000000) return 'shard3';
  return 'shard4';
}

// Query
const shard = getShardByUserId(1500000);  // shard2
const user = await shards[shard].query('SELECT * FROM users WHERE id = ?', [1500000]);
```

**Pros:**
- Simple to implement
- Easy range queries
- Easy to add new shards

**Cons:**
- Can lead to uneven distribution (hotspots)
- New users all go to same shard

**Use Cases:**
- Time-series data (shard by date)
- Geographic data (shard by region)

#### 2. Hash-Based Sharding

Use a hash function to determine the shard.

```javascript
function getShardByUserId(userId) {
  const hash = hashFunction(userId);
  const shardIndex = hash % numberOfShards;
  return shards[shardIndex];
}

// Example
const userId = 1234567;
const hash = md5(userId);  // e3d704f3542b44a621ebed70dc0efe13
const shardIndex = parseInt(hash, 16) % 4;  // 1
// User goes to shard1
```

**Pros:**
- Even distribution
- No hotspots

**Cons:**
- Range queries are difficult
- Adding/removing shards requires rehashing

**Use Cases:**
- User data
- Session data
- Any data without range query needs

#### 3. Consistent Hashing

Special hashing that minimizes data movement when adding/removing shards.

```javascript
class ConsistentHash {
  constructor(shards) {
    this.ring = [];
    shards.forEach(shard => {
      // Add each shard multiple times (virtual nodes)
      for (let i = 0; i < 150; i++) {
        const hash = md5(`${shard}:${i}`);
        this.ring.push({ hash, shard });
      }
    });
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  getShard(key) {
    const hash = md5(key);
    // Find first shard with hash >= key hash
    const shard = this.ring.find(node => node.hash >= hash);
    return shard ? shard.shard : this.ring[0].shard;
  }
}

// Adding a shard only affects ~1/N of keys
// Much better than normal hashing which affects all keys
```

**Pros:**
- Minimal data movement when scaling
- Even distribution with virtual nodes

**Cons:**
- More complex to implement
- Range queries still difficult

**Use Cases:**
- Caching systems (Memcached, Redis Cluster)
- Distributed storage (Cassandra, DynamoDB)
- CDN content routing

#### 4. Directory-Based Sharding

Use a lookup table to map keys to shards.

```javascript
const shardDirectory = {
  'user:1-1000000': 'shard1',
  'user:1000001-2000000': 'shard2',
  'user:2000001-3000000': 'shard3',
  'company:1-500000': 'shard1',
  'company:500001-1000000': 'shard2'
};

function getShard(key) {
  return shardDirectory[key];
}
```

**Pros:**
- Flexible partitioning
- Easy to rebalance
- Can optimize placement

**Cons:**
- Directory is a single point of failure
- Extra lookup required
- Directory can become large

### Challenges with Sharding

#### 1. Joins Across Shards

```sql
-- If users and orders are in different shards
-- This becomes very expensive
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;

-- Solution: Denormalize or fetch separately
```

#### 2. Auto-Incrementing Keys

```sql
-- Each shard generates IDs independently
-- Can have collisions

-- Solution 1: Prefix with shard ID
Shard 1: 1_1, 1_2, 1_3
Shard 2: 2_1, 2_2, 2_3

-- Solution 2: Use UUID
id = '550e8400-e29b-41d4-a716-446655440000'

-- Solution 3: Dedicated ID generation service (Twitter Snowflake)
```

#### 3. Rebalancing Shards

```javascript
// Adding new shard requires data migration
// Minimize downtime with double-writing

// Phase 1: Write to old and new shard
async function writeUser(user) {
  await oldShard.write(user);
  await newShard.write(user);
}

// Phase 2: Migrate old data
await migrateData(oldShard, newShard);

// Phase 3: Switch reads to new shard
// Phase 4: Remove double-writing
```

---

## Replication Strategies

Creating copies of data across multiple servers for reliability and performance.

### Why Replicate?

1. **High Availability:** If one server fails, others continue serving
2. **Performance:** Distribute read load across replicas
3. **Disaster Recovery:** Data survives data center failures
4. **Geographic Distribution:** Serve users from nearby locations

### Replication Types

#### 1. Master-Slave (Primary-Replica) Replication

One master handles writes, multiple slaves handle reads.

```
          Client Writes
                ↓
            [ Master ]
           /     |     \
          /      |      \
    [Slave 1] [Slave 2] [Slave 3]
         ↑        ↑         ↑
    Client   Client    Client
    Reads    Reads     Reads
```

**Implementation:**
```javascript
class Database {
  constructor() {
    this.master = new PostgreSQLConnection('master-db.example.com');
    this.slaves = [
      new PostgreSQLConnection('slave1-db.example.com'),
      new PostgreSQLConnection('slave2-db.example.com'),
      new PostgreSQLConnection('slave3-db.example.com')
    ];
    this.currentSlaveIndex = 0;
  }

  async write(query, params) {
    // All writes go to master
    return this.master.execute(query, params);
  }

  async read(query, params) {
    // Round-robin across slaves
    const slave = this.slaves[this.currentSlaveIndex];
    this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slaves.length;
    return slave.execute(query, params);
  }
}

// Usage
const db = new Database();
await db.write('INSERT INTO users (name) VALUES (?)', ['Alice']);
const users = await db.read('SELECT * FROM users');
```

**Pros:**
- Simple to implement
- Scales read performance
- Clear write authority

**Cons:**
- Master is single point of failure
- Replication lag (slaves may be behind)
- Doesn't scale writes

**Use Cases:**
- Most web applications
- Read-heavy workloads
- Content management systems

#### 2. Master-Master (Multi-Master) Replication

Multiple masters, all accept writes.

```
    [ Master 1 ] ←→ [ Master 2 ]
         ↕               ↕
    Reads/Writes   Reads/Writes
```

**Pros:**
- No single point of failure
- Scales writes
- Low latency (write to nearest master)

**Cons:**
- Complex conflict resolution
- Consistency challenges
- More difficult to maintain

**Conflict Example:**
```javascript
// Master 1
UPDATE users SET email = 'alice@example.com' WHERE id = 1;

// Master 2 (simultaneously)
UPDATE users SET email = 'alice@newdomain.com' WHERE id = 1;

// Conflict! Need resolution strategy:
// - Last Write Wins (LWW)
// - First Write Wins
// - Custom conflict resolution
// - Merge values
```

**Conflict Resolution Strategies:**

**Last Write Wins (LWW):**
```javascript
// Use timestamps
{
  id: 1,
  email: 'alice@newdomain.com',
  updated_at: '2025-01-15T10:30:15Z'  // Later timestamp wins
}
```

**Version Vectors:**
```javascript
{
  id: 1,
  email: 'alice@example.com',
  version: {
    master1: 5,
    master2: 3
  }
}
// Track versions from each master to detect conflicts
```

#### 3. Synchronous Replication

Master waits for slaves to confirm before returning success.

```javascript
async function writeWithSyncReplication(data) {
  // Write to master
  await master.write(data);

  // Wait for all slaves to acknowledge
  await Promise.all(slaves.map(slave => slave.replicate(data)));

  // Only now return success
  return { status: 'success' };
}
```

**Pros:**
- Strong consistency
- All replicas always in sync
- Safe from data loss

**Cons:**
- High latency (wait for slowest replica)
- Lower availability (fails if any replica fails)
- Reduced write throughput

**Use Cases:**
- Financial systems
- Inventory management
- Critical data

#### 4. Asynchronous Replication

Master returns success immediately, slaves update later.

```javascript
async function writeWithAsyncReplication(data) {
  // Write to master
  await master.write(data);

  // Return success immediately
  const result = { status: 'success' };

  // Replicate asynchronously (don't wait)
  slaves.forEach(slave => {
    slave.replicate(data).catch(err => {
      // Handle replication failure
      logReplicationError(err);
      retryQueue.add({ slave, data });
    });
  });

  return result;
}
```

**Pros:**
- Low latency
- High availability
- Better performance

**Cons:**
- Replication lag
- Risk of data loss if master fails
- Eventual consistency

**Use Cases:**
- Social media
- Analytics
- Most web applications

---

## Latency vs Throughput

### Latency

**Definition:** Time to complete a single operation.

**Measured in:** Milliseconds (ms)

**Examples:**
- Database query: 50ms
- API request: 200ms
- Cache lookup: 1ms

**How to measure:**
```javascript
const start = Date.now();
await database.query('SELECT * FROM users WHERE id = 1');
const latency = Date.now() - start;
console.log(`Latency: ${latency}ms`);
```

**Optimization Strategies:**
- Add caching
- Use CDN for static content
- Optimize database queries (indexing)
- Reduce network hops
- Use faster protocols (gRPC vs REST)
- Geographic distribution

### Throughput

**Definition:** Number of operations per unit time.

**Measured in:** Operations/second, Requests/second

**Examples:**
- API handles 10,000 requests/second
- Database processes 5,000 queries/second

**How to measure:**
```javascript
const operations = 10000;
const start = Date.now();

for (let i = 0; i < operations; i++) {
  await performOperation();
}

const duration = (Date.now() - start) / 1000;  // seconds
const throughput = operations / duration;
console.log(`Throughput: ${throughput} ops/sec`);
```

**Optimization Strategies:**
- Horizontal scaling (add more servers)
- Asynchronous processing
- Batching operations
- Load balancing
- Connection pooling
- Optimize resource usage

### Latency vs Throughput Trade-offs

**Scenario 1: Optimize for Latency**
```javascript
// Process each request immediately
async function handleRequest(request) {
  return await processImmediately(request);
}
// Latency: Low (10ms)
// Throughput: Lower (1000 req/sec)
```

**Scenario 2: Optimize for Throughput**
```javascript
// Batch requests
const batch = [];
async function handleRequest(request) {
  batch.push(request);

  if (batch.length >= 100) {
    const results = await processBatch(batch);
    batch.length = 0;
    return results;
  }
}
// Latency: Higher (100ms avg)
// Throughput: Higher (10,000 req/sec)
```

**Real-World Example:**
```
Video Streaming (Netflix):
- Optimize for throughput
- Pre-buffer content (higher latency)
- Serve millions of users simultaneously

Online Gaming:
- Optimize for latency
- Real-time updates critical
- Lower throughput per user acceptable
```

---

## Availability Patterns

### Failover

Automatically switch to backup system when primary fails.

#### Active-Passive Failover

```
[ Primary Server ]  ←→  [ Passive Backup ]
        ↓                      ↑
    All Traffic         No traffic (standby)

If Primary fails:
[ Primary Server ]      [ Active Backup ]
    (failed)                    ↓
                          All Traffic
```

**Implementation:**
```javascript
class FailoverSystem {
  constructor() {
    this.primary = new Server('primary');
    this.backup = new Server('backup');
    this.currentServer = this.primary;

    // Health check every 5 seconds
    setInterval(() => this.healthCheck(), 5000);
  }

  async healthCheck() {
    try {
      await this.primary.ping();
    } catch (error) {
      console.log('Primary failed, switching to backup');
      this.currentServer = this.backup;
    }
  }

  async handleRequest(req) {
    return this.currentServer.process(req);
  }
}
```

**Pros:**
- Simple to set up
- Lower cost (backup idle)

**Cons:**
- Backup resources wasted
- Downtime during failover
- Data loss if replication lag

#### Active-Active Failover

```
[ Server 1 ]      [ Server 2 ]
      ↓                 ↓
  50% Traffic     50% Traffic

If Server 1 fails:
[ Server 1 ]      [ Server 2 ]
   (failed)            ↓
                 100% Traffic
```

**Pros:**
- No wasted resources
- No failover time
- Better performance

**Cons:**
- More complex
- More expensive
- Require load balancer

### Replication

Covered in detail in [Replication Strategies](#replication-strategies)

### Load Balancing

Distribute traffic across multiple servers. Covered in detail in next section.

---

## Summary

**Key Takeaways:**

1. **CAP Theorem:** Choose 2 of 3 (Consistency, Availability, Partition Tolerance)
2. **ACID vs BASE:** Strong consistency vs Eventual consistency
3. **Consistency Patterns:** Strong, Eventual, Causal, Read-your-writes, Monotonic
4. **Sharding:** Partition data across servers to scale
5. **Replication:** Create copies for availability and performance
6. **Latency vs Throughput:** Optimize for speed or volume, not both
7. **Availability:** Use failover and replication for high uptime

These concepts form the foundation for all system design decisions. Understanding them deeply will help you make the right trade-offs for your specific use case.

**Next:** [System Components Deep Dive](./03-load-balancers.md)
