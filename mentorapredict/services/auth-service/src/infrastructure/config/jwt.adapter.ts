import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenGenerator, TokenPair } from '../../application/ports/output/i-token.generator';
import { UserRole } from '../../domain/entities/user.entity';

@Injectable()
export class JwtAdapter implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  generatePair(userId: string, email: string, role: UserRole): TokenPair {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    // Refresh token is a longer-lived JWT (verified separately from access)
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  verifyAccess(token: string) {
    try {
      return this.jwtService.verify<{ sub: string; email: string; role: UserRole }>(token);
    } catch {
      return null;
    }
  }

  verifyRefresh(token: string): { sub: string } | null {
    try {
      const payload = this.jwtService.verify<{ sub: string; type: string }>(token);
      if (payload.type !== 'refresh') return null;
      return { sub: payload.sub };
    } catch {
      return null;
    }
  }
}
