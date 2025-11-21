# Docker Images - Detailed Guide

## Table of Contents
- [What is a Docker Image?](#what-is-a-docker-image)
- [Understanding Image Layers](#understanding-image-layers)
- [Pulling Images](#pulling-images)
- [Listing Images](#listing-images)
- [Removing Images](#removing-images)
- [Understanding Image Tags](#understanding-image-tags)
- [Docker Hub](#docker-hub)

---

## What is a Docker Image?

**Simple Definition:**
A Docker image is a **read-only template** (like a snapshot or blueprint) that contains everything needed to run an application - the code, runtime, libraries, environment variables, and configuration files.

**Why do we need images?**
- Without images, you'd have to manually install and configure everything on each server
- Images ensure your application runs exactly the same way everywhere
- They're shareable - your team can use the same image

**Real-World Analogy:**
> Think of an image like a **recipe + all pre-measured ingredients** boxed together. Anyone with the box can make the exact same dish, every time, anywhere.

---

## Understanding Image Layers

**What are layers?**
Docker images are built in **layers**. Each instruction in a Dockerfile creates a new layer. Layers are stacked on top of each other.

**Why layers matter:**
- **Caching**: If a layer hasn't changed, Docker reuses it (faster builds)
- **Sharing**: Multiple images can share common layers (saves disk space)
- **Efficiency**: Only changed layers are transferred when pushing/pulling

```
How layers work:

Your Dockerfile:                    Resulting Image Layers:
─────────────────                   ──────────────────────
FROM node:18-alpine          →      Layer 1: Base OS (Alpine Linux + Node.js)
WORKDIR /app                 →      Layer 2: Create /app directory
COPY package.json ./         →      Layer 3: Add package.json file
RUN npm install              →      Layer 4: Add node_modules (largest layer!)
COPY . .                     →      Layer 5: Add your application code

Each layer only contains the CHANGES from the previous layer.
```

**Layer caching example:**
```
First build:  All 5 layers built from scratch ──→ 2 minutes

You change only your code (not package.json):
Second build: Layers 1-4 from CACHE ──→ 5 seconds
              Only Layer 5 rebuilt

This is why we copy package.json BEFORE copying all code!
```

---

## Pulling Images

**What does "pulling" mean?**
Pulling downloads an image from a registry (like Docker Hub) to your local machine.

**Why do we pull images?**
- To get pre-built images (nginx, postgres, node, etc.)
- To use images others have created
- Docker automatically pulls if an image isn't found locally

```bash
# Pull the latest version of nginx
docker pull nginx
# What happens: Downloads nginx:latest from Docker Hub

# Pull a specific version (RECOMMENDED for production)
docker pull nginx:1.24
# What happens: Downloads exactly version 1.24

# Pull from a different registry (not Docker Hub)
docker pull gcr.io/google-containers/nginx
# What happens: Downloads from Google's container registry

# Pull for a specific CPU architecture
docker pull --platform linux/amd64 nginx
# What happens: Downloads the Intel/AMD version (useful on Mac M1/M2)
```

**Common Official Images Explained:**
| Image | What it is | When to use |
|-------|------------|-------------|
| `nginx` | Web server & reverse proxy | Serving static files, load balancing |
| `node` | Node.js JavaScript runtime | Running Node.js applications |
| `python` | Python interpreter | Running Python applications |
| `postgres` | PostgreSQL database | Relational database needs |
| `redis` | In-memory data store | Caching, sessions, queues |
| `mongo` | MongoDB NoSQL database | Document-based data storage |
| `mysql` | MySQL database | Relational database needs |
| `alpine` | Minimal Linux (5MB!) | Base for custom lightweight images |
| `ubuntu` | Full Ubuntu Linux | When you need apt-get and full tooling |

---

## Listing Images

**What does this show?**
Lists all Docker images stored on your local machine.

```bash
# List all images on your machine
docker images
# OR (same thing)
docker image ls

# Example output:
# REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
# nginx        latest    a6bd71f48f68   2 days ago     187MB
# nginx        1.24      b8cf2cbeabb9   1 week ago     142MB
# node         18        b4e0d8a7a3b2   1 week ago     991MB
# <none>       <none>    c3d4e5f6a7b8   2 weeks ago    500MB  ← Dangling image
```

**Understanding the output:**
| Column | Meaning |
|--------|---------|
| REPOSITORY | Image name (nginx, node, myapp) |
| TAG | Version label (latest, 1.24, v1.0) |
| IMAGE ID | Unique identifier (first 12 chars of SHA256 hash) |
| CREATED | When the image was built |
| SIZE | Disk space used by this image |

**What is a "dangling" image?**
A dangling image shows `<none>` for both repository and tag. These are:
- Old layers left behind after rebuilding an image
- Intermediate build layers
- **Safe to delete** - they waste disk space

```bash
# Show only dangling images
docker images --filter "dangling=true"

# Show only image IDs (useful for scripting)
docker images -q

# Show all images including intermediate layers
docker images -a
```

---

## Removing Images

**Why remove images?**
- Free up disk space (images can be gigabytes!)
- Clean up old/unused versions
- Remove failed build artifacts

```bash
# Remove a single image by name
docker rmi nginx

# Remove by image ID
docker rmi a6bd71f48f68

# Remove multiple images at once
docker rmi nginx redis mongo

# Force remove (even if a container is using it)
docker rmi -f nginx

# Remove all "dangling" images (safe cleanup)
docker image prune

# Remove ALL unused images (not just dangling)
docker image prune -a

# Remove ALL images (careful!)
docker rmi $(docker images -q)
```

---

## Understanding Image Tags

**What is a tag?**
A tag is a **label** that identifies a specific version of an image. Think of it like version numbers for software.

**Format:** `repository:tag` (e.g., `nginx:1.24`)

**Why tags matter:**
- Same image name can have many versions
- Tags let you pick exactly which version you want
- Without a tag, Docker assumes `latest`

```bash
# These are all DIFFERENT images:
nginx:latest        # Most recent version (changes over time!)
nginx:1.24          # Specific version 1.24
nginx:1.24.0        # Even more specific (patch version)
nginx:1.24-alpine   # Version 1.24 on Alpine Linux (smaller)
```

**Tag naming conventions explained:**
| Tag suffix | Meaning | Size | Use when |
|------------|---------|------|----------|
| (none) | Full Debian-based | Large | Need maximum compatibility |
| `-slim` | Minimal Debian | Medium | Don't need build tools |
| `-alpine` | Alpine Linux based | Small | Want smallest size |
| `-bullseye` | Specific Debian version | Large | Need specific OS version |

**Best Practices:**
```bash
# BAD - "latest" can change anytime
FROM node:latest

# GOOD - Specific version, predictable
FROM node:18.17.0-alpine
```

**Creating your own tags:**
```bash
# Tag an existing image
docker tag nginx:latest mycompany/nginx:v1.0

# Tag when building
docker build -t myapp:v1.0 -t myapp:latest .
```

---

## Docker Hub

**What is Docker Hub?**
Docker Hub is the **default public registry** - a cloud service where Docker images are stored and shared. Think of it like GitHub, but for Docker images.

**Why use Docker Hub?**
- Pull pre-built official images (nginx, postgres, etc.)
- Share your images with your team or the world
- Automated builds from GitHub/Bitbucket
- Free for public images

**Types of images on Docker Hub:**
| Type | Example | Trust level |
|------|---------|-------------|
| Official Images | `nginx`, `postgres` | Highest - maintained by Docker |
| Verified Publisher | `bitnami/nginx` | High - verified company |
| Community | `someuser/myapp` | Varies - check downloads/stars |

```bash
# Login to Docker Hub
docker login

# Search for images
docker search nginx

# Pull from Docker Hub (default)
docker pull nginx

# Push YOUR image to Docker Hub
docker tag myapp:v1.0 yourusername/myapp:v1.0
docker push yourusername/myapp:v1.0
```

---
