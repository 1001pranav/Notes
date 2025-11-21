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

