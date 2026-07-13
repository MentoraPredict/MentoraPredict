# Use Case Specification — user-service

Formal, IEEE-style use case document for the application-layer use cases implemented in
`user-service`. user-service owns the user profile aggregate — the extended, mutable
identity data (bio, avatar, cedula, status) that sits alongside the auth-service credential
record and is consumed by every other service that needs to display or authorize against a
user.

**Actors**
- **Authenticated User** — any logged-in user (STUDENT, TEACHER, or ADMIN) acting on their
  own profile.
- **Admin** — a user with the ADMIN role, managing other users' profiles.
- **Internal Service** — auth-service or another microservice calling user-service over the
  internal HTTP channel.

Total use cases in this service: **7**.

--------------------------------------------------------------------

## UC-USER-01: Create User Profile

**Actor(s):** Internal Service (auth-service, via `UserProfileHttpClient`)

**Trigger:** A new account has just been created in auth-service (UC-AUTH-01 or
UC-AUTH-07) and a matching profile row must be provisioned.

**Preconditions:** The caller holds a valid internal-scope JWT. No `UserProfileEntity`
already exists for the given user ID.

**Main Flow:**
1. auth-service calls the internal profile-creation endpoint immediately after persisting
   the new `UserEntity`, passing the user ID and any known identity fields.
2. `InternalServiceGuard` verifies the `service:internal` scope.
3. user-service creates a new `UserProfileEntity` with default values (empty bio,
   `status = ACTIVE`, `role` mirrored from the auth record, `avatarUrl` unset).
4. The system returns the created profile record.

**Alternate Flows / Exceptions:**
- **A1 — Profile already exists for this user ID:** the call is treated as idempotent (no
  duplicate row is created) or is rejected, depending on the uniqueness constraint on the
  user ID column.

**Postconditions:** A `UserProfileEntity` exists in PostgreSQL (`user_profiles`) for the
new user, ready to be enriched later via UC-USER-03.

**Related endpoint:** internal profile-creation route, called from auth-service.

--------------------------------------------------------------------

## UC-USER-02: Retrieve User Profile

**Actor(s):** Authenticated User (own profile), Admin/Teacher (another user's profile,
where role-appropriate), Internal Service (cross-service lookups)

**Trigger:** The frontend needs to display profile information — most commonly right after
login (`GET /users/me`), or when viewing another user's details.

**Preconditions:** The requested `UserProfileEntity` exists.

**Main Flow:**
1. The caller requests a profile by user ID (or `me` for the caller's own profile).
2. `RolesGuard`/ownership checks confirm the caller may view this profile.
3. user-service fetches the `UserProfileEntity` from PostgreSQL, including `avatarUrl`.
4. The system returns the profile data (photo, bio, cedula, status, role, avatarUrl,
   timestamps).

**Alternate Flows / Exceptions:**
- **A1 — Profile not found:** a not-found error is returned.
- **A2 — Caller not authorized to view this profile:** the request is rejected.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-USER-03: Update User Profile

**Actor(s):** Authenticated User (own profile fields), Admin (any user's profile,
including status)

**Trigger:** The user edits their profile information, or an admin edits another user's
profile from the admin panel.

**Preconditions:** The target `UserProfileEntity` exists. The caller is authorized to
modify the requested fields.

**Main Flow:**
1. The caller submits updated fields (bio, cedula, photo, and — for admins only — status)
   via the update endpoint.
2. `RolesGuard`/ownership checks authorize the request.
3. user-service applies the changes and persists the updated `UserProfileEntity`.
4. The system returns the updated profile.

**Alternate Flows / Exceptions:**
- **A1 — Target profile not found:** a not-found error is returned.
- **A2 — Non-admin attempts to modify another user's profile or a restricted field (e.g.,
  status, role):** the request is rejected.

**Postconditions:** The `UserProfileEntity` reflects the new values.

--------------------------------------------------------------------

## UC-USER-04: Deactivate (Soft-Delete) User

**Actor(s):** Admin

**Trigger:** The admin selects "deactivate" for a TEACHER or STUDENT in the user management
screen.

**Preconditions:** The target `UserProfileEntity` exists and is currently active. The actor
holds the ADMIN role.

**Main Flow:**
1. The admin requests deactivation of a target user via the soft-delete endpoint.
2. `RolesGuard` verifies the ADMIN role.
3. user-service calls academic-service internally (`AcademicStatusHttpClient`) to run
   `CheckUserDeactivationEligibilityUseCase`, checking for active academic dependencies
   (subjects owned, for a teacher; active enrollments, for a student).
4. If no blocking dependency exists, user-service sets `status = INACTIVE` and
   `deletedAt = now()` on the `UserProfileEntity` (soft delete — the row is retained for
   audit/history).
5. user-service calls auth-service (`AuthSyncClient`) to set `isActive = false` on the
   corresponding `UserEntity`, and calls analytics-service (`NotificationHttpClient`) to
   notify the affected user of the deactivation.
6. The system returns a success response.

**Alternate Flows / Exceptions:**
- **A1 — Blocking academic dependency found:** the eligibility check in step 3 fails; the
  system rejects the deactivation with a reason code; the frontend surfaces this via the
  `AdminUserRestrictionDialog` instead of a generic error. No fields are changed.
- **A2 — Target already inactive:** the operation is treated as a no-op/idempotent success.

**Postconditions:** On success, the user's profile is marked inactive and soft-deleted, the
auth-service record is deactivated in lockstep, and the user has been notified. On
rejection, no state changes.

--------------------------------------------------------------------

## UC-USER-05: List/Search User Profiles

**Actor(s):** Admin, Teacher (restricted view, e.g., own students)

**Trigger:** The admin opens the user management table, optionally filtering by role or
status; or a teacher views a roster derived from profile data.

**Preconditions:** The actor holds a role permitted to list users (ADMIN unrestricted;
TEACHER scoped).

**Main Flow:**
1. The caller requests the list endpoint with optional filters (role, status, free-text
   search) and pagination parameters.
2. `RolesGuard` authorizes the request and scopes it if the caller is a TEACHER.
3. user-service queries PostgreSQL for matching `UserProfileEntity` rows.
4. The system returns a paginated collection of profiles.

**Alternate Flows / Exceptions:**
- **A1 — No matches:** an empty result set, not an error.

**Postconditions:** None (read-only operation).

--------------------------------------------------------------------

## UC-USER-06: Upload Profile Avatar

**Actor(s):** Authenticated User (own avatar), Admin (on behalf of another user, where
supported)

**Trigger:** The user selects an image file to use as their profile picture.

**Preconditions:** The target `UserProfileEntity` exists. The uploaded file passes format
and size validation (`multer` handling).

**Main Flow:**
1. The actor uploads an image file via the avatar upload endpoint.
2. user-service validates the file (type/size).
3. The system stores the image in Supabase Storage (bucket `SUPABASE_STORAGE_BUCKET`), or
   falls back to local disk storage (`UPLOADS_DIR`) if Supabase is not configured.
4. user-service updates `avatarUrl` on the `UserProfileEntity` to point to the stored
   image, replacing any prior avatar.
5. The system returns the updated profile with the new `avatarUrl`.

**Alternate Flows / Exceptions:**
- **A1 — Invalid file type/size:** the upload is rejected before storage occurs.
- **A2 — Storage backend misconfigured (no Supabase credentials, no local fallback path):**
  the request fails at upload time, though the service itself remains healthy — the
  `SupabaseImageStorageAdapter` no longer crashes at boot when credentials are missing, but
  it does fail an actual upload attempt in that state.

**Postconditions:** The profile's `avatarUrl` points to the newly uploaded image; any
previous avatar file may be orphaned or cleaned up depending on retention policy.

--------------------------------------------------------------------

## UC-USER-07: Delete Profile Avatar

**Actor(s):** Authenticated User (own avatar), Admin (on behalf of another user, where
supported)

**Trigger:** The user removes their profile picture, reverting to a default/no avatar
state.

**Preconditions:** The target `UserProfileEntity` currently has a non-null `avatarUrl`.

**Main Flow:**
1. The actor requests avatar deletion via the delete-avatar endpoint.
2. user-service removes the stored image from Supabase Storage or local disk, as
   applicable.
3. The system clears `avatarUrl` on the `UserProfileEntity`.
4. The system returns the updated profile (with no avatar).

**Alternate Flows / Exceptions:**
- **A1 — No avatar currently set:** the operation is treated as a no-op/idempotent success.
- **A2 — Underlying file already missing from storage:** the database field is still
  cleared; the storage-level absence is not treated as a blocking error.

**Postconditions:** The profile no longer references an avatar image.
