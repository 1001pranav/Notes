[Dockerfile - Building Custom Images](#5-dockerfile---building-custom-images)
   - 5.1 [What is a Dockerfile?](#51-what-is-a-dockerfile)
   - 5.2 [Dockerfile Instructions](#52-dockerfile-instructions)
   - 5.3 [Building Images](#53-building-images)
   - 5.4 [Best Practices](#54-best-practices)
   - 5.5 [Multi-Stage Builds](#55-multi-stage-builds)
   - 5.6 [.dockerignore File](#56-dockerignore-file)

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

