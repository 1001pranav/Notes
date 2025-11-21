# Docker Networking - Quick Reference

## Network Types
| Type | Description |
|------|-------------|
| `bridge` | Default, isolated (use custom for DNS) |
| `host` | Uses host network directly |
| `none` | No networking |

## Manage Networks
```bash
docker network create mynet      # Create
docker network ls                # List
docker network inspect mynet     # Details
docker network rm mynet          # Remove
docker network prune             # Remove unused
```

## Connect Containers
```bash
# Run on specific network
docker run -d --name web --network mynet nginx

# Connect existing container
docker network connect mynet container_name

# Disconnect
docker network disconnect mynet container_name
```

## Port Mapping
```bash
docker run -p 8080:80 nginx           # host:container
docker run -p 80:80 -p 443:443 nginx  # Multiple ports
docker run -p 127.0.0.1:8080:80 nginx # Specific interface
docker run -P nginx                    # Random ports
```

## Container Communication
```bash
# Create network
docker network create app

# Containers can reach each other by name
docker run -d --name db --network app postgres
docker run -d --name api --network app -e DB_HOST=db myapi
# api can connect to db using hostname "db"
```
