# Docker Volumes - Quick Reference

## Volume Types
| Type | Syntax | Use Case |
|------|--------|----------|
| Named Volume | `-v mydata:/app/data` | Production data |
| Bind Mount | `-v $(pwd):/app` | Development |
| Anonymous | `-v /app/data` | Temporary |

## Manage Volumes
```bash
docker volume create mydata      # Create
docker volume ls                 # List
docker volume inspect mydata     # Details
docker volume rm mydata          # Remove
docker volume prune              # Remove unused
```

## Use Volumes
```bash
# Named volume
docker run -v mydata:/app/data nginx

# Bind mount (current directory)
docker run -v $(pwd):/app node

# Read-only mount
docker run -v $(pwd)/config:/app/config:ro nginx

# Multiple volumes
docker run -v data:/data -v logs:/logs myapp
```

## Backup Volume
```bash
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data
```
