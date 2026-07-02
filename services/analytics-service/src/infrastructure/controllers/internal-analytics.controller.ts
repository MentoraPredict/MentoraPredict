import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetRiskSnapshotUseCase } from '../../application/use-cases/get-risk-snapshot.use-case';
import { RecalculateStudentMetricsUseCase } from '../../application/use-cases/recalculate-student-metrics.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('analytics-internal')
@Controller('api/v1/analytics/internal')
@UseGuards(InternalServiceGuard)
export class InternalAnalyticsController {
  constructor(
    private readonly getRiskSnapshotUC: GetRiskSnapshotUseCase,
    private readonly recalculateUC: RecalculateStudentMetricsUseCase,
  ) {}

  @Get('risk-snapshot/:studentId/:periodId')
  @ApiOperation({ summary: 'Internal: deterministic risk snapshot consumed by prediction-service' })
  riskSnapshot(
    @Param('studentId') studentId: string,
    @Param('periodId') periodId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.getRiskSnapshotUC.execute(studentId, periodId, correlationId);
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Internal: trigger weighted metric recalculation for students after grade import' })
  recalculate(
    @Body() body: { subjectId: string; periodId: string; studentIds: string[] },
  ) {
    return this.recalculateUC.execute(body.periodId, body.studentIds);
  }
}
