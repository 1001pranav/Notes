# Docker Volumes - Data Persistence (Detailed Guide)

## Why Do We Need Volumes?

**The Problem:**
Containers are **ephemeral** (temporary). When a container is deleted, all data inside it is lost forever.

**What does "ephemeral" mean?**
> Ephemeral = short-lived, temporary. Like writing on a whiteboard - when you erase it, the content is gone.

**Real-World Problem:**
```
Without Volume:
1. Run PostgreSQL container
2. Create database, add users, store data
3. Container crashes or is deleted
4. ALL YOUR DATA IS GONE! 😱
```

**The Solution - Volumes:**
Volumes store data **outside** the container on your host machine. Even if the container is deleted, the data remains.

```
Without Volume:                 With Volume:
+----------------+              +----------------+
|   Container    |              |   Container    |
|  +---------+   |              |       |        |
|  |  Data   |   |              |       | link   |
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
                                 DATA SAFE! ✓
```

---

## Types of Data Storage

### 1. Named Volumes (Recommended for Production)

**What is it?**
A storage space managed by Docker with a human-readable name.

**Why use it?**
- Docker manages the location
- Easy to backup
- Works across different host systems
- Best for database data, uploaded files

```bash
# Create a named volume
docker volume create mydata

# Use it with a container
docker run -d -v mydata:/app/data myapp
#              ^^^^^^ ^^^^^^^^^
#              |      +-- Path inside container
#              +-- Volume name (Docker manages where this is stored)
```

### 2. Bind Mounts (Best for Development)

**What is it?**
A direct link from a **specific folder on your computer** to a folder in the container.

**Why use it?**
- You control the exact location
- Perfect for development (edit code on host, changes reflect in container)
- Share configuration files

```bash
# Bind mount: /home/user/myproject → /app in container
docker run -d -v /home/user/myproject:/app myapp

# Using $(pwd) for current directory
docker run -d -v $(pwd):/app myapp
#              ^^^^^^ ^^^^
#              |      +-- Path inside container
#              +-- Path on YOUR computer (absolute path)
```

### 3. Anonymous Volumes (Temporary)

**What is it?**
A volume without a name - Docker generates a random ID.

**Why use it?**
- Temporary data you don't care about persisting
- Exclude directories from bind mounts

```bash
docker run -d -v /app/temp myapp
#              ^^^^^^^^^^ No colon, no host path = anonymous volume
```

### 4. tmpfs Mounts (Memory Only)

**What is it?**
Data stored in **RAM only**, never written to disk.

**Why use it?**
- Sensitive data (secrets, tokens) that shouldn't be on disk
- Very fast temporary storage
- Data disappears when container stops

```bash
docker run -d --tmpfs /app/secrets myapp
```

**Comparison Table:**
| Type | Syntax | Location | Persists? | Use Case |
|------|--------|----------|-----------|----------|
| Named Volume | `-v mydata:/app` | Docker managed | Yes | Databases, uploads |
| Bind Mount | `-v /host/path:/app` | You choose | Yes | Development |
| Anonymous | `-v /app/temp` | Docker managed | Until removed | Temporary |
| tmpfs | `--tmpfs /path` | RAM | No | Secrets |

---

## Creating and Managing Volumes

```bash
# Create a new volume
docker volume create mydata

# List all volumes
docker volume ls
# Output:
# DRIVER    VOLUME NAME
# local     mydata
# local     postgres_data
# local     abc123xyz  ← Anonymous volume (random name)

# Inspect a volume (see where it's stored)
docker volume inspect mydata
# Output shows: Mountpoint: /var/lib/docker/volumes/mydata/_data

# Remove a volume (must not be in use)
docker volume rm mydata

# Remove all unused volumes (careful!)
docker volume prune
```

---

## Using Volumes with Containers

### Database Example (Named Volume)
```bash
# PostgreSQL with persistent data
docker run -d \
  --name postgres \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Data survives container deletion:
docker rm -f postgres           # Container gone
docker volume ls                # Volume still exists!
docker run -d \
  --name postgres-new \
  -v pgdata:/var/lib/postgresql/data \  # Same volume
  postgres:15
# All your data is still there!
```

### Development Example (Bind Mount)
```bash
# Mount your code for live editing
docker run -d \
  --name dev-app \
  -v $(pwd):/app \           # Your code folder → /app
  -v /app/node_modules \     # Exclude node_modules (use container's)
  -p 3000:3000 \
  node:18 \
  npm run dev

# Edit files on your computer → Changes appear immediately in container
```

### Multiple Volumes
```bash
docker run -d \
  --name myapp \
  -v app_data:/app/data \        # Named volume for data
  -v app_logs:/app/logs \        # Named volume for logs
  -v $(pwd)/config:/app/config \ # Bind mount for config
  myapp
```

---

## Read-Only Mounts

**What is it?**
The container can read files but cannot modify them.

**Why use it?**
- Security: Prevent container from changing config files
- Safety: Protect important data from accidental changes

```bash
# :ro at the end = read-only
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  myapp

# Container can read /app/config but cannot write to it
```

---

## Backup and Restore Volumes

### Backup
```bash
# Backup a volume to a tar file
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mydata-backup.tar.gz -C /data .

# Explanation:
# - Mount the volume to /data
# - Mount current directory to /backup
# - Create tar.gz of volume contents
```

### Restore
```bash
# Restore from backup
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/mydata-backup.tar.gz"
```

---

## Volume Best Practices

1. **Use named volumes for databases**
   ```bash
   docker run -v postgres_data:/var/lib/postgresql/data postgres
   ```

2. **Use bind mounts for development**
   ```bash
   docker run -v $(pwd):/app myapp
   ```

3. **Exclude dependency folders in development**
   ```bash
   docker run \
     -v $(pwd):/app \
     -v /app/node_modules \  # Container's node_modules, not host's
     node:18
   ```

4. **Use read-only when container shouldn't modify**
   ```bash
   docker run -v ./config:/app/config:ro myapp
   ```

5. **Regular backups for important data**
   ```bash
   # Automate with cron or similar
   docker run --rm -v mydata:/data -v /backups:/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz /data
   ```

---
