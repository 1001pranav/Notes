## 10. Docker Security

### 10.1 Security Best Practices

1. **Use official images**
2. **Scan images for vulnerabilities**
3. **Don't run as root**
4. **Use read-only filesystems when possible**
5. **Limit resources**
6. **Don't store secrets in images**
7. **Keep Docker updated**

### 10.2 Running as Non-Root

```dockerfile
FROM node:18-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

CMD ["node", "index.js"]
```

**Run container as specific user:**
```bash
docker run --user 1000:1000 myapp
```

### 10.3 Scanning Images

```bash
# Docker Scout (built-in)
docker scout cves myimage:tag

# Trivy (popular scanner)
docker run aquasec/trivy image myimage:tag

# Snyk
docker scan myimage:tag
```

### 10.4 Secrets Management

**Docker Secrets (Swarm):**
```bash
# Create secret
echo "my_password" | docker secret create db_password -

# Use in service
docker service create \
  --name web \
  --secret db_password \
  myapp
```

**Docker Compose Secrets:**
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

**Never do this:**
```dockerfile
# BAD - Secret in image layer
ENV API_KEY=supersecretkey
RUN echo "password" > /app/config
```

---

