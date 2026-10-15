import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type HealthStatus = 'UP' | 'DOWN';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check — PostgreSQL' })
  async health() {
    let postgres = false;

    try {
      await this.db.query('SELECT 1');
      postgres = true;
    } catch {}

    const status: HealthStatus = postgres ? 'UP' : 'DOWN';
    return { status, postgres };
  }
}
