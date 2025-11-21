# Docker Networking - Detailed Guide

## Table of Contents
- [What is Docker Networking?](#what-is-docker-networking)
- [Network Types Explained](#network-types-explained)
  - [Bridge Network](#1-bridge-network-default)
  - [Host Network](#2-host-network)
  - [None Network](#3-none-network)
  - [Overlay Network](#4-overlay-network)
- [Creating and Managing Networks](#creating-and-managing-networks)
- [Connecting Containers](#connecting-containers)
- [Port Mapping Explained](#port-mapping-explained)
- [DNS in Docker](#dns-in-docker-container-discovery)
- [Container Communication Example](#container-communication-example)
- [Network Best Practices](#network-best-practices)

---

## What is Docker Networking?

**Simple Definition:**
Docker networking allows containers to communicate with each other and with the outside world.

**Why is it needed?**
- Containers are isolated by default - they can't talk to each other
- You need to expose services to the outside world (like a web server)
- Multi-container apps need internal communication (web → database)

**Real-World Example:**
```
Your Application:
+------------------+     +------------------+     +------------------+
|    Frontend      | --> |     Backend      | --> |    Database      |
|   (React app)    |     |   (Node.js API)  |     |   (PostgreSQL)   |
+------------------+     +------------------+     +------------------+
        |
  Port 80 exposed      Internal network only - not exposed to outside
  to outside world
```

---

## Network Types Explained

### 1. Bridge Network (Default)

**What is it?**
An isolated network on a single host where containers can communicate with each other.

**Why use it?**
- Default for standalone containers
- Provides isolation between containers
- Containers can reach outside internet

**Analogy:**
> Like a private office network - computers inside can talk to each other and access the internet, but outsiders can't directly access those computers.

```bash
# Containers on default bridge can't find each other by name
docker run -d --name web nginx
docker run -d --name api myapi
# 'web' cannot reach 'api' by name on default bridge!

# Create custom bridge - containers CAN find each other by name
docker network create mynetwork
docker run -d --name web --network mynetwork nginx
docker run -d --name api --network mynetwork myapi
# Now 'web' can reach 'api' by hostname "api"
```

### 2. Host Network

**What is it?**
Container uses the host's network directly - no isolation.

**Why use it?**
- Best performance (no network translation)
- When you need to access host network interfaces
- Debugging network issues

**Trade-off:** No port mapping needed, but loses network isolation.

```bash
docker run -d --network host nginx
# Nginx now directly on host's port 80, no -p needed
# But: No isolation from host network
```

### 3. None Network

**What is it?**
Container has no network access at all.

**Why use it?**
- Maximum security for processing-only containers
- Batch jobs that don't need network
- Security-sensitive workloads

```bash
docker run -d --network none myapp
# Container is completely isolated - no internet, no other containers
```

### 4. Overlay Network

**What is it?**
Network that spans multiple Docker hosts (for Docker Swarm/Kubernetes).

**Why use it?**
- Multi-host container communication
- Production clusters
- Microservices across servers

```bash
# Only works with Swarm initialized
docker network create -d overlay my-overlay
```

---

## Creating and Managing Networks

```bash
# Create a network
docker network create mynetwork

# Create with specific subnet
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  mynetwork

# List all networks
docker network ls

# Inspect network details
docker network inspect mynetwork
# Shows: connected containers, IP addresses, config

# Remove a network
docker network rm mynetwork

# Remove all unused networks
docker network prune
```

---

## Connecting Containers

### Method 1: Create container on network
```bash
docker run -d --name web --network mynetwork nginx
```

### Method 2: Connect existing container
```bash
docker run -d --name web nginx
docker network connect mynetwork web
```

### Method 3: Connect to multiple networks
```bash
docker network create frontend
docker network create backend

docker run -d --name api myapi
docker network connect frontend api
docker network connect backend api
# 'api' can now reach containers on both networks
```

### Disconnect from network
```bash
docker network disconnect mynetwork web
```

---

## Port Mapping Explained

**What is port mapping?**
Connects a port on your host machine to a port inside the container.

**Why needed?**
Containers are isolated - without port mapping, you can't access services inside from outside.

```
Without port mapping:
+------------------+          +------------------+
|   Your Computer  |    X     |    Container     |
|                  |----X---->|  nginx on :80    |
|   localhost:80   |    X     |                  |
+------------------+          +------------------+
Cannot reach container!

With port mapping (-p 8080:80):
+------------------+          +------------------+
|   Your Computer  |   ✓      |    Container     |
|                  |--------->|  nginx on :80    |
|  localhost:8080  |   ✓      |                  |
+------------------+          +------------------+
Request flows: localhost:8080 → container:80
```

### Port Mapping Syntax
```bash
# Format: -p HOST_PORT:CONTAINER_PORT
docker run -p 8080:80 nginx
#           ^^^^ ^^
#           |    +-- Port INSIDE container (nginx listens here)
#           +-- Port on YOUR computer (access via localhost:8080)

# Multiple ports
docker run -p 80:80 -p 443:443 nginx

# Only accessible from localhost (not from network)
docker run -p 127.0.0.1:8080:80 nginx

# Let Docker choose random host port
docker run -p 80 nginx
docker port container_name  # See what port was assigned

# UDP port
docker run -p 53:53/udp dns-server

# Publish all exposed ports to random ports
docker run -P nginx  # Capital P
```

---

## DNS in Docker (Container Discovery)

**What is DNS in Docker?**
Docker provides built-in DNS so containers can find each other by name instead of IP address.

**Why is this important?**
- Container IP addresses can change
- Names are easier to remember and configure
- Applications don't need to know IP addresses

**Important:** Only works on **custom networks**, NOT on default bridge!

```bash
# Create custom network
docker network create app-network

# Start database
docker run -d \
  --name database \
  --network app-network \
  postgres:15

# Start application
docker run -d \
  --name webapp \
  --network app-network \
  -e DATABASE_HOST=database \  # Use container NAME, not IP!
  myapp

# Inside 'webapp' container:
ping database        # Works! Resolves to database container's IP
curl http://database:5432  # Can reach postgres by name
```

**How it works:**
```
webapp container                     database container
       |                                   |
       | ping database                     |
       |                                   |
       v                                   |
Docker DNS Server                          |
       |                                   |
       | "database" → 172.20.0.2          |
       |                                   |
       +---------------------------------->+
                    ✓ Connected!
```

---

## Container Communication Example

### Scenario: Web app + API + Database

```bash
# 1. Create network
docker network create app-network

# 2. Start database (no port exposed to outside)
docker run -d \
  --name db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# 3. Start API (can reach database by name "db")
docker run -d \
  --name api \
  --network app-network \
  -e DATABASE_URL=postgres://postgres:secret@db:5432/postgres \
  myapi

# 4. Start frontend (exposed to outside world)
docker run -d \
  --name web \
  --network app-network \
  -p 80:80 \
  -e API_URL=http://api:3000 \
  myfrontend
```

**Security benefit:**
- Only `web` is exposed to outside (port 80)
- `api` and `db` are internal only - can't be accessed from internet
- Containers communicate securely inside the network

---

## Network Best Practices

1. **Always use custom networks** (not default bridge)
   ```bash
   docker network create myapp
   ```

2. **Don't expose databases to outside**
   ```bash
   # Good - no -p flag, internal only
   docker run -d --network myapp postgres

   # Bad - database exposed to internet!
   docker run -d -p 5432:5432 postgres
   ```

3. **Use meaningful network names**
   ```bash
   docker network create frontend-network
   docker network create backend-network
   ```

4. **Separate concerns with multiple networks**
   ```bash
   # Frontend can't directly reach database
   docker network connect frontend-network web
   docker network connect backend-network api
   docker network connect backend-network db
   ```

---
