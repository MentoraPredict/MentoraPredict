import { UnauthorizedException, Inject, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../ports/output/i-user.repository';
import { IPasswordHasher } from '../ports/output/i-password.hasher';
import { ITokenGenerator } from '../ports/output/i-token.generator';
import { ITokenCache } from '../ports/output/i-token.cache';
import { ILoginEventRepository } from '../ports/output/i-login-event.repository';
import { LoginEventEntity } from '../../domain/entities/login-event.entity';
import { LoginDto } from '../dtos';
import { ILoginUseCase } from '../ports/input/i-auth.use-cases';
import { REDIS_TTL } from '../../shared-types-local';

@Injectable()
export class LoginUserUseCase implements ILoginUseCase {
  private readonly logger = new Logger(LoginUserUseCase.name);

  constructor(
    @Inject('IUserRepository')  private readonly userRepo: IUserRepository,
    @Inject('IPasswordHasher')  private readonly hasher: IPasswordHasher,
    @Inject('ITokenGenerator')  private readonly tokenGen: ITokenGenerator,
    @Inject('ITokenCache')      private readonly cache: ITokenCache,
    @Inject('ILoginEventRepository') private readonly loginEventRepo: ILoginEventRepository,
  ) {}

  async execute(dto: LoginDto, ip: string, userAgent?: string) {
    // Check rate limit BEFORE touching the DB (RNF-006)
    const attempts = await this.cache.incrementLoginAttempts(ip, REDIS_TTL.RATE_LIMIT_LOGIN);
    if (attempts > 10) throw new ForbiddenException('Too many login attempts. Try again in 15 minutes.');

    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) {
      // Still counts as a failed attempt — already incremented above
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_DISABLED',
        message: 'Tu cuenta ha sido desactivada. Comunícate con un administrador.',
      });
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account signs in with Microsoft. Use "Continue with Microsoft" instead.',
      );
    }

    const valid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login — reset the rate limit counter for this IP
    await this.cache.deleteLoginAttempts(ip);

    const tokens = this.tokenGen.generatePair(user.id, user.email, user.role);

    // Store refresh token in Redis (TTL 7 days)
    await this.cache.setRefreshToken(user.id, tokens.refreshToken, REDIS_TTL.REFRESH_TOKEN);

    // Fase E (docs/database/database-update-plan.md §5.5) — fire-and-forget,
    // un fallo acá nunca debe bloquear el login real.
    this.loginEventRepo
      .save(new LoginEventEntity(randomUUID(), user.id, new Date(), 'LOCAL', ip, userAgent ?? null))
      .catch((err) => this.logger.error(`Failed to record login event for ${user.id}`, err));

    return { ...tokens, tokenType: 'Bearer' };
  }
}
