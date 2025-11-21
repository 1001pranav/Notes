# Dockerfile - Quick Reference

## Basic Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Instructions

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image |
| `WORKDIR` | Set working directory |
| `COPY` | Copy files from host |
| `ADD` | Copy + extract archives |
| `RUN` | Execute command (build time) |
| `CMD` | Default command (run time) |
| `ENTRYPOINT` | Fixed command |
| `ENV` | Environment variable |
| `ARG` | Build argument |
| `EXPOSE` | Document port |
| `VOLUME` | Create mount point |
| `USER` | Set user |
| `HEALTHCHECK` | Health check command |

## Examples

```dockerfile
# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Build arguments
ARG VERSION=latest
FROM node:${VERSION}

# Non-root user
RUN adduser -D appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
```

## Multi-Stage Build
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## .dockerignore
```
node_modules
.git
.env
*.log
Dockerfile
```
