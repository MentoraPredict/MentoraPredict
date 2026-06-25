import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetAlertsUseCase } from '../../application/use-cases/get-alerts.use-case';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly getAlertsUC: GetAlertsUseCase) {}

  @Get(':studentId')
  @ApiOperation({ summary: 'RF-021: Poll student alerts' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  getAlerts(
    @Param('studentId') studentId: string,
    @Query('unread') unread?: string,
  ) {
    const unreadOnly = unread === 'true';
    return this.getAlertsUC.execute(studentId, unreadOnly);
  }
}
