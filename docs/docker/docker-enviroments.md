# Docker Environment Configuration

This document describes environment variable management for MentoraPredict services.

## Environment Files

Environment-specific configuration is provided through dedicated files:

```text
.env.local
.env.qa
.env.prod
```

Each environment file should contain only the variables required for the target environment.

---

## Common Variables

Most backend services require the following configuration:

```env
NODE_ENV=

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

JWT_SECRET=

REDIS_HOST=
REDIS_PORT=
```

---

## Prediction Service Variables

The Prediction Service requires additional configuration:

```env
PYTHONUNBUFFERED=1

MONGO_HOST=
MONGO_PORT=
MONGO_DB=

REDIS_HOST=
REDIS_PORT=

OPENAI_API_KEY=
```

---

## Running Containers with Environment Files

Example:

```bash
docker run \
  --env-file .env.qa \
  mentorapredict/auth-service
```

Production example:

```bash
docker run \
  --env-file .env.prod \
  mentorapredict/auth-service
```

---

## Configuration Guidelines

* Use `.env.example` as the configuration template.
* Keep environment files outside version control.
* Store production secrets securely.
* Validate all required variables before deployment.

---

## Security Considerations

The following information must never be committed to source control:

* Database passwords
* JWT secrets
* API keys
* Cloud credentials
* Third-party access tokens

Production secrets should be managed through AWS Secrets Manager.
