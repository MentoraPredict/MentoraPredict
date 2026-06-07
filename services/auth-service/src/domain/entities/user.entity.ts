// ── DOMAIN LAYER ── NO framework imports ──────────────────
// Pure TypeScript entity — zero NestJS / TypeORM decorators here

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN   = 'ADMIN',
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public isActive: boolean,
    public isVerified: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public firstName: string = '',
    public lastName: string  = '',
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  activate(): void   { this.isActive = true;  this.updatedAt = new Date(); }
  deactivate(): void { this.isActive = false; this.updatedAt = new Date(); }
  verify(): void     { this.isVerified = true; this.updatedAt = new Date(); }

  changeRole(newRole: UserRole): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean   { return this.role === UserRole.ADMIN; }
  isTeacher(): boolean { return this.role === UserRole.TEACHER; }
}
