import { Inject, UnauthorizedException } from '@nestjs/common';
import { ITokenCache } from '../ports/output/i-token.cache';
import { ILogoutUseCase } from '../ports/input/i-auth.use-cases';

export class LogoutUserUseCase implements ILogoutUseCase {
  constructor(
    @Inject('ITokenCache') private readonly cache: ITokenCache,
  ) {}

  async execute(userId: string, refreshToken: string): Promise<void> {
    // Validate the stored token matches before deleting (prevents CSRF-style token invalidation)
    const stored = await this.cache.getRefreshToken(userId);
    if (stored && stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token does not match');
    }
    await this.cache.deleteRefreshToken(userId);
  }
}
