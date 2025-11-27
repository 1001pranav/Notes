# API Design Patterns

Comprehensive guide to designing scalable and maintainable APIs.

## Table of Contents
1. [REST API Design](#rest-api-design)
2. [GraphQL](#graphql)
3. [gRPC](#grpc)
4. [WebSockets](#websockets)
5. [API Versioning](#api-versioning)
6. [API Gateway Pattern](#api-gateway-pattern)
7. [Best Practices](#best-practices)

---

## REST API Design

Representational State Transfer - architectural style for distributed systems.

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | ✓ | ✓ |
| POST | Create resource | ✗ | ✗ |
| PUT | Update/Replace resource | ✓ | ✗ |
| PATCH | Partial update | ✗ | ✗ |
| DELETE | Delete resource | ✓ | ✗ |
| HEAD | Get headers only | ✓ | ✓ |
| OPTIONS | Get allowed methods | ✓ | ✓ |

**Idempotent:** Multiple identical requests have same effect as single request
**Safe:** Read-only, doesn't modify resource

### Resource Naming Conventions

**Use nouns, not verbs:**
```
✓ GET /users
✓ POST /users
✓ GET /users/123
✗ GET /getUsers
✗ POST /createUser
```

**Use plural nouns:**
```
✓ /users
✓ /products
✓ /orders
✗ /user
✗ /product
```

**Hierarchical relationships:**
```
GET /users/123/orders          # User's orders
GET /users/123/orders/456      # Specific order
POST /users/123/orders         # Create order for user
GET /categories/5/products     # Products in category
```

**Use hyphens for readability:**
```
✓ /order-items
✓ /user-profiles
✗ /orderItems
✗ /order_items
```

### HTTP Status Codes

#### Success (2xx)
```
200 OK                  - Request succeeded
201 Created             - Resource created (return Location header)
202 Accepted            - Request accepted, processing async
204 No Content          - Success, no response body
```

#### Redirection (3xx)
```
301 Moved Permanently   - Resource moved, use new URL
302 Found               - Temporary redirect
304 Not Modified        - Cache is still valid
```

#### Client Errors (4xx)
```
400 Bad Request         - Invalid syntax/parameters
401 Unauthorized        - Authentication required
403 Forbidden           - Authenticated but not authorized
404 Not Found           - Resource doesn't exist
405 Method Not Allowed  - HTTP method not supported
409 Conflict            - Conflict with current state (duplicate)
422 Unprocessable Entity- Semantic errors in request
429 Too Many Requests   - Rate limit exceeded
```

#### Server Errors (5xx)
```
500 Internal Server Error - Generic server error
502 Bad Gateway           - Invalid response from upstream
503 Service Unavailable   - Server overloaded or down
504 Gateway Timeout       - Upstream server timeout
```

### Request/Response Examples

#### Create Resource (POST)

**Request:**
```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Location: /api/users/12345
Content-Type: application/json

{
  "id": 12345,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Resource (GET)

**Request:**
```http
GET /api/users/12345 HTTP/1.1
Host: api.example.com
Authorization: Bearer token123
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "v1.0.0"
Cache-Control: max-age=3600

{
  "id": 12345,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update Resource (PUT vs PATCH)

**PUT (Full replacement):**
```http
PUT /api/users/12345 HTTP/1.1
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "senior-developer"
}
```

**PATCH (Partial update):**
```http
PATCH /api/users/12345 HTTP/1.1
Content-Type: application/json

{
  "role": "senior-developer"
}
```

#### Delete Resource (DELETE)

**Request:**
```http
DELETE /api/users/12345 HTTP/1.1
Authorization: Bearer token123
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### Filtering, Sorting, Pagination

#### Filtering
```
GET /api/products?category=electronics&price_max=1000&in_stock=true
GET /api/users?role=admin&status=active
```

#### Sorting
```
GET /api/products?sort=price              # Ascending
GET /api/products?sort=-price             # Descending
GET /api/products?sort=category,price     # Multiple
```

#### Pagination

**Offset-based:**
```
GET /api/users?limit=20&offset=40  # Page 3 (skip 40, take 20)

Response:
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "next": "/api/users?limit=20&offset=60",
    "prev": "/api/users?limit=20&offset=20"
  }
}
```

**Cursor-based (better for large datasets):**
```
GET /api/posts?limit=20&cursor=eyJpZCI6MTIzfQ

Response:
{
  "data": [...],
  "meta": {
    "next_cursor": "eyJpZCI6MTQzfQ",
    "has_more": true
  }
}
```

### Error Handling

**Consistent error format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "age",
        "message": "Must be at least 18"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### HATEOAS (Hypermedia)

**Include links to related resources:**
```json
{
  "id": 12345,
  "name": "John Doe",
  "email": "john@example.com",
  "_links": {
    "self": "/api/users/12345",
    "orders": "/api/users/12345/orders",
    "avatar": "/api/users/12345/avatar",
    "delete": {
      "href": "/api/users/12345",
      "method": "DELETE"
    }
  }
}
```

### Caching

**HTTP Headers:**
```http
# Client caching
Cache-Control: public, max-age=3600
ETag: "v1.0.0"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT

# No caching
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Conditional requests:**
```http
# Client sends
If-None-Match: "v1.0.0"
If-Modified-Since: Mon, 15 Jan 2024 10:30:00 GMT

# Server responds
HTTP/1.1 304 Not Modified  # If unchanged
```

---

## GraphQL

Query language allowing clients to request exactly what they need.

### Core Concepts

#### Schema Definition
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  followers: [User!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  likes: Int!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(authorId: ID): [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String): User!
  deleteUser(id: ID!): Boolean!
  createPost(title: String!, content: String!): Post!
}

type Subscription {
  postAdded: Post!
  commentAdded(postId: ID!): Comment!
}
```

### Queries

**Fetch specific fields:**
```graphql
query {
  user(id: "123") {
    name
    email
  }
}

Response:
{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Nested queries:**
```graphql
query {
  user(id: "123") {
    name
    posts {
      title
      likes
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
```

**Multiple queries:**
```graphql
query {
  user1: user(id: "123") {
    name
  }
  user2: user(id: "456") {
    name
  }
  posts(limit: 5) {
    title
  }
}
```

**Variables:**
```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}

Variables:
{
  "userId": "123"
}
```

### Mutations

**Create:**
```graphql
mutation {
  createUser(name: "Jane Doe", email: "jane@example.com") {
    id
    name
    email
  }
}
```

**Update:**
```graphql
mutation UpdateUser($id: ID!, $name: String!) {
  updateUser(id: $id, name: $name) {
    id
    name
  }
}
```

### Subscriptions

**Real-time updates:**
```graphql
subscription {
  postAdded {
    id
    title
    author {
      name
    }
  }
}

# Server pushes updates via WebSocket
```

### GraphQL vs REST

| Aspect | REST | GraphQL |
|--------|------|---------|
| Endpoints | Multiple | Single (/graphql) |
| Over-fetching | Common | No |
| Under-fetching | Common (N+1) | No |
| Versioning | Explicit | Field deprecation |
| Caching | HTTP caching | Complex |
| Learning Curve | Lower | Higher |
| Tooling | Mature | Growing |

### GraphQL Challenges

**1. N+1 Problem:**
```graphql
# Query
users {
  posts {  # N queries (one per user)
    title
  }
}

# Solution: DataLoader (batching)
const userLoader = new DataLoader(async (userIds) => {
  return db.users.findMany({ id: { in: userIds } })
})
```

**2. Complexity:**
```graphql
# Malicious query
{
  users {
    posts {
      comments {
        author {
          posts {
            comments {
              # Infinite nesting
            }
          }
        }
      }
    }
  }
}

# Solution: Query depth limiting
```

**3. Caching:**
```
REST: URL-based caching easy
GraphQL: Normalized cache (Apollo, Relay)
```

### When to Use GraphQL

**Use GraphQL when:**
```
✓ Multiple clients with different needs (web, mobile)
✓ Complex, nested data requirements
✓ Frequent API changes
✓ Need real-time updates
✓ Over-fetching is a problem
```

**Avoid GraphQL when:**
```
✗ Simple CRUD operations
✗ File uploads (REST simpler)
✗ Heavy caching needs
✗ Team lacks GraphQL expertise
```

---

## gRPC

High-performance RPC framework using Protocol Buffers.

### Protocol Buffers

**Define schema:**
```protobuf
// user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc StreamUsers (StreamUsersRequest) returns (stream User);
}

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
  google.protobuf.Timestamp created_at = 5;
}

message GetUserRequest {
  int64 id = 1;
}

message ListUsersRequest {
  int32 limit = 1;
  int32 offset = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}
```

**Generate code:**
```bash
protoc --go_out=. --go-grpc_out=. user.proto
```

### Communication Patterns

#### 1. Unary RPC (Request-Response)
```go
// Server
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := db.GetUser(req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found")
    }
    return user, nil
}

// Client
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 123})
```

#### 2. Server Streaming
```go
// Server sends multiple responses
func (s *server) StreamUsers(req *pb.StreamUsersRequest, stream pb.UserService_StreamUsersServer) error {
    users := db.GetAllUsers()
    for _, user := range users {
        if err := stream.Send(user); err != nil {
            return err
        }
    }
    return nil
}

// Client
stream, _ := client.StreamUsers(ctx, &pb.StreamUsersRequest{})
for {
    user, err := stream.Recv()
    if err == io.EOF {
        break
    }
    fmt.Println(user)
}
```

#### 3. Client Streaming
```go
// Client sends multiple requests
func (s *server) BatchCreateUsers(stream pb.UserService_BatchCreateUsersServer) error {
    for {
        user, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&pb.BatchResponse{Count: count})
        }
        db.CreateUser(user)
    }
}
```

#### 4. Bidirectional Streaming
```go
// Both send multiple messages
func (s *server) Chat(stream pb.ChatService_ChatServer) error {
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        response := processMessage(msg)
        stream.Send(response)
    }
}
```

### gRPC Features

**1. HTTP/2:**
```
- Multiplexing: Multiple requests on single connection
- Header compression
- Binary protocol (faster than JSON)
```

**2. Deadlines/Timeouts:**
```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 123})
```

**3. Metadata (Headers):**
```go
// Client sends metadata
md := metadata.Pairs("authorization", "Bearer token123")
ctx := metadata.NewOutgoingContext(context.Background(), md)
user, _ := client.GetUser(ctx, req)

// Server reads metadata
md, _ := metadata.FromIncomingContext(ctx)
tokens := md.Get("authorization")
```

**4. Error Handling:**
```go
import "google.golang.org/grpc/status"
import "google.golang.org/grpc/codes"

// Server
return status.Errorf(codes.NotFound, "user %d not found", id)

// Client
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        fmt.Println(st.Code())    // NotFound
        fmt.Println(st.Message()) // user 123 not found
    }
}
```

### gRPC vs REST

| Aspect | REST | gRPC |
|--------|------|------|
| Protocol | HTTP/1.1 | HTTP/2 |
| Format | JSON | Protobuf (binary) |
| Performance | Slower | Faster (7-10x) |
| Browser Support | Native | Requires proxy |
| Streaming | Limited (SSE) | Bidirectional |
| Schema | OpenAPI (optional) | Protobuf (required) |
| Human Readable | Yes | No |

### When to Use gRPC

**Use gRPC when:**
```
✓ Microservices communication
✓ High performance needed
✓ Polyglot environments (multi-language)
✓ Streaming required
✓ Strong typing desired
```

**Avoid gRPC when:**
```
✗ Browser clients (no native support)
✗ Public APIs (REST more common)
✗ Simple CRUD (REST simpler)
✗ Debugging ease needed
```

---

## WebSockets

Full-duplex communication over single TCP connection.

### Use Cases

```
✓ Real-time chat
✓ Live notifications
✓ Collaborative editing
✓ Gaming
✓ Live sports scores
✓ Stock tickers
✓ IoT dashboards
```

### WebSocket Flow

**1. Handshake:**
```http
# Client request
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# Server response
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**2. Data Exchange:**
```javascript
// Client
const ws = new WebSocket('ws://localhost:8080/chat')

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'join', room: 'general' }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('Connection closed')
}
```

**3. Server:**
```javascript
// Node.js with ws library
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', (message) => {
    const data = JSON.parse(message)
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})
```

### WebSocket Scaling

**Challenge:** Stateful connections

**Solutions:**

**1. Sticky Sessions:**
```
Load balancer routes client to same server
Simple but limits load balancing
```

**2. Message Broker:**
```
Redis Pub/Sub:
  Server 1 receives message
  → Publish to Redis
  → All servers subscribe
  → Broadcast to their clients
```

**3. Dedicated WebSocket Servers:**
```
HTTP API Servers → Message Queue → WebSocket Servers
                                 ↓
                              Clients
```

### WebSocket vs Alternatives

#### Server-Sent Events (SSE)
```javascript
// Server to client only (unidirectional)
const eventSource = new EventSource('/api/events')

eventSource.onmessage = (event) => {
  console.log(event.data)
}

// Server (Node.js)
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache'
})
res.write(`data: ${JSON.stringify(data)}\n\n`)
```

**SSE vs WebSocket:**
```
SSE:
  ✓ Simpler
  ✓ Auto-reconnect
  ✓ HTTP (easier scaling)
  ✗ Server to client only

WebSocket:
  ✓ Bidirectional
  ✓ Lower latency
  ✗ More complex
  ✗ Harder to scale
```

#### Long Polling
```javascript
// Fallback for old browsers
function poll() {
  fetch('/api/messages?timeout=30000')
    .then(res => res.json())
    .then(data => {
      handleMessages(data)
      poll()  // Next poll
    })
}
```

---

## API Versioning

### Strategies

#### 1. URL Versioning
```
GET /api/v1/users
GET /api/v2/users

Pros: Clear, easy to route
Cons: Multiple codebases, URL pollution
```

#### 2. Header Versioning
```http
GET /api/users
Accept: application/vnd.company.v2+json

Pros: Clean URLs
Cons: Not immediately visible, harder to test
```

#### 3. Query Parameter
```
GET /api/users?version=2

Pros: Simple
Cons: Version in every request, inconsistent
```

#### 4. Content Negotiation
```http
GET /api/users
Accept: application/vnd.company+json; version=2

Pros: RESTful
Cons: Complex
```

### Versioning Best Practices

```
1. Use URL versioning (simplest)
2. Only major versions (v1, v2, not v1.1)
3. Maintain old versions for deprecation period
4. Announce deprecation early
5. Default to latest version
6. Document breaking changes clearly
```

### Deprecation Strategy

```json
# Response header
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Deprecation: true
Link: <https://api.example.com/v2/users>; rel="alternate"

# Response body
{
  "data": {...},
  "meta": {
    "deprecated": true,
    "sunset_date": "2024-12-31",
    "migration_guide": "https://docs.example.com/v1-to-v2"
  }
}
```

---

## API Gateway Pattern

Single entry point for all clients to access microservices.

### Responsibilities

**1. Routing:**
```
/api/users/* → User Service
/api/products/* → Product Service
/api/orders/* → Order Service
```

**2. Authentication & Authorization:**
```
Centralized auth
JWT validation
OAuth flows
```

**3. Rate Limiting:**
```
Per-client throttling
Quota management
```

**4. Request/Response Transformation:**
```
Client: REST → Gateway → Service: gRPC
Aggregate multiple service calls
```

**5. Caching:**
```
Cache frequently accessed data
Reduce backend load
```

**6. Monitoring & Logging:**
```
Centralized request logging
Metrics collection
Tracing
```

### Architecture

```
Clients (Web, Mobile, IoT)
          ↓
    API Gateway
          ↓
  ┌───────┼───────┐
  ↓       ↓       ↓
User   Product  Order
Service Service Service
```

### Implementation Example (Express.js)

```javascript
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')

const app = express()

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per window
})

app.use(limiter)

// Service routing
app.use('/api/users', authenticate, createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true
}))

app.use('/api/products', authenticate, createProxyMiddleware({
  target: 'http://product-service:3002',
  changeOrigin: true
}))

app.use('/api/orders', authenticate, createProxyMiddleware({
  target: 'http://order-service:3003',
  changeOrigin: true
}))

app.listen(8080)
```

### Popular API Gateways

```
- Kong: Open-source, plugin-based
- AWS API Gateway: Managed, serverless
- Apigee: Enterprise, Google Cloud
- Tyk: Open-source, Go-based
- Nginx: Reverse proxy + API gateway
- Envoy: Cloud-native, service mesh
```

---

## Best Practices

### 1. Consistent Naming

```
✓ Use kebab-case for URLs
✓ Use camelCase for JSON fields
✓ Use plural nouns for collections
✓ Be consistent across all endpoints
```

### 2. Use HTTPS

```
Always use TLS/SSL in production
Redirect HTTP to HTTPS
Use HSTS header
```

### 3. Pagination by Default

```
Limit default: 20-50 items
Max limit: 100-200 items
Always return total count
```

### 4. API Documentation

```
Use OpenAPI/Swagger
Interactive docs (Swagger UI)
Code examples in multiple languages
Keep docs updated
```

### 5. Idempotency Keys

```http
POST /api/payments
Idempotency-Key: unique-key-123

Server stores key → prevents duplicate charges
```

### 6. Request IDs

```http
X-Request-ID: req_abc123

Include in all logs
Return in response for debugging
```

### 7. Webhooks for Async Operations

```
Client: POST /api/orders
Server: 202 Accepted (processing)
Server: POST https://client.com/webhook (when done)
```

### 8. Health Check Endpoints

```
GET /health → 200 OK
GET /health/ready → 200 OK (dependencies healthy)
GET /health/live → 200 OK (server running)
```

---

## Key Takeaways

1. **REST:** Use for public APIs, CRUD operations, simple requirements
2. **GraphQL:** Use for complex data needs, multiple clients, flexibility
3. **gRPC:** Use for microservices, high performance, internal APIs
4. **WebSockets:** Use for real-time, bidirectional communication
5. **Versioning:** Use URL versioning for simplicity
6. **API Gateway:** Centralize cross-cutting concerns
7. **Documentation:** OpenAPI is the standard

---

[← Previous: Database Design](./03-database-design.md) | [Next: Microservices →](./05-microservices.md)
