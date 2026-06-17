# MentoraPredict Web - Auth Flow

This document explains the authentication flow for `apps/web` and how session, tokens, protected routes, and role-based redirects are expected to work in the frontend architecture.

## Scope

This document covers the frontend auth pipeline:

```txt
Login
  -> AuthService
  -> Axios
  -> Kong
  -> Auth Service
  -> Auth Store
  -> Protected Route
  -> Role Redirect
```

It also answers:

- where tokens are stored
- who owns the session
- what happens when the session expires
- how logout works

## Current Backend Context

MentoraPredict uses microservices and exposes auth through the gateway.

Relevant backend flow:

- frontend sends login credentials to Kong
- Kong routes the request to `auth-service`
- `auth-service` validates credentials
- `auth-service` returns `accessToken` and `refreshToken`
- frontend stores session data and routes the user according to their role

The auth API is not the source of truth for frontend state. The frontend store is.

## End-To-End Flow

### 1. Login

The user enters email and password in the login form.

The form does not talk directly to the backend. It calls the auth service layer.

### 2. AuthService

`AuthService` is the feature-level interface for authentication behavior.

It is responsible for:

- sending the login request
- sending logout or refresh requests
- normalizing auth-related API responses
- coordinating token persistence through the auth store or internal storage helper

It should not contain UI code.

### 3. Axios

Axios is the HTTP client used by the frontend.

It is responsible for:

- using a centralized base URL
- attaching the `Authorization: Bearer <token>` header when a token exists
- sending requests to the gateway
- receiving backend responses and errors

Axios should not decide whether a user is authenticated. It only transports requests.

### 4. Kong

Kong is the API gateway.

It receives the request from the frontend and forwards it to the correct backend service.

For auth:

```txt
Frontend -> Kong -> auth-service
```

This means the frontend only needs to know the gateway endpoint, not the internal service topology.

### 5. Auth Service

The `auth-service` validates the credentials and returns the tokens.

Typical login response:

```txt
accessToken
refreshToken
expiresIn
tokenType
```

The frontend should treat this response as the start of the session, not the full user profile.

### 6. Auth Store

The auth store is the source of truth for session state in the frontend.

It should store:

- access token
- refresh token
- authenticated user
- role
- auth status
- session lifecycle actions

The auth store is also the right place to coordinate:

- session hydration
- logout
- refresh recovery
- role-based session state

### 7. Protected Route

Protected routes check whether the user has an active authenticated session.

If not authenticated, the user should be redirected to the login page.

This check should rely on the auth store, not on scattered local checks across components.

### 8. Role Redirect

After login, the user should not always go to `/`.

The redirect should depend on the user role:

```txt
STUDENT -> /student/dashboard
TEACHER -> /teacher/dashboard
ADMIN   -> /admin/dashboard
```

The role redirect should use the user stored in the auth state, not the raw JWT.

## Where Tokens Are Stored

Tokens should be persisted in one controlled place.

Recommended model:

```txt
Auth Store
  -> token persistence helper
```

Practical meaning:

- the auth store owns session state
- token persistence is an internal implementation detail
- components must not read or write tokens directly

### Important rule

Do not let multiple parts of the app manage tokens independently.

Avoid this:

- component writes token
- service writes token
- store also writes token

Use a single session owner.

## Who Manages The Session

The session is managed by the auth store.

That means the auth store is responsible for:

- knowing whether the user is logged in
- storing the current user
- storing the user role
- clearing state on logout
- recovering state on app reload
- handling refresh-token-based recovery

The store is the frontend source of truth.

## What Happens When A Token Expires

Access tokens are short-lived.

When the access token expires:

1. Axios receives a `401` from the backend.
2. The frontend checks whether a refresh token exists.
3. If refresh is supported, the frontend requests a new access token.
4. If refresh succeeds, the original request can be retried.
5. If refresh fails, the user is logged out and sent to login.

### Recommended behavior

- access token expiry should not immediately destroy the session if refresh is still valid
- refresh failure should clear auth state
- expired or invalid tokens should not leave the app in a half-authenticated state

## How Logout Works

Logout must clear the frontend session and invalidate the backend session state if the backend uses refresh token storage.

Expected logout flow:

```txt
User clicks logout
  -> AuthService sends logout request
  -> backend invalidates refresh token
  -> auth store clears user + tokens
  -> router redirects to login
```

### What logout should do on the frontend

- remove access token
- remove refresh token
- clear user data
- clear role data
- reset auth state
- redirect to a public route

### What logout should do on the backend

- invalidate the stored refresh token
- reject further refresh attempts for that session

## Auth Store Responsibilities

The auth store should expose actions such as:

- `login`
- `logout`
- `hydrateSession`
- `setUser`
- `setTokens`
- `clearSession`
- `recoverSession`

It should not expose low-level token storage mechanics to UI components.

## Protected Routes And Role Redirect

These are separate concerns.

### Protected Route

Purpose:

- block unauthenticated access

### Role Redirect

Purpose:

- send authenticated users to the right dashboard or area

They work together, but they are not the same thing.

## Recommended Auth Lifecycle

```txt
1. User opens login page
2. User submits credentials
3. AuthService posts to gateway
4. Kong forwards to auth-service
5. auth-service returns tokens
6. Auth Store persists session
7. Users service fetches /users/me
8. Auth Store stores user and role
9. Role Redirect sends the user to the correct dashboard
10. Protected Route guards private pages
```

## Recommended Frontend Rules

- UI components must never call backend endpoints directly.
- Pages should not own token persistence.
- Services should not own global session UI state.
- The auth store should be the central session owner.
- `/users/me` should be used to obtain user identity and role.
- JWT should be treated as authentication material, not as the user profile.

## Summary

MentoraPredict auth should be understood as a controlled pipeline:

```txt
Login
  -> AuthService
  -> Axios
  -> Kong
  -> Auth Service
  -> Auth Store
  -> Protected Route
  -> Role Redirect
```

The frontend should keep session logic centralized, token handling invisible to components, and role navigation driven by the authenticated user object.
