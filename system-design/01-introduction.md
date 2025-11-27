# Introduction to System Design

## Table of Contents
- [What is System Design?](#what-is-system-design)
- [Why is System Design Important?](#why-is-system-design-important)
- [Key Goals of System Design](#key-goals-of-system-design)
- [System Design Thinking Framework](#system-design-thinking-framework)
- [When to Think About System Design](#when-to-think-about-system-design)

---

## What is System Design?

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements. It's the blueprint for building scalable, reliable, and maintainable software systems.

### Key Aspects

**Architecture Planning**: Determining how different components of a system will interact with each other, what technologies to use, and how to structure the overall system.

**Component Design**: Breaking down a large system into smaller, manageable components that can be developed, tested, and maintained independently.

**Data Flow Design**: Planning how data will move through the system, where it will be stored, how it will be processed, and how it will be retrieved.

**Infrastructure Planning**: Deciding on servers, databases, caching layers, load balancers, and other infrastructure components needed to support the system.

---

## Why is System Design Important?

### 1. **Handles Growth and Scale**
As your application grows from 100 users to 100 million users, the system must scale accordingly. Poor system design leads to:
- Slow response times
- System crashes
- Data inconsistencies
- Inability to handle traffic spikes

### 2. **Cost Optimization**
Good system design helps optimize costs by:
- Efficient resource utilization
- Proper caching strategies
- Choosing the right database for the job
- Auto-scaling based on demand

### 3. **Reliability and Availability**
Users expect systems to be available 24/7. System design ensures:
- Fault tolerance
- Disaster recovery
- High availability (99.9%, 99.99%, 99.999% uptime)
- Graceful degradation

### 4. **Maintainability**
Well-designed systems are easier to:
- Debug and troubleshoot
- Update and enhance
- Refactor and optimize
- Document and understand

### 5. **Team Collaboration**
Clear system design enables:
- Multiple teams to work independently
- Better communication about system behavior
- Consistent architecture decisions
- Easier onboarding for new developers

### 6. **Career Growth**
System design skills are essential for:
- Senior engineering roles
- Technical leadership positions
- Architecture decisions
- Technical interviews at top companies

---

## Key Goals of System Design

Every system design should aim to achieve these fundamental goals:

### 1. **Scalability**

The ability of a system to handle increased load by adding resources.

**Types of Scalability:**

**Vertical Scaling (Scale Up)**
- Adding more power to existing machines (CPU, RAM, disk)
- Pros: Simple, no code changes needed
- Cons: Hardware limits, single point of failure, expensive
- Example: Upgrading from 16GB RAM to 64GB RAM

**Horizontal Scaling (Scale Out)**
- Adding more machines to the pool
- Pros: No hard limits, fault tolerant, cost-effective
- Cons: Complex, requires load balancing, data consistency challenges
- Example: Adding 5 more web servers to handle traffic

**Real-World Example:**
```
Initial: 1 server handling 1,000 requests/sec
Growth: Need to handle 100,000 requests/sec

Vertical Scaling Approach:
- Upgrade to a super powerful server
- Limitation: Max ~10,000 requests/sec

Horizontal Scaling Approach:
- Add 100 medium-sized servers behind a load balancer
- Each handles 1,000 requests/sec
- Can add more servers as needed
```

### 2. **Reliability**

The probability that a system will fail over a given time period. A reliable system continues to work correctly even when things go wrong.

**Key Concepts:**

**Fault Tolerance**
- System continues operating despite component failures
- Redundancy: Multiple instances of critical components
- Example: Database replicas, multiple application servers

**Error Handling**
- Graceful degradation
- Fallback mechanisms
- Retry logic with exponential backoff

**Data Integrity**
- ACID transactions for critical operations
- Data validation and constraints
- Backup and recovery mechanisms

**Real-World Example:**
```
E-commerce Checkout System:
- Payment service is down
- Instead of showing error page:
  - Queue the order
  - Process payment asynchronously
  - Send confirmation email when processed
  - User sees "Order received, processing payment"
```

### 3. **Availability**

The percentage of time a system is operational and accessible.

**Availability Levels:**

| Availability | Downtime per Year | Downtime per Month | Downtime per Week |
|--------------|-------------------|--------------------|--------------------|
| 90% (one nine) | 36.5 days | 3 days | 16.8 hours |
| 99% (two nines) | 3.65 days | 7.2 hours | 1.68 hours |
| 99.9% (three nines) | 8.76 hours | 43.8 minutes | 10.1 minutes |
| 99.99% (four nines) | 52.56 minutes | 4.32 minutes | 1.01 minutes |
| 99.999% (five nines) | 5.26 minutes | 25.9 seconds | 6.05 seconds |

**Achieving High Availability:**
- Eliminate single points of failure
- Multi-region deployment
- Automatic failover
- Health checks and monitoring
- Redundant network paths

**Real-World Example:**
```
Netflix Availability Strategy:
- Multiple AWS regions
- Chaos Monkey (randomly kills servers)
- Automatic traffic routing
- Cached content at edge locations
- Achieves 99.99%+ availability
```

### 4. **Maintainability**

The ease with which a system can be modified to fix defects, improve performance, or adapt to a changed environment.

**Principles:**

**Modularity**
- Break system into independent modules
- Each module has a single responsibility
- Loose coupling, high cohesion

**Documentation**
- Architecture diagrams
- API documentation
- Code comments for complex logic
- Runbooks for operations

**Code Quality**
- Consistent coding standards
- Automated testing
- Code reviews
- Refactoring

**Observability**
- Comprehensive logging
- Metrics and dashboards
- Distributed tracing
- Alerting

**Real-World Example:**
```
Microservices Architecture:
- User Service (manages users)
- Order Service (manages orders)
- Payment Service (processes payments)
- Each can be updated independently
- Bug in Payment Service doesn't require redeploying entire system
```

### 5. **Performance**

How quickly the system responds to user requests.

**Key Metrics:**

**Latency**
- Time to complete a single operation
- Measured in milliseconds
- Example: Database query takes 50ms

**Throughput**
- Number of operations per unit time
- Measured in requests/second
- Example: API handles 10,000 requests/second

**Response Time Percentiles**
- p50 (median): 50% of requests complete within this time
- p95: 95% of requests complete within this time
- p99: 99% of requests complete within this time

**Performance Optimization Strategies:**
- Caching (Redis, CDN)
- Database indexing
- Query optimization
- Asynchronous processing
- Load balancing
- Compression

**Real-World Example:**
```
Social Media Feed:
- Without caching: 2 seconds load time
- With Redis caching: 100ms load time
- Pre-computed timelines: 50ms load time
```

### 6. **Consistency**

Ensuring all nodes in a distributed system see the same data at the same time.

**Types:**

**Strong Consistency**
- All reads return the most recent write
- Example: Bank account balance

**Eventual Consistency**
- Reads may return stale data temporarily
- All nodes eventually converge to same state
- Example: Social media like counts

**Causal Consistency**
- Related operations appear in the correct order
- Example: Comment appears after the post

---

## System Design Thinking Framework

When approaching any system design problem, follow this framework:

### Step 1: **Understand the Requirements**

**Functional Requirements**
- What should the system do?
- What features are needed?
- What are the core use cases?

Example: Design a URL shortener
- Create short URLs from long URLs
- Redirect short URLs to original URLs
- Track click analytics

**Non-Functional Requirements**
- How should the system perform?
- What are the constraints?

Example:
- Handle 1 million URL creations per day
- Redirects should be fast (<50ms)
- Short URLs should be 7 characters
- System should be highly available (99.99%)

### Step 2: **Capacity Estimation**

Calculate the scale and resources needed:

**Traffic Estimates**
```
URL Shortener Example:
- 1 million URL creations per day
- Read:Write ratio = 100:1 (100 million redirects per day)
- QPS for writes = 1,000,000 / 86,400 ≈ 12 writes/sec
- QPS for reads = 100,000,000 / 86,400 ≈ 1,200 reads/sec
- Peak QPS (3x average) = 36 writes/sec, 3,600 reads/sec
```

**Storage Estimates**
```
- Average URL length = 500 bytes
- 1 million URLs per day
- Storage per day = 500 MB
- Storage for 10 years = 500 MB * 365 * 10 = 1.8 TB
```

**Bandwidth Estimates**
```
- Write: 12 requests/sec * 500 bytes = 6 KB/sec
- Read: 1,200 requests/sec * 500 bytes = 600 KB/sec
```

**Memory Estimates (for caching)**
```
- Cache 20% of hot URLs
- 100 million requests per day
- 20% = 20 million requests
- Unique URLs (assuming Pareto distribution) = 2 million URLs
- Memory needed = 2 million * 500 bytes = 1 GB
```

### Step 3: **Define the API**

Design the interfaces for the system:

```javascript
// URL Shortener API

// Create short URL
POST /api/v1/urls
Request: {
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "mylink", // optional
  "expirationDate": "2025-12-31" // optional
}
Response: {
  "shortUrl": "https://short.ly/abc1234",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2025-01-15T10:30:00Z"
}

// Redirect short URL
GET /{shortCode}
Response: 302 Redirect to original URL

// Get analytics
GET /api/v1/urls/{shortCode}/analytics
Response: {
  "shortCode": "abc1234",
  "totalClicks": 15420,
  "clicksByCountry": {...},
  "clicksByDate": {...}
}
```

### Step 4: **High-Level Design**

Create a block diagram showing major components:

```
User Request
    ↓
Load Balancer
    ↓
API Servers (multiple instances)
    ↓
┌──────────────┬──────────────┐
↓              ↓              ↓
Cache       Database    Analytics Queue
(Redis)    (PostgreSQL)  (Kafka)
```

### Step 5: **Detailed Component Design**

Deep dive into each component:

**URL Generation Service**
- Base62 encoding (a-z, A-Z, 0-9)
- 7 characters = 62^7 = 3.5 trillion combinations
- Use counter or hash-based generation

**Database Schema**
```sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  INDEX idx_short_code (short_code),
  INDEX idx_user_id (user_id)
);
```

**Caching Strategy**
- Cache popular URLs in Redis
- TTL: 24 hours
- LRU eviction policy

### Step 6: **Identify Bottlenecks and Trade-offs**

**Potential Issues:**
- Database becomes a bottleneck at high scale
- Single point of failure
- Cache misses cause database load

**Solutions:**
- Database sharding by short_code
- Read replicas for redirects
- Implement database connection pooling
- Add circuit breakers for fault tolerance

**Trade-offs:**
- Strong consistency vs Availability (CAP theorem)
- Storage cost vs Cache hit rate
- Custom aliases vs Random generation (collision handling)

### Step 7: **Scale and Optimize**

- Add monitoring and alerting
- Implement rate limiting
- Add CDN for static content
- Database partitioning
- Asynchronous analytics processing

---

## When to Think About System Design

### Early Stage Startups
- Focus on MVP and speed
- Use managed services (AWS RDS, Redis Cloud)
- Monolith is often fine initially
- Plan for scale but don't over-engineer

### Growth Phase
- Monitor performance metrics
- Identify bottlenecks
- Start thinking about caching
- Plan database optimization

### Scale Phase
- Implement horizontal scaling
- Consider microservices for complex domains
- Multi-region deployment
- Advanced caching strategies
- Message queues for async processing

### Enterprise Scale
- Service mesh
- Multi-cloud strategy
- Advanced observability
- Chaos engineering
- Cost optimization

---

## Common Misconceptions

### ❌ "System design is only for big companies"
✅ Even small apps benefit from good design principles. Start simple but design for growth.

### ❌ "Use microservices from day one"
✅ Start with a monolith. Move to microservices when complexity and team size demand it.

### ❌ "Always use the latest technology"
✅ Use proven, stable technologies. New tech has fewer resources and support.

### ❌ "More caching is always better"
✅ Caching adds complexity. Cache what's actually needed based on metrics.

### ❌ "Design everything upfront"
✅ Design for current needs with room to grow. Evolve architecture as requirements change.

---

## Next Steps

Now that you understand the fundamentals, we'll dive deeper into:
- Core concepts (CAP theorem, consistency models)
- System components (load balancers, caches, databases)
- Design patterns and best practices
- Real-world case studies
- Interview preparation strategies

Continue to the next section: [Core Concepts and Principles](./02-core-concepts.md)
