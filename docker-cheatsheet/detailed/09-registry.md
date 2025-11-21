## 9. Docker Registry

### 9.1 What is a Registry?

A registry is a storage and distribution system for Docker images.

- **Docker Hub** - Default public registry
- **AWS ECR** - Amazon's registry
- **GCR** - Google Container Registry
- **Azure ACR** - Azure Container Registry
- **GitHub GHCR** - GitHub Container Registry

### 9.2 Pushing Images

```bash
# Login to Docker Hub
docker login

# Tag image for registry
docker tag myapp:latest username/myapp:v1.0

# Push to Docker Hub
docker push username/myapp:v1.0

# Push to other registries
docker tag myapp:latest ghcr.io/username/myapp:v1.0
docker push ghcr.io/username/myapp:v1.0
```

### 9.3 Private Registries

**Login to private registry:**
```bash
# AWS ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.region.amazonaws.com

# Google GCR
gcloud auth configure-docker

# Azure ACR
az acr login --name myregistry
```

**Run your own registry:**
```bash
docker run -d \
  --name registry \
  -p 5000:5000 \
  -v registry_data:/var/lib/registry \
  registry:2

# Push to local registry
docker tag myapp localhost:5000/myapp
docker push localhost:5000/myapp
```

---

