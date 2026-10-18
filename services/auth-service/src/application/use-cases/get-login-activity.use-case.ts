import { Inject, Injectable } from '@nestjs/common';
import { ILoginEventRepository } from '../ports/output/i-login-event.repository';

const WINDOW_DAYS = 30;

export interface LoginActivity {
  lastLoginAt: string | null;
  loginCountLast30Days: number;
}

@Injectable()
export class GetLoginActivityUseCase {
  constructor(
    @Inject('ILoginEventRepository') private readonly loginEvents: ILoginEventRepository,
  ) {}

  async execute(userId: string, now: Date = new Date()): Promise<LoginActivity> {
    const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const { lastLoginAt, count } = await this.loginEvents.summarize(userId, since);

    return {
      lastLoginAt: lastLoginAt ? lastLoginAt.toISOString() : null,
      loginCountLast30Days: count,
    };
  }
}