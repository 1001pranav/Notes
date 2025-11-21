# Docker Cleanup - Quick Reference

## Check Disk Usage
```bash
docker system df
```

## Remove Containers
```bash
docker rm container_name          # Single
docker rm -f container_name       # Force (running)
docker container prune            # All stopped
docker rm -f $(docker ps -aq)    # ALL containers
```

## Remove Images
```bash
docker rmi image_name             # Single
docker rmi -f image_name          # Force
docker image prune                # Dangling images
docker image prune -a             # All unused images
docker rmi $(docker images -q)   # ALL images
```

## Remove Volumes
```bash
docker volume rm volume_name      # Single
docker volume prune               # All unused
```

## Remove Networks
```bash
docker network rm network_name    # Single
docker network prune              # All unused
```

## Remove Everything Unused
```bash
docker system prune               # Containers, networks, images
docker system prune -a            # + all unused images
docker system prune -a --volumes  # + volumes (CAREFUL!)
```
