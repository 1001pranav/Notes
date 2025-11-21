## 11. Docker in Production

### 11.1 Docker Swarm Basics

Docker Swarm is Docker's native clustering solution.

```bash
# Initialize swarm
docker swarm init

# Create service
docker service create \
  --name web \
  --replicas 3 \
  -p 80:80 \
  nginx

# Scale service
docker service scale web=5

# List services
docker service ls

# View service logs
docker service logs web
```

### 11.2 Kubernetes Overview

Kubernetes (K8s) is the industry standard for container orchestration.

**Key Concepts:**
- **Pod** - Smallest deployable unit (1+ containers)
- **Deployment** - Manages Pod replicas
- **Service** - Network endpoint for Pods
- **Ingress** - External access to services

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### 11.3 CI/CD with Docker

**GitHub Actions Example:**
```yaml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: username/myapp:${{ github.sha }}
```

### 11.4 Logging & Monitoring

**Logging drivers:**
```bash
# JSON file (default)
docker run --log-driver json-file myapp

# Send to syslog
docker run --log-driver syslog myapp

# Send to AWS CloudWatch
docker run \
  --log-driver awslogs \
  --log-opt awslogs-region=us-east-1 \
  --log-opt awslogs-group=myapp \
  myapp
```

**Monitoring stack (Prometheus + Grafana):**
```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

---

