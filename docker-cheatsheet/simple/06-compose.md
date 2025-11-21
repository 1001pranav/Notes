# Docker Compose - Quick Reference

## Basic docker-compose.yml
```yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Commands
```bash
docker compose up                # Start (foreground)
docker compose up -d             # Start (background)
docker compose up --build        # Build & start
docker compose down              # Stop & remove
docker compose down -v           # Stop & remove volumes
docker compose ps                # List services
docker compose logs              # View logs
docker compose logs -f web       # Follow specific service
docker compose exec web bash     # Enter service
docker compose restart           # Restart services
docker compose pull              # Pull latest images
docker compose build             # Rebuild images
```

## Environment Variables
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}    # From .env file
    env_file:
      - .env
```

## Health Check
```yaml
services:
  db:
    image: postgres
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    depends_on:
      db:
        condition: service_healthy
```
