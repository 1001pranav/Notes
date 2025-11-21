# Docker Images - Quick Reference

## Pull Images
```bash
docker pull nginx              # Latest version
docker pull nginx:1.24         # Specific version
docker pull nginx:alpine       # Alpine (smaller)
```

## List Images
```bash
docker images
docker images -q               # IDs only
```

## Remove Images
```bash
docker rmi nginx               # Remove by name
docker rmi -f nginx            # Force remove
docker image prune             # Remove unused
docker rmi $(docker images -q) # Remove ALL
```

## Tag Images
```bash
docker tag nginx:latest myrepo/nginx:v1.0
```

## Build Image
```bash
docker build -t myapp:v1.0 .
docker build -f Dockerfile.prod -t myapp:prod .
docker build --no-cache -t myapp .
```

## Push Image
```bash
docker login
docker push username/myapp:v1.0
```
