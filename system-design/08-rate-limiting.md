# Rate Limiting and Throttling

Protect your services from overload and abuse.

## Table of Contents
1. [Why Rate Limiting](#why-rate-limiting)
2. [Rate Limiting Algorithms](#rate-limiting-algorithms)
3. [Distributed Rate Limiting](#distributed-rate-limiting)
4. [Implementation Examples](#implementation-examples)
5. [Best Practices](#best-practices)

---

## Why Rate Limiting

### Purposes

**1. Prevent Abuse:**
```
Stop malicious users from overwhelming system
Prevent scraping/crawling
DDoS mitigation
```

**2. Ensure Fair Usage:**
```
Prevent single user from consuming all resources
Quality of service guarantees
```

**3. Cost Control:**
```
Limit API calls to stay within budget
Prevent unexpected scaling costs
```

**4. Stability:**
```
Protect downstream services
Prevent cascading failures
Graceful degradation
```

### Where to Apply

```
API Gateway: Centralized rate limiting
Application: Service-level limits
Database: Query rate limits
Network: Connection limits
```

---

## Rate Limiting Algorithms

### 1. Token Bucket

**Concept:** Bucket holds tokens, request consumes token.

**Behavior:**
```
Bucket capacity: 10 tokens
Refill rate: 1 token/second

Request arrives:
  - Has token? Allow and remove token
  - No token? Reject (429)

Allows bursts up to bucket capacity
```

**Algorithm:**
```javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillRate  // tokens per second
    this.lastRefill = Date.now()
  }

  allow() {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }

    return false
  }

  refill() {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsed * this.refillRate

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

// Usage
const bucket = new TokenBucket(10, 1)  // 10 capacity, 1/sec

if (bucket.allow()) {
  processRequest()
} else {
  return res.status(429).json({ error: 'Rate limit exceeded' })
}
```

**Pros:**
```
✓ Allows bursts
✓ Smooth traffic
✓ Simple implementation
```

**Cons:**
```
✗ Can be difficult to tune
✗ Memory per user
```

**Use Cases:**
```
- API rate limiting
- Network traffic shaping
- AWS API Gateway uses this
```

---

### 2. Leaky Bucket

**Concept:** Requests enter bucket, leak out at constant rate.

**Behavior:**
```
Bucket capacity: 10
Leak rate: 1 request/second

Request arrives:
  - Bucket not full? Add to bucket
  - Bucket full? Reject (429)

Requests processed at constant rate (leak rate)
```

**Algorithm:**
```javascript
class LeakyBucket {
  constructor(capacity, leakRate) {
    this.capacity = capacity
    this.queue = []
    this.leakRate = leakRate  // requests per second
    this.lastLeak = Date.now()
  }

  allow() {
    this.leak()

    if (this.queue.length < this.capacity) {
      this.queue.push(Date.now())
      return true
    }

    return false
  }

  leak() {
    const now = Date.now()
    const elapsed = (now - this.lastLeak) / 1000
    const leakCount = Math.floor(elapsed * this.leakRate)

    if (leakCount > 0) {
      this.queue.splice(0, leakCount)
      this.lastLeak = now
    }
  }
}
```

**Pros:**
```
✓ Constant output rate
✓ Smooth traffic
✓ Good for bursty inputs
```

**Cons:**
```
✗ Queue memory overhead
✗ Slow response during bursts
```

**Use Cases:**
```
- Network traffic shaping
- Ensure constant processing rate
- Protect downstream services
```

---

### 3. Fixed Window Counter

**Concept:** Count requests in fixed time windows.

**Behavior:**
```
Window: 1 minute
Limit: 100 requests

00:00 - 01:00: Count requests
01:00 - 02:00: Reset counter, count again
```

**Algorithm:**
```javascript
class FixedWindowCounter {
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    this.counters = new Map()  // userId -> {count, windowStart}
  }

  allow(userId) {
    const now = Date.now()
    const data = this.counters.get(userId)

    if (!data || now - data.windowStart >= this.windowMs) {
      // New window
      this.counters.set(userId, {
        count: 1,
        windowStart: now
      })
      return true
    }

    if (data.count < this.limit) {
      data.count++
      return true
    }

    return false
  }

  reset(userId) {
    this.counters.delete(userId)
  }
}

// Usage
const limiter = new FixedWindowCounter(100, 60000)  // 100 req/min

if (limiter.allow(userId)) {
  processRequest()
} else {
  return res.status(429).json({ error: 'Rate limit exceeded' })
}
```

**Pros:**
```
✓ Simple
✓ Memory efficient
✓ Easy to understand
```

**Cons:**
```
✗ Edge case: 2× requests at window boundary
  Example:
    59:30-60:00 → 100 requests
    60:00-60:30 → 100 requests
    Total: 200 requests in 1 minute
```

**Use Cases:**
```
- Simple rate limiting
- When exact limits not critical
- Low traffic systems
```

---

### 4. Sliding Window Log

**Concept:** Store timestamp of each request, count in sliding window.

**Behavior:**
```
Window: 1 minute
Limit: 100 requests
Current: 12:00:30

Count requests between 11:59:30 and 12:00:30
If < 100: Allow
```

**Algorithm:**
```javascript
class SlidingWindowLog {
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    this.logs = new Map()  // userId -> [timestamps]
  }

  allow(userId) {
    const now = Date.now()
    const userLog = this.logs.get(userId) || []

    // Remove old requests outside window
    const validLog = userLog.filter(timestamp => now - timestamp < this.windowMs)

    if (validLog.length < this.limit) {
      validLog.push(now)
      this.logs.set(userId, validLog)
      return true
    }

    return false
  }
}

// Redis implementation
async function slidingWindowLogRedis(userId, limit, windowMs) {
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowStart = now - windowMs

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Count requests in window
  const count = await redis.zcard(key)

  if (count < limit) {
    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`)
    await redis.expire(key, Math.ceil(windowMs / 1000))
    return true
  }

  return false
}
```

**Pros:**
```
✓ Accurate
✓ No edge cases
✓ Precise sliding window
```

**Cons:**
```
✗ High memory usage (store all timestamps)
✗ More complex
```

**Use Cases:**
```
- Strict rate limiting
- High-value operations (payments)
- When accuracy matters
```

---

### 5. Sliding Window Counter

**Concept:** Weighted count from previous and current window.

**Behavior:**
```
Window: 1 minute
Limit: 100 requests
Current time: 12:00:30

Previous window (11:59-12:00): 80 requests
Current window (12:00-12:01): 40 requests

Estimated count = Previous × (1 - progress) + Current
                = 80 × 0.5 + 40
                = 80 requests
```

**Algorithm:**
```javascript
class SlidingWindowCounter {
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    this.counters = new Map()  // userId -> {prev, current, windowStart}
  }

  allow(userId) {
    const now = Date.now()
    const data = this.counters.get(userId) || {
      prev: 0,
      current: 0,
      windowStart: now
    }

    const elapsed = now - data.windowStart

    if (elapsed >= this.windowMs) {
      // Move to next window
      data.prev = data.current
      data.current = 0
      data.windowStart += this.windowMs
    }

    // Calculate weighted count
    const progress = elapsed / this.windowMs
    const estimatedCount = data.prev * (1 - progress) + data.current

    if (estimatedCount < this.limit) {
      data.current++
      this.counters.set(userId, data)
      return true
    }

    return false
  }
}
```

**Pros:**
```
✓ Accurate (approximation)
✓ Memory efficient
✓ No edge cases like fixed window
```

**Cons:**
```
✗ Slightly complex
✗ Approximation (not exact)
```

**Use Cases:**
```
- Most API rate limiting
- Balance between accuracy and efficiency
- Cloudflare, Stripe use this
```

---

### Comparison

| Algorithm | Accuracy | Memory | Complexity | Bursts |
|-----------|----------|--------|------------|--------|
| Token Bucket | Good | Low | Low | Yes |
| Leaky Bucket | Good | Medium | Medium | No |
| Fixed Window | Poor | Low | Low | Yes (edge) |
| Sliding Log | Excellent | High | Medium | No |
| Sliding Counter | Good | Low | Medium | Controlled |

---

## Distributed Rate Limiting

### Challenge

```
Multiple servers, shared rate limit:
Server 1: 50 requests
Server 2: 50 requests
Total: 100 requests (at limit)

How to coordinate?
```

### Solutions

#### 1. Centralized Store (Redis)

```javascript
const redis = require('redis').createClient()

async function rateLimit(userId, limit, windowMs) {
  const key = `rate_limit:${userId}`

  // Increment counter
  const count = await redis.incr(key)

  // Set expiry on first request
  if (count === 1) {
    await redis.pexpire(key, windowMs)
  }

  return count <= limit
}

// Token bucket in Redis
async function tokenBucketRedis(userId, capacity, refillRate) {
  const key = `tokens:${userId}`
  const script = `
    local tokens_key = KEYS[1]
    local timestamp_key = KEYS[1] .. ":timestamp"
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    local tokens = tonumber(redis.call('get', tokens_key))
    local last_refill = tonumber(redis.call('get', timestamp_key))

    if not tokens then
      tokens = capacity
      last_refill = now
    end

    -- Refill tokens
    local elapsed = (now - last_refill) / 1000
    local tokens_to_add = elapsed * refill_rate
    tokens = math.min(capacity, tokens + tokens_to_add)

    if tokens >= 1 then
      tokens = tokens - 1
      redis.call('set', tokens_key, tokens)
      redis.call('set', timestamp_key, now)
      return 1  -- Allowed
    else
      return 0  -- Denied
    end
  `

  const result = await redis.eval(script, 1, key, capacity, refillRate, Date.now())
  return result === 1
}
```

#### 2. Sticky Sessions

```
Route same user to same server
Each server maintains local rate limit
Simple but limits load balancing flexibility
```

#### 3. Global Rate Limiter Service

```
Dedicated rate limiting service
All servers query it
Can become bottleneck
```

---

## Implementation Examples

### Express.js Middleware

```javascript
const express = require('express')
const redis = require('redis').createClient()
const app = express()

// Rate limiting middleware
async function rateLimitMiddleware(req, res, next) {
  const userId = req.user?.id || req.ip
  const limit = 100
  const windowMs = 60000  // 1 minute

  const key = `rate_limit:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.pexpire(key, windowMs)
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', limit)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count))
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString())

  if (count > limit) {
    return res.status(429).json({
      error: 'Too many requests',
      retry_after: Math.ceil(windowMs / 1000)
    })
  }

  next()
}

app.use(rateLimitMiddleware)

// Per-endpoint limits
app.post('/api/expensive-operation',
  rateLimitMiddleware({ limit: 10, windowMs: 60000 }),
  async (req, res) => {
    // ...
  }
)
```

### Using express-rate-limit

```javascript
const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')

const limiter = rateLimit({
  store: new RedisStore({
    client: redis
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Limit each IP to 100 requests per windowMs
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retry_after: req.rateLimit.resetTime
    })
  }
})

app.use('/api', limiter)

// Different limits for different routes
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5
})

app.post('/api/auth/login', strictLimiter, loginHandler)
```

### API Gateway (Kong)

```yaml
# Kong rate limiting plugin
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
      policy: redis
      redis_host: redis-server
      redis_port: 6379
      fault_tolerant: true  # If Redis down, don't block
```

### Nginx

```nginx
# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=1r/s;

    server {
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            # burst: Allow 20 requests burst
            # nodelay: Don't delay burst requests

            limit_req_status 429;
            limit_req_log_level warn;

            proxy_pass http://backend;
        }

        location /api/auth/login {
            limit_req zone=login_limit burst=5;
            proxy_pass http://backend;
        }
    }
}
```

---

## Best Practices

### 1. Return Appropriate Headers

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642345678
Retry-After: 60

{
  "error": "Rate limit exceeded",
  "message": "You have exceeded 100 requests per minute",
  "retry_after": 60
}
```

### 2. Different Limits for Different Operations

```javascript
const limits = {
  read: { limit: 1000, window: 60000 },     // 1000/min
  write: { limit: 100, window: 60000 },     // 100/min
  delete: { limit: 10, window: 60000 },     // 10/min
  expensive: { limit: 5, window: 60000 }    // 5/min
}
```

### 3. Tiered Rate Limits

```javascript
const tierLimits = {
  free: { requests: 100, window: 3600000 },       // 100/hour
  basic: { requests: 1000, window: 3600000 },     // 1000/hour
  premium: { requests: 10000, window: 3600000 },  // 10000/hour
  enterprise: { requests: -1, window: 0 }         // Unlimited
}

const userLimit = tierLimits[user.tier]
```

### 4. Whitelist Important Clients

```javascript
const whitelist = ['admin-user-id', '10.0.1.5']

if (whitelist.includes(userId)) {
  return next()  // Skip rate limiting
}
```

### 5. Graceful Degradation

```javascript
try {
  const allowed = await rateLimitCheck(userId)
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }
} catch (err) {
  // Redis down - fail open (allow request)
  logger.error('Rate limiter error:', err)
}
```

### 6. Monitor and Alert

```javascript
// Track rate limit hits
metrics.increment('rate_limit.exceeded', {
  endpoint: req.path,
  user_id: userId
})

// Alert if many users hitting limits
if (exceedCount > threshold) {
  alerting.notify('High rate limit rejection rate')
}
```

### 7. Communicate Limits

```
Document API rate limits clearly
Include in API response headers
Show remaining quota in dashboard
Email notifications before limit
```

### 8. Consider Use Case

```
Public API: Strict limits (100/hour)
Internal API: Generous limits (10000/hour)
Critical endpoints: Very strict (10/hour)
Read operations: Higher limits
Write operations: Lower limits
```

---

## Key Takeaways

1. **Choose algorithm:** Sliding window counter for most cases
2. **Distributed:** Use Redis for multi-server deployments
3. **Headers:** Always return rate limit info in headers
4. **Tiered limits:** Different limits for different user tiers
5. **Fail open:** Don't block requests if rate limiter fails
6. **Monitor:** Track rate limit hits and adjust
7. **Document:** Clearly communicate limits to users

---

[← Previous: Design Patterns](./07-design-patterns.md) | [Next: Security →](./09-security.md)
