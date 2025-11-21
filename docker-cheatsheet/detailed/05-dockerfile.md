# Dockerfile - Building Custom Images (Detailed Guide)

## What is a Dockerfile?

A Dockerfile is a **text file containing step-by-step instructions** that Docker uses to automatically build an image. Think of it like a recipe - it tells Docker exactly what ingredients (base image, files, dependencies) and steps (commands) are needed to create your application's container.

**Why do we need a Dockerfile?**
- Without it, you'd have to manually set up every container
- It makes your setup **reproducible** - anyone can build the same image
- It serves as **documentation** of your application's requirements
- Enables **automation** in CI/CD pipelines

---

## Understanding Dockerfile Instructions (Beginner-Friendly)

### FROM - The Starting Point

**What is it?**
`FROM` specifies the **base image** your container will be built on. Every Dockerfile MUST start with FROM (except for ARG which can come before).

**Why do we need it?**
You don't want to build everything from scratch. Base images give you a pre-configured operating system with tools already installed.

**Simple Analogy:**
> Imagine building a house. `FROM` is like choosing your foundation - you can start with bare land (scratch), or a pre-built foundation with plumbing already done (ubuntu, node, python).

```dockerfile
# Start with Ubuntu operating system
FROM ubuntu:22.04

# Start with Node.js already installed
FROM node:18-alpine

# Start with Python already installed
FROM python:3.11-slim

# Start with completely empty image (advanced)
FROM scratch
```

**Understanding Image Tags:**
```dockerfile
FROM node:18-alpine
#    ^^^^  ^^ ^^^^^^
#    |     |  |
#    |     |  +-- Variant: alpine = smaller Linux, slim = minimal, bullseye = Debian version
#    |     +-- Version: 18 = Node.js version 18
#    +-- Image name: node
```

**Common Base Images for Beginners:**
| Base Image | Size | Use When |
|------------|------|----------|
| `ubuntu:22.04` | ~77MB | Need full Ubuntu, apt-get packages |
| `node:18-alpine` | ~180MB | Node.js apps (smallest) |
| `node:18-slim` | ~240MB | Node.js apps (more compatible) |
| `python:3.11-alpine` | ~50MB | Python apps (smallest) |
| `python:3.11-slim` | ~150MB | Python apps (more compatible) |
| `nginx:alpine` | ~40MB | Static websites, reverse proxy |

---

### WORKDIR - Setting Your Working Directory

**What is it?**
`WORKDIR` sets the **current directory** inside the container for all subsequent commands. It's like running `cd` but it also creates the directory if it doesn't exist.

**Why do we need it?**
- Keeps your files organized in a specific location
- Makes paths in other commands simpler
- You don't have to write full paths everywhere

```dockerfile
# Without WORKDIR (messy)
FROM node:18-alpine
RUN mkdir -p /home/app
COPY package.json /home/app/package.json
RUN cd /home/app && npm install
COPY . /home/app/
CMD ["node", "/home/app/index.js"]

# With WORKDIR (clean)
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

**Common WORKDIR paths:**
```dockerfile
WORKDIR /app           # Most common for applications
WORKDIR /usr/src/app   # Another common pattern
WORKDIR /home/node/app # For node user home directory
```

---

### COPY - Copying Files from Your Computer to Container

**What is it?**
`COPY` takes files from your computer (where you run `docker build`) and puts them inside the container image.

**Why do we need it?**
Your application code, configuration files, and other assets need to be inside the container to run.

**Syntax:**
```dockerfile
COPY <source-on-your-computer> <destination-in-container>
```

**Examples with Explanations:**
```dockerfile
WORKDIR /app

# Copy single file to current WORKDIR (/app)
COPY package.json ./
# Result: /app/package.json

# Copy single file with different name
COPY package.json /app/pkg.json
# Result: /app/pkg.json

# Copy everything from current folder to WORKDIR
COPY . .
# Result: All your project files go to /app/

# Copy a specific folder
COPY src/ ./src/
# Result: Your src folder becomes /app/src/

# Copy multiple files
COPY package.json package-lock.json ./
# Result: Both files in /app/

# Copy with ownership (for non-root users)
COPY --chown=node:node . .
# Result: Files owned by 'node' user, not root
```

**Understanding the Two Dots:**
```dockerfile
COPY . .
#    ^ ^
#    | +-- Destination: Current WORKDIR in container
#    +-- Source: Current directory on your computer (where Dockerfile is)
```

---

### ADD vs COPY - What's the Difference?

**What is ADD?**
`ADD` is similar to `COPY` but has extra features:
- Can extract tar/zip archives automatically
- Can download files from URLs

**When to use which?**
```dockerfile
# USE COPY (99% of the time) - Simple, predictable
COPY package.json ./
COPY . .

# USE ADD only for these specific cases:
ADD myarchive.tar.gz /app/           # Auto-extracts the archive
ADD https://example.com/file.txt /app/  # Downloads from URL (not recommended)
```

**Best Practice:** Always use `COPY` unless you specifically need ADD's extra features.

---

### RUN - Executing Commands During Build

**What is it?**
`RUN` executes commands **while building the image**. It's used to install packages, create directories, download files, etc.

**Why do we need it?**
To set up your container with all necessary software and configurations before it runs.

**Key Concept:** Each `RUN` creates a new **layer** in your image.

```dockerfile
# Installing packages on Ubuntu
FROM ubuntu:22.04
RUN apt-get update
RUN apt-get install -y curl wget git

# Installing packages on Alpine (smaller Linux)
FROM alpine:latest
RUN apk add --no-cache curl wget git

# Installing Node.js dependencies
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install

# Installing Python dependencies
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
```

**Best Practice - Combine Commands:**
```dockerfile
# BAD - Creates 3 layers, cache issues
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget

# GOOD - Single layer, cleanup included
RUN apt-get update && \
    apt-get install -y \
        curl \
        wget \
        git && \
    rm -rf /var/lib/apt/lists/*
#   ^^^^^^^^^^^^^^^^^^^^^^^^^ Cleanup to reduce image size
```

**Shell Form vs Exec Form:**
```dockerfile
# Shell form - runs in /bin/sh -c "..."
RUN apt-get update && apt-get install -y curl

# Exec form - runs directly without shell
RUN ["apt-get", "update"]

# Shell form is usually fine for RUN
```

---

### CMD - The Default Command (What Runs When Container Starts)

**What is it?**
`CMD` specifies the **default command** that runs when you start a container. It's what your container actually does.

**Why do we need it?**
Without CMD, your container wouldn't know what to do when it starts.

**Key Points:**
- Only ONE CMD per Dockerfile (last one wins)
- Can be overridden when running container
- Runs at **container runtime**, not build time

```dockerfile
# For a Node.js app
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
# When container starts, it runs: npm start

# For a Python app
FROM python:3.11-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]
# When container starts, it runs: python app.py

# For a simple web server
FROM nginx:alpine
# nginx image already has CMD defined
# It automatically serves files from /usr/share/nginx/html
```

**Exec Form vs Shell Form:**
```dockerfile
# Exec form (RECOMMENDED) - Runs directly
CMD ["npm", "start"]
CMD ["python", "app.py"]
CMD ["node", "server.js"]

# Shell form - Runs in /bin/sh -c
CMD npm start
CMD python app.py

# Why exec form is better:
# - Signals (like SIGTERM for graceful shutdown) go directly to your process
# - Shell form wraps your command in a shell, complicating signal handling
```

**Overriding CMD:**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
CMD ["npm", "start"]
```
```bash
# Default - runs npm start
docker run myapp

# Override - runs npm test instead
docker run myapp npm test

# Override - open a shell
docker run -it myapp sh
```

---

### ENTRYPOINT - The Fixed Command

**What is it?**
`ENTRYPOINT` sets a command that **always runs** and cannot easily be overridden. CMD becomes arguments to ENTRYPOINT.

**Why do we need it?**
When you want your container to always behave as a specific executable.

**ENTRYPOINT vs CMD:**
```dockerfile
# CMD only - can be completely overridden
FROM python:3.11
CMD ["python", "app.py"]
# docker run myapp            → python app.py
# docker run myapp bash       → bash (CMD is replaced)

# ENTRYPOINT only - always runs
FROM python:3.11
ENTRYPOINT ["python"]
# docker run myapp            → python (no arguments)
# docker run myapp app.py     → python app.py

# ENTRYPOINT + CMD - best of both worlds
FROM python:3.11
ENTRYPOINT ["python"]
CMD ["app.py"]
# docker run myapp            → python app.py (default)
# docker run myapp test.py    → python test.py (CMD overridden)
```

**Real-World Example:**
```dockerfile
# Create a container that always runs Python scripts
FROM python:3.11-slim
WORKDIR /scripts
COPY . .
ENTRYPOINT ["python"]
CMD ["main.py"]
```
```bash
docker run mypython              # Runs: python main.py
docker run mypython other.py    # Runs: python other.py
docker run mypython -c "print('hi')"  # Runs: python -c "print('hi')"
```

---

### ENV - Environment Variables

**What is it?**
`ENV` sets environment variables that persist in the container. These are like global settings your application can read.

**Why do we need it?**
- Configure application behavior without changing code
- Set paths, modes, API keys, etc.
- Makes containers configurable

```dockerfile
# Setting environment variables
FROM node:18-alpine
WORKDIR /app

# Set single variable
ENV NODE_ENV=production

# Set multiple variables
ENV PORT=3000 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info

# Use variables in other commands
ENV APP_HOME=/app
WORKDIR ${APP_HOME}

# Add to PATH
ENV PATH="/app/bin:${PATH}"

COPY . .
CMD ["npm", "start"]
```

**Your app reads these like normal environment variables:**
```javascript
// Node.js
const port = process.env.PORT;  // "3000"
const env = process.env.NODE_ENV;  // "production"
```
```python
# Python
import os
port = os.environ.get('PORT')  # "3000"
```

**Override at Runtime:**
```bash
docker run -e PORT=8080 -e NODE_ENV=development myapp
```

---

### ARG - Build-Time Variables

**What is it?**
`ARG` defines variables that are only available **during the build process**. They don't persist in the final image.

**Why do we need it?**
- Pass dynamic values during build
- Customize builds without changing Dockerfile

**ARG vs ENV:**
| Feature | ARG | ENV |
|---------|-----|-----|
| Available during build | Yes | Yes |
| Available at runtime | No | Yes |
| Can override with --build-arg | Yes | No |
| Persists in image | No | Yes |

```dockerfile
# Define build argument with default value
ARG NODE_VERSION=18
ARG APP_ENV=production

# Use in FROM (must be before FROM)
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

# Use in other commands
ARG APP_ENV=production
ENV NODE_ENV=${APP_ENV}

# Full example
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ARG APP_ENV=production
ENV NODE_ENV=${APP_ENV}

WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Using ARG during build:**
```bash
# Use defaults
docker build -t myapp .

# Override ARG values
docker build --build-arg NODE_VERSION=20 --build-arg APP_ENV=development -t myapp .
```

---

### EXPOSE - Documenting Ports

**What is it?**
`EXPOSE` documents which ports your application uses. It's **metadata** - it doesn't actually publish the port.

**Why do we need it?**
- Documentation for other developers
- Some tools use it for automatic configuration
- Required for certain orchestration features

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .

# Document that this app uses port 3000
EXPOSE 3000

# You can expose multiple ports
EXPOSE 80
EXPOSE 443

# Specify protocol (default is tcp)
EXPOSE 3000/tcp
EXPOSE 5000/udp

CMD ["npm", "start"]
```

**Important:** EXPOSE alone doesn't make ports accessible! You still need `-p`:
```bash
# EXPOSE 3000 is in Dockerfile, but you STILL need:
docker run -p 3000:3000 myapp
#          ^^^^^^^^^^^ This actually publishes the port

# -P publishes all EXPOSE'd ports to random host ports
docker run -P myapp
```

---

### VOLUME - Persistent Data Mount Points

**What is it?**
`VOLUME` creates a mount point for persistent data that survives container restarts/deletion.

**Why do we need it?**
- Container filesystems are temporary - when container is deleted, data is lost
- VOLUME marks directories that should be persisted

```dockerfile
FROM postgres:15
# Postgres data should persist
VOLUME /var/lib/postgresql/data

FROM mysql:8
# MySQL data should persist
VOLUME /var/lib/mysql

# Your application
FROM node:18-alpine
WORKDIR /app
COPY . .
# User uploads should persist
VOLUME /app/uploads
CMD ["npm", "start"]
```

**Better practice - define volumes at runtime:**
```bash
# Named volume (recommended)
docker run -v mydata:/app/uploads myapp

# Bind mount (for development)
docker run -v $(pwd)/uploads:/app/uploads myapp
```

---

### USER - Running as Non-Root

**What is it?**
`USER` switches to a different user for running commands. By default, containers run as root, which is a security risk.

**Why do we need it?**
- Security: If container is compromised, attacker has limited permissions
- Best practice for production

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy files with correct ownership
COPY --chown=appuser:appgroup . .

# Install dependencies as root (needs write to /app)
RUN npm install

# Switch to non-root user
USER appuser

# Now container runs as appuser, not root
CMD ["npm", "start"]
```

**Common patterns:**
```dockerfile
# Alpine Linux
RUN addgroup -S mygroup && adduser -S myuser -G mygroup
USER myuser

# Ubuntu/Debian
RUN useradd -m myuser
USER myuser

# Node.js images already have 'node' user
FROM node:18-alpine
USER node
```

---

### HEALTHCHECK - Container Health Monitoring

**What is it?**
`HEALTHCHECK` tells Docker how to check if your container is healthy and working properly.

**Why do we need it?**
- Docker can automatically detect if your app is broken
- Orchestrators (Swarm, Kubernetes) use it for load balancing
- Automatic restart of unhealthy containers

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install

# Check health every 30 seconds
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

**Healthcheck Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--interval` | Time between checks | 30s |
| `--timeout` | Max time for check | 30s |
| `--start-period` | Grace period on startup | 0s |
| `--retries` | Failures before unhealthy | 3 |

**Examples for different apps:**
```dockerfile
# Node.js / Express
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

# Python / Flask
HEALTHCHECK CMD curl -f http://localhost:5000/health || exit 1

# Check if process is running
HEALTHCHECK CMD pgrep node || exit 1

# For apps without curl
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Disable inherited healthcheck
HEALTHCHECK NONE
```

---

### LABEL - Adding Metadata

**What is it?**
`LABEL` adds key-value metadata to your image. It's purely informational.

**Why do we need it?**
- Documentation
- Filtering images
- Tracking maintainer info
- CI/CD metadata

```dockerfile
FROM node:18-alpine

LABEL maintainer="yourname@example.com"
LABEL version="1.0.0"
LABEL description="My awesome Node.js application"
LABEL org.opencontainers.image.source="https://github.com/user/repo"

# Multiple labels in one instruction
LABEL maintainer="dev@example.com" \
      version="1.0.0" \
      description="My app"

WORKDIR /app
COPY . .
CMD ["npm", "start"]
```

**Viewing labels:**
```bash
docker inspect myapp --format='{{json .Config.Labels}}'
```

---

## Complete Dockerfile Examples

### Node.js Application (Production Ready)
```dockerfile
# Use specific version for reproducibility
FROM node:18.17.0-alpine

# Add metadata
LABEL maintainer="dev@example.com"

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=appuser:appgroup . .

# Document the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Switch to non-root user
USER appuser

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "index.js"]
```

### Python Flask Application
```dockerfile
FROM python:3.11-slim

LABEL maintainer="dev@example.com"

# Create user
RUN useradd -m appuser

WORKDIR /app

# Install dependencies first
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY --chown=appuser:appuser . .

EXPOSE 5000

HEALTHCHECK CMD curl -f http://localhost:5000/health || exit 1

USER appuser

ENV FLASK_ENV=production

CMD ["python", "app.py"]
```

---

## Multi-Stage Builds Explained

**What are they?**
Multi-stage builds let you use multiple `FROM` instructions in one Dockerfile. Each FROM starts a new "stage". You can copy files from one stage to another.

**Why do we need them?**
- **Smaller images**: Build tools don't end up in production image
- **Security**: Less software = fewer vulnerabilities
- **Cleaner**: Separate build concerns from runtime

```dockerfile
# ============ Stage 1: Build ============
FROM node:18 AS builder
# 'AS builder' names this stage

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# At this point we have:
# - node_modules (huge!)
# - source code
# - built dist/ folder

# ============ Stage 2: Production ============
FROM node:18-alpine AS production
# Start fresh with smaller image

WORKDIR /app

# Copy ONLY what we need from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Final image has:
# - Production dependencies only
# - Built code only
# - No dev dependencies, no source code

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Size comparison:**
| Stage | Contents | Size |
|-------|----------|------|
| Builder | Node + npm + all deps + source + built code | ~1.2GB |
| Production | Alpine + prod deps + built code | ~180MB |

---

## .dockerignore Explained

**What is it?**
A file that tells Docker what to **ignore** when copying files with `COPY` or `ADD`.

**Why do we need it?**
- Faster builds (don't copy unnecessary files)
- Smaller images
- Security (don't accidentally copy secrets)
- Avoid cache issues (node_modules, .git)

**Create `.dockerignore` in your project root:**
```bash
# Dependencies (will be installed fresh in container)
node_modules
vendor
.venv
__pycache__

# Git (not needed in container)
.git
.gitignore

# IDE files
.idea
.vscode
*.swp

# Build outputs (will be rebuilt)
dist
build

# Environment files (NEVER put secrets in images!)
.env
.env.*
*.local

# Docker files themselves
Dockerfile*
docker-compose*
.dockerignore

# Documentation
README.md
docs

# Tests (usually not needed in production)
test
tests
coverage
*.test.js

# Logs
*.log
logs

# OS files
.DS_Store
Thumbs.db
```

**Without .dockerignore:**
```
COPY . .  →  Copies EVERYTHING including node_modules, .git, .env
            Build is slow, image is huge, secrets might leak
```

**With .dockerignore:**
```
COPY . .  →  Copies only what's needed
            Fast build, small image, no secrets
```

---

## Building Images

```bash
# Basic build (current directory)
docker build .

# Build with tag (name:version)
docker build -t myapp:v1.0 .
docker build -t myapp:latest .

# Build with multiple tags
docker build -t myapp:v1.0 -t myapp:latest .

# Build from different Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp .

# Build without using cache (force fresh build)
docker build --no-cache -t myapp .

# Build and see all output
docker build --progress=plain -t myapp .

# Build for different platform
docker build --platform linux/amd64 -t myapp .
```

---

## Best Practices Summary

1. **Use specific base image tags** - `node:18.17.0-alpine` not `node:latest`
2. **Order by change frequency** - Copy package.json before source code
3. **Combine RUN commands** - Reduces layers and image size
4. **Use .dockerignore** - Faster builds, smaller images
5. **Don't run as root** - Create and use non-root user
6. **Use multi-stage builds** - Smaller production images
7. **Add HEALTHCHECK** - Enable container health monitoring
8. **Use COPY over ADD** - More predictable behavior
9. **Clean up in same RUN** - `rm -rf /var/lib/apt/lists/*`
10. **Use exec form for CMD** - Better signal handling
