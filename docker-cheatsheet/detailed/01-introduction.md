# Docker Complete Guide - From Beginner to Expert

## Table of Contents

1. [Introduction to Docker](#1-introduction-to-docker)
   - 1.1 [What is Docker?](#11-what-is-docker)
   - 1.2 [Why Use Docker?](#12-why-use-docker)
   - 1.3 [Docker vs Virtual Machines](#13-docker-vs-virtual-machines)
   - 1.4 [Docker Architecture](#14-docker-architecture)
   - 1.5 [Key Terminology](#15-key-terminology)

2. [Installation & Setup](#2-installation--setup)
   - 2.1 [Installing Docker on Linux](#21-installing-docker-on-linux)
   - 2.2 [Installing Docker on Windows/Mac](#22-installing-docker-on-windowsmac)
   - 2.3 [Verify Installation](#23-verify-installation)
   - 2.4 [Post-Installation Steps](#24-post-installation-steps)

3. [Docker Images](#3-docker-images)
   - 3.1 [What is a Docker Image?](#31-what-is-a-docker-image)
   - 3.2 [Pulling Images](#32-pulling-images)
   - 3.3 [Listing Images](#33-listing-images)
   - 3.4 [Removing Images](#34-removing-images)
   - 3.5 [Image Tags](#35-image-tags)
   - 3.6 [Docker Hub](#36-docker-hub)

4. [Docker Containers](#4-docker-containers)
   - 4.1 [What is a Container?](#41-what-is-a-container)
   - 4.2 [Running Containers](#42-running-containers)
   - 4.3 [Container Lifecycle](#43-container-lifecycle)
   - 4.4 [Managing Containers](#44-managing-containers)
   - 4.5 [Container Logs](#45-container-logs)
   - 4.6 [Executing Commands in Containers](#46-executing-commands-in-containers)
   - 4.7 [Container Resource Limits](#47-container-resource-limits)

5. [Dockerfile - Building Custom Images](#5-dockerfile---building-custom-images)
   - 5.1 [What is a Dockerfile?](#51-what-is-a-dockerfile)
   - 5.2 [Dockerfile Instructions](#52-dockerfile-instructions)
   - 5.3 [Building Images](#53-building-images)
   - 5.4 [Best Practices](#54-best-practices)
   - 5.5 [Multi-Stage Builds](#55-multi-stage-builds)
   - 5.6 [.dockerignore File](#56-dockerignore-file)

6. [Docker Volumes - Data Persistence](#6-docker-volumes---data-persistence)
   - 6.1 [Why Volumes?](#61-why-volumes)
   - 6.2 [Types of Volumes](#62-types-of-volumes)
   - 6.3 [Creating and Managing Volumes](#63-creating-and-managing-volumes)
   - 6.4 [Bind Mounts](#64-bind-mounts)
   - 6.5 [Volume Best Practices](#65-volume-best-practices)

7. [Docker Networking](#7-docker-networking)
   - 7.1 [Network Types](#71-network-types)
   - 7.2 [Creating Networks](#72-creating-networks)
   - 7.3 [Connecting Containers](#73-connecting-containers)
   - 7.4 [Port Mapping](#74-port-mapping)
   - 7.5 [DNS in Docker](#75-dns-in-docker)

8. [Docker Compose](#8-docker-compose)
   - 8.1 [What is Docker Compose?](#81-what-is-docker-compose)
   - 8.2 [docker-compose.yml Structure](#82-docker-composeyml-structure)
   - 8.3 [Docker Compose Commands](#83-docker-compose-commands)
   - 8.4 [Environment Variables](#84-environment-variables)
   - 8.5 [Depends On & Health Checks](#85-depends-on--health-checks)
   - 8.6 [Real-World Examples](#86-real-world-examples)

9. [Docker Registry](#9-docker-registry)
   - 9.1 [What is a Registry?](#91-what-is-a-registry)
   - 9.2 [Pushing Images](#92-pushing-images)
   - 9.3 [Private Registries](#93-private-registries)

10. [Docker Security](#10-docker-security)
    - 10.1 [Security Best Practices](#101-security-best-practices)
    - 10.2 [Running as Non-Root](#102-running-as-non-root)
    - 10.3 [Scanning Images](#103-scanning-images)
    - 10.4 [Secrets Management](#104-secrets-management)

11. [Docker in Production](#11-docker-in-production)
    - 11.1 [Docker Swarm Basics](#111-docker-swarm-basics)
    - 11.2 [Kubernetes Overview](#112-kubernetes-overview)
    - 11.3 [CI/CD with Docker](#113-cicd-with-docker)
    - 11.4 [Logging & Monitoring](#114-logging--monitoring)

12. [Troubleshooting & Tips](#12-troubleshooting--tips)
    - 12.1 [Common Issues](#121-common-issues)
    - 12.2 [Useful Commands Cheatsheet](#122-useful-commands-cheatsheet)
    - 12.3 [Performance Tips](#123-performance-tips)

---

## 1. Introduction to Docker

### 1.1 What is Docker?

Docker is a **containerization platform** that allows you to package applications with all their dependencies into a standardized unit called a **container**.

**Simple Analogy:**
> Think of Docker like a shipping container. Just as shipping containers can hold any goods and be transported anywhere in the world, Docker containers can hold any application and run anywhere Docker is installed.

```
Traditional Way:           Docker Way:
+------------------+       +------------------+
| Your Application |       |   Container      |
+------------------+       | +-------------+  |
        |                  | | Application |  |
        v                  | | Dependencies|  |
+------------------+       | | Libraries   |  |
| Install Python   |       | | Config      |  |
| Install Node     |       | +-------------+  |
| Install Redis    |       +------------------+
| Configure...     |              |
+------------------+              v
        |                  Runs ANYWHERE!
        v
  Works on MY machine...
```

### 1.2 Why Use Docker?

| Problem | Docker Solution |
|---------|----------------|
| "Works on my machine" | Same container runs everywhere |
| Dependency conflicts | Each container has isolated dependencies |
| Slow setup for new developers | Just run `docker-compose up` |
| Inconsistent environments | Dev, Test, Prod all use same image |
| Resource heavy VMs | Containers are lightweight |

**Key Benefits:**
- **Consistency** - Same environment everywhere
- **Isolation** - Applications don't interfere with each other
- **Portability** - Run on any system with Docker
- **Scalability** - Easy to scale up/down
- **Version Control** - Track changes to your environment

### 1.3 Docker vs Virtual Machines

```
Virtual Machine:                    Docker Container:
+---------------------------+       +---------------------------+
|   App A   |   App B      |       |   App A   |   App B      |
+-----------+--------------+       +-----------+--------------+
|  Guest OS |  Guest OS    |       |  Container| Container    |
+-----------+--------------+       +-----------+--------------+
|      Hypervisor          |       |     Docker Engine        |
+---------------------------+       +---------------------------+
|      Host OS             |       |      Host OS             |
+---------------------------+       +---------------------------+
|      Hardware            |       |      Hardware            |
+---------------------------+       +---------------------------+

Size: GBs                           Size: MBs
Boot: Minutes                       Boot: Seconds
Performance: Slower                 Performance: Near Native
```

| Feature | Virtual Machine | Docker Container |
|---------|----------------|------------------|
| Size | Gigabytes | Megabytes |
| Startup | Minutes | Seconds |
| OS | Full OS per VM | Shares host OS |
| Isolation | Complete | Process-level |
| Performance | Overhead | Near-native |

### 1.4 Docker Architecture

```
+---------------------------------------------------+
|                  Docker Client                     |
|              (docker CLI commands)                 |
+---------------------------------------------------+
                        |
                        | REST API
                        v
+---------------------------------------------------+
|                  Docker Daemon                     |
|                   (dockerd)                        |
|  +-------------+  +----------+  +--------------+  |
|  |   Images    |  |Containers|  |   Networks   |  |
|  +-------------+  +----------+  +--------------+  |
|  +-------------+  +----------+                    |
|  |   Volumes   |  | Plugins  |                    |
|  +-------------+  +----------+                    |
+---------------------------------------------------+
                        |
                        v
+---------------------------------------------------+
|                Docker Registry                     |
|            (Docker Hub, Private)                   |
+---------------------------------------------------+
```

**Components:**
- **Docker Client** - CLI tool you use (`docker` commands)
- **Docker Daemon** - Background service managing everything
- **Docker Registry** - Storage for Docker images (Docker Hub)

### 1.5 Key Terminology

| Term | Definition |
|------|------------|
| **Image** | Read-only template with instructions to create a container |
| **Container** | Running instance of an image |
| **Dockerfile** | Text file with instructions to build an image |
| **Docker Hub** | Public registry for Docker images |
| **Volume** | Persistent data storage for containers |
| **Network** | Communication layer between containers |
| **Docker Compose** | Tool to define multi-container applications |

---

