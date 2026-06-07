import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisClient } from '../cache/redis.client';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly redis: RedisClient,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Service health check — DB + Redis' })
  async health() {
    const dbOk = this.db.isInitialized;
    let redisOk = false;
    try {
      await this.redis.instance.ping();
      redisOk = true;
    } catch {}

    return {
      status: dbOk && redisOk ? 'UP' : 'DEGRADED',
      services: {
        database: dbOk    ? 'UP' : 'DOWN',
        redis:    redisOk ? 'UP' : 'DOWN',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
