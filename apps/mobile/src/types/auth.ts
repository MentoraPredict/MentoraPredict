export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}
