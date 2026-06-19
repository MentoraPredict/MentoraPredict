# ADR 0002 — Auth Strategy: JWT RS256

Status: Proposed

Context
- Services need token-based authentication compatible across microservices and third-party integrations.

Decision
- Use JWT RS256 for access tokens. Private key stored in secrets manager; public key served via `/jwks` or provided as part of deployment.
- Short-lived access tokens (e.g., 15m) and long-lived refresh tokens stored in Redis with rotation.
- Use `kid` header to support key rotation.

Consequences
- Services must validate tokens using the public key and enforce `aud` and `iss` claims.
- Implement monitoring for token validation failures and rotate keys periodically.

Notes
- Consider adding OAuth2 introspection endpoint if integrating third-party identity providers.
