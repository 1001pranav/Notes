# System Design Interview Guide

## Table of Contents
- [Understanding System Design Interviews](#understanding-system-design-interviews)
- [The Framework](#the-framework)
- [Step-by-Step Interview Process](#step-by-step-interview-process)
- [Common Interview Questions](#common-interview-questions)
- [Tips and Best Practices](#tips-and-best-practices)
- [What Interviewers Look For](#what-interviewers-look-for)
- [Red Flags to Avoid](#red-flags-to-avoid)
- [Example Walkthrough](#example-walkthrough)

---

## Understanding System Design Interviews

### What Are They?

Open-ended interviews where you design large-scale systems. No single "correct" answer exists.

**Duration:** 45-60 minutes

**Goal:** Demonstrate your ability to:
- Think through complex problems
- Make trade-off decisions
- Design scalable systems
- Communicate effectively

### Why Do Companies Ask?

1. **Assess technical depth**: Beyond coding, can you architect systems?
2. **Problem-solving skills**: How do you break down ambiguous problems?
3. **Communication**: Can you explain technical concepts clearly?
4. **Experience**: Have you built/scaled real systems?
5. **Collaboration**: How do you handle feedback and iterate?

### Common Misconceptions

**❌ "I need to know every technology"**
✅ Focus on fundamentals: databases, caching, load balancing

**❌ "There's one perfect solution"**
✅ Multiple valid approaches exist; trade-offs matter

**❌ "I should jump into coding"**
✅ Spend time understanding requirements first

**❌ "I need to design everything in detail"**
✅ Focus on high-level architecture, dive deep where needed

---

## The Framework

Use a structured approach to tackle any system design question.

### The READSTODEM Framework

**R** - Requirements (Functional & Non-functional)
**E** - Estimation (Scale, storage, bandwidth)
**A** - API Design
**D** - Data Model
**S** - System Architecture (High-level)
**T** - Technology Choices
**O** - Optimize & Bottlenecks
**D** - Deep Dives
**E** - Edge Cases
**M** - Monitoring & Maintenance

---

## Step-by-Step Interview Process

### Step 1: Requirements Gathering (5-10 minutes)

**Ask clarifying questions. Never assume.**

#### Functional Requirements

What should the system do?

**Example Questions:**
- "Who are the users of this system?"
- "What are the core features we need to support?"
- "Are there any features we can deprioritize?"
- "What's the expected user flow?"

**Example (Design Twitter):**
```
Functional Requirements:
✓ Users can post tweets (280 characters)
✓ Users can follow other users
✓ Users can view their timeline (feed of tweets from people they follow)
✓ Users can like tweets
✗ Direct messaging (out of scope)
✗ Notifications (out of scope for this interview)
```

#### Non-Functional Requirements

How should the system perform?

**Questions to ask:**
- "How many users are we targeting?"
- "What's the expected read/write ratio?"
- "What's the acceptable latency?"
- "Do we need high availability?"
- "Consistency vs Availability trade-off?"

**Example (Design Twitter):**
```
Non-Functional Requirements:
• Scale: 500M users, 100M daily active users
• Read-heavy: 100:1 read/write ratio
• Latency: Timeline loads in < 500ms
• Availability: 99.99% uptime
• Consistency: Eventual consistency is acceptable
```

### Step 2: Capacity Estimation (3-5 minutes)

Back-of-the-envelope calculations.

**Template:**
```
Traffic:
• Daily active users (DAU): ___
• Actions per user per day: ___
• Total daily requests: DAU × actions = ___
• QPS (queries per second): total / 86,400 = ___
• Peak QPS: QPS × 3 (or specified) = ___

Storage:
• Data size per item: ___
• Items per day: ___
• Daily storage: items × size = ___
• Storage for X years: daily × 365 × X = ___
• With replication: storage × 3 = ___

Bandwidth:
• Incoming: writes/sec × data size = ___
• Outgoing: reads/sec × data size = ___

Memory (for caching):
• Cache X% of hot data
• Memory needed: ___
```

**Example (Design URL Shortener):**
```
Traffic:
• 100M new URLs per month = 3.3M/day
• Write QPS: 3.3M / 86,400 ≈ 40/sec
• Read/Write ratio: 100:1
• Read QPS: 4,000/sec
• Peak: 12,000 reads/sec, 120 writes/sec

Storage:
• 500 bytes per URL (including short code, long URL, metadata)
• 3.3M URLs/day × 500 bytes = 1.65 GB/day
• 5 years: 1.65 GB × 365 × 5 = 3 TB
• With replication (3x): 9 TB

Bandwidth:
• Incoming: 40/sec × 500 bytes = 20 KB/sec
• Outgoing: 4,000/sec × 500 bytes = 2 MB/sec

Cache:
• 20% of URLs account for 80% of traffic (Pareto)
• Cache 20% of daily reads: 0.2 × 4,000/sec × 86,400 = 69M requests
• Unique URLs: ~7M
• Memory: 7M × 500 bytes = 3.5 GB
```

### Step 3: API Design (2-3 minutes)

Define the interfaces.

**Template:**
```
POST /api/v1/resource
Request: { ... }
Response: { ... }

GET /api/v1/resource/{id}
Response: { ... }
```

**Example (URL Shortener):**
```javascript
// Create short URL
POST /api/v1/urls
Request: {
  "longUrl": "https://example.com/very/long/url",
  "customAlias": "mylink",  // optional
  "expirationDate": "2025-12-31"  // optional
}
Response: {
  "shortUrl": "https://short.ly/abc123",
  "longUrl": "https://example.com/very/long/url",
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-12-31T23:59:59Z"
}

// Redirect
GET /{shortCode}
Response: 302 Redirect to long URL

// Analytics (optional)
GET /api/v1/urls/{shortCode}/stats
Response: {
  "totalClicks": 1542,
  "clicksByDate": {...},
  "clicksByCountry": {...}
}
```

### Step 4: Data Model (3-5 minutes)

Design the database schema.

**Example (URL Shortener):**
```sql
-- URLs table
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0,

  INDEX idx_short_code (short_code),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Analytics table (optional)
CREATE TABLE clicks (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(10),
  clicked_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(2),

  INDEX idx_short_code (short_code),
  INDEX idx_clicked_at (clicked_at)
);
```

### Step 5: High-Level Design (10-15 minutes)

Draw the architecture diagram.

**Start simple, then elaborate:**

```
Level 1 - Basic:
Client → Server → Database

Level 2 - Add Load Balancer:
Client → Load Balancer → Servers → Database

Level 3 - Add Cache:
Client → Load Balancer → Servers → Cache/Database

Level 4 - Full Architecture:
                DNS
                 ↓
            Load Balancer
                 ↓
        ┌────────┼────────┐
        ↓        ↓        ↓
      App      App      App
      Server   Server   Server
        ↓        ↓        ↓
    Redis Cache (Cluster)
        ↓
    ┌───┴───┬───────┐
    ↓       ↓       ↓
  Master  Slave   Slave
    DB      DB      DB
```

**Components to consider:**
- **Load Balancer**: Distribute traffic
- **Application Servers**: Business logic
- **Cache**: Fast data access (Redis)
- **Database**: Persistent storage
- **CDN**: Static content delivery
- **Message Queue**: Async processing
- **Object Storage**: Images, files (S3)

### Step 6: Detailed Component Design (10-15 minutes)

Deep dive into critical components.

**Interviewer might ask:** "How would you generate the short code?"

```javascript
// Approach 1: Hash-based
function generateShortCode(longUrl) {
  const hash = md5(longUrl);
  const base62 = hash.substring(0, 7);  // First 7 chars
  return base62;
}
// Pros: Deterministic (same URL = same code)
// Cons: Collisions possible

// Approach 2: Counter-based
let counter = 0;
function generateShortCode() {
  counter++;
  return base62Encode(counter);  // 1 → "b", 2 → "c", ...
}
// Pros: No collisions, sequential
// Cons: Predictable, needs distributed counter

// Approach 3: Random + Collision Check (RECOMMENDED)
function generateShortCode() {
  while (true) {
    const code = randomBase62String(7);  // a-zA-Z0-9
    const exists = await checkIfExists(code);
    if (!exists) return code;
  }
}
// Pros: Random, URL-friendly
// Cons: Need collision check (rare with 62^7 combinations)
```

### Step 7: Identify Bottlenecks & Optimize (5-10 minutes)

Discuss potential issues and solutions.

**Common Bottlenecks:**

1. **Database becomes bottleneck**
   - Solution: Read replicas, caching, sharding

2. **Cache misses**
   - Solution: Increase cache size, pre-warm cache

3. **Single point of failure**
   - Solution: Redundancy, multi-region

4. **Hot URLs (celebrities)**
   - Solution: CDN, distributed cache

**Trade-offs to discuss:**
- **SQL vs NoSQL**: Structure vs Scale
- **Strong vs Eventual Consistency**: Correctness vs Availability
- **Normalization vs Denormalization**: Storage vs Performance
- **Sync vs Async**: Latency vs Reliability

### Step 8: Address Edge Cases (2-3 minutes)

Think about corner cases.

**Examples:**
- What if two users try to create the same custom alias?
- What happens when a URL expires?
- How do we handle malicious URLs?
- What if a user deletes a URL?
- Rate limiting to prevent abuse?

---

## Common Interview Questions

### Category 1: Social Media

1. **Design Twitter/X**
   - Focus: Timeline generation, follow relationships, trending

2. **Design Instagram**
   - Focus: Image storage, feed generation, like/comment

3. **Design Facebook News Feed**
   - Focus: Ranking algorithm, real-time updates

4. **Design LinkedIn**
   - Focus: Connection graph, job recommendations

### Category 2: Messaging

5. **Design WhatsApp**
   - Focus: Message delivery, online status, media sharing

6. **Design Slack**
   - Focus: Channels, real-time messaging, search

7. **Design Discord**
   - Focus: Voice channels, text chat, presence

### Category 3: Video/Content

8. **Design YouTube**
   - Focus: Video upload, streaming, recommendations

9. **Design Netflix**
   - Focus: Video encoding, CDN, personalization

10. **Design TikTok**
    - Focus: Short video upload, feed algorithm

### Category 4: E-commerce

11. **Design Amazon**
    - Focus: Product catalog, inventory, search

12. **Design Uber/Lyft**
    - Focus: Matching, real-time tracking, pricing

13. **Design DoorDash**
    - Focus: Restaurant matching, delivery routing

### Category 5: Utilities

14. **Design URL Shortener (bit.ly)**
    - Focus: Hash generation, redirection, analytics

15. **Design Pastebin**
    - Focus: Text storage, expiration, syntax highlighting

16. **Design Google Drive**
    - Focus: File storage, sync, sharing

17. **Design Dropbox**
    - Focus: File sync, deduplication, versioning

### Category 6: Search/Analytics

18. **Design Google Search**
    - Focus: Crawler, indexing, ranking

19. **Design Typeahead/Autocomplete**
    - Focus: Prefix matching, ranking, caching

20. **Design Web Crawler**
    - Focus: URL discovery, distributed crawling, politeness

### Category 7: Infrastructure

21. **Design Distributed Cache (Redis)**
    - Focus: Sharding, replication, eviction

22. **Design Rate Limiter**
    - Focus: Algorithms, distributed implementation

23. **Design Notification System**
    - Focus: Push, email, SMS, prioritization

24. **Design Job Scheduler**
    - Focus: Distributed tasks, retries, monitoring

---

## Tips and Best Practices

### Communication

1. **Think out loud**: Share your thought process
2. **Ask questions**: Clarify requirements before designing
3. **Use the whiteboard**: Draw diagrams (even in virtual interviews)
4. **Check in**: "Does this make sense?" "Should I go deeper here?"
5. **Time management**: Don't spend 30 minutes on one component

### Technical

1. **Start simple, then iterate**: Don't over-engineer initially
2. **State your assumptions**: "I'm assuming eventual consistency is okay..."
3. **Discuss trade-offs**: "We could use X, but Y has these benefits..."
4. **Use numbers**: "This will handle 10K QPS with 3 servers..."
5. **Know the fundamentals**: Don't need to know every tool, but understand concepts

### Drawing Diagrams

**Good diagram:**
```
┌─────────┐
│  Client │
└────┬────┘
     │ HTTPS
     ↓
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
   ┌───┴───┬───────┐
   ↓       ↓       ↓
┌─────┐ ┌─────┐ ┌─────┐
│ App │ │ App │ │ App │
└──┬──┘ └──┬──┘ └──┬──┘
   └───────┼───────┘
           ↓
      ┌────────┐
      │  Cache │
      └────┬───┘
           ↓
      ┌────────┐
      │   DB   │
      └────────┘
```

**Key elements:**
- Boxes for components
- Arrows for data flow
- Labels for protocols/data
- Clear hierarchy

### Time Allocation

**45-minute interview:**
```
0-5 min:   Clarify requirements
5-8 min:   Capacity estimation
8-10 min:  API design
10-13 min: Data model
13-25 min: High-level design
25-40 min: Deep dive & optimization
40-45 min: Edge cases, wrap up
```

---

## What Interviewers Look For

### 1. Problem-Solving Approach

✓ Structured thinking
✓ Breaking down complex problems
✓ Asking right questions
✓ Not jumping to solutions

### 2. Technical Knowledge

✓ Understanding of databases, caching, load balancing
✓ Awareness of trade-offs
✓ Scalability patterns
✓ Not just memorizing solutions

### 3. Communication

✓ Clear explanations
✓ Justifying decisions
✓ Listening to feedback
✓ Collaborative attitude

### 4. Practical Experience

✓ Real-world considerations
✓ Operational concerns (monitoring, deployment)
✓ Edge cases
✓ Cost awareness

### 5. Depth and Breadth

✓ High-level architecture (breadth)
✓ Deep dive into components (depth)
✓ Balance between both
✓ Knowing when to go deep

---

## Red Flags to Avoid

❌ **Jumping to solution without asking questions**
❌ **Not considering scale (assumes small system)**
❌ **Over-engineering (using every technology you know)**
❌ **Not discussing trade-offs ("We'll just use X")**
❌ **Ignoring interviewer hints/feedback**
❌ **Getting stuck on one component (poor time management)**
❌ **Not drawing diagrams (just talking)**
❌ **Saying "I don't know" without trying**
❌ **Being defensive about design choices**
❌ **Forgetting about operations (monitoring, deployment)**

---

## Example Walkthrough: Design Twitter

### 1. Requirements (5 min)

**Interviewer:** "Design Twitter."

**You:** "Let me clarify the requirements:

**Functional:**
- Can users post tweets up to 280 characters?
- Can users follow other users?
- Do users see a timeline of tweets from people they follow?
- Are we including likes, retweets?
- What about direct messages, trending topics?

**Interviewer:** "Focus on posting tweets, following users, and viewing timelines. Skip DMs and trending."

**You:** "Got it. For non-functional requirements:
- How many users are we targeting?
- What's the read/write ratio?
- Consistency requirements?

**Interviewer:** "500M users, 100M daily active. Very read-heavy, maybe 100:1. Eventual consistency is fine."

### 2. Capacity Estimation (3 min)

**You:** "Let me estimate capacity:

**Traffic:**
```
100M daily active users
Each user: posts 2 tweets/day, reads 200 tweets/day

Writes: 100M × 2 = 200M tweets/day = 2,300 tweets/sec
Reads: 100M × 200 = 20B reads/day = 231K reads/sec
Peak (3x): 7K writes/sec, 693K reads/sec
```

**Storage:**
```
Tweet: 280 chars + metadata ≈ 500 bytes
200M tweets/day × 500 bytes = 100 GB/day
5 years: 182 TB (with replication: 546 TB)
```

**Memory:**
```
Cache 20% of hot tweets: ~20 GB
```

### 3. API Design (2 min)

```javascript
POST /api/v1/tweets
{
  "userId": 123,
  "content": "Hello world!",
  "mediaUrls": []
}

GET /api/v1/timeline
?userId=123&limit=20&offset=0

POST /api/v1/follow
{
  "followerId": 123,
  "followeeId": 456
}
```

### 4. Data Model (3 min)

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE tweets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  content TEXT,
  created_at TIMESTAMP,
  INDEX idx_user_created (user_id, created_at)
);

CREATE TABLE follows (
  follower_id BIGINT,
  followee_id BIGINT,
  created_at TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  INDEX idx_follower (follower_id)
);
```

### 5. High-Level Design (10 min)

```
            Client Apps
                ↓
            CDN (static)
                ↓
          Load Balancer
                ↓
       ┌────────┼────────┐
       ↓        ↓        ↓
     API      API      API
    Servers  Servers  Servers
       ↓
    ┌──┴───┬────────┐
    ↓      ↓        ↓
  Redis   Kafka   Object
  Cache   (async)  Storage(S3)
    ↓               (media)
Database Cluster
(Sharded by user_id)
```

**You:** "For timeline generation, we have two approaches:

**Fanout on Write (Push Model):**
```
User posts tweet → Write to all followers' timelines
Pros: Fast reads
Cons: Slow writes (celebrities have millions of followers)
```

**Fanout on Read (Pull Model):**
```
User requests timeline → Fetch from all followed users
Pros: Fast writes
Cons: Slow reads (query many users)
```

**Hybrid Approach:**
- Regular users: Fanout on write
- Celebrities (>1M followers): Fanout on read
- Merge results at read time

### 6. Deep Dive (10 min)

**Interviewer:** "How do you handle a celebrity with 100M followers posting a tweet?"

**You:** "Great question. A few strategies:

**1. Don't fanout to all followers:**
```
- Only fanout to active followers (logged in recently)
- Others fetch on demand when they log in
```

**2. Async processing:**
```
- Queue the fanout task
- Process in batches
- Takes minutes instead of blocking
```

**3. Tiered approach:**
```
- Super active users: Fanout immediately
- Regular users: Fanout within 1 hour
- Inactive users: On-demand only
```

**4. Caching:**
```
- Cache celebrity tweets separately
- Merge with personalized timeline
- Reduces database load
```"

### 7. Wrap Up (2 min)

**You:** "To summarize:
- Hybrid fanout model handles both regular and celebrity users
- Redis cache for fast timeline reads
- Kafka for async processing
- Sharded database for scale
- CDN for media

**Trade-offs we made:**
- Eventual consistency (faster, scalable)
- Hybrid model (complexity vs performance)
- Sharding (complexity vs scale)

**Not covered but worth mentioning:**
- Monitoring and alerting
- Rate limiting
- Spam detection
- Analytics"

---

## Preparation Checklist

### Must Know Concepts

✅ Load balancers (L4 vs L7, algorithms)
✅ Caching (strategies, eviction policies)
✅ Databases (SQL vs NoSQL, sharding, replication)
✅ CAP theorem
✅ Consistency patterns
✅ Message queues
✅ CDN
✅ API design (REST, pagination)
✅ Scaling (horizontal vs vertical)

### Should Know

✅ Microservices vs Monolith
✅ Circuit breaker
✅ Rate limiting
✅ Distributed tracing
✅ Monitoring
✅ Security basics

### Nice to Have

✅ Specific technologies (Kafka, Redis, PostgreSQL)
✅ Cloud platforms (AWS, GCP, Azure)
✅ Container orchestration (Kubernetes)

### Practice

1. **Solve 15-20 problems** from common questions list
2. **Draw diagrams** for each
3. **Time yourself** (45 minutes per problem)
4. **Practice explaining out loud**
5. **Mock interviews** with peers or mentors

---

## Final Tips

1. **Relax**: No one knows everything. Show your thinking process.
2. **Be honest**: If you don't know something, say so and make an educated guess.
3. **Stay high-level**: Go deep only when asked.
4. **It's a conversation**: Not an exam. Collaborate with the interviewer.
5. **Have fun**: System design is creative. Enjoy the problem-solving!

**Good luck with your interview! 🚀**
