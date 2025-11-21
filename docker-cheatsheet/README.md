# Docker Cheatsheet

Complete Docker documentation from beginner to expert level.

## Folder Structure

```
docker-cheatsheet/
├── simple/           # Quick reference (commands only)
│   ├── 01-images.md
│   ├── 02-containers.md
│   ├── 03-dockerfile.md
│   ├── 04-volumes.md
│   ├── 05-networking.md
│   ├── 06-compose.md
│   └── 07-cleanup.md
│
└── detailed/         # In-depth explanations (what, why, how)
    └── DOCKER.md     # Complete guide with diagrams & examples
```

## Which to Use?

| Folder | Use When |
|--------|----------|
| **simple/** | You know Docker, need quick command reference |
| **detailed/** | Learning Docker, need to understand concepts |

## Quick Start

```bash
# Run a container
docker run -d -p 80:80 nginx

# Using Docker Compose
docker compose up -d
```
