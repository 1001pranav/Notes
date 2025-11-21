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

