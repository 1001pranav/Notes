# Docker in Production - Detailed Guide

## Table of Contents
- [What is Container Orchestration?](#what-is-container-orchestration)
- [Docker Swarm Basics](#docker-swarm-basics)
  - [What is Docker Swarm?](#what-is-docker-swarm)
  - [Key Concepts](#key-concepts)
  - [Basic Commands](#basic-commands)
- [Kubernetes Overview](#kubernetes-overview)
  - [What is Kubernetes?](#what-is-kubernetes)
  - [Key Concepts](#key-concepts-1)
  - [When to Use What?](#when-to-use-what)
- [CI/CD with Docker](#cicd-with-docker)
  - [GitHub Actions Example](#github-actions-example)
  - [GitLab CI Example](#gitlab-ci-example)
- [Logging & Monitoring](#logging--monitoring)
- [Production Checklist](#production-checklist)

---

## What is Container Orchestration?

**Simple Definition:**
Managing multiple containers across multiple servers automatically - handling deployment, scaling, networking, and recovery.

**Why is it needed?**
Single Docker host works for development, but production needs:
- Multiple servers for high availability
- Auto-restart when containers crash
- Load balancing across containers
- Rolling updates without downtime
- Auto-scaling based on load

---

## Docker Swarm Basics

### What is Docker Swarm?

**Simple Definition:**
Docker's built-in tool for managing containers across multiple machines as a single system.

**Analogy:**
> Single Docker = One chef in one kitchen
> Docker Swarm = Many chefs in many kitchens, coordinated by a head chef

### Key Concepts

| Term | What it means |
|------|---------------|
| **Swarm** | A cluster of Docker hosts |
| **Node** | A single Docker host in the swarm |
| **Manager** | Node that controls the swarm |
| **Worker** | Node that runs containers |
| **Service** | A definition of containers to run |
| **Task** | A single container in a service |
| **Replica** | Number of container copies to run |

### Basic Commands

```bash
# Initialize a swarm (run on manager node)
docker swarm init
# Output shows command to join worker nodes

# Join as worker (run on other machines)
docker swarm join --token <token> <manager-ip>:2377

# Create a service (like docker run, but distributed)
docker service create \
  --name web \
  --replicas 3 \
  -p 80:80 \
  nginx

# List services
docker service ls

# Scale service (add more containers)
docker service scale web=5

# View service logs
docker service logs web

# Update service (rolling update)
docker service update --image nginx:1.25 web

# Remove service
docker service rm web

# Leave swarm
docker swarm leave --force  # On manager
docker swarm leave          # On worker
```

---

## Kubernetes Overview

### What is Kubernetes?

**Simple Definition:**
The industry-standard platform for automating deployment, scaling, and management of containerized applications. More powerful than Swarm, but more complex.

**Analogy:**
> Docker Swarm = Small restaurant chain (simple management)
> Kubernetes = Global franchise (complex but powerful)

### Key Concepts

| Term | What it means | Docker equivalent |
|------|---------------|-------------------|
| **Pod** | Smallest unit - one or more containers | Container |
| **Deployment** | Manages Pods, handles updates | Service |
| **Service** | Network endpoint for Pods | Port + Load balancer |
| **Namespace** | Virtual cluster separation | - |
| **ConfigMap** | Configuration data | Environment variables |
| **Secret** | Sensitive data | Docker secrets |
| **Ingress** | External HTTP access | Reverse proxy |

### Basic Example

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3                    # Run 3 copies
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
        image: nginx:1.24
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
---
# Service to expose the deployment
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

```bash
# Apply configuration
kubectl apply -f deployment.yaml

# View running pods
kubectl get pods

# Scale deployment
kubectl scale deployment web-app --replicas=5

# View logs
kubectl logs deployment/web-app

# Delete
kubectl delete -f deployment.yaml
```

### When to Use What?

| Use Swarm | Use Kubernetes |
|-----------|----------------|
| Small teams | Large teams |
| Simple needs | Complex requirements |
| Quick setup | Production-grade |
| Docker-only | Multi-platform |
| < 10 services | Many microservices |

---

## CI/CD with Docker

### What is CI/CD?

**CI (Continuous Integration):** Automatically build and test code when pushed
**CD (Continuous Deployment):** Automatically deploy to production

### Typical Pipeline

```
Code Push → Build Image → Test → Push to Registry → Deploy
```

### GitHub Actions Example

```yaml
# .github/workflows/docker.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # 1. Get code
      - uses: actions/checkout@v3

      # 2. Login to Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # 3. Build and push image
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: |
            username/myapp:latest
            username/myapp:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # Deploy to your server
      - name: Deploy to production
        run: |
          ssh user@server "docker pull username/myapp:${{ github.sha }} && docker-compose up -d"
```

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - ssh server "docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    - ssh server "docker-compose up -d"
  only:
    - main
```

---

## Logging & Monitoring

### Why Important?

- **Debugging:** Find what went wrong
- **Performance:** Identify bottlenecks
- **Security:** Detect intrusions
- **Business:** Track usage metrics

### Logging Drivers

**What is a logging driver?**
Determines where container logs are sent.

```bash
# JSON file (default) - logs stored locally
docker run --log-driver json-file myapp

# Limit log size
docker run \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp

# Send to syslog
docker run --log-driver syslog myapp

# Send to AWS CloudWatch
docker run \
  --log-driver awslogs \
  --log-opt awslogs-region=us-east-1 \
  --log-opt awslogs-group=myapp-logs \
  myapp

# Send to Google Cloud Logging
docker run --log-driver gcplogs myapp
```

### Centralized Logging (ELK Stack)

```yaml
# docker-compose.yml for ELK
services:
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
    volumes:
      - es_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.10.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"

volumes:
  es_data:
```

### Monitoring with Prometheus + Grafana

```yaml
# docker-compose.yml
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
    volumes:
      - grafana_data:/var/lib/grafana

  # Collect Docker metrics
  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"

volumes:
  grafana_data:
```

---

## Production Checklist

### Before Deployment
- [ ] Use specific image tags (not `latest`)
- [ ] Scan images for vulnerabilities
- [ ] Run as non-root user
- [ ] Set resource limits (CPU, memory)
- [ ] No secrets in images
- [ ] Health checks configured
- [ ] Logging configured

### Infrastructure
- [ ] Use orchestration (Swarm/Kubernetes)
- [ ] Multiple replicas for high availability
- [ ] Load balancer in front
- [ ] Persistent storage for data
- [ ] Backup strategy for volumes
- [ ] Network policies configured

### Operations
- [ ] CI/CD pipeline set up
- [ ] Monitoring and alerting
- [ ] Centralized logging
- [ ] Rolling update strategy
- [ ] Rollback plan tested
- [ ] Documentation updated

---
