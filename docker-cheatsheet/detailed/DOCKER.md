# Docker Complete Guide - From Beginner to Expert

## Table of Contents

1. [Introduction to Docker](#1-introduction-to-docker)
   - 1.1 [What is Docker?](#11-what-is-docker)
   - 1.2 [Why Use Docker?](#12-why-use-docker)
   - 1.3 [Docker vs Virtual Machines](#13-docker-vs-virtual-machines)
   - 1.4 [Docker Architecture](#14-docker-architecture)
   - 1.5 [Key Terminology](#15-key-terminology)

2. [Installation & Setup](#2-installation--setup)
   - 2.1 [Installing Docker on Linux](#21-installing-docker-on-linux)
   - 2.2 [Installing Docker on Windows/Mac](#22-installing-docker-on-windowsmac)
   - 2.3 [Verify Installation](#23-verify-installation)
   - 2.4 [Post-Installation Steps](#24-post-installation-steps)

3. [Docker Images](#3-docker-images)
   - 3.1 [What is a Docker Image?](#31-what-is-a-docker-image)
   - 3.2 [Pulling Images](#32-pulling-images)
   - 3.3 [Listing Images](#33-listing-images)
   - 3.4 [Removing Images](#34-removing-images)
   - 3.5 [Image Tags](#35-image-tags)
   - 3.6 [Docker Hub](#36-docker-hub)

4. [Docker Containers](#4-docker-containers)
   - 4.1 [What is a Container?](#41-what-is-a-container)
   - 4.2 [Running Containers](#42-running-containers)
   - 4.3 [Container Lifecycle](#43-container-lifecycle)
   - 4.4 [Managing Containers](#44-managing-containers)
   - 4.5 [Container Logs](#45-container-logs)
   - 4.6 [Executing Commands in Containers](#46-executing-commands-in-containers)
   - 4.7 [Container Resource Limits](#47-container-resource-limits)

5. [Dockerfile - Building Custom Images](#5-dockerfile---building-custom-images)
   - 5.1 [What is a Dockerfile?](#51-what-is-a-dockerfile)
   - 5.2 [Dockerfile Instructions](#52-dockerfile-instructions)
   - 5.3 [Building Images](#53-building-images)
   - 5.4 [Best Practices](#54-best-practices)
   - 5.5 [Multi-Stage Builds](#55-multi-stage-builds)
   - 5.6 [.dockerignore File](#56-dockerignore-file)

6. [Docker Volumes - Data Persistence](#6-docker-volumes---data-persistence)
   - 6.1 [Why Volumes?](#61-why-volumes)
   - 6.2 [Types of Volumes](#62-types-of-volumes)
   - 6.3 [Creating and Managing Volumes](#63-creating-and-managing-volumes)
   - 6.4 [Bind Mounts](#64-bind-mounts)
   - 6.5 [Volume Best Practices](#65-volume-best-practices)

7. [Docker Networking](#7-docker-networking)
   - 7.1 [Network Types](#71-network-types)
   - 7.2 [Creating Networks](#72-creating-networks)
   - 7.3 [Connecting Containers](#73-connecting-containers)
   - 7.4 [Port Mapping](#74-port-mapping)
   - 7.5 [DNS in Docker](#75-dns-in-docker)

8. [Docker Compose](#8-docker-compose)
   - 8.1 [What is Docker Compose?](#81-what-is-docker-compose)
   - 8.2 [docker-compose.yml Structure](#82-docker-composeyml-structure)
   - 8.3 [Docker Compose Commands](#83-docker-compose-commands)
   - 8.4 [Environment Variables](#84-environment-variables)
   - 8.5 [Depends On & Health Checks](#85-depends-on--health-checks)
   - 8.6 [Real-World Examples](#86-real-world-examples)

9. [Docker Registry](#9-docker-registry)
   - 9.1 [What is a Registry?](#91-what-is-a-registry)
   - 9.2 [Pushing Images](#92-pushing-images)
   - 9.3 [Private Registries](#93-private-registries)

10. [Docker Security](#10-docker-security)
    - 10.1 [Security Best Practices](#101-security-best-practices)
    - 10.2 [Running as Non-Root](#102-running-as-non-root)
    - 10.3 [Scanning Images](#103-scanning-images)
    - 10.4 [Secrets Management](#104-secrets-management)

11. [Docker in Production](#11-docker-in-production)
    - 11.1 [Docker Swarm Basics](#111-docker-swarm-basics)
    - 11.2 [Kubernetes Overview](#112-kubernetes-overview)
    - 11.3 [CI/CD with Docker](#113-cicd-with-docker)
    - 11.4 [Logging & Monitoring](#114-logging--monitoring)

12. [Troubleshooting & Tips](#12-troubleshooting--tips)
    - 12.1 [Common Issues](#121-common-issues)
    - 12.2 [Useful Commands Cheatsheet](#122-useful-commands-cheatsheet)
    - 12.3 [Performance Tips](#123-performance-tips)

---

## 1. Introduction to Docker

### 1.1 What is Docker?

Docker is a **containerization platform** that allows you to package applications with all their dependencies into a standardized unit called a **container**.

**Simple Analogy:**
> Think of Docker like a shipping container. Just as shipping containers can hold any goods and be transported anywhere in the world, Docker containers can hold any application and run anywhere Docker is installed.

```
Traditional Way:           Docker Way:
+------------------+       +------------------+
| Your Application |       |   Container      |
+------------------+       | +-------------+  |
        |                  | | Application |  |
        v                  | | Dependencies|  |
+------------------+       | | Libraries   |  |
| Install Python   |       | | Config      |  |
| Install Node     |       | +-------------+  |
| Install Redis    |       +------------------+
| Configure...     |              |
+------------------+              v
        |                  Runs ANYWHERE!
        v
  Works on MY machine...
```

### 1.2 Why Use Docker?

| Problem | Docker Solution |
|---------|----------------|
| "Works on my machine" | Same container runs everywhere |
| Dependency conflicts | Each container has isolated dependencies |
| Slow setup for new developers | Just run `docker-compose up` |
| Inconsistent environments | Dev, Test, Prod all use same image |
| Resource heavy VMs | Containers are lightweight |

**Key Benefits:**
- **Consistency** - Same environment everywhere
- **Isolation** - Applications don't interfere with each other
- **Portability** - Run on any system with Docker
- **Scalability** - Easy to scale up/down
- **Version Control** - Track changes to your environment

### 1.3 Docker vs Virtual Machines

```
Virtual Machine:                    Docker Container:
+---------------------------+       +---------------------------+
|   App A   |   App B      |       |   App A   |   App B      |
+-----------+--------------+       +-----------+--------------+
|  Guest OS |  Guest OS    |       |  Container| Container    |
+-----------+--------------+       +-----------+--------------+
|      Hypervisor          |       |     Docker Engine        |
+---------------------------+       +---------------------------+
|      Host OS             |       |      Host OS             |
+---------------------------+       +---------------------------+
|      Hardware            |       |      Hardware            |
+---------------------------+       +---------------------------+

Size: GBs                           Size: MBs
Boot: Minutes                       Boot: Seconds
Performance: Slower                 Performance: Near Native
```

| Feature | Virtual Machine | Docker Container |
|---------|----------------|------------------|
| Size | Gigabytes | Megabytes |
| Startup | Minutes | Seconds |
| OS | Full OS per VM | Shares host OS |
| Isolation | Complete | Process-level |
| Performance | Overhead | Near-native |

### 1.4 Docker Architecture

```
+---------------------------------------------------+
|                  Docker Client                     |
|              (docker CLI commands)                 |
+---------------------------------------------------+
                        |
                        | REST API
                        v
+---------------------------------------------------+
|                  Docker Daemon                     |
|                   (dockerd)                        |
|  +-------------+  +----------+  +--------------+  |
|  |   Images    |  |Containers|  |   Networks   |  |
|  +-------------+  +----------+  +--------------+  |
|  +-------------+  +----------+                    |
|  |   Volumes   |  | Plugins  |                    |
|  +-------------+  +----------+                    |
+---------------------------------------------------+
                        |
                        v
+---------------------------------------------------+
|                Docker Registry                     |
|            (Docker Hub, Private)                   |
+---------------------------------------------------+
```

**Components:**
- **Docker Client** - CLI tool you use (`docker` commands)
- **Docker Daemon** - Background service managing everything
- **Docker Registry** - Storage for Docker images (Docker Hub)

### 1.5 Key Terminology

| Term | Definition |
|------|------------|
| **Image** | Read-only template with instructions to create a container |
| **Container** | Running instance of an image |
| **Dockerfile** | Text file with instructions to build an image |
| **Docker Hub** | Public registry for Docker images |
| **Volume** | Persistent data storage for containers |
| **Network** | Communication layer between containers |
| **Docker Compose** | Tool to define multi-container applications |

---

## 2. Installation & Setup

### 2.1 Installing Docker on Linux

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**CentOS/RHEL:**
```bash
# Install required packages
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.2 Installing Docker on Windows/Mac

**Windows:**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Enable WSL 2 when prompted (recommended)
4. Restart your computer
5. Start Docker Desktop

**Mac:**
1. Download Docker Desktop for Mac
2. Drag to Applications folder
3. Open Docker from Applications
4. Grant necessary permissions

### 2.3 Verify Installation

```bash
# Check Docker version
docker --version
# Output: Docker version 24.0.0, build xxx

# Check Docker Compose version
docker compose version
# Output: Docker Compose version v2.20.0

# Run test container
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### 2.4 Post-Installation Steps

**Run Docker without sudo (Linux):**
```bash
# Create docker group
sudo groupadd docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Activate changes (or log out and back in)
newgrp docker

# Verify
docker run hello-world
```

**Configure Docker to start on boot:**
```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

---

## 3. Docker Images

### 3.1 What is a Docker Image?

A Docker image is a **read-only template** containing:
- Application code
- Runtime environment
- Libraries and dependencies
- Environment variables
- Configuration files

```
Image Layers:
+---------------------------+
|    Application Code       |  <- Your code
+---------------------------+
|    Dependencies (npm)     |  <- node_modules
+---------------------------+
|    Node.js Runtime        |  <- Node installation
+---------------------------+
|    Base OS (Alpine)       |  <- Minimal Linux
+---------------------------+
```

> **Important:** Images are built in layers. Each layer is cached, making subsequent builds faster.

### 3.2 Pulling Images

```bash
# Pull latest version
docker pull nginx

# Pull specific version (tag)
docker pull nginx:1.24

# Pull from different registry
docker pull gcr.io/google-containers/nginx

# Pull with specific platform
docker pull --platform linux/amd64 nginx
```

**Common Official Images:**
| Image | Purpose |
|-------|---------|
| `nginx` | Web server |
| `node` | Node.js runtime |
| `python` | Python runtime |
| `postgres` | PostgreSQL database |
| `redis` | Redis cache |
| `mongo` | MongoDB database |
| `mysql` | MySQL database |

### 3.3 Listing Images

```bash
# List all images
docker images
# OR
docker image ls

# Output:
# REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
# nginx        latest    a6bd71f48f68   2 days ago     187MB
# node         18        b4e0d8a7a3b2   1 week ago     991MB

# List with filtering
docker images --filter "dangling=true"

# Show image IDs only
docker images -q

# Show all images (including intermediate)
docker images -a
```

### 3.4 Removing Images

```bash
# Remove single image
docker rmi nginx

# Remove by image ID
docker rmi a6bd71f48f68

# Remove multiple images
docker rmi nginx redis mongo

# Force remove (even if container exists)
docker rmi -f nginx

# Remove all unused images
docker image prune

# Remove ALL images (careful!)
docker rmi $(docker images -q)
```

### 3.5 Image Tags

Tags are labels for different versions of an image.

```bash
# Format: repository:tag
nginx:latest        # Latest version (default)
nginx:1.24          # Specific version
nginx:1.24-alpine   # Alpine-based (smaller)
node:18-slim        # Slim version
python:3.11-bullseye # Debian Bullseye based
```

**Tag Best Practices:**
- **Never use `latest` in production** - not predictable
- Use specific version tags: `nginx:1.24.0`
- Use semantic versioning for your images

```bash
# Tag an existing image
docker tag nginx:latest myregistry/nginx:v1.0

# Tag when building
docker build -t myapp:v1.0 -t myapp:latest .
```

### 3.6 Docker Hub

[Docker Hub](https://hub.docker.com) is the default public registry.

```bash
# Login to Docker Hub
docker login

# Search for images
docker search nginx

# Pull from Docker Hub (default)
docker pull nginx

# Push to Docker Hub
docker push username/myimage:tag
```

---

## 4. Docker Containers

### 4.1 What is a Container?

A container is a **running instance** of an image. Think of it as:
- Image = Class (blueprint)
- Container = Object (instance)

```
One Image → Multiple Containers:

+------------------+
|   nginx image    |
+------------------+
         |
    +----+----+----+
    |    |    |    |
    v    v    v    v
 [web1] [web2] [web3] [web4]  ← Running containers
```

### 4.2 Running Containers

**Basic Run:**
```bash
# Simple run
docker run nginx

# Run in background (detached)
docker run -d nginx

# Run with name
docker run -d --name my-nginx nginx

# Run with port mapping
docker run -d -p 8080:80 nginx
# Access at http://localhost:8080

# Run interactively
docker run -it ubuntu bash

# Run and auto-remove when stopped
docker run --rm nginx
```

**Common Run Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `-d` | Detached (background) | `docker run -d nginx` |
| `-p` | Port mapping | `-p 8080:80` |
| `-v` | Volume mount | `-v /host:/container` |
| `-e` | Environment variable | `-e NODE_ENV=production` |
| `--name` | Container name | `--name myapp` |
| `-it` | Interactive terminal | `-it ubuntu bash` |
| `--rm` | Remove on stop | `--rm nginx` |
| `--network` | Connect to network | `--network mynet` |
| `--restart` | Restart policy | `--restart always` |

**Full Example:**
```bash
docker run -d \
  --name my-web-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=localhost \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  myapp:v1.0
```

### 4.3 Container Lifecycle

```
        docker create
             |
             v
+-------------------------+
|        CREATED          |
+-------------------------+
             |
      docker start
             |
             v
+-------------------------+
|        RUNNING          | <--+
+-------------------------+    |
      |            |           |
docker stop   docker pause     | docker restart
      |            |           |
      v            v           |
+---------+  +---------+       |
| EXITED  |  | PAUSED  |-------+
+---------+  +---------+
      |       docker unpause
      |
docker rm
      |
      v
   DELETED
```

### 4.4 Managing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start a stopped container
docker start container_name

# Stop a running container
docker stop container_name

# Stop immediately (force)
docker kill container_name

# Restart container
docker restart container_name

# Pause container
docker pause container_name

# Unpause container
docker unpause container_name

# Remove container
docker rm container_name

# Remove running container (force)
docker rm -f container_name

# Remove all stopped containers
docker container prune

# Remove all containers (careful!)
docker rm -f $(docker ps -aq)
```

### 4.5 Container Logs

```bash
# View logs
docker logs container_name

# Follow logs (like tail -f)
docker logs -f container_name

# Show last N lines
docker logs --tail 100 container_name

# Show logs with timestamps
docker logs -t container_name

# Show logs since time
docker logs --since 2023-01-01 container_name
docker logs --since 10m container_name

# Combine options
docker logs -f --tail 50 -t container_name
```

### 4.6 Executing Commands in Containers

```bash
# Run command in running container
docker exec container_name ls -la

# Interactive shell
docker exec -it container_name bash
# OR for Alpine-based images
docker exec -it container_name sh

# Run as specific user
docker exec -u root container_name whoami

# Set working directory
docker exec -w /app container_name pwd

# With environment variable
docker exec -e MY_VAR=value container_name env
```

**Useful Debugging Commands:**
```bash
# Check processes
docker exec container_name ps aux

# Check network
docker exec container_name netstat -tlnp

# Check environment
docker exec container_name env

# Check disk usage
docker exec container_name df -h
```

### 4.7 Container Resource Limits

```bash
# Limit memory
docker run -d --memory="512m" nginx

# Limit CPU
docker run -d --cpus="1.5" nginx

# Limit both
docker run -d \
  --memory="1g" \
  --memory-swap="2g" \
  --cpus="2" \
  nginx

# Check resource usage
docker stats

# Check specific container
docker stats container_name
```

---

## 5. Dockerfile - Building Custom Images

### 5.1 What is a Dockerfile?

A Dockerfile is a **text file with instructions** to build a Docker image automatically.

```dockerfile
# Simple Dockerfile Example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 5.2 Dockerfile Instructions

#### **FROM** - Base Image (Required, must be first)
```dockerfile
FROM ubuntu:22.04
FROM node:18-alpine
FROM python:3.11-slim
FROM scratch  # Empty base image
```

#### **WORKDIR** - Set Working Directory
```dockerfile
WORKDIR /app
WORKDIR /home/user/project
# Creates directory if doesn't exist
```

#### **COPY** - Copy Files from Host
```dockerfile
COPY . .                      # Copy all to WORKDIR
COPY package.json .           # Copy single file
COPY src/ /app/src/          # Copy directory
COPY --chown=user:group . .  # Copy with ownership
```

#### **ADD** - Copy + Extract (use COPY instead usually)
```dockerfile
ADD app.tar.gz /app/         # Extracts automatically
ADD https://example.com/file /app/  # Download URL
```

#### **RUN** - Execute Commands (build time)
```dockerfile
# Shell form
RUN apt-get update && apt-get install -y curl

# Exec form (preferred)
RUN ["apt-get", "update"]

# Multi-line for readability
RUN apt-get update && \
    apt-get install -y \
        curl \
        vim \
        git && \
    rm -rf /var/lib/apt/lists/*
```

#### **CMD** - Default Command (run time)
```dockerfile
# Exec form (preferred)
CMD ["npm", "start"]
CMD ["python", "app.py"]

# Shell form
CMD npm start
```

#### **ENTRYPOINT** - Fixed Command
```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
# Results in: python app.py

# Can be overridden with --entrypoint
docker run --entrypoint sh myimage
```

> **CMD vs ENTRYPOINT:**
> - `CMD` - Default, can be overridden
> - `ENTRYPOINT` - Fixed, CMD becomes arguments

#### **ENV** - Environment Variables
```dockerfile
ENV NODE_ENV=production
ENV PORT=3000 HOST=0.0.0.0
ENV PATH="/app/bin:${PATH}"
```

#### **ARG** - Build Arguments
```dockerfile
ARG VERSION=latest
ARG NODE_ENV=production

FROM node:${VERSION}
ENV NODE_ENV=${NODE_ENV}
```
```bash
# Override at build time
docker build --build-arg VERSION=18 .
```

#### **EXPOSE** - Document Ports
```dockerfile
EXPOSE 80
EXPOSE 443
EXPOSE 3000/tcp
EXPOSE 5000/udp
```
> **Note:** EXPOSE doesn't publish ports, it's documentation. Use `-p` flag to publish.

#### **VOLUME** - Create Mount Point
```dockerfile
VOLUME /data
VOLUME ["/data", "/logs"]
```

#### **USER** - Set User
```dockerfile
# Create user and switch
RUN useradd -m appuser
USER appuser

# Or use existing
USER nobody
```

#### **HEALTHCHECK** - Container Health
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Disable healthcheck
HEALTHCHECK NONE
```

#### **LABEL** - Metadata
```dockerfile
LABEL maintainer="dev@example.com"
LABEL version="1.0"
LABEL description="My awesome app"
```

### 5.3 Building Images

```bash
# Build from current directory
docker build .

# Build with tag
docker build -t myapp:v1.0 .

# Build with multiple tags
docker build -t myapp:v1.0 -t myapp:latest .

# Build from different Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp .

# Build without cache
docker build --no-cache -t myapp .

# Build and show output
docker build --progress=plain -t myapp .
```

### 5.4 Best Practices

#### 1. Use Specific Base Image Tags
```dockerfile
# Bad
FROM node:latest

# Good
FROM node:18.17.0-alpine
```

#### 2. Minimize Layers & Clean Up
```dockerfile
# Bad - Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim

# Good - Single layer with cleanup
RUN apt-get update && \
    apt-get install -y curl vim && \
    rm -rf /var/lib/apt/lists/*
```

#### 3. Order Instructions by Change Frequency
```dockerfile
# Good - Dependencies rarely change, code changes often
FROM node:18-alpine
WORKDIR /app

# These rarely change - cached
COPY package*.json ./
RUN npm ci --only=production

# This changes often - rebuilt
COPY . .

CMD ["npm", "start"]
```

#### 4. Use .dockerignore
```bash
# .dockerignore
node_modules
.git
.env
*.log
Dockerfile
.dockerignore
```

#### 5. Don't Run as Root
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup . .

USER appuser
CMD ["npm", "start"]
```

### 5.5 Multi-Stage Builds

Multi-stage builds help create smaller production images.

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Go Example:**
```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/main /main
CMD ["/main"]
```

### 5.6 .dockerignore File

Create `.dockerignore` in your project root:

```bash
# Dependencies
node_modules
vendor
.venv

# Git
.git
.gitignore

# IDE
.idea
.vscode
*.swp

# Build outputs
dist
build
*.pyc
__pycache__

# Environment files
.env
.env.*
*.local

# Docker files
Dockerfile*
docker-compose*
.dockerignore

# Documentation
README.md
docs

# Tests
test
tests
coverage
.nyc_output

# Logs
*.log
logs

# OS files
.DS_Store
Thumbs.db
```

---

## 6. Docker Volumes - Data Persistence

### 6.1 Why Volumes?

Containers are **ephemeral** - when deleted, data is lost.

```
Without Volume:                 With Volume:
+----------------+              +----------------+
|   Container    |              |   Container    |
|  +---------+   |              |       |        |
|  |  Data   |   |              |       |        |
|  +---------+   |              +-------|--------+
+----------------+                      |
        |                               v
   Container                     +-------------+
   Deleted                       |   Volume    |
        |                        |   (Data)    |
        v                        +-------------+
   DATA LOST!                          |
                                 Container Deleted
                                       |
                                       v
                                 DATA PRESERVED!
```

### 6.2 Types of Volumes

| Type | Use Case | Command |
|------|----------|---------|
| **Named Volume** | Production data | `-v mydata:/app/data` |
| **Anonymous Volume** | Temporary data | `-v /app/data` |
| **Bind Mount** | Development | `-v $(pwd):/app` |
| **tmpfs Mount** | Sensitive data | `--tmpfs /app/temp` |

### 6.3 Creating and Managing Volumes

```bash
# Create volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Remove volume
docker volume rm mydata

# Remove unused volumes
docker volume prune

# Use volume with container
docker run -d \
  --name postgres \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# Multiple volumes
docker run -d \
  -v data:/app/data \
  -v logs:/app/logs \
  myapp
```

### 6.4 Bind Mounts

Bind mounts link a host directory to a container directory.

```bash
# Mount current directory
docker run -d \
  -v $(pwd):/app \
  -p 3000:3000 \
  node:18

# Read-only mount
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  myapp

# Using --mount (more explicit)
docker run -d \
  --mount type=bind,source=$(pwd),target=/app \
  myapp
```

**Development with Hot Reload:**
```bash
# Node.js with nodemon
docker run -d \
  -v $(pwd):/app \
  -v /app/node_modules \  # Exclude node_modules
  -p 3000:3000 \
  node:18 \
  npx nodemon index.js
```

### 6.5 Volume Best Practices

1. **Use named volumes for databases**
```bash
docker run -d \
  --name mysql \
  -v mysql_data:/var/lib/mysql \
  mysql:8
```

2. **Backup volumes**
```bash
# Backup
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup.tar.gz /data

# Restore
docker run --rm \
  -v mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_backup.tar.gz -C /
```

3. **Use read-only mounts when possible**
```bash
docker run -v ./config:/app/config:ro myapp
```

---

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

## 8. Docker Compose

### 8.1 What is Docker Compose?

Docker Compose is a tool for defining and running **multi-container** applications.

**Without Compose:**
```bash
docker network create app
docker run -d --name db --network app -e POSTGRES_PASSWORD=secret postgres
docker run -d --name redis --network app redis
docker run -d --name api --network app -p 3000:3000 -e DB_HOST=db myapi
```

**With Compose:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=secret

  redis:
    image: redis

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
```

```bash
docker compose up -d  # That's it!
```

### 8.2 docker-compose.yml Structure

```yaml
version: "3.9"  # Optional in newer versions

services:
  # Service name (also DNS name)
  web:
    # Image to use
    image: nginx:alpine
    # OR build from Dockerfile
    build:
      context: .
      dockerfile: Dockerfile

    # Port mapping
    ports:
      - "80:80"
      - "443:443"

    # Environment variables
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}  # From .env file

    # Mount volumes
    volumes:
      - ./src:/app/src
      - node_modules:/app/node_modules

    # Connect to networks
    networks:
      - frontend
      - backend

    # Service dependencies
    depends_on:
      - db
      - redis

    # Restart policy
    restart: unless-stopped

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

# Named volumes
volumes:
  node_modules:
  pgdata:

# Custom networks
networks:
  frontend:
  backend:
```

### 8.3 Docker Compose Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Start specific service
docker compose up -d web

# Build and start
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs
docker compose logs -f web

# List running services
docker compose ps

# Execute command in service
docker compose exec web bash

# Scale service
docker compose up -d --scale web=3

# Restart services
docker compose restart

# Rebuild images
docker compose build

# Pull latest images
docker compose pull

# View config (merged)
docker compose config
```

### 8.4 Environment Variables

**Method 1: Inline**
```yaml
services:
  web:
    environment:
      - NODE_ENV=production
      - DEBUG=false
```

**Method 2: env_file**
```yaml
services:
  web:
    env_file:
      - .env
      - .env.production
```

**Method 3: Variable substitution**
```yaml
# docker-compose.yml
services:
  web:
    image: myapp:${VERSION:-latest}
    environment:
      - API_KEY=${API_KEY}
```

```bash
# .env file (auto-loaded)
VERSION=1.0.0
API_KEY=secret123
```

### 8.5 Depends On & Health Checks

**Basic depends_on:**
```yaml
services:
  web:
    depends_on:
      - db
      - redis
```

**With health check condition:**
```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### 8.6 Real-World Examples

#### Full-Stack Web Application
```yaml
version: "3.9"

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:4000
    depends_on:
      - backend

  # Backend API
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  # Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

#### Development with Hot Reload
```yaml
version: "3.9"

services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev
```

---

## 9. Docker Registry

### 9.1 What is a Registry?

A registry is a storage and distribution system for Docker images.

- **Docker Hub** - Default public registry
- **AWS ECR** - Amazon's registry
- **GCR** - Google Container Registry
- **Azure ACR** - Azure Container Registry
- **GitHub GHCR** - GitHub Container Registry

### 9.2 Pushing Images

```bash
# Login to Docker Hub
docker login

# Tag image for registry
docker tag myapp:latest username/myapp:v1.0

# Push to Docker Hub
docker push username/myapp:v1.0

# Push to other registries
docker tag myapp:latest ghcr.io/username/myapp:v1.0
docker push ghcr.io/username/myapp:v1.0
```

### 9.3 Private Registries

**Login to private registry:**
```bash
# AWS ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.region.amazonaws.com

# Google GCR
gcloud auth configure-docker

# Azure ACR
az acr login --name myregistry
```

**Run your own registry:**
```bash
docker run -d \
  --name registry \
  -p 5000:5000 \
  -v registry_data:/var/lib/registry \
  registry:2

# Push to local registry
docker tag myapp localhost:5000/myapp
docker push localhost:5000/myapp
```

---

## 10. Docker Security

### 10.1 Security Best Practices

1. **Use official images**
2. **Scan images for vulnerabilities**
3. **Don't run as root**
4. **Use read-only filesystems when possible**
5. **Limit resources**
6. **Don't store secrets in images**
7. **Keep Docker updated**

### 10.2 Running as Non-Root

```dockerfile
FROM node:18-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

CMD ["node", "index.js"]
```

**Run container as specific user:**
```bash
docker run --user 1000:1000 myapp
```

### 10.3 Scanning Images

```bash
# Docker Scout (built-in)
docker scout cves myimage:tag

# Trivy (popular scanner)
docker run aquasec/trivy image myimage:tag

# Snyk
docker scan myimage:tag
```

### 10.4 Secrets Management

**Docker Secrets (Swarm):**
```bash
# Create secret
echo "my_password" | docker secret create db_password -

# Use in service
docker service create \
  --name web \
  --secret db_password \
  myapp
```

**Docker Compose Secrets:**
```yaml
services:
  db:
    image: postgres
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Never do this:**
```dockerfile
# BAD - Secret in image layer
ENV API_KEY=supersecretkey
RUN echo "password" > /app/config
```

---

## 11. Docker in Production

### 11.1 Docker Swarm Basics

Docker Swarm is Docker's native clustering solution.

```bash
# Initialize swarm
docker swarm init

# Create service
docker service create \
  --name web \
  --replicas 3 \
  -p 80:80 \
  nginx

# Scale service
docker service scale web=5

# List services
docker service ls

# View service logs
docker service logs web
```

### 11.2 Kubernetes Overview

Kubernetes (K8s) is the industry standard for container orchestration.

**Key Concepts:**
- **Pod** - Smallest deployable unit (1+ containers)
- **Deployment** - Manages Pod replicas
- **Service** - Network endpoint for Pods
- **Ingress** - External access to services

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### 11.3 CI/CD with Docker

**GitHub Actions Example:**
```yaml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: username/myapp:${{ github.sha }}
```

### 11.4 Logging & Monitoring

**Logging drivers:**
```bash
# JSON file (default)
docker run --log-driver json-file myapp

# Send to syslog
docker run --log-driver syslog myapp

# Send to AWS CloudWatch
docker run \
  --log-driver awslogs \
  --log-opt awslogs-region=us-east-1 \
  --log-opt awslogs-group=myapp \
  myapp
```

**Monitoring stack (Prometheus + Grafana):**
```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

---

## 12. Troubleshooting & Tips

### 12.1 Common Issues

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

### 12.2 Useful Commands Cheatsheet

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

### 12.3 Performance Tips

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
