# Microservices Architecture

Comprehensive guide to designing and implementing microservices.

## Table of Contents
1. [Microservices vs Monolith](#microservices-vs-monolith)
2. [Service Discovery](#service-discovery)
3. [Inter-service Communication](#inter-service-communication)
4. [Data Management](#data-management)
5. [Distributed Transactions](#distributed-transactions)
6. [Service Mesh](#service-mesh)
7. [Best Practices](#best-practices)

---

## Microservices vs Monolith

### Monolithic Architecture

**Definition:** Single unified codebase, deployed as one unit.

**Structure:**
```
┌─────────────────────────────┐
│      Monolithic App         │
│  ┌──────────────────────┐   │
│  │   Presentation       │   │
│  ├──────────────────────┤   │
│  │   Business Logic     │   │
│  │   - Users            │   │
│  │   - Orders           │   │
│  │   - Products         │   │
│  │   - Payments         │   │
│  ├──────────────────────┤   │
│  │   Data Access        │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
         ↓
   ┌─────────┐
   │   DB    │
   └─────────┘
```

**Pros:**
```
✓ Simple to develop initially
✓ Easy to test (single process)
✓ Easy to deploy (single artifact)
✓ Performance (in-process calls)
✓ Single transaction for operations
✓ Easier debugging
```

**Cons:**
```
✗ Tight coupling
✗ Hard to scale specific features
✗ Long build/deploy times
✗ Technology lock-in
✗ Hard to understand as grows
✗ Single point of failure
✗ Difficult parallel development
```

**When to use:**
```
- Small teams (< 10 developers)
- Simple applications
- MVP/Prototypes
- Limited domain complexity
- Tight budget/timeline
```

---

### Microservices Architecture

**Definition:** Application composed of small, independent services.

**Structure:**
```
        API Gateway
             ↓
  ┌──────────┼──────────┐
  ↓          ↓          ↓
┌────┐   ┌─────┐   ┌────┐
│User│   │Order│   │Pay │
│Svc │   │ Svc │   │Svc │
└────┘   └─────┘   └────┘
  ↓          ↓          ↓
┌────┐   ┌─────┐   ┌────┐
│User│   │Order│   │Pay │
│ DB │   │ DB  │   │ DB │
└────┘   └─────┘   └────┘
```

**Characteristics:**
```
- Single responsibility
- Independently deployable
- Own database per service
- Loosely coupled
- Technology agnostic
- Small team ownership
```

**Pros:**
```
✓ Independent scaling
✓ Independent deployment
✓ Technology flexibility
✓ Team autonomy
✓ Fault isolation
✓ Easier to understand each service
✓ Faster development (parallel teams)
```

**Cons:**
```
✗ Distributed system complexity
✗ Network latency
✗ Data consistency challenges
✗ Testing complexity
✗ Operational overhead
✗ Debugging harder
✗ Eventual consistency
```

**When to use:**
```
- Large teams (> 10 developers)
- Complex domains
- Need independent scaling
- Different technology needs
- Rapid iteration required
- High availability critical
```

---

### Decision Matrix

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team Size | < 10 | > 10 |
| Domain Complexity | Simple | Complex |
| Deployment Frequency | Low | High |
| Scalability Needs | Uniform | Varied |
| Technology Diversity | No | Yes |
| Initial Setup | Fast | Slow |
| Operational Complexity | Low | High |

---

### Migration from Monolith

**Strangler Fig Pattern:**
```
1. Identify bounded context
2. Extract to microservice
3. Route traffic through facade
4. Gradually migrate functionality
5. Decommission monolith code

Example:
Monolith → [Facade] → User Service (new)
                    → Monolith (legacy)

Over time, facade routes more to new services
```

**Steps:**
```
1. Stop adding features to monolith
2. Extract independent modules first (payments, notifications)
3. Create API gateway
4. Migrate read-heavy services first
5. Keep critical services in monolith initially
6. Use events for data sync during transition
```

---

## Service Discovery

How services find and communicate with each other.

### Client-Side Discovery

**Flow:**
```
1. Service registers with registry
2. Client queries registry
3. Client calls service directly

Client → Registry (get service location)
Client → Service (direct call)
```

**Example: Netflix Eureka**
```java
// Service registration
@EnableEurekaClient
@SpringBootApplication
public class UserService {
    public static void main(String[] args) {
        SpringApplication.run(UserService.class, args);
    }
}

// Client lookup
@Autowired
private DiscoveryClient discoveryClient;

List<ServiceInstance> instances =
    discoveryClient.getInstances("user-service");
ServiceInstance instance = instances.get(0);
String url = instance.getUri() + "/users";
```

**Pros:**
```
✓ Client controls load balancing
✓ One less network hop
```

**Cons:**
```
✗ Client logic complexity
✗ Multiple implementations (per language)
```

---

### Server-Side Discovery

**Flow:**
```
1. Service registers with registry
2. Client calls load balancer
3. Load balancer queries registry
4. Load balancer routes to service

Client → Load Balancer → Registry
Load Balancer → Service
```

**Example: AWS ELB + Consul**
```
Client → ALB → Target Group
                  ↓
           Healthy Instances
           (from registry)
```

**Pros:**
```
✓ Simpler clients
✓ Centralized logic
✓ Language agnostic
```

**Cons:**
```
✗ Extra network hop
✗ Load balancer is SPOF
```

---

### Service Registry

**Responsibilities:**
```
- Service registration
- Health checking
- Service deregistration
- Query interface
```

**Popular Tools:**

**1. Consul:**
```hcl
# Service registration
service {
  name = "user-service"
  port = 8080
  check {
    http     = "http://localhost:8080/health"
    interval = "10s"
    timeout  = "1s"
  }
}

# DNS query
dig user-service.service.consul
```

**2. Etcd:**
```bash
# Register service
etcdctl put /services/user-service/instance1 "10.0.1.5:8080"

# Get services
etcdctl get /services/user-service/ --prefix
```

**3. Zookeeper:**
```
/services
  /user-service
    /instance1 → 10.0.1.5:8080
    /instance2 → 10.0.1.6:8080
```

**4. Kubernetes:**
```yaml
# Service automatically discovers pods
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
```

---

## Inter-service Communication

### Synchronous Communication

#### REST over HTTP

**Pros:**
```
✓ Simple, well-understood
✓ Human-readable
✓ Extensive tooling
```

**Cons:**
```
✗ Slower than binary protocols
✗ Tight coupling
✗ Cascading failures
```

**Example:**
```javascript
// Order Service calls User Service
const userResponse = await axios.get(
  `${USER_SERVICE_URL}/users/${userId}`
)
const user = userResponse.data

// Order Service calls Payment Service
const paymentResponse = await axios.post(
  `${PAYMENT_SERVICE_URL}/charges`,
  { amount: total, user_id: userId }
)
```

**Problem: Cascade failures**
```
Client → Order Service → User Service (down) ❌
                      → Payment Service (waiting) ⏳

Solution: Circuit breaker, timeouts
```

#### gRPC

**Pros:**
```
✓ Fast (binary)
✓ Streaming support
✓ Strong typing
✓ Code generation
```

**Example:**
```protobuf
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}
```

```go
// Call user service
conn, _ := grpc.Dial("user-service:50051")
client := pb.NewUserServiceClient(conn)
user, _ := client.GetUser(ctx, &pb.GetUserRequest{Id: userId})
```

---

### Asynchronous Communication

Decoupled communication via message queues or event streams.

#### Message Queue Pattern

**Point-to-point messaging:**
```
Producer → Queue → Consumer

Example: RabbitMQ, SQS
```

**Use Cases:**
```
- Background jobs
- Task distribution
- Load leveling
```

**Example: RabbitMQ**
```javascript
// Order Service publishes
channel.sendToQueue('email-queue', Buffer.from(JSON.stringify({
  to: user.email,
  subject: 'Order Confirmation',
  order_id: order.id
})))

// Email Service consumes
channel.consume('email-queue', (msg) => {
  const data = JSON.parse(msg.content.toString())
  sendEmail(data)
  channel.ack(msg)
})
```

**Pros:**
```
✓ Decoupling
✓ Load leveling
✓ Reliability (retries)
```

**Cons:**
```
✗ Eventual consistency
✗ Complexity
✗ Debugging harder
```

---

#### Event-Driven Architecture

**Pub/Sub pattern:**
```
Publisher → Topic → Subscriber 1
                 → Subscriber 2
                 → Subscriber 3

Example: Kafka, SNS/SQS, Redis Pub/Sub
```

**Event example:**
```json
{
  "event_type": "order.created",
  "event_id": "evt_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "order_id": "order_456",
    "user_id": "user_789",
    "total": 99.99,
    "items": [...]
  }
}
```

**Services react to events:**
```
Order Created Event
  → Inventory Service (reserve items)
  → Email Service (send confirmation)
  → Analytics Service (track metrics)
  → Loyalty Service (award points)
```

**Implementation: Kafka**
```javascript
// Order Service publishes event
await producer.send({
  topic: 'orders',
  messages: [{
    key: order.id,
    value: JSON.stringify({
      event_type: 'order.created',
      data: order
    })
  }]
})

// Inventory Service subscribes
consumer.subscribe({ topic: 'orders' })
consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value)
    if (event.event_type === 'order.created') {
      await reserveInventory(event.data)
    }
  }
})
```

**Pros:**
```
✓ High decoupling
✓ Scalability
✓ Multiple consumers
✓ Event replay
```

**Cons:**
```
✗ Eventual consistency
✗ Complex debugging
✗ Event ordering challenges
```

---

### Synchronous vs Asynchronous

| Aspect | Synchronous | Asynchronous |
|--------|-------------|--------------|
| Coupling | Tight | Loose |
| Response | Immediate | Eventual |
| Failure Handling | Retry/fallback | Queue/DLQ |
| Use Case | Critical path | Background tasks |
| Example | Payment processing | Email notifications |

---

## Data Management

### Database per Service

**Principle:** Each service owns its data, no direct DB access from other services.

**Architecture:**
```
User Service → User DB
Order Service → Order DB
Payment Service → Payment DB
```

**Pros:**
```
✓ Service autonomy
✓ Technology flexibility
✓ Independent scaling
✓ Fault isolation
```

**Cons:**
```
✗ Data duplication
✗ No joins across services
✗ Distributed transactions complex
```

---

### Data Consistency Patterns

#### 1. Event Sourcing

**Concept:** Store events, not current state.

**Example:**
```
Traditional:
users table: { id: 123, balance: 100 }

Event Sourcing:
events table:
  1. AccountCreated: { id: 123, initial: 0 }
  2. MoneyDeposited: { id: 123, amount: 150 }
  3. MoneyWithdrawn: { id: 123, amount: 50 }

Current state = replay events → balance: 100
```

**Benefits:**
```
✓ Complete audit trail
✓ Time travel (replay to any point)
✓ Event replay for new features
✓ Natural fit for CQRS
```

**Challenges:**
```
✗ Query complexity
✗ Event schema evolution
✗ Storage overhead
```

#### 2. CQRS (Command Query Responsibility Segregation)

**Concept:** Separate models for reads and writes.

**Architecture:**
```
Write Model (Commands)
  ↓
Event Store
  ↓
Read Model (Queries)

Commands: CreateUser, UpdateOrder
Queries: GetUser, ListOrders
```

**Example:**
```javascript
// Write model (normalized)
class OrderCommandHandler {
  async createOrder(command) {
    const order = new Order(command)
    await orderRepo.save(order)
    await eventBus.publish(new OrderCreated(order))
  }
}

// Read model (denormalized)
class OrderQueryHandler {
  async getOrder(orderId) {
    // Optimized for reads
    return await readDB.query(`
      SELECT o.*, u.name, u.email, p.status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN payments p ON o.id = p.order_id
      WHERE o.id = ?
    `, orderId)
  }
}

// Event handler updates read model
eventBus.on('OrderCreated', async (event) => {
  await readDB.insert('orders', {
    id: event.order_id,
    user_name: event.user_name,
    total: event.total,
    ...
  })
})
```

**Benefits:**
```
✓ Optimized read and write models
✓ Independent scaling
✓ Better performance
```

**Challenges:**
```
✗ Complexity
✗ Eventual consistency
✗ Data duplication
```

#### 3. Saga Pattern

Covered in next section (Distributed Transactions).

---

### Data Querying Across Services

**Problem:** Need data from multiple services.

**Anti-pattern:**
```javascript
// DON'T: Distributed join
const user = await userService.getUser(userId)
const orders = await orderService.getUserOrders(userId)
const payments = await paymentService.getUserPayments(userId)
```

**Solutions:**

**1. API Composition:**
```javascript
// API Gateway composes response
async function getUserProfile(userId) {
  const [user, orders, loyaltyPoints] = await Promise.all([
    userService.getUser(userId),
    orderService.getUserOrders(userId),
    loyaltyService.getPoints(userId)
  ])

  return {
    ...user,
    orders,
    loyalty_points: loyaltyPoints
  }
}
```

**2. Data Replication:**
```
Order Service stores: order_id, user_id, user_name, user_email
When user updates profile → Event → Order Service updates denormalized data
```

**3. Dedicated View Service:**
```
View Service listens to events from all services
Maintains denormalized view
Optimized for queries
```

---

## Distributed Transactions

### The Challenge

**ACID transactions don't work across services:**
```
BEGIN TRANSACTION
  INSERT INTO users (order_service_db) ...
  INSERT INTO payments (payment_service_db) ...
COMMIT  ❌ Can't span databases
```

---

### Solutions

#### 1. Saga Pattern

**Sequence of local transactions with compensating actions.**

**Types:**

**A. Choreography (Event-driven):**
```
1. Order Service: Create order → Emit OrderCreated
2. Payment Service: Charge payment → Emit PaymentSucceeded
3. Inventory Service: Reserve items → Emit ItemsReserved
4. Shipping Service: Schedule shipment → Emit ShipmentScheduled

If any fails → Emit compensating events

Payment fails:
  → Emit PaymentFailed
  → Order Service: Cancel order
  → Inventory Service: Release items
```

**Implementation:**
```javascript
// Order Service
async function createOrder(data) {
  const order = await db.orders.create({ ...data, status: 'pending' })
  await eventBus.publish({ type: 'OrderCreated', data: order })
  return order
}

eventBus.on('PaymentSucceeded', async (event) => {
  await db.orders.update(event.order_id, { status: 'confirmed' })
})

eventBus.on('PaymentFailed', async (event) => {
  // Compensating transaction
  await db.orders.update(event.order_id, { status: 'cancelled' })
})

// Payment Service
eventBus.on('OrderCreated', async (event) => {
  try {
    await stripe.charges.create({ amount: event.total })
    await eventBus.publish({ type: 'PaymentSucceeded', order_id: event.order_id })
  } catch (err) {
    await eventBus.publish({ type: 'PaymentFailed', order_id: event.order_id })
  }
})
```

**B. Orchestration (Centralized):**
```
Saga Orchestrator controls flow:
1. Call Order Service
2. If success, call Payment Service
3. If success, call Inventory Service
4. If any fails, call compensating transactions
```

**Implementation:**
```javascript
class OrderSagaOrchestrator {
  async execute(orderData) {
    let order, payment, reservation

    try {
      // Step 1: Create order
      order = await orderService.createOrder(orderData)

      // Step 2: Process payment
      payment = await paymentService.charge({
        order_id: order.id,
        amount: order.total
      })

      // Step 3: Reserve inventory
      reservation = await inventoryService.reserve({
        order_id: order.id,
        items: order.items
      })

      return { success: true, order }

    } catch (err) {
      // Compensating transactions (reverse order)
      if (reservation) {
        await inventoryService.release(reservation.id)
      }
      if (payment) {
        await paymentService.refund(payment.id)
      }
      if (order) {
        await orderService.cancel(order.id)
      }

      return { success: false, error: err }
    }
  }
}
```

**Choreography vs Orchestration:**
```
Choreography:
  ✓ Loose coupling
  ✓ No central coordinator
  ✗ Hard to understand flow
  ✗ Cyclic dependencies risk

Orchestration:
  ✓ Clear flow
  ✓ Easy to understand
  ✗ Orchestrator SPOF
  ✗ Tighter coupling
```

#### 2. Two-Phase Commit (2PC)

**Avoid in microservices** - blocking, coordinator SPOF

#### 3. Eventual Consistency

**Accept temporary inconsistency:**
```
Order created → Eventually charged → Eventually shipped
Use status field to track progress
```

---

## Service Mesh

**Infrastructure layer for service-to-service communication.**

### Responsibilities

```
- Service discovery
- Load balancing
- Retry logic
- Circuit breaking
- Timeouts
- Metrics collection
- Distributed tracing
- mTLS (mutual TLS)
- Traffic shaping (canary, A/B)
```

### Architecture

**Sidecar Pattern:**
```
Service A Container
  ↕
Sidecar Proxy (Envoy)
  ↕
Network
  ↕
Sidecar Proxy (Envoy)
  ↕
Service B Container
```

**All traffic goes through proxies, not direct.**

### Popular Service Meshes

**1. Istio:**
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
    - user-service
  http:
    - match:
        - headers:
            user-agent:
              regex: ".*mobile.*"
      route:
        - destination:
            host: user-service-v2
    - route:
        - destination:
            host: user-service-v1
```

**2. Linkerd:**
```yaml
# Automatic mTLS, retries, timeouts
# Lightweight, simpler than Istio
```

**3. Consul Connect:**
```hcl
service {
  name = "user-service"
  connect {
    sidecar_service {}
  }
}
```

### Benefits

```
✓ Centralized policies
✓ No code changes
✓ Uniform observability
✓ Security (mTLS)
```

### Challenges

```
✗ Complexity
✗ Performance overhead (proxy)
✗ Learning curve
✗ Overkill for small systems
```

---

## Best Practices

### 1. Design Principles

**Single Responsibility:**
```
Each service does one thing well
User Service: User management only
Not: User + Orders + Payments
```

**Bounded Context (DDD):**
```
Align services with business domains
E-commerce: User, Product, Order, Payment, Shipping
```

**API-First:**
```
Define APIs before implementation
Use OpenAPI/Protobuf specs
```

### 2. Communication

**Prefer async over sync:**
```
✓ Background tasks: Use message queues
✓ Notifications: Use events
✗ Critical path: Use sync (payments)
```

**Implement timeouts:**
```javascript
const response = await axios.get(url, { timeout: 5000 })
```

**Circuit breakers:**
```javascript
const circuitBreaker = new CircuitBreaker(apiCall, {
  timeout: 3000,
  errorThreshold: 50,  // % failures
  resetTimeout: 30000
})
```

### 3. Data Management

**Database per service:**
```
✓ Each service owns its data
✗ No shared database
```

**Eventual consistency:**
```
Accept temporary inconsistency
Use sagas for distributed transactions
```

### 4. Deployment

**Independent deployability:**
```
Service deployed without affecting others
Use CI/CD pipelines
```

**Containerization:**
```
Docker containers
Kubernetes orchestration
```

**Versioning:**
```
API versioning
Backward compatibility
```

### 5. Observability

**Centralized logging:**
```
ELK Stack, Splunk, CloudWatch
Include request IDs
```

**Distributed tracing:**
```
Jaeger, Zipkin, AWS X-Ray
Trace requests across services
```

**Metrics:**
```
Prometheus, Grafana
Service-level indicators (SLIs)
```

### 6. Security

**API Gateway:**
```
Centralized authentication
Rate limiting
```

**Service-to-service auth:**
```
mTLS or JWT
Zero trust architecture
```

**Secrets management:**
```
HashiCorp Vault
AWS Secrets Manager
```

### 7. Testing

**Contract testing:**
```
Pact: Consumer-driven contracts
Ensure API compatibility
```

**Integration testing:**
```
Test service interactions
Use test containers
```

**Chaos engineering:**
```
Test failure scenarios
Chaos Monkey
```

---

## Key Takeaways

1. **Start simple:** Don't go microservices prematurely
2. **Bounded contexts:** Align services with business domains
3. **Async communication:** Prefer events over sync calls
4. **Database per service:** Never share databases
5. **Sagas:** Handle distributed transactions
6. **Service mesh:** Consider for mature microservices
7. **Observability:** Essential for debugging distributed systems

---

[← Previous: API Design](./04-api-design.md) | [Next: System Components →](./06-system-components.md)
