# Docker Containers - Quick Reference

## Run Containers
```bash
docker run nginx                        # Basic run
docker run -d nginx                     # Detached (background)
docker run -d --name web nginx          # With name
docker run -d -p 8080:80 nginx          # Port mapping
docker run -it ubuntu bash              # Interactive
docker run --rm nginx                   # Auto-remove on stop
docker run -e NODE_ENV=prod myapp       # Environment variable
docker run -v /host:/container nginx    # Volume mount
```

## List Containers
```bash
docker ps                    # Running only
docker ps -a                 # All containers
docker ps -q                 # IDs only
```

## Start/Stop/Restart
```bash
docker start container_name
docker stop container_name
docker restart container_name
docker kill container_name   # Force stop
```

## Remove Containers
```bash
docker rm container_name
docker rm -f container_name           # Force remove running
docker container prune                # Remove all stopped
docker rm -f $(docker ps -aq)        # Remove ALL
```

## Logs
```bash
docker logs container_name
docker logs -f container_name         # Follow
docker logs --tail 100 container_name # Last 100 lines
```

## Execute Commands
```bash
docker exec container_name ls -la
docker exec -it container_name bash   # Interactive shell
docker exec -it container_name sh     # For Alpine
```

## Inspect & Stats
```bash
docker inspect container_name
docker stats                          # Resource usage
docker top container_name             # Processes
```
