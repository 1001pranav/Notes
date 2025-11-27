# Database Design Guide

Comprehensive guide to designing scalable and efficient database systems.

## Table of Contents
1. [SQL vs NoSQL](#sql-vs-nosql)
2. [Database Scaling](#database-scaling)
3. [Sharding](#sharding)
4. [Replication Strategies](#replication-strategies)
5. [Normalization vs Denormalization](#normalization-vs-denormalization)
6. [ACID vs BASE](#acid-vs-base)
7. [Database Selection Guide](#database-selection-guide)

---

## SQL vs NoSQL

### SQL (Relational) Databases

**Structure:** Tables with fixed schema, rows, and columns

**Popular Databases:**
- PostgreSQL
- MySQL
- Oracle
- SQL Server
- MariaDB

#### Characteristics

**ACID Compliant:**
```
Atomicity: All or nothing transactions
Consistency: Data integrity maintained
Isolation: Concurrent transactions don't interfere
Durability: Committed data persists
```

**Schema:**
```
Fixed schema (predefined structure)
Strong typing
Enforced relationships
```

**Query Language:**
```sql
-- Standardized SQL
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed';
```

#### Pros

```
✓ ACID transactions
✓ Complex queries and JOINs
✓ Data integrity and validation
✓ Mature ecosystem and tooling
✓ Strong consistency
✓ Excellent for financial systems
```

#### Cons

```
✗ Harder to scale horizontally
✗ Schema changes expensive
✗ Performance degrades with very large tables
✗ Vertical scaling limits
```

#### Use Cases

```
- Financial applications (banking, payments)
- E-commerce transactions
- Enterprise applications (ERP, CRM)
- Applications requiring complex queries
- Strong consistency requirements
```

---

### NoSQL Databases

**Structure:** Flexible schema, various data models

**Types:**

#### 1. Document Stores
Store JSON/BSON documents.

**Databases:** MongoDB, CouchDB, Firebase

**Example:**
```json
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "orders": [
    {
      "order_id": "order456",
      "total": 99.99,
      "items": [...]
    }
  ]
}
```

**Pros:**
```
✓ Flexible schema
✓ Easy to scale horizontally
✓ Natural JSON mapping
✓ Nested data structures
```

**Use Cases:**
```
- Content management systems
- User profiles
- Product catalogs
- Real-time analytics
```

#### 2. Key-Value Stores
Simple key-value pairs.

**Databases:** Redis, DynamoDB, Riak

**Example:**
```
user:123 → {"name": "John", "email": "john@example.com"}
session:abc → {"userId": 123, "loggedIn": true}
```

**Pros:**
```
✓ Extremely fast (O(1) lookups)
✓ Simple data model
✓ Highly scalable
✓ Low latency
```

**Use Cases:**
```
- Session storage
- Caching
- Real-time data
- Leaderboards
- Rate limiting
```

#### 3. Column-Family Stores
Store data in columns rather than rows.

**Databases:** Cassandra, HBase, ScyllaDB

**Example:**
```
Row Key: user123
Column Family: profile
  name: "John Doe"
  email: "john@example.com"
Column Family: settings
  theme: "dark"
  language: "en"
```

**Pros:**
```
✓ Excellent for time-series data
✓ High write throughput
✓ Compression efficiency
✓ Distributed architecture
```

**Use Cases:**
```
- Time-series data (IoT, metrics)
- Event logging
- Analytics
- Large-scale data warehouses
```

#### 4. Graph Databases
Store nodes and relationships.

**Databases:** Neo4j, Amazon Neptune, ArangoDB

**Example:**
```
(User:John)-[:FOLLOWS]->(User:Jane)
(User:John)-[:LIKES]->(Post:123)
(Post:123)-[:TAGGED]->(Tag:JavaScript)
```

**Pros:**
```
✓ Natural relationship modeling
✓ Fast traversal queries
✓ Flexible schema
✓ Pattern matching
```

**Use Cases:**
```
- Social networks
- Recommendation engines
- Fraud detection
- Knowledge graphs
```

---

### SQL vs NoSQL Decision Matrix

| Factor | SQL | NoSQL |
|--------|-----|-------|
| Schema | Fixed, predefined | Flexible, dynamic |
| Scalability | Vertical (scale up) | Horizontal (scale out) |
| Transactions | Strong ACID | Eventual consistency (BASE) |
| Queries | Complex JOINs | Simple lookups, no JOINs |
| Data Structure | Structured, relational | Unstructured, nested |
| Consistency | Strong | Eventual (configurable) |
| Best For | Financial, complex queries | High throughput, flexibility |

**When to use SQL:**
```
✓ Need ACID transactions
✓ Complex queries with JOINs
✓ Structured data with relationships
✓ Data integrity is critical
✓ Moderate read/write volume
```

**When to use NoSQL:**
```
✓ Need horizontal scalability
✓ Flexible/evolving schema
✓ Simple queries (key lookups)
✓ High read/write volume
✓ Eventually consistent is acceptable
```

---

## Database Scaling

### Vertical Scaling (Scale Up)

**Approach:** Upgrade hardware (more CPU, RAM, SSD)

**Pros:**
```
- Simple (no code changes)
- Maintains ACID properties
- No sharding complexity
```

**Cons:**
```
- Expensive at higher tiers
- Hardware limits
- Single point of failure
- Downtime during upgrades
```

**When to use:** Initial growth, moderate traffic

---

### Horizontal Scaling (Scale Out)

**Approach:** Add more database servers

#### 1. Read Replicas

**Architecture:**
```
Master (Write) → Replica 1 (Read)
              → Replica 2 (Read)
              → Replica 3 (Read)
```

**How it works:**
```
1. All writes go to master
2. Master replicates to replicas
3. Reads distributed across replicas
```

**Configuration:**
```python
# Application code
write_db = connect('master.db.example.com')
read_db = random.choice([
    connect('replica1.db.example.com'),
    connect('replica2.db.example.com'),
    connect('replica3.db.example.com')
])

# Writes
write_db.execute("INSERT INTO users ...")

# Reads
read_db.execute("SELECT * FROM users ...")
```

**Challenges:**
```
- Replication lag (eventual consistency)
- Read-after-write inconsistency
```

**Solution: Read-after-write consistency:**
```python
def create_user(data):
    user_id = write_db.insert(data)
    # Read from master for this session
    return write_db.query("SELECT * FROM users WHERE id = ?", user_id)
```

#### 2. Sharding

Partition data across multiple databases (covered in detail below).

---

## Sharding

Splitting data horizontally across multiple databases.

### Sharding Strategies

#### 1. Range-Based Sharding

**Partition by key range.**

**Example: User IDs**
```
Shard 1: user_id 1-1,000,000
Shard 2: user_id 1,000,001-2,000,000
Shard 3: user_id 2,000,001-3,000,000
```

**Example: Dates**
```
Shard 1: Jan 2024 - Mar 2024
Shard 2: Apr 2024 - Jun 2024
Shard 3: Jul 2024 - Sep 2024
```

**Pros:**
```
✓ Simple to implement
✓ Range queries efficient
✓ Easy to add new shards
```

**Cons:**
```
✗ Uneven distribution (hotspots)
✗ Sequential IDs create hot shard
```

**Use Cases:** Time-series data, logs, archives

#### 2. Hash-Based Sharding

**Partition by hash of key.**

**Algorithm:**
```
shard_id = hash(key) % num_shards
```

**Example:**
```python
def get_shard(user_id, num_shards=4):
    return hash(user_id) % num_shards

get_shard(12345) → Shard 1
get_shard(67890) → Shard 3
```

**Pros:**
```
✓ Even distribution
✓ No hotspots
✓ Predictable
```

**Cons:**
```
✗ Range queries difficult
✗ Resharding requires full migration
```

**Solution: Consistent Hashing**
```
Use virtual nodes to minimize resharding impact
```

**Use Cases:** User data, session data

#### 3. Geographic Sharding

**Partition by user location.**

**Example:**
```
Shard US: US users
Shard EU: EU users
Shard ASIA: Asian users
```

**Pros:**
```
✓ Low latency (data near users)
✓ Compliance (GDPR, data residency)
✓ Fault isolation
```

**Cons:**
```
✗ Uneven distribution
✗ Global queries complex
```

**Use Cases:** Global applications, regulated data

#### 4. Directory-Based Sharding

**Lookup table maps entities to shards.**

**Example:**
```
Lookup Service:
{
  "user:123": "shard-1",
  "user:456": "shard-2",
  "user:789": "shard-1"
}
```

**Pros:**
```
✓ Flexible assignment
✓ Easy resharding
✓ Can optimize per-entity
```

**Cons:**
```
✗ Lookup service overhead
✗ Single point of failure
✗ Additional complexity
```

**Use Cases:** Complex sharding logic, tenant isolation

---

### Sharding Challenges

#### 1. Cross-Shard Queries

**Problem:**
```sql
-- Requires data from multiple shards
SELECT COUNT(*) FROM users WHERE status = 'active';
```

**Solutions:**

**A. Scatter-Gather:**
```python
def count_active_users():
    results = []
    for shard in all_shards:
        count = shard.query("SELECT COUNT(*) FROM users WHERE status = 'active'")
        results.append(count)
    return sum(results)
```

**B. Denormalization:**
```
Maintain aggregate table in separate DB
Update via async jobs or event streams
```

**C. Avoid:**
```
Design schema to keep related data together
```

#### 2. Cross-Shard Joins

**Problem:**
```sql
-- Users and Orders on different shards
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**Solutions:**

**A. Shard by same key:**
```
Both users and orders sharded by user_id
Co-locate related data
```

**B. Application-level joins:**
```python
# Fetch from different shards
users = user_shard.query("SELECT * FROM users WHERE id IN (?)", user_ids)
orders = order_shard.query("SELECT * FROM orders WHERE user_id IN (?)", user_ids)

# Join in application
for user in users:
    user['orders'] = [o for o in orders if o['user_id'] == user['id']]
```

**C. Denormalization:**
```
Store user info in orders table
Sacrifice normalization for performance
```

#### 3. Distributed Transactions

**Problem:** ACID transactions across shards

**Solutions:**

**A. Avoid:**
```
Design to keep transactions within single shard
```

**B. Two-Phase Commit (2PC):**
```
1. Prepare phase: All shards vote
2. Commit phase: All commit or all rollback

Problems: Slow, blocking, coordinator SPOF
```

**C. Saga Pattern:**
```
1. Series of local transactions
2. Compensating transactions for rollback
3. Eventual consistency

Example:
  Create Order → Reserve Inventory → Charge Payment
  If payment fails → Unreserve Inventory → Cancel Order
```

#### 4. Shard Key Selection

**Bad shard keys:**
```
✗ Low cardinality (country: only ~200 values)
✗ Monotonically increasing (timestamp, sequential ID)
✗ Uneven distribution (celebrity users)
```

**Good shard keys:**
```
✓ High cardinality (user_id, email)
✓ Even distribution
✓ Used in most queries
✓ Immutable (don't change after creation)
```

**Example:**
```
Good: user_id (UUID)
Bad: created_at (time-based hotspot)
```

#### 5. Resharding

**When needed:**
```
- Adding more shards for growth
- Rebalancing uneven shards
- Changing shard key
```

**Strategies:**

**A. Stop-the-world:**
```
1. Make DB read-only
2. Migrate data
3. Switch to new shards
4. Resume writes

Downtime: Hours to days
```

**B. Dual-write approach:**
```
1. Write to old AND new shards
2. Migrate data gradually
3. Switch reads to new shards
4. Stop writing to old shards

Minimal downtime
```

**C. Consistent hashing:**
```
Minimize data movement
Only affected keys remapped
```

---

## Replication Strategies

### Replication Models

#### 1. Master-Slave (Primary-Replica)

**Architecture:**
```
Master (Read/Write)
  ↓
  ├→ Slave 1 (Read-only)
  ├→ Slave 2 (Read-only)
  └→ Slave 3 (Read-only)
```

**Replication Methods:**

**A. Statement-Based:**
```
Master logs SQL statements
Slaves replay statements
Problem: Non-deterministic functions (NOW(), RAND())
```

**B. Row-Based:**
```
Master logs actual row changes
More reliable, more space
```

**C. Mixed:**
```
Uses statement-based when safe
Falls back to row-based when needed
```

**Failover:**
```
Manual: DBA promotes slave to master
Semi-automatic: Tool detects failure, promotes slave
Automatic: Orchestrator promotes slave, updates clients
```

**MySQL Example:**
```sql
-- On Master
SHOW MASTER STATUS;

-- On Slave
CHANGE MASTER TO
  MASTER_HOST='master-host',
  MASTER_USER='repl_user',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=12345;

START SLAVE;
```

#### 2. Master-Master (Multi-Master)

**Architecture:**
```
Master 1 ←→ Master 2
```

**Conflict Resolution:**
```
- Auto-increment with offsets
- Timestamp-based (last write wins)
- Application-level resolution
```

**Example: Auto-increment offsets**
```sql
-- Master 1
SET auto_increment_increment = 2;
SET auto_increment_offset = 1;  -- IDs: 1, 3, 5, 7...

-- Master 2
SET auto_increment_increment = 2;
SET auto_increment_offset = 2;  -- IDs: 2, 4, 6, 8...
```

**Pros:**
```
✓ Write scalability
✓ High availability
✓ Geographic distribution
```

**Cons:**
```
✗ Conflict resolution complexity
✗ Consistency challenges
✗ Harder to maintain
```

#### 3. Group Replication

**Architecture:**
```
Node 1 ←→ Node 2 ←→ Node 3
  ↑                    ↓
  └────────────────────┘
```

**How it works:**
```
1. All nodes can write
2. Changes replicated to all nodes
3. Majority consensus required
4. Automatic failover
```

**MySQL Group Replication:**
```
- Single primary mode: One writable master
- Multi-primary mode: All nodes writable
```

---

### Synchronous vs Asynchronous Replication

#### Synchronous Replication

**Flow:**
```
1. Client writes to master
2. Master writes to replicas
3. Wait for replica ACK
4. Return success to client
```

**Pros:**
```
✓ No data loss
✓ Strong consistency
✓ Replicas always up-to-date
```

**Cons:**
```
✗ Higher latency
✗ Lower availability (if replica down)
✗ Limited by slowest replica
```

**Use Cases:** Financial systems, critical data

#### Asynchronous Replication

**Flow:**
```
1. Client writes to master
2. Master returns success immediately
3. Master asynchronously replicates to replicas
```

**Pros:**
```
✓ Low latency
✓ High availability
✓ Master not blocked by replicas
```

**Cons:**
```
✗ Replication lag
✗ Potential data loss
✗ Eventual consistency
```

**Use Cases:** Analytics, caching, non-critical data

#### Semi-Synchronous Replication

**Flow:**
```
1. Client writes to master
2. Master waits for at least ONE replica ACK
3. Return success to client
4. Other replicas catch up asynchronously
```

**Balance:** Between latency and durability

---

## Normalization vs Denormalization

### Normalization

**Goal:** Eliminate data redundancy

#### Normal Forms

**1NF (First Normal Form):**
```
- Atomic values (no arrays)
- No repeating groups
```

**Before:**
```
| user_id | name | emails |
|---------|------|--------|
| 1 | John | john@a.com, john@b.com |
```

**After:**
```
| user_id | name |
|---------|------|
| 1 | John |

| user_id | email |
|---------|-------|
| 1 | john@a.com |
| 1 | john@b.com |
```

**2NF (Second Normal Form):**
```
- 1NF + No partial dependencies
```

**3NF (Third Normal Form):**
```
- 2NF + No transitive dependencies
```

**Example: E-commerce**
```sql
-- Normalized (3NF)
users: id, name, email
orders: id, user_id, total, status
order_items: id, order_id, product_id, quantity, price
products: id, name, description, price
```

**Pros:**
```
✓ No data duplication
✓ Easy updates (single source of truth)
✓ Data integrity
✓ Less storage
```

**Cons:**
```
✗ Complex queries (JOINs)
✗ Slower reads
✗ Not suitable for distributed systems
```

---

### Denormalization

**Goal:** Optimize read performance by duplicating data

**Example: E-commerce**
```sql
-- Denormalized
orders: id, user_id, user_name, user_email, total, status

order_items: id, order_id, product_id, product_name,
             product_description, quantity, price
```

**Pros:**
```
✓ Fast reads (no JOINs)
✓ Suitable for distributed systems
✓ Reduced query complexity
```

**Cons:**
```
✗ Data duplication
✗ Complex updates (multiple places)
✗ Data inconsistency risk
✗ More storage
```

---

### Decision Guide

**Use Normalization when:**
```
- Data integrity is critical
- Write-heavy workload
- Storage is expensive
- Complex updates common
- Single database server
```

**Use Denormalization when:**
```
- Read-heavy workload
- Performance is critical
- Distributed system
- Data rarely changes
- Can tolerate slight inconsistency
```

**Hybrid Approach:**
```
- Normalize for writes (master DB)
- Denormalize for reads (read replicas, caches, search indexes)
- Use ETL/CDC to keep denormalized data updated
```

---

## ACID vs BASE

### ACID (Relational Databases)

**Atomicity:**
```
Transaction succeeds completely or fails completely
No partial updates
```

**Consistency:**
```
Database remains in valid state
Constraints enforced
```

**Isolation:**
```
Concurrent transactions don't interfere
Serializable execution
```

**Durability:**
```
Committed data persists (survives crashes)
Write-ahead logging
```

**Example:**
```sql
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- Both updates or neither
```

---

### BASE (NoSQL Databases)

**Basically Available:**
```
System responds to requests (even if stale)
Prioritizes availability over consistency
```

**Soft state:**
```
State may change without input
Eventual consistency in progress
```

**Eventually consistent:**
```
System becomes consistent over time
Temporary inconsistencies acceptable
```

**Example:**
```
User updates profile → Change replicates to all nodes over time
Reads may return old data briefly
```

---

### ACID vs BASE Comparison

| Aspect | ACID | BASE |
|--------|------|------|
| Consistency | Strong | Eventual |
| Availability | Lower | Higher |
| Scalability | Vertical | Horizontal |
| Complexity | Simpler | More complex |
| Use Case | Banking | Social media |

---

## Database Selection Guide

### Decision Tree

```
1. Need transactions across multiple records?
   YES → SQL (PostgreSQL, MySQL)
   NO → Continue

2. Need complex queries with JOINs?
   YES → SQL
   NO → Continue

3. Data structure well-defined and stable?
   YES → SQL
   NO → Continue

4. High write/read volume (>10k RPS)?
   YES → NoSQL
   NO → SQL (simpler)

5. What's your data model?
   - Key-value pairs → Redis, DynamoDB
   - Documents → MongoDB, CouchDB
   - Time-series → Cassandra, InfluxDB
   - Graphs → Neo4j, Neptune
```

### Popular Database Use Cases

#### PostgreSQL
```
✓ Complex queries, JOINs
✓ ACID transactions
✓ JSON support
✓ Full-text search
Use: E-commerce, SaaS applications
```

#### MySQL
```
✓ Read-heavy workloads
✓ Simple queries
✓ Replication
Use: Blogs, CMS, small applications
```

#### MongoDB
```
✓ Flexible schema
✓ Document storage
✓ Horizontal scaling
Use: Content management, catalogs, IoT
```

#### Redis
```
✓ In-memory (fast)
✓ Caching
✓ Pub/Sub
✓ Leaderboards
Use: Session store, cache, real-time
```

#### Cassandra
```
✓ Time-series data
✓ High write throughput
✓ Distributed
Use: IoT, logging, analytics
```

#### Elasticsearch
```
✓ Full-text search
✓ Log analytics
✓ Real-time search
Use: Search engines, monitoring
```

#### DynamoDB
```
✓ Serverless
✓ Low latency
✓ Auto-scaling
Use: Gaming, IoT, mobile backends
```

---

## Key Takeaways

1. **SQL vs NoSQL:** Choose SQL for complex queries/transactions, NoSQL for scale/flexibility
2. **Scaling:** Start with read replicas, shard when necessary
3. **Sharding:** Hash-based for even distribution, Geographic for compliance
4. **Replication:** Async for performance, Sync for durability
5. **Normalization:** Normalize for writes, denormalize for reads
6. **ACID vs BASE:** ACID for consistency, BASE for availability
7. **Selection:** Match database to workload, not hype

---

[← Previous: Key Concepts](./02-key-concepts.md) | [Next: API Design →](./04-api-design.md)
