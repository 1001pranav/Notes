# Real-World System Design Examples

Step-by-step design of common systems with detailed architecture.

## Table of Contents
1. [URL Shortener (like bit.ly)](#url-shortener)
2. [Social Media Feed (like Twitter)](#social-media-feed)
3. [Chat System (like WhatsApp)](#chat-system)
4. [Video Streaming (like YouTube)](#video-streaming)
5. [Ride-Sharing Service (like Uber)](#ride-sharing-service)

---

## URL Shortener

Design a service like bit.ly that shortens long URLs.

### Requirements

**Functional:**
- Shorten long URL to unique short URL
- Redirect short URL to original URL
- Custom aliases (optional)
- Analytics (click tracking)
- URL expiration (optional)

**Non-Functional:**
- High availability
- Low latency redirects (< 100ms)
- Scalable (millions of URLs/day)
- Durable (URLs never lost)

### Capacity Estimation

```
Users: 100M active users
Write: 100M new URLs per day = 1,200 URLs/second
Read: 100:1 read-write ratio = 120,000 reads/second
Storage: 100M URLs/day × 365 days × 5 years = 182B URLs
         182B × 500 bytes/URL = 91 TB
```

### API Design

```
POST /api/shorten
Body: { "long_url": "https://example.com/very/long/url" }
Response: { "short_url": "https://bit.ly/abc123" }

GET /{short_code}
Redirect to original URL
```

### Database Schema

```sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(7) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  clicks BIGINT DEFAULT 0,
  INDEX (short_code),
  INDEX (user_id)
);

CREATE TABLE analytics (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(7),
  clicked_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(2)
);
```

### Short Code Generation

**Base62 Encoding:**
```javascript
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function toBase62(num) {
  if (num === 0) return ALPHABET[0]

  let result = ''
  while (num > 0) {
    result = ALPHABET[num % 62] + result
    num = Math.floor(num / 62)
  }
  return result
}

// Auto-increment ID → Base62
const id = 12345
const shortCode = toBase62(id)  // '3D7'

// 7 characters = 62^7 = 3.5 trillion unique URLs
```

**Hash + Collision Handling:**
```javascript
async function generateShortCode(longUrl) {
  // MD5 hash → Base62 → Take first 7 chars
  const hash = crypto.createHash('md5').update(longUrl).digest('hex')
  let shortCode = toBase62(parseInt(hash.substring(0, 8), 16)).substring(0, 7)

  // Check collision
  let existing = await db.findOne({ short_code: shortCode })
  let attempt = 0

  while (existing) {
    // Append attempt number and retry
    const newHash = hash + attempt
    shortCode = toBase62(parseInt(newHash.substring(0, 8), 16)).substring(0, 7)
    existing = await db.findOne({ short_code: shortCode })
    attempt++
  }

  return shortCode
}
```

### Architecture

```
┌────────┐
│ Client │
└───┬────┘
    │
    ↓
┌────────────┐
│   CDN/     │
│   Cache    │
└─────┬──────┘
      │
      ↓
┌─────────────┐       ┌──────────┐
│Load Balancer├──────→│   API    │
└─────────────┘       │  Servers │
                      └────┬─────┘
                           │
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │  Redis   │    │PostgreSQL│   │  Kafka   │
    │  Cache   │    │(Primary) │   │(Analytics)
    └──────────┘    └────┬─────┘   └──────────┘
                         │
                  ┌──────┴──────┐
                  ↓             ↓
           ┌──────────┐  ┌──────────┐
           │PostgreSQL│  │PostgreSQL│
           │(Replica) │  │(Replica) │
           └──────────┘  └──────────┘
```

### Implementation

```javascript
// POST /api/shorten
app.post('/api/shorten', async (req, res) => {
  const { long_url, custom_alias } = req.body

  // Validate URL
  if (!isValidURL(long_url)) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  // Check if already shortened
  const existing = await db.urls.findOne({ long_url, user_id: req.user.id })
  if (existing) {
    return res.json({ short_url: `https://bit.ly/${existing.short_code}` })
  }

  // Generate short code
  const shortCode = custom_alias || await generateShortCode(long_url)

  // Save to database
  await db.urls.create({
    short_code: shortCode,
    long_url: long_url,
    user_id: req.user.id
  })

  res.json({ short_url: `https://bit.ly/${shortCode}` })
})

// GET /{short_code}
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params

  // Check cache
  let url = await redis.get(`url:${shortCode}`)

  if (!url) {
    // Cache miss - query DB
    const record = await db.urls.findOne({ short_code: shortCode })

    if (!record || (record.expires_at && record.expires_at < new Date())) {
      return res.status(404).send('URL not found')
    }

    url = record.long_url

    // Cache for 1 hour
    await redis.setex(`url:${shortCode}`, 3600, url)
  }

  // Analytics (async)
  kafka.send({
    topic: 'url_clicks',
    messages: [{
      short_code: shortCode,
      ip: req.ip,
      user_agent: req.get('user-agent'),
      timestamp: Date.now()
    }]
  })

  // Redirect
  res.redirect(301, url)
})
```

### Optimizations

**1. Caching:**
```
- Cache hot URLs in Redis/CDN
- 90% of clicks on 10% of URLs (power law)
- TTL: 1 hour
```

**2. Analytics:**
```
- Async processing via Kafka
- Batch inserts to analytics DB
- Aggregate data for dashboards
```

**3. Rate Limiting:**
```
- Limit URL creation per user
- Prevent abuse
```

---

## Social Media Feed

Design a Twitter-like news feed.

### Requirements

**Functional:**
- Post tweets
- Follow users
- View home timeline (tweets from followed users)
- View user timeline

**Non-Functional:**
- Highly available
- Low latency feeds (< 500ms)
- Eventually consistent
- Scalable (500M users, 1B tweets/day)

### API Design

```
POST /api/tweets
Body: { "content": "Hello world!", "media_urls": [...] }

GET /api/timeline/home?cursor=abc123&limit=20
Response: { "tweets": [...], "next_cursor": "xyz789" }

GET /api/timeline/user/{user_id}?cursor=abc123&limit=20

POST /api/follow/{user_id}
```

### Database Schema

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE tweets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (user_id, created_at)
);

CREATE TABLE follows (
  follower_id BIGINT NOT NULL,
  followee_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id),
  INDEX (follower_id),
  INDEX (followee_id)
);

-- Denormalized for fast reads
CREATE TABLE feeds (
  user_id BIGINT NOT NULL,
  tweet_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, created_at, tweet_id),
  INDEX (user_id, created_at DESC)
);
```

### Feed Generation Approaches

**1. Fan-out on Write (Push):**
```javascript
// When user posts tweet
async function createTweet(userId, content) {
  // Insert tweet
  const tweet = await db.tweets.create({ user_id: userId, content })

  // Get followers
  const followers = await db.follows.find({ followee_id: userId })

  // Push tweet to all followers' feeds
  const feedInserts = followers.map(follower => ({
    user_id: follower.follower_id,
    tweet_id: tweet.id,
    created_at: tweet.created_at
  }))

  await db.feeds.insertMany(feedInserts)

  return tweet
}

// Read feed (fast)
async function getHomeFeed(userId, limit = 20, cursor) {
  return await db.feeds.find({
    user_id: userId,
    created_at: { $lt: cursor }
  }).sort({ created_at: -1 }).limit(limit)
}
```

**Pros:** Fast reads
**Cons:** Slow writes (celebrities with millions of followers)

**2. Fan-out on Read (Pull):**
```javascript
// Write tweet (fast)
async function createTweet(userId, content) {
  return await db.tweets.create({ user_id: userId, content })
}

// Read feed (slow)
async function getHomeFeed(userId, limit = 20) {
  // Get followed users
  const following = await db.follows.find({ follower_id: userId })
  const followeeIds = following.map(f => f.followee_id)

  // Get tweets from followed users
  return await db.tweets.find({
    user_id: { $in: followeeIds },
  }).sort({ created_at: -1 }).limit(limit)
}
```

**Pros:** Fast writes
**Cons:** Slow reads (querying multiple users' tweets)

**3. Hybrid Approach (Twitter's approach):**
```javascript
async function createTweet(userId, content) {
  const tweet = await db.tweets.create({ user_id: userId, content })

  const followerCount = await db.follows.count({ followee_id: userId })

  if (followerCount < 10000) {
    // Regular user: Fan-out on write
    const followers = await db.follows.find({ followee_id: userId })
    await Promise.all(followers.map(f =>
      redis.zadd(`feed:${f.follower_id}`, tweet.created_at, tweet.id)
    ))
  } else {
    // Celebrity: Fan-out on read
    await redis.sadd('celebrities', userId)
  }

  return tweet
}

async function getHomeFeed(userId, limit = 20) {
  // Get pre-computed feed (from Redis sorted set)
  let tweets = await redis.zrevrange(`feed:${userId}`, 0, limit - 1)

  // Merge with celebrity tweets (fan-out on read)
  const celebrities = await redis.smembers('celebrities')
  const following = await db.follows.find({ follower_id: userId })
  const followedCelebrities = following.filter(f => celebrities.includes(f.followee_id))

  if (followedCelebrities.length > 0) {
    const celebrityTweets = await db.tweets.find({
      user_id: { $in: followedCelebrities.map(f => f.followee_id) }
    }).sort({ created_at: -1 }).limit(limit)

    // Merge and sort
    tweets = mergeSorted(tweets, celebrityTweets).slice(0, limit)
  }

  return tweets
}
```

### Architecture

```
                ┌────────────┐
                │   Client   │
                └──────┬─────┘
                       │
                ┌──────▼──────┐
                │API Gateway  │
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌───────────┐  ┌───────────┐  ┌───────────┐
│Tweet Write│  │Tweet Read │  │  Follow   │
│  Service  │  │  Service  │  │  Service  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      ↓              ↓              ↓
┌─────────────────────────────────────┐
│         Message Queue (Kafka)       │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
┌────────┐ ┌────────┐ ┌────────┐
│Feed Gen│ │Analytics│ │Notif   │
│Worker  │ │Worker   │ │Worker  │
└───┬────┘ └────────┘ └────────┘
    │
    ↓
┌────────┐       ┌──────────┐
│ Redis  │       │Cassandra │
│(Feeds) │       │(Tweets)  │
└────────┘       └──────────┘
```

---

## Chat System

Design a WhatsApp-like chat application.

### Requirements

**Functional:**
- One-on-one chat
- Group chat
- Online status
- Message delivery confirmation
- Message persistence

**Non-Functional:**
- Real-time (low latency < 100ms)
- Highly available
- Scalable (1B users, 100B messages/day)
- End-to-end encryption

### Architecture

```
┌────────┐                    ┌────────┐
│Client A│                    │Client B│
└───┬────┘                    └───┬────┘
    │                             │
    │  WebSocket                  │ WebSocket
    │  Connection                 │ Connection
    │                             │
    ├──────────┐         ┌────────┤
    │          ↓         ↓        │
┌───▼──────────────────────────▼─┐
│    WebSocket Gateway Cluster   │
│  (Persistent connections)      │
└───────────┬────────────────────┘
            │
            ↓
    ┌───────────────┐
    │ Message Queue │
    │    (Kafka)    │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ↓               ↓
┌────────┐    ┌──────────┐
│Message │    │ Online   │
│Handler │    │ Status   │
│Service │    │ Service  │
└───┬────┘    └────┬─────┘
    │              │
    ↓              ↓
┌────────┐    ┌────────┐
│Cassandra│   │ Redis  │
│(Messages)│  │(Status)│
└─────────┘   └────────┘
```

### WebSocket Server

```javascript
const WebSocket = require('ws')
const redis = require('redis').createClient()

const wss = new WebSocket.Server({ port: 8080 })
const connections = new Map()  // userId → WebSocket

wss.on('connection', (ws, req) => {
  let userId

  ws.on('message', async (data) => {
    const message = JSON.parse(data)

    switch (message.type) {
      case 'auth':
        userId = await authenticateUser(message.token)
        connections.set(userId, ws)
        await redis.set(`online:${userId}`, Date.now())
        break

      case 'message':
        await handleMessage(userId, message)
        break

      case 'typing':
        await notifyTyping(userId, message.recipient_id)
        break
    }
  })

  ws.on('close', async () => {
    connections.delete(userId)
    await redis.del(`online:${userId}`)
  })
})

async function handleMessage(senderId, message) {
  const { recipient_id, content, chat_id } = message

  // Save message
  const msg = await db.messages.create({
    id: uuidv4(),
    chat_id,
    sender_id: senderId,
    content,
    created_at: Date.now()
  })

  // Send to recipient if online
  const recipientWs = connections.get(recipient_id)
  if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
    recipientWs.send(JSON.stringify({
      type: 'message',
      data: msg
    }))

    // Send delivery confirmation to sender
    const senderWs = connections.get(senderId)
    senderWs.send(JSON.stringify({
      type: 'delivered',
      message_id: msg.id
    }))
  } else {
    // Recipient offline - queue for later
    await redis.lpush(`pending:${recipient_id}`, JSON.stringify(msg))

    // Send push notification
    await sendPushNotification(recipient_id, msg)
  }
}
```

### Message Storage (Cassandra)

```sql
-- Optimized for message retrieval by chat
CREATE TABLE messages (
  chat_id UUID,
  message_id UUID,
  sender_id BIGINT,
  content TEXT,
  created_at TIMESTAMP,
  PRIMARY KEY ((chat_id), created_at, message_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Query recent messages
SELECT * FROM messages
WHERE chat_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

### Scaling WebSocket Connections

**Challenge:** User connects to different server on reconnect

**Solutions:**

**1. Service Discovery + Redis Pub/Sub:**
```javascript
// When user connects, register in Redis
await redis.set(`user:${userId}:server`, 'ws-server-3')

// To send message
const serverIdfOrUser = await redis.get(`user:${recipientId}:server`)
await redis.publish(`server:${serverId}`, JSON.stringify(message))

// Each server subscribes to its channel
redis.subscribe(`server:${SERVER_ID}`)
redis.on('message', (channel, message) => {
  const msg = JSON.parse(message)
  const ws = connections.get(msg.recipient_id)
  if (ws) ws.send(JSON.stringify(msg))
})
```

**2. Message Queue (Kafka):**
```javascript
// Producer: Send message to Kafka
await kafka.send({
  topic: `user.${recipientId}`,
  messages: [{ value: JSON.stringify(message) }]
})

// Consumer: Each WS server consumes messages for its connected users
kafka.subscribe({ topics: connectedUserTopics })
kafka.run({
  eachMessage: async ({ message }) => {
    const msg = JSON.parse(message.value)
    const ws = connections.get(msg.recipient_id)
    if (ws) ws.send(JSON.stringify(msg))
  }
})
```

---

## Video Streaming

Design a YouTube-like video platform.

### Components

**Upload Pipeline:**
```
1. User uploads video → S3
2. Transcoding service (AWS MediaConvert, FFmpeg)
   - Multiple resolutions (360p, 720p, 1080p, 4K)
   - Multiple formats (MP4, HLS, DASH)
3. Generate thumbnails
4. Store in CDN
```

**Streaming:**
```
1. Client requests video
2. CDN serves chunks (HLS/DASH)
3. Adaptive bitrate streaming
4. Analytics (views, watch time)
```

**Architecture:**
```
Upload:
Client → API Gateway → S3 → SQS → Transcoding Workers → CDN

Playback:
Client → CDN (cache) → Origin Server → S3
```

---

## Ride-Sharing Service

Design an Uber-like service.

### Key Features

- Match riders with nearby drivers
- Real-time location tracking
- ETA calculation
- Dynamic pricing

### Geospatial Indexing

**Geohash:**
```javascript
// Encode lat/lng to geohash
const geohash = encodeGeohash(37.7749, -122.4194)  // "9q8yy"

// Find nearby drivers (same geohash prefix)
const nearbyDrivers = await redis.georadius(
  'drivers',
  -122.4194,  // longitude
  37.7749,    // latitude
  5,          // radius (km)
  'km',
  'WITHCOORD'
)
```

**QuadTree/S2 Cells:** More efficient for dense areas

### Real-time Tracking

```javascript
// Driver updates location every 5 seconds
await redis.geoadd('drivers', longitude, latitude, driverId)

// Rider sees nearby drivers
setInterval(async () => {
  const drivers = await redis.georadius('drivers', riderLng, riderLat, 5, 'km')
  updateMapMarkers(drivers)
}, 5000)
```

---

## Key Takeaways

1. **URL Shortener:** Base62 encoding, caching, analytics
2. **Social Feed:** Fan-out on write for normal users, fan-out on read for celebrities
3. **Chat:** WebSockets, Redis Pub/Sub, Cassandra for messages
4. **Video Streaming:** Transcoding, CDN, adaptive streaming
5. **Ride-Sharing:** Geospatial indexing, real-time updates

---

[← Previous: Security](./09-security.md) | [Next: Monitoring →](./11-monitoring.md)
