# Load Balancers

## Table of Contents
- [What is a Load Balancer?](#what-is-a-load-balancer)
- [Why Use Load Balancers?](#why-use-load-balancers)
- [Types of Load Balancers](#types-of-load-balancers)
- [Load Balancing Algorithms](#load-balancing-algorithms)
- [Health Checks](#health-checks)
- [Session Persistence](#session-persistence)
- [Load Balancer Placement](#load-balancer-placement)
- [Popular Load Balancing Solutions](#popular-load-balancing-solutions)
- [Advanced Concepts](#advanced-concepts)

---

## What is a Load Balancer?

A load balancer is a device or software that distributes network traffic across multiple servers to ensure no single server becomes overwhelmed. It acts as a reverse proxy, sitting between clients and servers.

### Basic Flow

```
Client Requests
      ↓
[ Load Balancer ]
      ↓
  ┌───┴───┬───────┐
  ↓       ↓       ↓
[Server1] [Server2] [Server3]
```

### Key Functions

1. **Traffic Distribution**: Spread incoming requests across multiple servers
2. **High Availability**: Route traffic away from failed servers
3. **Scalability**: Add/remove servers without downtime
4. **SSL Termination**: Handle SSL encryption/decryption
5. **Security**: Hide backend server details, prevent DDoS

---

## Why Use Load Balancers?

### 1. Increased Availability

```javascript
// Without Load Balancer
Single Server → Fails → Entire System Down

// With Load Balancer
3 Servers → 1 Fails → System Still Running (66% capacity)
```

### 2. Horizontal Scalability

```
Current: 1 server handling 1000 req/sec
Need: 5000 req/sec

Solution: Add 4 more servers behind load balancer
Result: 5 servers × 1000 req/sec = 5000 req/sec
```

### 3. Improved Performance

```
Without LB: All users → Single server in US (high latency for EU users)
With LB: EU users → EU servers, US users → US servers (low latency)
```

### 4. Maintenance Without Downtime

```
1. Remove Server1 from load balancer pool
2. Update/maintain Server1
3. Add Server1 back to pool
4. Repeat for Server2, Server3, etc.
// Zero downtime deployments
```

---

## Types of Load Balancers

### Layer 4 (L4) Load Balancer - Transport Layer

Operates at the TCP/UDP level, makes routing decisions based on IP address and port.

**How it works:**
```
Client connects to LB (TCP handshake)
LB selects backend server based on IP/Port
LB forwards packets to selected server
```

**Characteristics:**
- Fast (less processing)
- No visibility into HTTP headers
- Cannot route based on URL path or cookies
- Maintains single connection throughout session

**Example:**
```
Client: 203.0.113.5:54321
↓
Load Balancer: 198.51.100.1:80
↓
Routes to: 10.0.0.5:8080 (based on IP/Port only)
```

**Use Cases:**
- High-performance requirements
- Non-HTTP protocols (database connections, gaming, VoIP)
- Simple traffic distribution

**Implementation:**
```nginx
# HAProxy L4 Configuration
frontend tcp_front
    bind *:3306
    mode tcp
    default_backend mysql_servers

backend mysql_servers
    mode tcp
    balance roundrobin
    server mysql1 10.0.0.1:3306 check
    server mysql2 10.0.0.2:3306 check
    server mysql3 10.0.0.3:3306 check
```

### Layer 7 (L7) Load Balancer - Application Layer

Operates at the HTTP level, can make intelligent routing decisions based on content.

**How it works:**
```
Client sends HTTP request
LB terminates TCP connection
LB reads HTTP headers, URL, cookies
LB routes based on application logic
LB creates new connection to backend server
```

**Characteristics:**
- Slower (more processing)
- Full visibility into HTTP data
- Can route based on URL, headers, cookies
- Can modify requests/responses
- SSL termination

**Example:**
```
GET /api/users → Route to API servers (10.0.1.x)
GET /static/image.jpg → Route to static servers (10.0.2.x)
GET /admin → Route to admin servers (10.0.3.x)
Cookie: user=premium → Route to premium servers
```

**Use Cases:**
- Web applications
- Microservices routing
- A/B testing
- Content-based routing
- SSL offloading

**Implementation:**
```nginx
# NGINX L7 Configuration
upstream api_servers {
    server 10.0.1.1:8080;
    server 10.0.1.2:8080;
}

upstream static_servers {
    server 10.0.2.1:8080;
    server 10.0.2.2:8080;
}

server {
    listen 80;

    location /api/ {
        proxy_pass http://api_servers;
    }

    location /static/ {
        proxy_pass http://static_servers;
    }

    location /premium/ {
        if ($cookie_tier = "premium") {
            proxy_pass http://premium_servers;
        }
    }
}
```

### L4 vs L7 Comparison

| Feature | Layer 4 (L4) | Layer 7 (L7) |
|---------|-------------|-------------|
| **Speed** | Faster | Slower |
| **Routing** | IP/Port only | URL, headers, cookies |
| **Protocol** | Any TCP/UDP | HTTP/HTTPS |
| **SSL Termination** | No | Yes |
| **Content Modification** | No | Yes |
| **Caching** | No | Yes |
| **Complexity** | Simple | Complex |
| **Use Case** | Database, gaming | Web apps, APIs |

---

## Load Balancing Algorithms

### 1. Round Robin

Distribute requests sequentially to each server.

```javascript
class RoundRobinLoadBalancer {
  constructor(servers) {
    this.servers = servers;
    this.currentIndex = 0;
  }

  getNextServer() {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }
}

// Example
const lb = new RoundRobinLoadBalancer(['server1', 'server2', 'server3']);
console.log(lb.getNextServer()); // server1
console.log(lb.getNextServer()); // server2
console.log(lb.getNextServer()); // server3
console.log(lb.getNextServer()); // server1 (loops back)
```

**Pros:**
- Simple to implement
- Equal distribution (if requests are similar)
- No overhead

**Cons:**
- Doesn't account for server load
- Doesn't account for request complexity
- Uneven distribution if servers have different capacities

**Best For:** Servers with equal capacity, similar request types

### 2. Weighted Round Robin

Like round robin, but servers with higher weight receive more requests.

```javascript
class WeightedRoundRobinLoadBalancer {
  constructor(servers) {
    // servers = [{name: 'server1', weight: 3}, {name: 'server2', weight: 1}]
    this.weightedServers = [];

    servers.forEach(server => {
      for (let i = 0; i < server.weight; i++) {
        this.weightedServers.push(server.name);
      }
    });

    this.currentIndex = 0;
  }

  getNextServer() {
    const server = this.weightedServers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.weightedServers.length;
    return server;
  }
}

// Example
const lb = new WeightedRoundRobinLoadBalancer([
  { name: 'server1', weight: 3 },  // Powerful server
  { name: 'server2', weight: 1 }   // Less powerful
]);

// Sequence: server1, server1, server1, server2, server1, server1, server1, server2...
```

**Configuration:**
```nginx
upstream backend {
    server server1.example.com weight=3;
    server server2.example.com weight=1;
}
```

**Best For:** Servers with different capacities

### 3. Least Connections

Route to the server with the fewest active connections.

```javascript
class LeastConnectionsLoadBalancer {
  constructor(servers) {
    this.servers = servers.map(name => ({
      name,
      connections: 0
    }));
  }

  getNextServer() {
    // Find server with minimum connections
    const server = this.servers.reduce((min, current) =>
      current.connections < min.connections ? current : min
    );

    server.connections++;
    return server.name;
  }

  releaseConnection(serverName) {
    const server = this.servers.find(s => s.name === serverName);
    if (server) server.connections--;
  }
}

// Example
const lb = new LeastConnectionsLoadBalancer(['server1', 'server2', 'server3']);

// Initially all have 0 connections
lb.getNextServer(); // server1 (0→1 connection)
lb.getNextServer(); // server2 (0→1 connection)
lb.getNextServer(); // server3 (0→1 connection)
lb.getNextServer(); // server1 (1→2 connections)
lb.releaseConnection('server2'); // server2 (1→0 connections)
lb.getNextServer(); // server2 (0→1 connection, has least)
```

**Pros:**
- Adapts to varying request duration
- Better distribution for long-lived connections

**Cons:**
- More overhead (tracking connections)
- Doesn't account for request complexity

**Best For:** Long-lived connections (WebSockets, database connections)

### 4. Least Response Time

Route to server with lowest response time and fewest connections.

```javascript
class LeastResponseTimeLoadBalancer {
  constructor(servers) {
    this.servers = servers.map(name => ({
      name,
      connections: 0,
      avgResponseTime: 0,
      totalRequests: 0
    }));
  }

  getNextServer() {
    const server = this.servers.reduce((best, current) => {
      const bestScore = best.avgResponseTime * (best.connections + 1);
      const currentScore = current.avgResponseTime * (current.connections + 1);
      return currentScore < bestScore ? current : best;
    });

    server.connections++;
    return server.name;
  }

  recordResponse(serverName, responseTime) {
    const server = this.servers.find(s => s.name === serverName);
    if (server) {
      server.totalRequests++;
      server.avgResponseTime =
        (server.avgResponseTime * (server.totalRequests - 1) + responseTime) /
        server.totalRequests;
      server.connections--;
    }
  }
}
```

**Best For:** Servers with varying performance characteristics

### 5. IP Hash

Route based on client IP address (same client always goes to same server).

```javascript
class IPHashLoadBalancer {
  constructor(servers) {
    this.servers = servers;
  }

  hashIP(ip) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      hash = ((hash << 5) - hash) + ip.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getServerForIP(clientIP) {
    const hash = this.hashIP(clientIP);
    const index = hash % this.servers.length;
    return this.servers[index];
  }
}

// Example
const lb = new IPHashLoadBalancer(['server1', 'server2', 'server3']);

lb.getServerForIP('192.168.1.100'); // Always server2
lb.getServerForIP('192.168.1.100'); // Always server2 (same)
lb.getServerForIP('10.0.0.50');     // Always server1
```

**Configuration:**
```nginx
upstream backend {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}
```

**Pros:**
- Session persistence without cookies
- Predictable routing

**Cons:**
- Uneven distribution (some IPs more common)
- Adding/removing servers changes distribution

**Best For:** Session-based applications without shared session storage

### 6. Consistent Hashing

Like IP hash, but minimizes redistribution when servers change.

```javascript
class ConsistentHashLoadBalancer {
  constructor(servers, virtualNodes = 150) {
    this.ring = [];

    servers.forEach(server => {
      // Add multiple virtual nodes per server
      for (let i = 0; i < virtualNodes; i++) {
        const hash = this.hash(`${server}:${i}`);
        this.ring.push({ hash, server });
      }
    });

    // Sort by hash value
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  getServer(clientIP) {
    const hash = this.hash(clientIP);

    // Find first server with hash >= client hash
    for (let i = 0; i < this.ring.length; i++) {
      if (this.ring[i].hash >= hash) {
        return this.ring[i].server;
      }
    }

    // Wrap around to first server
    return this.ring[0].server;
  }
}

// When adding/removing servers, only ~1/N keys are redistributed
```

**Best For:** Distributed caching, scaling scenarios

### 7. Random

Randomly select a server.

```javascript
class RandomLoadBalancer {
  constructor(servers) {
    this.servers = servers;
  }

  getNextServer() {
    const randomIndex = Math.floor(Math.random() * this.servers.length);
    return this.servers[randomIndex];
  }
}
```

**Pros:**
- Simple
- Good distribution over time

**Cons:**
- Short-term unevenness
- No optimization

**Best For:** Testing, simple use cases

---

## Health Checks

Load balancers need to detect failed servers and stop routing traffic to them.

### Types of Health Checks

#### 1. Passive Health Checks

Monitor actual traffic and mark servers as unhealthy based on errors.

```nginx
upstream backend {
    server server1.example.com max_fails=3 fail_timeout=30s;
    server server2.example.com max_fails=3 fail_timeout=30s;
}

# After 3 failed requests, mark server unhealthy for 30 seconds
```

#### 2. Active Health Checks

Periodically send test requests to servers.

```javascript
class HealthChecker {
  constructor(servers, interval = 10000) {
    this.servers = servers.map(url => ({
      url,
      healthy: true,
      consecutiveFailures: 0
    }));

    setInterval(() => this.checkAllServers(), interval);
  }

  async checkServer(server) {
    try {
      const response = await fetch(`${server.url}/health`, {
        timeout: 5000
      });

      if (response.ok) {
        server.healthy = true;
        server.consecutiveFailures = 0;
      } else {
        server.consecutiveFailures++;
        if (server.consecutiveFailures >= 3) {
          server.healthy = false;
        }
      }
    } catch (error) {
      server.consecutiveFailures++;
      if (server.consecutiveFailures >= 3) {
        server.healthy = false;
      }
    }
  }

  async checkAllServers() {
    await Promise.all(
      this.servers.map(server => this.checkServer(server))
    );
  }

  getHealthyServers() {
    return this.servers.filter(s => s.healthy);
  }
}
```

### Health Check Endpoints

```javascript
// Express.js health check endpoint
app.get('/health', (req, res) => {
  // Check database connection
  const dbHealthy = await checkDatabase();

  // Check external dependencies
  const cacheHealthy = await checkRedis();

  // Check system resources
  const cpuUsage = os.loadavg()[0];
  const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;

  const healthy = dbHealthy && cacheHealthy && cpuUsage < 0.8 && memoryUsage < 0.9;

  if (healthy) {
    res.status(200).json({ status: 'healthy', cpu: cpuUsage, memory: memoryUsage });
  } else {
    res.status(503).json({ status: 'unhealthy', cpu: cpuUsage, memory: memoryUsage });
  }
});
```

---

## Session Persistence

Ensuring requests from the same user go to the same server.

### 1. Sticky Sessions (Cookie-Based)

```nginx
upstream backend {
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    server server1.example.com;
    server server2.example.com;
}

# Load balancer sets cookie: srv_id=server1
# Subsequent requests with this cookie → server1
```

### 2. IP-Based Persistence

```nginx
upstream backend {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
}
```

### 3. Shared Session Storage (Better Approach)

Instead of sticky sessions, store sessions externally:

```javascript
// Store sessions in Redis (accessible by all servers)
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ host: 'redis-server' });

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Now any server can handle any request
```

---

## Load Balancer Placement

### 1. Single Load Balancer

```
Clients → [ Load Balancer ] → [ Servers ]
```

**Pros:** Simple, cost-effective
**Cons:** Single point of failure

### 2. Active-Passive Load Balancers

```
Clients → [ Primary LB ] ←→ [ Backup LB ]
              ↓
          [ Servers ]
```

**Pros:** High availability
**Cons:** Wasted resources (backup idle)

### 3. Active-Active Load Balancers (DNS Round Robin)

```
         DNS Round Robin
         /             \
[ Load Balancer 1 ]  [ Load Balancer 2 ]
         \             /
           [ Servers ]
```

**Pros:** No waste, scales
**Cons:** DNS caching issues

### 4. Multi-Tier Load Balancing

```
     [ External LB ] (L7)
            ↓
    ┌───────┴───────┐
    ↓               ↓
[ LB for API ] [ LB for Web ]
    ↓               ↓
[ API Servers ] [ Web Servers ]
```

---

## Popular Load Balancing Solutions

### 1. NGINX

```nginx
http {
    upstream backend {
        least_conn;  # Algorithm

        server backend1.example.com weight=3;
        server backend2.example.com weight=2;
        server backend3.example.com backup;  # Only used if others fail

        keepalive 32;  # Connection pooling
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

**Pros:** Fast, lightweight, flexible, free
**Use Cases:** Web apps, API gateways, reverse proxy

### 2. HAProxy

```
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /health
    server server1 10.0.0.1:8080 check
    server server2 10.0.0.2:8080 check
    server server3 10.0.0.3:8080 check
```

**Pros:** Very fast, reliable, advanced features
**Use Cases:** High-traffic sites, TCP/HTTP load balancing

### 3. AWS Elastic Load Balancer (ELB)

**Application Load Balancer (ALB)** - Layer 7
```
- Path-based routing (/api → api servers)
- Host-based routing (api.example.com → api servers)
- WebSocket support
- Integrated with AWS services
```

**Network Load Balancer (NLB)** - Layer 4
```
- Ultra-low latency
- Millions of requests/sec
- Static IP addresses
- TCP/UDP/TLS traffic
```

### 4. Cloud Load Balancer (GCP)

Global load balancing with CDN integration

### 5. Azure Load Balancer

Layer 4 load balancing for Azure VMs

---

## Advanced Concepts

### SSL Termination

Load balancer handles SSL, forwards unencrypted traffic to backends.

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://backend;  # HTTP to backend
    }
}
```

**Benefits:**
- Reduced CPU load on application servers
- Centralized certificate management
- Easier debugging (unencrypted backend traffic)

### Connection Pooling

Reuse connections between load balancer and backends.

```nginx
upstream backend {
    server backend1.example.com;
    keepalive 100;  # Maintain 100 idle connections
}
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location / {
        limit_req zone=one burst=20;
        proxy_pass http://backend;
    }
}
```

### Global Server Load Balancing (GSLB)

DNS-based routing to nearest data center.

```
User in Europe → DNS resolves to EU load balancer
User in Asia → DNS resolves to Asia load balancer
```

---

## Best Practices

1. **Always use health checks** - Detect and remove unhealthy servers
2. **Enable connection pooling** - Reduce overhead
3. **Configure timeouts** - Prevent hanging connections
4. **Use SSL termination** - Offload encryption from app servers
5. **Monitor metrics** - Track latency, error rates, connections
6. **Implement retries** - Retry failed requests on different servers
7. **Use multiple load balancers** - Eliminate single point of failure
8. **Choose right algorithm** - Match algorithm to use case
9. **Plan for scaling** - Use consistent hashing if adding servers frequently
10. **Test failover** - Regularly test server failure scenarios

---

## Summary

Load balancers are critical for:
- **High availability** - Route around failures
- **Scalability** - Distribute traffic across servers
- **Performance** - Optimize routing, SSL offloading
- **Flexibility** - Add/remove servers without downtime

**Key Decisions:**
- L4 vs L7 (speed vs intelligence)
- Algorithm (round robin, least connections, IP hash)
- Session persistence strategy
- Health check configuration
- Placement architecture

**Next:** [Monitoring and Observability](./12-monitoring-observability.md)
