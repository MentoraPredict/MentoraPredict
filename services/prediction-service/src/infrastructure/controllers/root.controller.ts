import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint for prediction service' })
  root() {
    return {
      service: 'prediction-service',
      status: 'UP',
      health: '/health',
      docs: '/api/v1/prediction/docs',
    };
  }
}
