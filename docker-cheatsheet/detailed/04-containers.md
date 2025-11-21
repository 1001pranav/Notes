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

