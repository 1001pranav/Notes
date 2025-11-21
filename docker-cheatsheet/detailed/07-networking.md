## 7. Docker Networking

### 7.1 Network Types

| Network | Description | Use Case |
|---------|-------------|----------|
| **bridge** | Default, isolated network | Single host containers |
| **host** | Uses host's network | Performance critical |
| **none** | No networking | Isolated processing |
| **overlay** | Multi-host networking | Swarm/Kubernetes |
| **macvlan** | Assign MAC address | Legacy applications |

```bash
# List networks
docker network ls

# Output:
# NETWORK ID     NAME      DRIVER    SCOPE
# a1b2c3d4e5f6   bridge    bridge    local
# b2c3d4e5f6a7   host      host      local
# c3d4e5f6a7b8   none      null      local
```

### 7.2 Creating Networks

```bash
# Create bridge network
docker network create mynetwork

# Create with subnet
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  mynetwork

# Inspect network
docker network inspect mynetwork

# Remove network
docker network rm mynetwork

# Remove unused networks
docker network prune
```

### 7.3 Connecting Containers

```bash
# Run container on specific network
docker run -d --name web --network mynetwork nginx

# Connect running container to network
docker network connect mynetwork container_name

# Disconnect from network
docker network disconnect mynetwork container_name

# Connect to multiple networks
docker network connect frontend web
docker network connect backend web
```

**Container Communication Example:**
```bash
# Create network
docker network create app-network

# Run database
docker run -d \
  --name db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Run app (can reach db by name)
docker run -d \
  --name app \
  --network app-network \
  -e DB_HOST=db \
  myapp
```

### 7.4 Port Mapping

```bash
# Map single port
docker run -p 8080:80 nginx
# Access: localhost:8080 → container:80

# Map multiple ports
docker run -p 80:80 -p 443:443 nginx

# Map to specific interface
docker run -p 127.0.0.1:8080:80 nginx

# Map random port
docker run -p 80 nginx
docker port container_name  # See mapped port

# Map UDP port
docker run -p 53:53/udp dns-server

# Publish all exposed ports
docker run -P nginx
```

### 7.5 DNS in Docker

Containers on the same custom network can reach each other by **container name**.

```bash
# Create network
docker network create app

# These containers can reach each other by name
docker run -d --name api --network app myapi
docker run -d --name web --network app myweb

# From 'web' container:
curl http://api:3000  # Works!
```

> **Important:** Default bridge network doesn't support DNS resolution by container name. Always create custom networks.

---

