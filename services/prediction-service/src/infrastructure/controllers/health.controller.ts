import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

type HealthStatus = 'UP' | 'DOWN';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly mongo: Connection) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check — MongoDB' })
  health() {
    const mongodb = this.mongo.readyState === 1;
    const status: HealthStatus = mongodb ? 'UP' : 'DOWN';
    return { status, mongodb };
  }
}
