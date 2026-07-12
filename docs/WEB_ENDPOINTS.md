# Web Endpoint Management

The web client accesses backend services through the API gateway. Components and pages must never define URLs or call Axios directly.

## Request flow

```text
Page or feature hook -> domain service -> shared Axios client -> API gateway
```

- Define every path in `apps/web/src/services/api/endpoints.ts`.
- Group paths by backend domain: `auth`, `users`, `academic`, `analytics`, `prediction`, and `notifications`.
- Put request functions and DTO mapping in `apps/web/src/services`.
- Use TanStack Query hooks for server state, caching, and mutations.
- Use query keys from `services/query/queryKeys.ts` and invalidate affected keys after mutations.

## Base URL and authentication

`services/api.ts` creates the shared Axios client. `VITE_API_BASE_URL` defaults to `/api`; endpoint paths therefore start with `/v1`, producing gateway URLs such as `/api/v1/auth/login`.

The request interceptor adds the access token. A `401` triggers one shared refresh attempt, queues concurrent requests, and retries them after token renewal. File uploads use `FormData`; the browser supplies the multipart boundary.

## Adding an endpoint

1. Add its path or parameterized path builder to `endpoints.ts`.
2. Add typed request and response models under `src/types` or beside the service when local.
3. Implement the request and backend-to-UI mapping in the appropriate service.
4. Expose it through a feature hook or TanStack Query function.
5. Handle loading, empty, and error states in the consuming domain component.

The backend OpenAPI specifications remain the source of truth for payloads and status codes.
