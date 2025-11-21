# Docker Troubleshooting & Tips

## Table of Contents
- [Common Issues](#common-issues)
- [Useful Commands Cheatsheet](#useful-commands-cheatsheet)
- [Performance Tips](#performance-tips)
- [Quick Reference Card](#quick-reference-card)

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Container exits immediately | Check logs: `docker logs container_name` |
| Port already in use | Stop conflicting service or use different port |
| Permission denied | Check file permissions or run as correct user |
| Cannot connect to Docker daemon | Start Docker service or check permissions |
| Image not found | Check image name/tag or pull first |
| Out of disk space | Run `docker system prune -a` |
| Container can't reach internet | Check network configuration |

**Debug container:**
```bash
# Run with shell instead of default command
docker run -it myimage sh

# Override entrypoint
docker run -it --entrypoint sh myimage

# Inspect container
docker inspect container_name

# Check container processes
docker top container_name
```

## Useful Commands Cheatsheet

```bash
# === IMAGES ===
docker images                    # List images
docker pull image:tag           # Pull image
docker build -t name:tag .      # Build image
docker rmi image                # Remove image
docker image prune              # Remove unused images

# === CONTAINERS ===
docker ps                       # List running containers
docker ps -a                    # List all containers
docker run -d -p 80:80 nginx   # Run container
docker start/stop/restart name  # Control container
docker rm container             # Remove container
docker logs -f container        # View logs
docker exec -it container bash  # Enter container

# === VOLUMES ===
docker volume ls                # List volumes
docker volume create name       # Create volume
docker volume rm name           # Remove volume
docker volume prune             # Remove unused volumes

# === NETWORKS ===
docker network ls               # List networks
docker network create name      # Create network
docker network connect net container  # Connect container
docker network inspect name     # Inspect network

# === CLEANUP ===
docker system df                # Show disk usage
docker system prune             # Remove unused data
docker system prune -a          # Remove ALL unused data

# === COMPOSE ===
docker compose up -d            # Start services
docker compose down             # Stop services
docker compose logs -f          # View logs
docker compose ps               # List services
docker compose exec service sh  # Enter service

# === INFO ===
docker version                  # Docker version
docker info                     # System info
docker inspect resource         # Detailed info
docker stats                    # Resource usage
```

## Performance Tips

1. **Use Alpine-based images** (smaller size)
```dockerfile
FROM node:18-alpine  # ~180MB vs ~1GB for full image
```

2. **Leverage build cache**
```dockerfile
# Copy dependencies first (rarely change)
COPY package*.json ./
RUN npm ci

# Copy source last (frequently changes)
COPY . .
```

3. **Use multi-stage builds**
```dockerfile
FROM node:18 AS builder
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

4. **Use .dockerignore**
```
node_modules
.git
*.log
```

5. **Clean up in the same layer**
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

---

## Quick Reference Card

```
+------------------------------------------------------------------+
|                     DOCKER QUICK REFERENCE                        |
+------------------------------------------------------------------+
| IMAGES                                                            |
|   docker pull nginx          Pull image from registry             |
|   docker images              List local images                    |
|   docker rmi nginx           Remove image                         |
|   docker build -t app .      Build from Dockerfile                |
+------------------------------------------------------------------+
| CONTAINERS                                                        |
|   docker run -d nginx        Run in background                    |
|   docker run -it ubuntu bash Interactive shell                    |
|   docker ps                  List running containers              |
|   docker stop <name>         Stop container                       |
|   docker rm <name>           Remove container                     |
|   docker logs <name>         View container logs                  |
|   docker exec -it <name> sh  Execute command in container         |
+------------------------------------------------------------------+
| VOLUMES & NETWORKS                                                |
|   -v host:container          Bind mount                           |
|   -v name:/path              Named volume                         |
|   -p 8080:80                 Port mapping                         |
|   --network mynet            Connect to network                   |
+------------------------------------------------------------------+
| COMPOSE                                                           |
|   docker compose up -d       Start all services                   |
|   docker compose down        Stop all services                    |
|   docker compose logs -f     Follow logs                          |
+------------------------------------------------------------------+
| CLEANUP                                                           |
|   docker system prune -a     Remove all unused resources          |
+------------------------------------------------------------------+
```

---

**Happy Dockerizing!**
