# System Components

Deep dive into essential infrastructure components for distributed systems.

## Table of Contents
1. [Message Queues](#message-queues)
2. [Content Delivery Networks](#content-delivery-networks)
3. [Reverse Proxies](#reverse-proxies)
4. [Cache Systems](#cache-systems)
5. [Search Engines](#search-engines)
6. [Object Storage](#object-storage)

---

## Message Queues

Asynchronous communication between services or components.

### Core Concepts

**Producer:** Sends messages
**Queue/Topic:** Stores messages
**Consumer:** Processes messages

**Benefits:**
```
✓ Decoupling
✓ Load leveling
✓ Reliability (retry)
✓ Scalability
✓ Asynchronous processing
```

---

### Message Queue vs Event Stream

**Message Queue (RabbitMQ, SQS):**
```
- Point-to-point
- Message deleted after consumption
- Order not always guaranteed
- Lower latency
Use: Task queues, job processing
```

**Event Stream (Kafka, Kinesis):**
```
- Pub/Sub
- Messages retained (configurable)
- Order guaranteed per partition
- Higher throughput
Use: Event sourcing, analytics, logs
```

---

### RabbitMQ

**AMQP-based message broker**

#### Architecture

```
Producer → Exchange → Queue → Consumer
                ↓
             Binding
```

**Exchange Types:**

**1. Direct:**
```
Routes by routing key (exact match)

Producer → (key: "email") → Email Queue
Producer → (key: "sms") → SMS Queue
```

**2. Fanout:**
```
Broadcasts to all queues

Producer → Exchange → Queue 1
                   → Queue 2
                   → Queue 3
```

**3. Topic:**
```
Pattern matching

user.created → User Service
user.* → Analytics Service
*.created → Audit Service
```

**4. Headers:**
```
Routes by message headers
```

#### Usage Example

```javascript
// Producer
const amqp = require('amqplib')

const conn = await amqp.connect('amqp://localhost')
const channel = await conn.createChannel()

await channel.assertQueue('tasks')

channel.sendToQueue('tasks', Buffer.from(JSON.stringify({
  task: 'send_email',
  to: 'user@example.com',
  subject: 'Welcome!'
})), {
  persistent: true  // Survive broker restart
})

// Consumer
await channel.assertQueue('tasks', { durable: true })
channel.prefetch(1)  // Process one message at a time

channel.consume('tasks', async (msg) => {
  const task = JSON.parse(msg.content.toString())

  try {
    await processTask(task)
    channel.ack(msg)  // Acknowledge
  } catch (err) {
    channel.nack(msg, false, true)  // Requeue
  }
}, { noAck: false })
```

#### Features

**Dead Letter Queue (DLQ):**
```javascript
await channel.assertQueue('tasks', {
  deadLetterExchange: 'dlx',
  deadLetterRoutingKey: 'failed_tasks'
})

// Failed messages go to DLQ after max retries
```

**Priority Queue:**
```javascript
await channel.assertQueue('tasks', {
  maxPriority: 10
})

channel.sendToQueue('tasks', msg, { priority: 8 })
```

**Message TTL:**
```javascript
channel.sendToQueue('tasks', msg, {
  expiration: '60000'  // 60 seconds
})
```

---

### Apache Kafka

**Distributed event streaming platform**

#### Architecture

```
Producer → Topic (Partition 0) → Consumer Group
                (Partition 1)
                (Partition 2)
```

**Key Concepts:**

**Topic:** Category of messages
**Partition:** Ordered, immutable log
**Consumer Group:** Multiple consumers, each reads different partitions
**Offset:** Position in partition

#### Usage Example

```javascript
// Producer
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  brokers: ['localhost:9092']
})

const producer = kafka.producer()
await producer.connect()

await producer.send({
  topic: 'user-events',
  messages: [
    {
      key: 'user123',  // Determines partition
      value: JSON.stringify({
        event: 'user.created',
        user_id: 123,
        timestamp: Date.now()
      })
    }
  ]
})

// Consumer
const consumer = kafka.consumer({ groupId: 'analytics-group' })
await consumer.connect()
await consumer.subscribe({ topic: 'user-events', fromBeginning: true })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString())
    console.log(`Partition ${partition}: ${event.event}`)
    await processEvent(event)
  }
})
```

#### Features

**Partitioning:**
```
Same key → Same partition → Order guaranteed
Different keys → Different partitions → Parallel processing
```

**Retention:**
```
Time-based: Keep for 7 days
Size-based: Keep last 10 GB
Compaction: Keep latest per key
```

**Consumer Groups:**
```
Group 1: Analytics Service (Partition 0, 1, 2)
Group 2: Email Service (Partition 0, 1, 2)
Both receive all messages independently
```

**Exactly Once Semantics:**
```javascript
const producer = kafka.producer({
  idempotent: true,
  transactionalId: 'my-transactional-producer'
})

await producer.transaction({
  topics: [{ topic: 'orders' }],
  messages: [...]
})
```

---

### AWS SQS

**Managed message queue service**

#### Queue Types

**Standard Queue:**
```
- At least once delivery
- Best-effort ordering
- Unlimited throughput
```

**FIFO Queue:**
```
- Exactly once delivery
- Strict ordering
- 3000 messages/second limit
```

#### Usage Example

```javascript
const AWS = require('aws-sdk')
const sqs = new AWS.SQS()

// Send message
await sqs.sendMessage({
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456/my-queue',
  MessageBody: JSON.stringify({ task: 'process_order', order_id: 456 }),
  DelaySeconds: 10  // Delayed delivery
}).promise()

// Receive message
const data = await sqs.receiveMessage({
  QueueUrl: queueUrl,
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20  // Long polling
}).promise()

for (const message of data.Messages) {
  await processMessage(message)

  // Delete after processing
  await sqs.deleteMessage({
    QueueUrl: queueUrl,
    ReceiptHandle: message.ReceiptHandle
  }).promise()
}
```

#### Features

**Visibility Timeout:**
```
Message invisible to other consumers while processing
Default: 30 seconds
Extend if processing takes longer
```

**Dead Letter Queue:**
```
After maxReceiveCount failures → Move to DLQ
```

**Delay Queue:**
```
Delay message delivery (0-15 minutes)
```

---

### Comparison

| Feature | RabbitMQ | Kafka | SQS |
|---------|----------|-------|-----|
| Type | Message broker | Event stream | Message queue |
| Throughput | Moderate | Very high | High |
| Ordering | Per queue | Per partition | FIFO only |
| Retention | Until consumed | Configurable | 14 days max |
| Delivery | At least once | At least once | At least once / Exactly once (FIFO) |
| Use Case | Task queues | Event sourcing | AWS integration |
| Managed | Self-hosted | Self-hosted | Fully managed |

---

## Content Delivery Networks

Distributed network of servers that deliver content to users based on geographic location.

### How CDN Works

```
1. User requests www.example.com/logo.png
2. DNS routes to nearest CDN edge server
3. Edge checks cache:
   - HIT: Return cached content
   - MISS: Fetch from origin, cache, return
```

### Benefits

```
✓ Reduced latency (geographic proximity)
✓ Reduced bandwidth costs
✓ Improved availability (DDoS protection)
✓ Offload origin server
✓ SSL termination at edge
```

### CDN Strategies

#### 1. Push CDN

**Upload content to CDN explicitly**

```
When: Low traffic, infrequent changes
Example: Deploying static assets after build

aws s3 sync ./dist s3://my-bucket
cloudflare purge-cache
```

**Pros:**
```
✓ Control over what's cached
✓ No origin load
```

**Cons:**
```
✗ Manual updates
✗ Storage costs
```

#### 2. Pull CDN

**CDN fetches from origin on demand**

```
When: High traffic, frequent updates
Example: User-generated content

User requests /user/123/avatar.jpg
→ CDN checks cache
→ If miss, fetches from origin
→ Caches for future requests
```

**Pros:**
```
✓ Automatic
✓ Origin is source of truth
```

**Cons:**
```
✗ First request slow (cache miss)
✗ Origin load on cache miss
```

### Cache Control Headers

```http
# Immutable assets (versioned)
Cache-Control: public, max-age=31536000, immutable

# Frequently changing
Cache-Control: public, max-age=3600, s-maxage=7200

# Private (per-user)
Cache-Control: private, max-age=300

# No caching
Cache-Control: no-cache, no-store, must-revalidate
```

### Invalidation

**Problem:** Cached content becomes stale

**Solutions:**

**1. Versioning:**
```
logo-v1.png → logo-v2.png
styles.abc123.css (hash in filename)
```

**2. Purge API:**
```bash
# CloudFlare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -d '{"files":["https://example.com/image.jpg"]}'
```

**3. Short TTL:**
```
Cache-Control: max-age=300  # 5 minutes
```

### Popular CDNs

**CloudFlare:**
```
- Free tier available
- DDoS protection
- DNS + CDN
- Workers (edge computing)
```

**AWS CloudFront:**
```
- Global edge locations
- AWS integration
- Lambda@Edge
- Origin shield (additional caching layer)
```

**Fastly:**
```
- Instant purge (< 150ms)
- Edge computing (VCL)
- Real-time logging
```

**Akamai:**
```
- Largest CDN network
- Enterprise-focused
- Expensive
```

---

## Reverse Proxies

Server that sits between clients and backend servers.

### Nginx

**High-performance web server and reverse proxy**

#### Configuration Example

```nginx
# Load balancing
upstream backend {
    least_conn;  # Algorithm
    server backend1.example.com weight=3;
    server backend2.example.com;
    server backend3.example.com backup;

    keepalive 32;  # Connection pool
}

server {
    listen 80;
    server_name api.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Static files
    location /static/ {
        root /var/www;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Caching
    location /api/products {
        proxy_pass http://backend;
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
    }
}

# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

#### Features

**Load Balancing:**
```
- Round Robin
- Least Connections
- IP Hash
- Weighted
```

**SSL Termination:**
```
Handle HTTPS at proxy
Backend uses HTTP (faster)
```

**Compression:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

**Request Buffering:**
```nginx
client_max_body_size 10M;  # Max upload size
client_body_buffer_size 128k;
```

---

### HAProxy

**High availability load balancer and proxy**

```cfg
global
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

frontend http-in
    bind *:80
    default_backend servers

    # ACL-based routing
    acl is_api path_beg /api
    acl is_static path_beg /static

    use_backend api_servers if is_api
    use_backend static_servers if is_static

backend servers
    balance roundrobin
    option httpchk GET /health

    server web1 10.0.1.10:8080 check
    server web2 10.0.1.11:8080 check
    server web3 10.0.1.12:8080 check backup

backend api_servers
    balance leastconn
    server api1 10.0.2.10:3000 check
    server api2 10.0.2.11:3000 check

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
```

---

### Envoy

**Cloud-native proxy and service mesh data plane**

```yaml
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 10000
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: backend
              domains: ["*"]
              routes:
              - match:
                  prefix: "/api"
                route:
                  cluster: api_cluster
                  retry_policy:
                    retry_on: "5xx"
                    num_retries: 3
              - match:
                  prefix: "/health"
                direct_response:
                  status: 200
                  body:
                    inline_string: "OK"
          http_filters:
          - name: envoy.filters.http.router

  clusters:
  - name: api_cluster
    connect_timeout: 0.25s
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: api_cluster
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: api-service
                port_value: 8080
    health_checks:
    - timeout: 1s
      interval: 10s
      unhealthy_threshold: 2
      healthy_threshold: 2
      http_health_check:
        path: "/health"
```

---

## Cache Systems

### Redis

**In-memory data structure store**

#### Use Cases

```
- Caching
- Session storage
- Real-time analytics
- Leaderboards
- Rate limiting
- Pub/Sub messaging
- Distributed locks
```

#### Data Structures

**1. Strings:**
```redis
SET user:123:name "John Doe"
GET user:123:name

SET page_views 0
INCR page_views  # Atomic increment
```

**2. Hashes:**
```redis
HSET user:123 name "John" email "john@example.com" age 30
HGET user:123 name
HGETALL user:123
```

**3. Lists:**
```redis
LPUSH notifications "New message"  # Push left
RPUSH queue "task1"  # Push right
LPOP queue  # Pop left (FIFO)
LRANGE notifications 0 9  # Get first 10
```

**4. Sets:**
```redis
SADD tags:post:123 "javascript" "nodejs" "redis"
SMEMBERS tags:post:123
SISMEMBER tags:post:123 "javascript"  # Check membership
SINTER tags:post:123 tags:post:456  # Intersection
```

**5. Sorted Sets:**
```redis
ZADD leaderboard 1000 "player1" 1500 "player2"
ZINCRBY leaderboard 50 "player1"
ZRANGE leaderboard 0 9 WITHSCORES  # Top 10
ZREVRANGE leaderboard 0 9  # Descending
```

#### Usage Example

```javascript
const redis = require('redis')
const client = redis.createClient()

// Caching pattern
async function getUser(userId) {
  const cacheKey = `user:${userId}`

  // Check cache
  const cached = await client.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Cache miss - query DB
  const user = await db.users.findById(userId)

  // Store in cache
  await client.setEx(cacheKey, 3600, JSON.stringify(user))

  return user
}

// Rate limiting
async function checkRateLimit(userId) {
  const key = `rate_limit:${userId}`
  const count = await client.incr(key)

  if (count === 1) {
    await client.expire(key, 60)  // 60 seconds window
  }

  return count <= 100  // 100 requests per minute
}

// Pub/Sub
const publisher = redis.createClient()
const subscriber = redis.createClient()

await subscriber.subscribe('notifications', (message) => {
  console.log('Received:', message)
})

await publisher.publish('notifications', 'New order created')

// Distributed lock
async function acquireLock(lockKey, timeout = 10000) {
  const lockValue = Date.now() + timeout
  const acquired = await client.set(lockKey, lockValue, {
    NX: true,  // Only if not exists
    PX: timeout  // Expire after timeout
  })
  return acquired === 'OK'
}
```

#### Persistence

**RDB (Snapshotting):**
```
Periodic snapshots
Fast restart
Potential data loss (since last snapshot)
```

**AOF (Append Only File):**
```
Logs every write
More durable
Slower restart
```

**Both:**
```redis
save 900 1  # Save if 1 key changed in 900 seconds
save 300 10
save 60 10000

appendonly yes
appendfsync everysec
```

#### High Availability

**Redis Sentinel:**
```
Monitoring
Automatic failover
Configuration provider
```

**Redis Cluster:**
```
Horizontal scaling
Sharding (16384 hash slots)
Multi-master
```

---

### Memcached

**Simple distributed memory caching**

#### vs Redis

```
Memcached:
  ✓ Simple (key-value only)
  ✓ Multithreaded
  ✓ Lower memory overhead
  ✗ No persistence
  ✗ Limited data structures

Redis:
  ✓ Rich data structures
  ✓ Persistence
  ✓ Pub/Sub
  ✗ Single-threaded (per instance)
```

#### Usage

```javascript
const Memcached = require('memcached')
const memcached = new Memcached('localhost:11211')

// Set
memcached.set('key', 'value', 3600, (err) => {
  // 3600 seconds TTL
})

// Get
memcached.get('key', (err, data) => {
  console.log(data)
})

// Multi-get
memcached.getMulti(['key1', 'key2'], (err, data) => {
  console.log(data)
})
```

---

## Search Engines

### Elasticsearch

**Distributed search and analytics engine**

#### Use Cases

```
- Full-text search
- Log analytics
- Application monitoring
- Business intelligence
```

#### Core Concepts

**Index:** Collection of documents (like database)
**Document:** JSON object (like row)
**Shard:** Subset of index
**Replica:** Copy of shard

#### Usage Example

```javascript
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

// Index document
await client.index({
  index: 'products',
  id: '1',
  body: {
    name: 'Laptop',
    description: 'High-performance laptop for developers',
    price: 1299.99,
    category: 'electronics',
    tags: ['computer', 'portable', 'work']
  }
})

// Search
const result = await client.search({
  index: 'products',
  body: {
    query: {
      multi_match: {
        query: 'laptop developer',
        fields: ['name^2', 'description']  // Name boosted
      }
    },
    aggregations: {
      categories: {
        terms: { field: 'category' }
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 500 },
            { from: 500, to: 1000 },
            { from: 1000 }
          ]
        }
      }
    }
  }
})

// Complex query
await client.search({
  index: 'products',
  body: {
    query: {
      bool: {
        must: [
          { match: { category: 'electronics' } }
        ],
        filter: [
          { range: { price: { gte: 100, lte: 2000 } } }
        ],
        should: [
          { match: { tags: 'portable' } }
        ],
        must_not: [
          { match: { name: 'refurbished' } }
        ]
      }
    },
    sort: [
      { _score: 'desc' },
      { price: 'asc' }
    ],
    from: 0,
    size: 20
  }
})
```

#### Features

**Analyzers:**
```
- Tokenization
- Lowercase
- Stop words removal
- Stemming
- Synonyms
```

**Relevance Scoring:**
```
TF-IDF and BM25 algorithms
Boost fields
Custom scoring
```

**Aggregations:**
```
Metrics: avg, sum, min, max
Buckets: terms, range, date histogram
```

---

## Object Storage

### Amazon S3

**Scalable object storage**

#### Use Cases

```
- Static assets (images, videos, documents)
- Backups
- Data lakes
- Software distribution
```

#### Usage Example

```javascript
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

// Upload
await s3.putObject({
  Bucket: 'my-bucket',
  Key: 'images/profile/user123.jpg',
  Body: fileBuffer,
  ContentType: 'image/jpeg',
  ACL: 'public-read',
  Metadata: {
    'user-id': '123',
    'uploaded-by': 'system'
  }
}).promise()

// Download
const data = await s3.getObject({
  Bucket: 'my-bucket',
  Key: 'images/profile/user123.jpg'
}).promise()

// Pre-signed URL (temporary access)
const url = s3.getSignedUrl('getObject', {
  Bucket: 'my-bucket',
  Key: 'private/document.pdf',
  Expires: 3600  // 1 hour
})

// List objects
const objects = await s3.listObjectsV2({
  Bucket: 'my-bucket',
  Prefix: 'images/',
  MaxKeys: 1000
}).promise()
```

#### Storage Classes

```
S3 Standard: Frequent access
S3 Intelligent-Tiering: Auto-optimize costs
S3 IA (Infrequent Access): Cheaper, access fees
S3 Glacier: Archive, retrieval delay
S3 Glacier Deep Archive: Cheapest, 12h retrieval
```

#### Features

**Versioning:**
```
Keep all versions of objects
Recover from deletes
```

**Lifecycle Policies:**
```xml
<LifecycleConfiguration>
  <Rule>
    <Transition>
      <Days>30</Days>
      <StorageClass>STANDARD_IA</StorageClass>
    </Transition>
    <Transition>
      <Days>90</Days>
      <StorageClass>GLACIER</StorageClass>
    </Transition>
  </Rule>
</LifecycleConfiguration>
```

**Events:**
```
Trigger Lambda on upload
SNS notifications
SQS messages
```

---

## Key Takeaways

1. **Message Queues:** RabbitMQ for tasks, Kafka for events, SQS for AWS
2. **CDN:** Essential for global applications, use versioning for cache invalidation
3. **Reverse Proxy:** Nginx for general purpose, Envoy for service mesh
4. **Cache:** Redis for rich features, Memcached for simplicity
5. **Search:** Elasticsearch for full-text search and analytics
6. **Storage:** S3 for objects, use lifecycle policies to optimize costs

---

[← Previous: Microservices](./05-microservices.md) | [Next: Design Patterns →](./07-design-patterns.md)
