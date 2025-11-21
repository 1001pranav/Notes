# Docker Registry - Detailed Guide

## Table of Contents
- [What is a Registry?](#what-is-a-registry)
- [Types of Registries](#types-of-registries)
- [Working with Docker Hub](#working-with-docker-hub)
- [Cloud Provider Registries](#cloud-provider-registries)
  - [AWS ECR](#aws-ecr-elastic-container-registry)
  - [Google GCR](#google-gcr--artifact-registry)
  - [Azure ACR](#azure-acr)
  - [GitHub Container Registry](#github-container-registry)
- [Self-Hosted Registry](#self-hosted-registry)
- [Registry Best Practices](#registry-best-practices)

---

## What is a Registry?

**Simple Definition:**
A registry is a **storage and distribution service** for Docker images. It's where images are stored and from where they can be downloaded.

**Real-World Analogy:**
> Think of a registry like an **app store** for Docker images. Just as you download apps from the App Store or Google Play, you download Docker images from a registry.

**Why do we need registries?**
- **Share images** with team members or the world
- **Store images** for deployment to servers
- **Version control** for your container images
- **Backup** of your application packages

---

## Types of Registries

### Public Registries

**Docker Hub** (Default)
- Free for public images
- Most popular, largest collection
- Official images verified by Docker

```bash
# Pull from Docker Hub (no prefix needed)
docker pull nginx
docker pull postgres:15
```

### Private Registries

Store images privately - only authorized users can access.

| Registry | Provider | Use Case |
|----------|----------|----------|
| Docker Hub (Private) | Docker | Simple private repos |
| AWS ECR | Amazon | AWS deployments |
| Google GCR/Artifact Registry | Google | GCP deployments |
| Azure ACR | Microsoft | Azure deployments |
| GitHub GHCR | GitHub | Open source, GitHub Actions |
| Self-hosted | You | Full control, on-premises |

---

## Working with Docker Hub

### Login
```bash
# Login (prompts for password)
docker login

# Login with username
docker login -u yourusername

# Login with token (CI/CD)
echo $DOCKER_TOKEN | docker login -u yourusername --password-stdin
```

### Push Images

**What is pushing?**
Uploading your image from your computer to a registry so others can use it.

```bash
# Step 1: Build your image
docker build -t myapp:v1.0 .

# Step 2: Tag for registry (required for Docker Hub)
docker tag myapp:v1.0 yourusername/myapp:v1.0
#                      ^^^^^^^^^^^^ Your Docker Hub username

# Step 3: Push to registry
docker push yourusername/myapp:v1.0

# Now anyone can:
docker pull yourusername/myapp:v1.0
```

### Pull Images
```bash
# Public images - no login needed
docker pull nginx

# Your private images - login first
docker login
docker pull yourusername/private-app:v1.0
```

---

## Cloud Provider Registries

### AWS ECR (Elastic Container Registry)
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag for ECR
docker tag myapp:v1.0 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:v1.0

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:v1.0
```

### Google GCR / Artifact Registry
```bash
# Login
gcloud auth configure-docker

# Tag for GCR
docker tag myapp:v1.0 gcr.io/your-project/myapp:v1.0

# Push
docker push gcr.io/your-project/myapp:v1.0
```

### Azure ACR
```bash
# Login
az acr login --name yourregistry

# Tag for ACR
docker tag myapp:v1.0 yourregistry.azurecr.io/myapp:v1.0

# Push
docker push yourregistry.azurecr.io/myapp:v1.0
```

### GitHub Container Registry
```bash
# Login with personal access token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag for GHCR
docker tag myapp:v1.0 ghcr.io/yourusername/myapp:v1.0

# Push
docker push ghcr.io/yourusername/myapp:v1.0
```

---

## Self-Hosted Registry

**Why run your own registry?**
- Full control over storage and access
- Keep images on-premises (security/compliance)
- No external dependencies
- Faster pulls within your network

### Setup
```bash
# Run official registry image
docker run -d \
  --name registry \
  -p 5000:5000 \
  -v registry_data:/var/lib/registry \
  --restart always \
  registry:2

# Push to local registry
docker tag myapp:v1.0 localhost:5000/myapp:v1.0
docker push localhost:5000/myapp:v1.0

# Pull from local registry
docker pull localhost:5000/myapp:v1.0
```

### With Basic Authentication
```bash
# Create password file
mkdir -p /auth
docker run --rm \
  --entrypoint htpasswd \
  httpd:2 -Bbn myuser mypassword > /auth/htpasswd

# Run registry with auth
docker run -d \
  --name registry \
  -p 5000:5000 \
  -v registry_data:/var/lib/registry \
  -v /auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry:2

# Login before push/pull
docker login localhost:5000
```

---

## Registry Best Practices

1. **Use specific tags, not `latest`**
   ```bash
   docker push myregistry/app:v1.2.3  # Good
   docker push myregistry/app:latest  # Avoid in production
   ```

2. **Use immutable tags in production**
   - Once pushed, don't overwrite tags
   - Use Git commit SHA or semantic versions

3. **Clean up old images regularly**
   - Registries grow large over time
   - Set up retention policies

4. **Scan images for vulnerabilities**
   ```bash
   # Many registries offer built-in scanning
   # Or use tools like Trivy
   docker run aquasec/trivy image myapp:v1.0
   ```

5. **Use private registries for sensitive images**
   - Don't push proprietary code to public repos
   - Use access controls

---
