# Docker Cheatsheet - Quick Reference

## Images
```bash
docker pull nginx:alpine          # Pull image
docker images                     # List images
docker rmi nginx                  # Remove image
docker build -t myapp:v1 .        # Build image
docker tag myapp myrepo/myapp:v1  # Tag image
docker push myrepo/myapp:v1       # Push image
```

## Containers
```bash
docker run -d -p 8080:80 --name web nginx   # Run container
docker ps -a                                 # List all containers
docker start/stop/restart web               # Control container
docker rm -f web                            # Remove container
docker logs -f web                          # View logs
docker exec -it web bash                    # Enter container
```

## Run Options
| Option | Example | Description |
|--------|---------|-------------|
| `-d` | `-d` | Detached mode |
| `-p` | `-p 8080:80` | Port mapping |
| `-v` | `-v data:/app` | Volume mount |
| `-e` | `-e NODE_ENV=prod` | Environment var |
| `--name` | `--name web` | Container name |
| `--rm` | `--rm` | Remove on exit |
| `--network` | `--network mynet` | Network |

## Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image |
| `WORKDIR` | Working directory |
| `COPY/ADD` | Copy files |
| `RUN` | Execute (build time) |
| `CMD` | Default command (runtime) |
| `ENV` | Environment variable |
| `EXPOSE` | Document port |
| `USER` | Set user |

## Volumes
```bash
docker volume create mydata              # Create volume
docker volume ls                         # List volumes
docker run -v mydata:/app/data nginx     # Named volume
docker run -v $(pwd):/app nginx          # Bind mount
docker run -v /app/data:ro nginx         # Read-only
```

## Networks
```bash
docker network create mynet              # Create network
docker network ls                        # List networks
docker run --network mynet nginx         # Use network
docker network connect mynet web         # Connect container
```

## Docker Compose
```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment: [DB_HOST=db]
    depends_on: [db]
  db:
    image: postgres
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

```bash
docker compose up -d       # Start services
docker compose down        # Stop services
docker compose logs -f     # View logs
docker compose exec web sh # Enter service
docker compose ps          # List services
```

## Cleanup
```bash
docker system df                  # Check disk usage
docker system prune -a            # Remove all unused
docker container prune            # Remove stopped containers
docker image prune -a             # Remove unused images
docker volume prune               # Remove unused volumes
```

## Common Patterns
```bash
# Dev with hot reload
docker run -v $(pwd):/app -p 3000:3000 node npm run dev

# Database with persistence
docker run -d -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres

# Enter running container
docker exec -it container_name sh
```
