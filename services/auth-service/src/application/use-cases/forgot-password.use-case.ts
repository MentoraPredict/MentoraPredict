import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../ports/output/i-user.repository';
import { ICachePort } from '../ports/output/i-cache.port';
import { IEmailPort } from '../ports/output/i-email.port';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

const RESET_TTL_SECONDS = 3600;

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ICachePort')      private readonly cache: ICachePort,
    @Inject('IEmailPort')      private readonly email: IEmailPort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ token?: string } | void> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) return;

    const token = randomUUID();
    await this.cache.setResetToken(token, user.id, RESET_TTL_SECONDS);
    await this.email.sendPasswordReset(user.email, token);

    if (process.env.NODE_ENV !== 'production') {
      return { token };
    }
  }
}
