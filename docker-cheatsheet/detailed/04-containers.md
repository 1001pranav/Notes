# Docker Containers - Detailed Guide

## Table of Contents
- [What is a Container?](#what-is-a-container)
- [Running Containers](#running-containers)
  - [Understanding Run Options](#understanding-run-options)
- [Container Lifecycle](#container-lifecycle)
- [Managing Containers](#managing-containers)
- [Container Logs](#container-logs)
- [Executing Commands in Containers](#executing-commands-in-containers)
- [Resource Limits](#resource-limits)

---

## What is a Container?

**Simple Definition:**
A container is a **running instance** of an image. If an image is a blueprint, a container is the actual building created from that blueprint.

**Programming Analogy:**
```
Image     = Class      (the definition/template)
Container = Object     (an instance you can interact with)
```

**Why containers?**
- They provide an **isolated environment** for your application
- Multiple containers can run from the same image
- Each container has its own filesystem, network, and processes
- Containers are lightweight and start in seconds

```
One Image → Multiple Containers:

+------------------+
|   nginx image    |  (stored on disk, read-only)
+------------------+
         |
    Creates instances
         |
    +----+----+----+----+
    |    |    |    |    |
    v    v    v    v    v
 [web1][web2][web3][web4][web5]  ← Running containers
```

---

## Running Containers

### Understanding Run Options

#### `-d` (Detached Mode)
**What is it?** Runs container in **background**
**Why use it?** So your terminal isn't blocked

```bash
docker run nginx        # Foreground - blocks terminal
docker run -d nginx     # Background - returns immediately
```

#### `--name` (Container Name)
**What is it?** Human-readable name for the container
**Why use it?** Easier than random IDs like "happy_einstein"

```bash
docker run -d --name my-website nginx
docker stop my-website  # Easy to reference
```

#### `-p` (Port Mapping)
**What is it?** Connects your computer's port to container's port
**Why use it?** Containers are isolated - no access without port mapping

```bash
docker run -d -p 8080:80 nginx
#              ^^^^  ^^
#              |     +-- Container port (nginx listens here)
#              +-- Your computer port (localhost:8080)

# Access: http://localhost:8080
```

#### `-it` (Interactive Terminal)
**What is it?** `-i` (interactive) + `-t` (terminal)
**Why use it?** To get a shell inside the container

```bash
docker run -it ubuntu bash
# Now you're "inside" the container
root@abc123:/# exit
```

#### `-e` (Environment Variables)
**What is it?** Sets environment variables in container
**Why use it?** Configure your app without changing code

```bash
docker run -d -e NODE_ENV=production -e API_KEY=secret myapp
```

#### `-v` (Volume Mount)
**What is it?** Links a folder on your computer to one in container
**Why use it?** Persist data, share files

```bash
docker run -d -v $(pwd):/app node:18
```

#### `--rm` (Auto Remove)
**What is it?** Deletes container automatically when it stops
**Why use it?** No leftover stopped containers

```bash
docker run --rm node:18 node --version
```

#### `--restart` (Restart Policy)
**What is it?** When Docker should restart the container
**Why use it?** Keep services running

```bash
--restart always         # Always restart
--restart unless-stopped # Unless manually stopped
--restart on-failure     # Only on crash
```

### Full Example
```bash
docker run -d \
  --name my-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  myapp:v1.0
```

---

## Container Lifecycle

```
docker create → CREATED → docker start → RUNNING
                                            |
                          docker stop ──────+──── docker pause
                               |                       |
                               v                       v
                           EXITED                   PAUSED
                               |                       |
                          docker rm              docker unpause
                               |                       |
                               v                       +→ RUNNING
                           DELETED
```

| State | Meaning |
|-------|---------|
| **Created** | Exists but never started |
| **Running** | Actively executing |
| **Paused** | Frozen, can resume |
| **Exited** | Stopped |

---

## Managing Containers

```bash
# List running containers
docker ps

# List ALL containers (including stopped)
docker ps -a

# Stop container (graceful shutdown)
docker stop my-nginx

# Start stopped container
docker start my-nginx

# Restart
docker restart my-nginx

# Kill immediately (no graceful shutdown)
docker kill my-nginx

# Remove stopped container
docker rm my-nginx

# Force remove running container
docker rm -f my-nginx

# Remove all stopped containers
docker container prune
```

---

## Container Logs

**What are logs?**
Everything your app prints to stdout/stderr.

```bash
# View all logs
docker logs my-nginx

# Follow logs in real-time
docker logs -f my-nginx

# Last 100 lines
docker logs --tail 100 my-nginx

# With timestamps
docker logs -t my-nginx

# Logs from last 10 minutes
docker logs --since 10m my-nginx
```

---

## Executing Commands in Containers

**What is `docker exec`?**
Run commands inside a running container.

```bash
# Run a command
docker exec my-nginx ls /etc/nginx

# Get interactive shell
docker exec -it my-nginx bash
# For Alpine images (no bash):
docker exec -it my-nginx sh

# Run as different user
docker exec -u root my-nginx whoami

# Debugging commands
docker exec my-nginx ps aux        # Processes
docker exec my-nginx env           # Environment
docker exec my-nginx df -h         # Disk space
```

---

## Resource Limits

**Why limit resources?**
Prevent one container from consuming all system resources.

```bash
# Limit memory to 512MB
docker run -d --memory="512m" nginx

# Limit to 1.5 CPU cores
docker run -d --cpus="1.5" nginx

# Combined
docker run -d --memory="1g" --cpus="2" myapp

# Monitor usage
docker stats
```

---
