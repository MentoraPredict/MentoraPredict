# Use Case Specification — auth-service

Formal, IEEE-style use case document for the application-layer use cases implemented in
`auth-service`. auth-service owns identity and credential management: registration, login,
session/token lifecycle, password recovery, OAuth login, and the authoritative role/status
record consumed by every other microservice.

**Actors**
- **Unauthenticated Visitor** — a person who does not yet hold a valid session.
- **Authenticated User** — any logged-in user (STUDENT, TEACHER, or ADMIN), acting on their
  own credential record.
- **Admin** — a user with the ADMIN role, managing other users' credential records.
- **Internal Service** — another microservice (user-service, academic-service, etc.) calling
  auth-service over the internal HTTP channel with a `scope: "service:internal"` JWT.

Total use cases in this service: **12**.

--------------------------------------------------------------------

## UC-AUTH-01: User Registration

**Actor(s):** Unauthenticated Visitor

**Trigger:** The visitor submits the registration form on the public site.

**Preconditions:**
- The visitor does not already hold a valid session.
- The submitted email address is not already registered in the system.

**Main Flow:**
1. The actor submits email, password, and full name via `POST /auth/register`.
2. auth-service validates the payload (email format, password strength) through DTO
   validation (`class-validator`).
3. The system verifies the email is not already taken.
4. The system hashes the password with bcrypt (cost factor 12) and creates a new
   `UserEntity` record in PostgreSQL with `role` defaulted to `STUDENT`, `isActive = true`,
   and `authProvider = LOCAL`.
5. auth-service calls user-service internally (`UserProfileHttpClient`) to provision a
   matching `user_profiles` row for the new account.
6. The system returns a success response confirming the account was created.

**Alternate Flows / Exceptions:**
- **A1 — Email already registered:** at step 3 the system rejects the request with a
  validation error; no `UserEntity` is created and no call is made to user-service.
- **A2 — Downstream profile provisioning fails:** if the call to user-service fails, the
  credential record still exists in auth-service; the profile is expected to be
  reconciled/retried rather than rolling back the registration.

**Postconditions:** A new `UserEntity` exists with role `STUDENT`; a corresponding
`user_profiles` row exists in user-service; the visitor can now proceed to log in
(UC-AUTH-02).

**Related endpoint:** `POST /auth/register`.

--------------------------------------------------------------------

## UC-AUTH-02: User Login (Credential-Based)

**Actor(s):** Unauthenticated Visitor (becomes Authenticated User on success)

**Trigger:** The visitor submits email and password on the login form.

**Preconditions:** The visitor holds a registered, local (non-OAuth-only) account.

**Main Flow:**
1. The actor submits email and password via `POST /auth/login`.
2. auth-service looks up the `UserEntity` by email.
3. The system verifies the password against the stored bcrypt hash.
4. The system checks `isActive`; if the account is active, it issues a JWT access token
   (RS256) and a refresh token, storing the refresh token in Redis.
5. The response returns both tokens to the client, along with basic user identity claims
   embedded in the JWT.

**Alternate Flows / Exceptions:**
- **A1 — Invalid credentials:** email not found or password mismatch → generic
  authentication error, no token issued. Repeated failures are throttled per Redis-backed
  login-attempt rate limiting.
- **A2 — Disabled account:** the account exists and the password is correct, but
  `isActive = false` → the backend returns the `ACCOUNT_DISABLED` error code instead of a
  generic error; the frontend renders a dedicated `DisabledAccountDialog`.

**Postconditions:** On success, a refresh token is persisted in Redis and the client holds
a valid JWT access token; the frontend hydrates the session and fetches the full profile
(`GET /users/me`, handled by user-service).

**Related endpoint:** `POST /auth/login`.

--------------------------------------------------------------------

## UC-AUTH-03: User Logout

**Actor(s):** Authenticated User

**Trigger:** The user selects "log out" in the client application.

**Preconditions:** The user holds a valid session (access token and/or refresh token).

**Main Flow:**
1. The client calls the logout endpoint with the current refresh token.
2. auth-service invalidates the refresh token by removing it from Redis.
3. The system returns a success response.
4. The client discards its local copy of the access/refresh tokens and redirects to the
   login screen.

**Alternate Flows / Exceptions:**
- **A1 — Refresh token already invalid/expired:** the operation is treated as idempotent;
  the session is considered terminated regardless.

**Postconditions:** The refresh token no longer exists in Redis and can no longer be
exchanged for a new access token.

--------------------------------------------------------------------

## UC-AUTH-04: Access Token Refresh

**Actor(s):** Authenticated User (via client-side silent refresh), Internal Service (N/A —
this is client-facing only)

**Trigger:** The client's access token has expired or is close to expiring.

**Preconditions:** The client holds a still-valid, non-revoked refresh token stored in
Redis.

**Main Flow:**
1. The client calls the refresh endpoint, presenting the refresh token.
2. auth-service validates the refresh token against the Redis-stored value.
3. The system issues a new JWT access token (and, depending on rotation policy, a new
   refresh token) and returns it to the client.

**Alternate Flows / Exceptions:**
- **A1 — Refresh token invalid, expired, or not found in Redis:** the request is rejected;
  the client is forced back to UC-AUTH-02 (full login).

**Postconditions:** The client holds a renewed access token without requiring the user to
re-enter credentials.

--------------------------------------------------------------------

## UC-AUTH-05: Password Recovery Request

**Actor(s):** Unauthenticated Visitor

**Trigger:** The visitor selects "forgot password" and submits their email.

**Preconditions:** None strictly required — the flow does not reveal whether the email
exists, to avoid account enumeration.

**Main Flow:**
1. The actor submits their email via the forgot-password endpoint.
2. auth-service looks up the account; if found, it generates a time-limited password reset
   token.
3. The system sends a password reset email containing the token/link via `EmailAdapter`.
4. The system returns a generic success response regardless of whether the email was
   found, to avoid leaking account existence.

**Alternate Flows / Exceptions:**
- **A1 — Email not found:** no email is sent, but the response is identical to the success
  case (security-by-design, prevents enumeration).

**Postconditions:** If the account exists, a reset token has been generated and an email
has been dispatched.

--------------------------------------------------------------------

## UC-AUTH-06: Password Reset

**Actor(s):** Unauthenticated Visitor (holder of a valid reset token)

**Trigger:** The visitor follows the reset link from the recovery email and submits a new
password.

**Preconditions:** The actor holds a non-expired, unused password reset token issued by
UC-AUTH-05.

**Main Flow:**
1. The actor submits the reset token and a new password.
2. auth-service validates the token (existence, expiry, single use).
3. The system hashes the new password and updates the `UserEntity` record.
4. The system invalidates the reset token so it cannot be reused.
5. The system returns a success response; the actor can now log in with the new password.

**Alternate Flows / Exceptions:**
- **A1 — Token expired or already used:** the request is rejected with an error; the
  password is not changed.
- **A2 — New password fails policy validation:** rejected before any persistence occurs.

**Postconditions:** The account's password hash is updated; the reset token is consumed
and can no longer be reused; existing refresh tokens may optionally be invalidated as a
security measure.

--------------------------------------------------------------------

## UC-AUTH-07: OAuth Login via Microsoft

**Actor(s):** Unauthenticated Visitor (becomes Authenticated User on success)

**Trigger:** The visitor selects "Sign in with Microsoft".

**Preconditions:** The institution's Microsoft/Azure AD tenant is correctly configured
(`MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`).

**Main Flow:**
1. The actor is redirected to Microsoft's login page via `GET /auth/microsoft`.
2. The actor authenticates with their institutional Microsoft account.
3. Microsoft redirects back to `GET /auth/microsoft/callback` with an authorization code.
4. `MicrosoftOAuthClient` exchanges the code for the user's Azure AD identity claims.
5. auth-service looks up an existing `UserEntity` by email; if none exists, it creates one
   with `authProvider = MICROSOFT` and role defaulted to `STUDENT`, provisioning a
   user-service profile as in UC-AUTH-01.
6. The system issues a JWT access token and refresh token, identical in shape to
   UC-AUTH-02, and redirects the browser back to the frontend with the session established.

**Alternate Flows / Exceptions:**
- **A1 — Existing local account with the same email:** the system links or rejects the
  OAuth login depending on account-linking policy (implementation-defined uniqueness on
  email).
- **A2 — Disabled account:** same `ACCOUNT_DISABLED` handling as UC-AUTH-02.
- **A3 — Microsoft authentication fails or is cancelled:** the actor is redirected back to
  the login page with an error state, no session is created.

**Postconditions:** The actor holds a valid session; if this was their first OAuth login, a
new `UserEntity` and profile row now exist.

--------------------------------------------------------------------

## UC-AUTH-08: Retrieve Single User Credential Record

**Actor(s):** Internal Service, Admin

**Trigger:** Another microservice needs to resolve a user's credential/role data by ID
(e.g., user-service confirming a role during authorization), or an admin views a single
user's record.

**Preconditions:** The caller holds a valid internal-scope JWT (for Internal Service) or an
ADMIN-scope user JWT.

**Main Flow:**
1. The caller requests the record by user ID via the internal endpoint.
2. `InternalServiceGuard` (or `RolesGuard` for the admin-facing path) verifies the caller's
   authorization.
3. auth-service fetches the `UserEntity` from PostgreSQL.
4. The system returns the credential record (id, email, role, isActive, isVerified,
   authProvider, timestamps) — never the password hash.

**Alternate Flows / Exceptions:**
- **A1 — User not found:** a not-found response is returned.
- **A2 — Caller lacks the required scope/role:** the request is rejected before reaching
  the use case (guard-level rejection).

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-AUTH-09: Batch Retrieve User Credential Records by ID

**Actor(s):** Internal Service

**Trigger:** A calling service (e.g., academic-service listing enrolled students, or
user-service listing profiles) needs role/status data for a set of user IDs in a single
round trip, avoiding N individual calls.

**Preconditions:** The caller holds a valid internal-scope JWT.

**Main Flow:**
1. The caller submits a list of user IDs to the internal batch endpoint.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. auth-service queries PostgreSQL for all matching `UserEntity` rows in one query.
4. The system returns the collection of credential records, omitting any IDs that do not
   exist rather than erroring.

**Alternate Flows / Exceptions:**
- **A1 — Empty ID list:** the system returns an empty collection.
- **A1 — Some IDs not found:** those IDs are silently omitted from the response; the call
  does not fail as a whole.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-AUTH-10: Search User Credential Records

**Actor(s):** Admin

**Trigger:** The admin uses the user management search/filter UI (e.g., filtering by role
or searching by name/email).

**Preconditions:** The actor holds the ADMIN role.

**Main Flow:**
1. The admin submits search criteria (free-text query and/or role filter) via the search
   endpoint.
2. `RolesGuard` verifies the ADMIN role.
3. auth-service queries PostgreSQL with the given filters and returns a paginated list of
   matching credential records.

**Alternate Flows / Exceptions:**
- **A1 — No matches:** an empty result set is returned, not an error.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-AUTH-11: Update User Credential Record

**Actor(s):** Admin, Authenticated User (limited self-service fields), Internal Service
(role/status sync)

**Trigger:** An admin edits a user's role/status from the admin panel, or another service
requests a credential-level update (e.g., role change propagation).

**Preconditions:** The target `UserEntity` exists. The caller is authorized to modify the
requested fields (an ADMIN may change role/isActive; a self-service caller may only change
fields such as password; an Internal Service call must carry the internal scope).

**Main Flow:**
1. The caller submits the updated fields (e.g., role, isActive) via the update endpoint.
2. The appropriate guard (`RolesGuard` or `InternalServiceGuard`) authorizes the request.
3. auth-service applies the changes to the `UserEntity` and persists them.
4. The system returns the updated credential record.

**Alternate Flows / Exceptions:**
- **A1 — Target user not found:** a not-found error is returned.
- **A2 — Caller not authorized for the requested field change:** the request is rejected.

**Postconditions:** The `UserEntity` reflects the new values; role/status changes are
authoritative here and are expected to be consumed by other services via UC-AUTH-08/09 or
UC-AUTH-12.

--------------------------------------------------------------------

## UC-AUTH-12: Synchronize User Credential Record from an External Service

**Actor(s):** Internal Service (typically user-service, via `AuthSyncClient`)

**Trigger:** A change made in another service's own aggregate (e.g., a profile-level status
change in user-service) needs to be reflected back into auth-service's authoritative
credential record, or vice versa, to keep the two in sync.

**Preconditions:** The caller holds a valid internal-scope JWT.

**Main Flow:**
1. The calling service sends the fields that must be synchronized (e.g., `isActive`,
   `role`) for a given user ID via the internal sync endpoint.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. auth-service updates the corresponding `UserEntity` fields to match.
4. The system returns a confirmation of the synchronized state.

**Alternate Flows / Exceptions:**
- **A1 — Target user not found:** the sync call fails and the caller is expected to handle
  the inconsistency (e.g., log and alert, since auth-service is the source of truth for
  identity).

**Postconditions:** The `UserEntity` record in auth-service reflects the state pushed by
the calling service, keeping the two independently-owned aggregates (credential vs.
profile) consistent.
