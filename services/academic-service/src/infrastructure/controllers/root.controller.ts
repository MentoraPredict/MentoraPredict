import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint for academic service' })
  root() {
    return {
      service: 'academic-service',
      status: 'UP',
      health: '/health',
      docs: '/api/docs',
    };
  }
}
