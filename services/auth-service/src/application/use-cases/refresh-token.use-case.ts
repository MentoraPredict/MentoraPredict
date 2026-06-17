import { UnauthorizedException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../ports/output/i-user.repository';
import { ITokenGenerator } from '../ports/output/i-token.generator';
import { ITokenCache } from '../ports/output/i-token.cache';
import { RefreshDto } from '../dtos';
import { IRefreshUseCase } from '../ports/input/i-auth.use-cases';
import { REDIS_TTL } from '../../shared-types-local';

@Injectable()
export class RefreshTokenUseCase implements IRefreshUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ITokenGenerator') private readonly tokenGen: ITokenGenerator,
    @Inject('ITokenCache')     private readonly cache: ITokenCache,
  ) {}

  async execute(dto: RefreshDto) {
    // Verify the refresh token (7-day lifetime, 'type':'refresh' claim)
    const payload = this.tokenGen.verifyRefresh(dto.refreshToken);
    if (!payload) throw new UnauthorizedException('Invalid refresh token');

    const stored = await this.cache.getRefreshToken(payload.sub);
    if (!stored || stored !== dto.refreshToken) {
      throw new UnauthorizedException('Refresh token expired or already used');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException('User not found or disabled');

    const tokens = this.tokenGen.generatePair(user.id, user.email, user.role);
    await this.cache.setRefreshToken(user.id, tokens.refreshToken, REDIS_TTL.REFRESH_TOKEN);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn };
  }
}
