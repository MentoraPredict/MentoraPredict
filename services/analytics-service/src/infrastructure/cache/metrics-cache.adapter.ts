import { Injectable } from '@nestjs/common';
import { IMetricsCachePort } from '../../domain/ports/i-metrics-cache.port';
import { RedisClient } from './redis.client';

@Injectable()
export class MetricsCacheAdapter implements IMetricsCachePort {
  constructor(private readonly redis: RedisClient) {}

  async get(key: string): Promise<string | null> {
    return this.redis.instance.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.instance.set(key, value, 'EX', ttlSeconds);
  }
}
