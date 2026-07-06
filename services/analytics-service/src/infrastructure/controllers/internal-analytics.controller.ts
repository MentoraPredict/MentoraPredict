import { Controller, Get, Headers, Body, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetRiskSnapshotUseCase } from '../../application/use-cases/get-risk-snapshot.use-case';
import { RecalculateStudentMetricsUseCase } from '../../application/use-cases/recalculate-student-metrics.use-case';
import { GetLatestSubjectMetricUseCase } from '../../application/use-cases/get-latest-subject-metric.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('analytics-internal')
@Controller('api/v1/analytics/internal')
@UseGuards(InternalServiceGuard)
export class InternalAnalyticsController {
  constructor(
    private readonly getRiskSnapshotUC: GetRiskSnapshotUseCase,
    private readonly recalculateUC: RecalculateStudentMetricsUseCase,
    private readonly getLatestSubjectMetricUC: GetLatestSubjectMetricUseCase,
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
  @ApiOperation({ summary: 'Internal: weekly processing pipeline — recalculates per-subject metrics for students after a grade import or check-in save' })
  recalculate(
    @Body() body: { subjectId: string; periodId: string; studentIds: string[] },
  ) {
    return this.recalculateUC.execute(body.subjectId, body.periodId, body.studentIds);
  }

  @Get('students/:studentId/subjects/:subjectId/metrics/latest')
  @ApiOperation({ summary: 'Internal: latest per-subject metric for a student (consumed by academic-service and prediction-service)' })
  latestSubjectMetric(
    @Param('studentId') studentId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.getLatestSubjectMetricUC.execute(studentId, subjectId);
  }
}
