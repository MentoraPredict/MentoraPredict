import { UnauthorizedException, Inject, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from '../ports/output/i-user.repository';
import { IPasswordHasher } from '../ports/output/i-password.hasher';
import { ITokenGenerator } from '../ports/output/i-token.generator';
import { ITokenCache } from '../ports/output/i-token.cache';
import { LoginDto } from '../dtos';
import { ILoginUseCase } from '../ports/input/i-auth.use-cases';
import { REDIS_TTL } from '../../shared-types-local';

export class LoginUserUseCase implements ILoginUseCase {
  constructor(
    @Inject('IUserRepository')  private readonly userRepo: IUserRepository,
    @Inject('IPasswordHasher')  private readonly hasher: IPasswordHasher,
    @Inject('ITokenGenerator')  private readonly tokenGen: ITokenGenerator,
    @Inject('ITokenCache')      private readonly cache: ITokenCache,
  ) {}

  async execute(dto: LoginDto, ip: string) {
    // Check rate limit BEFORE touching the DB (RNF-006)
    const attempts = await this.cache.incrementLoginAttempts(ip, REDIS_TTL.RATE_LIMIT_LOGIN);
    if (attempts > 10) throw new ForbiddenException('Too many login attempts. Try again in 15 minutes.');

    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) {
      // Still counts as a failed attempt — already incremented above
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const valid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login — reset the rate limit counter for this IP
    await this.cache.deleteLoginAttempts(ip);

    const tokens = this.tokenGen.generatePair(user.id, user.email, user.role);

    // Store refresh token in Redis (TTL 7 days)
    await this.cache.setRefreshToken(user.id, tokens.refreshToken, REDIS_TTL.REFRESH_TOKEN);

    return { ...tokens, tokenType: 'Bearer' };
  }
}
