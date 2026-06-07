import { UserRole } from '../../../domain/entities/user.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenGenerator {
  generatePair(userId: string, email: string, role: UserRole): TokenPair;
  verifyAccess(token: string): { sub: string; email: string; role: UserRole } | null;
  verifyRefresh(token: string): { sub: string } | null;
}
