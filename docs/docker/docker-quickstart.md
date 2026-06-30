# Docker Quick Start

This document provides a quick reference for building and running MentoraPredict Docker images.

## Prerequisites

Before working with Docker containers, ensure the following software is installed:

- Docker
- Docker Compose
- Git

---

## Building Docker Images

All images must be built from the repository root.

### Auth Service

```bash
docker build \
  -f services/auth-service/Dockerfile \
  -t mentorapredict/auth-service .
```

### User Service

```bash
docker build \
  -f services/user-service/Dockerfile \
  -t mentorapredict/user-service .
```

### Academic Service

```bash
docker build \
  -f services/academic-service/Dockerfile \
  -t mentorapredict/academic-service .
```

### Recommendation Service

```bash
docker build \
  -f services/recommendation-service/Dockerfile \
  -t mentorapredict/recommendation-service .
```

### Analytics Service

```bash
docker build \
  -f services/analytics-service/Dockerfile \
  -t mentorapredict/analytics-service .
```

### Prediction Service

```bash
docker build \
  -f services/prediction-service/Dockerfile \
  -t mentorapredict/prediction-service .
```

---

## Running Containers

Example:

```bash
docker run \
  -p 3001:3001 \
  --env-file .env \
  mentorapredict/auth-service
```

---

## Health Verification

Verify that the container is running:

```bash
docker ps
```

View container logs:

```bash
docker logs <container-id>
```

Inspect container details:

```bash
docker inspect <container-id>
```

---

## Notes

Docker images must always be built from the repository root because Dockerfiles depend on monorepo-level resources such as:

- turbo.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- Shared packages
- Workspace configurations

Building directly from individual service folders is not supported.
