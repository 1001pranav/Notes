# Docker Security - Detailed Guide

## Why Docker Security Matters

**The Risk:**
Containers share the host kernel. A compromised container could potentially affect other containers or the host system.

**Real-World Analogy:**
> Containers are like apartments in a building. They're separate, but they share walls, plumbing, and electricity. A fire in one apartment can spread. Good security = fire prevention.

---

## Security Best Practices Explained

### 1. Use Official Images

**What are official images?**
Images maintained by Docker or verified publishers, regularly updated with security patches.

**Why use them?**
- Regularly scanned for vulnerabilities
- Maintained by experts
- Receive security updates quickly

```bash
# Good - Official image
FROM nginx:1.24

# Risky - Unknown source
FROM someuser/nginx-modified
```

**How to identify official images:**
- On Docker Hub: Look for "Official Image" badge
- No username prefix: `nginx` vs `someuser/nginx`

---

### 2. Don't Run as Root

**What's the problem?**
By default, containers run as the `root` user. If an attacker gains access, they have root privileges.

**Why it matters:**
- Root can modify system files
- Root can install malware
- Root can escape container (in some vulnerabilities)

```dockerfile
# BAD - Running as root (default)
FROM node:18
WORKDIR /app
COPY . .
CMD ["node", "app.js"]

# GOOD - Running as non-root user
FROM node:18
WORKDIR /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Change ownership of app files
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

CMD ["node", "app.js"]
```

**At runtime:**
```bash
# Run as specific user ID
docker run --user 1000:1000 myapp

# Verify the container isn't running as root
docker exec myapp whoami  # Should NOT be "root"
```

---

### 3. Scan Images for Vulnerabilities

**What is vulnerability scanning?**
Automated tools check your image for known security issues (CVEs) in packages and libraries.

**Why scan?**
- Discover vulnerable packages before deployment
- Meet compliance requirements
- Catch issues early

```bash
# Docker Scout (built into Docker)
docker scout cves myimage:tag
docker scout quickview myimage:tag

# Trivy (popular open-source scanner)
docker run aquasec/trivy image myimage:tag

# Snyk
docker scan myimage:tag

# GitHub Actions / CI integration
# Many registries (ECR, GCR) have built-in scanning
```

**Example output:**
```
myimage:tag (alpine 3.18)
========================
Total: 3 (HIGH: 1, MEDIUM: 2)

+---------+------------------+----------+-------------------+
| LIBRARY | VULNERABILITY ID | SEVERITY | INSTALLED VERSION |
+---------+------------------+----------+-------------------+
| openssl | CVE-2023-XXXXX   | HIGH     | 1.1.1k            |
+---------+------------------+----------+-------------------+
```

---

### 4. Never Store Secrets in Images

**What's the problem?**
Anything in your image can be extracted by anyone with access to it.

**Why it matters:**
- Images are often pushed to registries
- Image layers are cached and can be inspected
- Secrets become exposed if image leaks

```dockerfile
# NEVER DO THIS - Secrets are stored in image layer!
FROM node:18
ENV API_KEY=supersecret123
COPY .env /app/.env
RUN echo "password123" > /app/config

# Even if you delete it later, it's still in the layer history!
RUN rm /app/config  # Secret is STILL in previous layer!
```

**Better approaches:**

**1. Environment variables at runtime:**
```bash
docker run -e API_KEY=supersecret myapp
```

**2. Docker secrets (Swarm):**
```bash
echo "mysecret" | docker secret create api_key -
docker service create --secret api_key myapp
```

**3. Mounted secret files:**
```bash
docker run -v /path/to/secrets:/run/secrets:ro myapp
```

**4. Secret management tools:**
- HashiCorp Vault
- AWS Secrets Manager
- Kubernetes secrets

---

### 5. Use Read-Only Filesystems

**What is it?**
Container cannot write to its filesystem - prevents malware from persisting.

**Why use it?**
- Prevents attackers from modifying binaries
- Blocks malware installation
- Forces explicit data paths

```bash
# Read-only root filesystem
docker run --read-only myapp

# With specific writable directories
docker run --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  -v data:/app/data \
  myapp
```

---

### 6. Limit Container Capabilities

**What are capabilities?**
Linux splits root privileges into smaller units called capabilities.

**Why limit them?**
- Reduce what a compromised container can do
- Follow principle of least privilege

```bash
# Drop all capabilities, add only what's needed
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# Common capabilities to DROP:
# - SYS_ADMIN (very powerful, often unnecessary)
# - NET_RAW (can sniff network)
# - SYS_PTRACE (can debug processes)
```

---

### 7. Set Resource Limits

**Why?**
Prevent denial-of-service attacks and resource exhaustion.

```bash
docker run -d \
  --memory="512m" \
  --memory-swap="512m" \
  --cpus="1" \
  --pids-limit 100 \
  myapp

# Without limits, one container could consume all resources
```

---

### 8. Keep Docker Updated

**Why?**
Docker regularly releases security patches.

```bash
# Check current version
docker version

# Update Docker (Ubuntu)
sudo apt-get update && sudo apt-get upgrade docker-ce

# Update Docker Desktop
# Use the built-in update mechanism
```

---

## Docker Secrets (Swarm Mode)

**What are Docker secrets?**
Encrypted data (passwords, certificates, keys) that Docker manages securely.

**How they work:**
- Stored encrypted at rest
- Only sent to containers that need them
- Mounted as files in `/run/secrets/`
- Never written to disk in containers

```bash
# Create a secret
echo "mypassword" | docker secret create db_password -

# Or from file
docker secret create db_password ./password.txt

# Use in service
docker service create \
  --name myapp \
  --secret db_password \
  myapp

# In container, secret is at /run/secrets/db_password
```

**In Docker Compose:**
```yaml
services:
  db:
    image: postgres
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## Security Checklist

- [ ] Use official or verified base images
- [ ] Pin image versions (no `latest` in production)
- [ ] Run as non-root user
- [ ] Scan images for vulnerabilities
- [ ] No secrets in images or Dockerfiles
- [ ] Use read-only filesystem where possible
- [ ] Drop unnecessary capabilities
- [ ] Set resource limits
- [ ] Keep Docker and images updated
- [ ] Use private registries for sensitive images
- [ ] Enable content trust for image signing

---
