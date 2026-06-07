import { Injectable } from '@nestjs/common';
import { ITokenCache } from '../../application/ports/output/i-token.cache';
import { RedisClient } from './redis.client';

@Injectable()
export class RedisAdapter implements ITokenCache {
  constructor(private readonly redis: RedisClient) {}

  async setRefreshToken(userId: string, token: string, ttl: number): Promise<void> {
    await this.redis.instance.set(`auth:refresh:${userId}`, token, 'EX', ttl);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.instance.get(`auth:refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.redis.instance.del(`auth:refresh:${userId}`);
  }

  async setResetToken(hash: string, userId: string, ttl: number): Promise<void> {
    await this.redis.instance.set(`auth:pwreset:${hash}`, userId, 'EX', ttl);
  }

  async getResetToken(hash: string): Promise<string | null> {
    return this.redis.instance.get(`auth:pwreset:${hash}`);
  }

  async deleteResetToken(hash: string): Promise<void> {
    await this.redis.instance.del(`auth:pwreset:${hash}`);
  }

  async incrementLoginAttempts(ip: string, ttl: number): Promise<number> {
    const key = `auth:ratelimit:login:${ip}`;
    const count = await this.redis.instance.incr(key);
    if (count === 1) await this.redis.instance.expire(key, ttl);
    return count;
  }

  async deleteLoginAttempts(ip: string): Promise<void> {
    await this.redis.instance.del(`auth:ratelimit:login:${ip}`);
  }
}
