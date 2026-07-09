export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  MICROSOFT = "MICROSOFT",
}

export const UserProfileStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserProfileStatus =
  (typeof UserProfileStatus)[keyof typeof UserProfileStatus];

export class UserProfileEntity {
  constructor(
    public readonly id: string,
    /** @deprecated Freeform string that predates real file storage. `avatarUrl` (Fase 10)
     * is the source of truth going forward — kept as-is, no data migration in this phase. */
    public photo: string | null,
    public bio: string | null,
    public cedula: string | null,
    public authProvider: AuthProvider,
    public role: string,
    public status: UserProfileStatus,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    // Server-managed upload (Fase 10) — distinct from the freeform `photo`
    // string field, which predates real file storage and stays untouched.
    public avatarUrl: string | null = null,
  ) {}

  update(
    data: Partial<
      Pick<
        UserProfileEntity,
        "photo" | "bio" | "cedula" | "authProvider" | "role" | "status"
      >
    >,
  ): void {
    if (data.photo !== undefined) this.photo = data.photo;
    if (data.bio !== undefined) this.bio = data.bio;
    if (data.cedula !== undefined) this.cedula = data.cedula;
    if (data.authProvider !== undefined) this.authProvider = data.authProvider;
    if (data.role !== undefined) this.role = data.role;
    if (data.status !== undefined) this.status = data.status;
    this.updatedAt = new Date();
  }

  setAvatar(url: string): void {
    this.avatarUrl = url;
    this.updatedAt = new Date();
  }

  clearAvatar(): void {
    this.avatarUrl = null;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.status = "INACTIVE";
    this.updatedAt = new Date();
  }
}
