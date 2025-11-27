# Distributed System Design Patterns

Essential patterns for building resilient distributed systems.

## Table of Contents
1. [Circuit Breaker](#circuit-breaker)
2. [Retry and Exponential Backoff](#retry-and-exponential-backoff)
3. [Bulkhead](#bulkhead)
4. [CQRS](#cqrs)
5. [Event Sourcing](#event-sourcing)
6. [Saga Pattern](#saga-pattern)
7. [Strangler Fig](#strangler-fig)
8. [Sidecar](#sidecar)

---

## Circuit Breaker

Prevents cascading failures by stopping calls to failing services.

### Problem

```
Service A → Service B (down) → timeout after 30s
100 requests/second × 30s = 3000 hanging requests
Service A runs out of threads → crashes
```

### Solution

**Circuit states:**

**1. Closed (Normal):**
```
Requests pass through
Track failures
```

**2. Open (Failing):**
```
Reject requests immediately
Return fallback or error
Retry after timeout
```

**3. Half-Open (Testing):**
```
Allow limited requests
If success → Closed
If failure → Open
```

### Implementation

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.timeout = options.timeout || 60000  // 60s
    this.monitoringPeriod = options.monitoringPeriod || 10000  // 10s

    this.state = 'CLOSED'
    this.failureCount = 0
    this.nextAttempt = Date.now()
    this.successCount = 0
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN')
      }
      // Try again (half-open)
      this.state = 'HALF_OPEN'
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  onSuccess() {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= 2) {
        this.state = 'CLOSED'
        this.successCount = 0
      }
    }
  }

  onFailure() {
    this.failureCount++
    this.successCount = 0

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
      this.nextAttempt = Date.now() + this.timeout
    }
  }
}

// Usage
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000
})

async function callExternalAPI() {
  try {
    return await breaker.call(async () => {
      const response = await axios.get('https://api.example.com/data')
      return response.data
    })
  } catch (err) {
    // Fallback
    return getCachedData()
  }
}
```

### Libraries

```
JavaScript: opossum
Java: Resilience4j, Hystrix
Python: pybreaker
Go: gobreaker
```

### When to Use

```
✓ External service calls
✓ Database connections
✓ Third-party APIs
✗ Internal, fast operations
```

---

## Retry and Exponential Backoff

Automatically retry failed operations with increasing delays.

### Simple Retry

```javascript
async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      // Wait before retry
      await sleep(1000)
    }
  }
}

// Usage
await retryOperation(() => axios.get('/api/data'), 3)
```

### Exponential Backoff

**Delay increases exponentially:**
```
Attempt 1: Wait 1s
Attempt 2: Wait 2s
Attempt 3: Wait 4s
Attempt 4: Wait 8s
```

**With jitter (randomization):**
```
Prevents thundering herd
Random delay between 0 and 2^attempt
```

```javascript
async function exponentialBackoff(fn, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries - 1) throw err

      // Exponential backoff with jitter
      const baseDelay = Math.pow(2, attempt) * 1000  // 1s, 2s, 4s, 8s...
      const jitter = Math.random() * baseDelay
      const delay = baseDelay + jitter

      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await sleep(delay)
    }
  }
}

// With timeout
async function retryWithTimeout(fn, maxRetries = 5, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  )

  return Promise.race([
    exponentialBackoff(fn, maxRetries),
    timeoutPromise
  ])
}
```

### Idempotency

**Critical:** Operations must be idempotent (safe to retry).

**Examples:**

**Idempotent:**
```
GET /users/123
PUT /users/123 (update to specific state)
DELETE /users/123
```

**Not idempotent:**
```
POST /users (creates new user every time)
POST /payments (charges multiple times)
```

**Solution: Idempotency keys**
```javascript
// Client sends unique key
await axios.post('/payments', {
  amount: 100,
  idempotency_key: 'unique-key-123'
})

// Server checks if already processed
if (await db.payments.findOne({ idempotency_key: key })) {
  return existing_payment
}
```

### When to Retry

```
✓ Network timeouts
✓ 5xx server errors
✓ 429 Rate limit (with backoff)
✓ Connection refused
✗ 4xx client errors (except 429)
✗ Authentication failures
```

---

## Bulkhead

Isolate resources to prevent total system failure.

### Problem

```
Single thread pool handles all requests:
  - Critical API calls
  - Background jobs
  - Report generation

Heavy report generation → exhausts threads → API calls fail
```

### Solution

**Separate resource pools:**

```
Thread Pool 1: Critical API (20 threads)
Thread Pool 2: Reports (5 threads)
Thread Pool 3: Background jobs (10 threads)

Reports exhaust their pool → API still works
```

### Implementation

```javascript
class Bulkhead {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      // Wait in queue
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++
    try {
      return await fn()
    } finally {
      this.running--
      // Process queue
      if (this.queue.length > 0) {
        const resolve = this.queue.shift()
        resolve()
      }
    }
  }
}

// Usage
const apiBulkhead = new Bulkhead(20)
const reportBulkhead = new Bulkhead(5)

// API requests
app.get('/api/users', async (req, res) => {
  const users = await apiBulkhead.execute(() => getUsersFromDB())
  res.json(users)
})

// Heavy reports
app.get('/reports/monthly', async (req, res) => {
  const report = await reportBulkhead.execute(() => generateReport())
  res.json(report)
})
```

### Database Connection Pools

```javascript
// Separate pools for different workloads
const readPool = new Pool({
  host: 'read-replica',
  max: 20,  // Max connections
  idleTimeoutMillis: 30000
})

const writePool = new Pool({
  host: 'primary',
  max: 10
})

const analyticsPool = new Pool({
  host: 'analytics-db',
  max: 5
})

// Read queries
app.get('/api/users', async (req, res) => {
  const users = await readPool.query('SELECT * FROM users')
  res.json(users)
})

// Writes
app.post('/api/users', async (req, res) => {
  const user = await writePool.query('INSERT INTO users ...')
  res.json(user)
})

// Heavy analytics
app.get('/reports/metrics', async (req, res) => {
  const metrics = await analyticsPool.query('SELECT ... FROM analytics')
  res.json(metrics)
})
```

### Kubernetes Resource Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: api-server
spec:
  containers:
  - name: api
    image: api:latest
    resources:
      requests:
        memory: "256Mi"
        cpu: "500m"
      limits:
        memory: "512Mi"
        cpu: "1000m"  # Bulkhead: CPU limited
```

---

## CQRS

Command Query Responsibility Segregation - separate read and write models.

### Traditional

```
Single model for reads and writes:
API → Service → Database
```

### CQRS

```
Write (Command):
Client → Command → Write Model → Write DB → Event

Read (Query):
Client → Query → Read Model → Read DB

Event Handler → Updates Read DB
```

### Implementation

```javascript
// Write side (Commands)
class CreateOrderCommand {
  constructor(userId, items) {
    this.userId = userId
    this.items = items
  }
}

class OrderCommandHandler {
  async handle(command) {
    // Validate
    if (!command.items.length) {
      throw new Error('No items in order')
    }

    // Write to normalized DB
    const order = await db.orders.create({
      user_id: command.userId,
      status: 'pending',
      created_at: new Date()
    })

    for (const item of command.items) {
      await db.order_items.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity
      })
    }

    // Publish event
    await eventBus.publish({
      type: 'OrderCreated',
      order_id: order.id,
      user_id: command.userId,
      items: command.items
    })

    return order.id
  }
}

// Read side (Queries)
class GetOrderQuery {
  constructor(orderId) {
    this.orderId = orderId
  }
}

class OrderQueryHandler {
  async handle(query) {
    // Read from denormalized view
    return await readDb.query(`
      SELECT
        o.id,
        o.status,
        o.total,
        o.created_at,
        u.name as user_name,
        u.email as user_email,
        json_agg(json_build_object(
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price
        )) as items
      FROM orders_view o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, u.name, u.email
    `, [query.orderId])
  }
}

// Event handler updates read model
eventBus.on('OrderCreated', async (event) => {
  // Denormalize for reads
  const user = await db.users.findById(event.user_id)
  const items = await Promise.all(
    event.items.map(item => db.products.findById(item.product_id))
  )

  await readDb.orders_view.create({
    id: event.order_id,
    user_id: event.user_id,
    user_name: user.name,
    user_email: user.email,
    items: items.map((p, i) => ({
      product_id: p.id,
      product_name: p.name,
      quantity: event.items[i].quantity,
      price: p.price
    })),
    total: items.reduce((sum, p, i) => sum + p.price * event.items[i].quantity, 0),
    status: 'pending',
    created_at: new Date()
  })
})

// API
app.post('/orders', async (req, res) => {
  const command = new CreateOrderCommand(req.user.id, req.body.items)
  const orderId = await commandHandler.handle(command)
  res.json({ order_id: orderId })
})

app.get('/orders/:id', async (req, res) => {
  const query = new GetOrderQuery(req.params.id)
  const order = await queryHandler.handle(query)
  res.json(order)
})
```

### Benefits

```
✓ Optimized read model (denormalized)
✓ Optimized write model (normalized)
✓ Independent scaling
✓ Flexibility
```

### Challenges

```
✗ Complexity
✗ Eventual consistency
✗ Data duplication
✗ Sync challenges
```

---

## Event Sourcing

Store state as sequence of events rather than current state.

### Traditional

```sql
-- Users table
id | name | balance | updated_at
1  | John | 100     | 2024-01-15

-- Lost history: How did balance become 100?
```

### Event Sourcing

```sql
-- Events table
id | aggregate_id | event_type       | data                | timestamp
1  | user:1      | UserCreated      | {name: "John"}      | 2024-01-01
2  | user:1      | MoneyDeposited   | {amount: 150}       | 2024-01-10
3  | user:1      | MoneyWithdrawn   | {amount: 50}        | 2024-01-15

-- Current state = replay events
balance = 0 + 150 - 50 = 100
```

### Implementation

```javascript
// Events
class UserCreatedEvent {
  constructor(userId, name, email) {
    this.type = 'UserCreated'
    this.userId = userId
    this.name = name
    this.email = email
    this.timestamp = new Date()
  }
}

class MoneyDepositedEvent {
  constructor(userId, amount) {
    this.type = 'MoneyDeposited'
    this.userId = userId
    this.amount = amount
    this.timestamp = new Date()
  }
}

// Aggregate (entity)
class UserAggregate {
  constructor(userId) {
    this.userId = userId
    this.name = null
    this.email = null
    this.balance = 0
    this.version = 0
    this.uncommittedEvents = []
  }

  // Command handlers
  create(name, email) {
    const event = new UserCreatedEvent(this.userId, name, email)
    this.apply(event)
    this.uncommittedEvents.push(event)
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Amount must be positive')

    const event = new MoneyDepositedEvent(this.userId, amount)
    this.apply(event)
    this.uncommittedEvents.push(event)
  }

  withdraw(amount) {
    if (amount > this.balance) throw new Error('Insufficient balance')

    const event = new MoneyWithdrawnEvent(this.userId, amount)
    this.apply(event)
    this.uncommittedEvents.push(event)
  }

  // Event handlers (apply state changes)
  apply(event) {
    switch (event.type) {
      case 'UserCreated':
        this.name = event.name
        this.email = event.email
        break
      case 'MoneyDeposited':
        this.balance += event.amount
        break
      case 'MoneyWithdrawn':
        this.balance -= event.amount
        break
    }
    this.version++
  }

  // Replay events to rebuild state
  static fromEvents(userId, events) {
    const user = new UserAggregate(userId)
    events.forEach(event => user.apply(event))
    return user
  }
}

// Repository
class UserRepository {
  async save(user) {
    // Save events
    for (const event of user.uncommittedEvents) {
      await db.events.create({
        aggregate_id: user.userId,
        event_type: event.type,
        data: event,
        version: user.version,
        timestamp: event.timestamp
      })
    }
    user.uncommittedEvents = []

    // Update snapshot (optional, for performance)
    await db.user_snapshots.upsert({
      user_id: user.userId,
      name: user.name,
      email: user.email,
      balance: user.balance,
      version: user.version
    })
  }

  async load(userId) {
    // Load snapshot (optional)
    const snapshot = await db.user_snapshots.findOne({ user_id: userId })

    // Load events after snapshot
    const events = await db.events.find({
      aggregate_id: userId,
      version: { $gt: snapshot?.version || 0 }
    }).sort({ version: 1 })

    // Rebuild from snapshot + events
    const user = snapshot
      ? Object.assign(new UserAggregate(userId), snapshot)
      : new UserAggregate(userId)

    events.forEach(event => user.apply(event))
    return user
  }
}

// Usage
const user = new UserAggregate('user:123')
user.create('John Doe', 'john@example.com')
user.deposit(150)
user.withdraw(50)
await userRepo.save(user)

// Load and replay
const loadedUser = await userRepo.load('user:123')
console.log(loadedUser.balance)  // 100
```

### Snapshots

**Problem:** Replaying 1 million events is slow

**Solution:** Periodic snapshots
```
Snapshot at event 1000: balance = 500
Load snapshot + replay events 1001-1100
```

### Benefits

```
✓ Complete audit trail
✓ Time travel (replay to any point)
✓ Event replay for new features
✓ Debug production issues
✓ Analytics from events
```

### Challenges

```
✗ Query complexity
✗ Event schema evolution
✗ Storage overhead
✗ Learning curve
```

---

## Saga Pattern

Manage distributed transactions across microservices.

Covered in detail in [05-microservices.md](./05-microservices.md#distributed-transactions)

**Quick Summary:**

**Choreography:**
```
Services react to events
Decentralized
```

**Orchestration:**
```
Central coordinator
Explicit flow
```

---

## Strangler Fig

Gradually migrate from legacy system to new system.

### Pattern

```
1. Intercept requests (facade/proxy)
2. Route some to new system
3. Route rest to legacy
4. Gradually migrate features
5. Decommission legacy
```

### Implementation

```
               Proxy/Facade
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    New System             Legacy System
    (Users API)            (Monolith)
```

```nginx
# Nginx proxy
server {
    listen 80;

    # New system
    location /api/users {
        proxy_pass http://user-service:3000;
    }

    location /api/orders {
        proxy_pass http://order-service:3001;
    }

    # Legacy system (everything else)
    location / {
        proxy_pass http://legacy-monolith:8080;
    }
}
```

```javascript
// Application-level facade
app.use((req, res, next) => {
  // Feature flag or user-based routing
  if (req.path.startsWith('/api/users') && featureFlags.newUserService) {
    return proxy.web(req, res, { target: 'http://user-service:3000' })
  }

  // Legacy
  return proxy.web(req, res, { target: 'http://legacy:8080' })
})
```

### Migration Steps

```
1. Identify bounded context (users, orders, etc.)
2. Extract to microservice
3. Dual-write to both systems
4. Switch reads to new system
5. Stop writing to legacy
6. Decommission legacy code
```

---

## Sidecar

Deploy helper container alongside main application.

### Pattern

```
Pod:
  ├── Main Container (Application)
  └── Sidecar Container (Helper)
      - Logging
      - Monitoring
      - Proxying
      - Configuration
```

### Examples

**1. Logging Sidecar:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  # Main application
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app

  # Logging sidecar
  - name: log-forwarder
    image: fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
    env:
    - name: FLUENT_ELASTICSEARCH_HOST
      value: "elasticsearch"

  volumes:
  - name: logs
    emptyDir: {}
```

**2. Service Mesh (Envoy Sidecar):**
```yaml
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 8080

  - name: envoy-sidecar
    image: envoyproxy/envoy:latest
    # Intercepts all traffic
```

**3. Config Reload Sidecar:**
```yaml
containers:
- name: app
  image: myapp:latest

- name: config-reloader
  image: config-reloader:latest
  # Watches ConfigMap, reloads app on change
```

### Benefits

```
✓ Separation of concerns
✓ Reusable sidecars
✓ Independent updates
✓ Language agnostic
```

---

## Key Takeaways

1. **Circuit Breaker:** Prevent cascading failures, fail fast
2. **Retry:** Use exponential backoff with jitter, ensure idempotency
3. **Bulkhead:** Isolate resources to contain failures
4. **CQRS:** Separate read/write models for optimization
5. **Event Sourcing:** Store events for complete history
6. **Saga:** Manage distributed transactions with events
7. **Strangler Fig:** Gradually migrate legacy systems
8. **Sidecar:** Deploy helpers alongside applications

---

[← Previous: System Components](./06-system-components.md) | [Next: Rate Limiting →](./08-rate-limiting.md)
