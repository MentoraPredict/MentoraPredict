// ── DOMAIN LAYER ── NO framework imports ──────────────────
// Pure TypeScript entity — zero NestJS / TypeORM decorators here

import { Role, AuthProvider } from "@mentorapredict/shared-types";

export { AuthProvider };
export { Role as UserRole };

export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string | null,
    public role: Role,
    public isActive: boolean,
    public isVerified: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public firstName: string = "",
    public lastName: string = "",
    public authProvider: AuthProvider = AuthProvider.LOCAL,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
  verify(): void {
    this.isVerified = true;
    this.updatedAt = new Date();
  }

  changeRole(newRole: Role): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  changePassword(newHash: string): void {
    this.passwordHash = newHash;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
  isTeacher(): boolean {
    return this.role === Role.TEACHER;
  }
}
