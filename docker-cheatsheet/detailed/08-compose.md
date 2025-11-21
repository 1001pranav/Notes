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

