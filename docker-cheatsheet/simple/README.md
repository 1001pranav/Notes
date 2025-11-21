# Docker Quick Reference

Quick command reference for Docker. For detailed explanations, see the `detailed/` folder.

## Files

| File | Content |
|------|---------|
| [01-images.md](01-images.md) | Pull, list, remove, tag, build images |
| [02-containers.md](02-containers.md) | Run, manage, logs, exec containers |
| [03-dockerfile.md](03-dockerfile.md) | Dockerfile instructions & examples |
| [04-volumes.md](04-volumes.md) | Data persistence & mounts |
| [05-networking.md](05-networking.md) | Networks & port mapping |
| [06-compose.md](06-compose.md) | Docker Compose basics |
| [07-cleanup.md](07-cleanup.md) | Remove unused resources |

## Most Used Commands

```bash
# Run container
docker run -d -p 8080:80 --name web nginx

# List containers
docker ps -a

# Stop & remove
docker stop web && docker rm web

# View logs
docker logs -f web

# Enter container
docker exec -it web bash

# Compose up/down
docker compose up -d
docker compose down

# Cleanup
docker system prune -a
```
