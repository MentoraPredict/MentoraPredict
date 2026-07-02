import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetRiskSnapshotUseCase } from '../../application/use-cases/get-risk-snapshot.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('analytics-internal')
@Controller('api/v1/analytics/internal')
@UseGuards(InternalServiceGuard)
export class InternalAnalyticsController {
  constructor(private readonly getRiskSnapshotUC: GetRiskSnapshotUseCase) {}

  @Get('risk-snapshot/:studentId/:periodId')
  @ApiOperation({ summary: 'Internal: deterministic risk snapshot consumed by prediction-service' })
  riskSnapshot(
    @Param('studentId') studentId: string,
    @Param('periodId') periodId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.getRiskSnapshotUC.execute(studentId, periodId, correlationId);
  }
}
