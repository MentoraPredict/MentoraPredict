import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

type HealthStatus = 'UP' | 'DOWN';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private readonly mongo: Connection) {
    // MongoDB connects in the background (lazyConnection: true in
    // app.module.ts). Without a listener, an unhandled "error" event on this
    // EventEmitter crashes the whole process — this just logs it instead.
    this.mongo.on('error', (error: Error) => {
      this.logger.warn(`MongoDB connection error: ${error.message}`);
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check — MongoDB' })
  health() {
    const mongodb = this.mongo.readyState === 1;
    const status: HealthStatus = mongodb ? 'UP' : 'DOWN';
    return { status, mongodb };
  }
}
