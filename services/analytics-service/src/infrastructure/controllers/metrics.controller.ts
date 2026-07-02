import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetAggregatedMetricsUseCase } from '../../application/use-cases/get-aggregated-metrics.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('analytics-metrics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics/metrics')
export class MetricsController {
  constructor(private readonly getAggregatedMetricsUC: GetAggregatedMetricsUseCase) {}

  @Get('overview')
  @ApiOperation({ summary: 'Institution-wide aggregated academic metrics' })
  @ApiQuery({ name: 'periodId', required: false })
  overview(@Query('periodId') periodId?: string) {
    return this.getAggregatedMetricsUC.overview(periodId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Latest or period-specific metrics for a user' })
  @ApiQuery({ name: 'periodId', required: false })
  user(@Param('userId') userId: string, @Query('periodId') periodId?: string) {
    return this.getAggregatedMetricsUC.user(userId, periodId);
  }

  @Get('subjects/:subjectId')
  @ApiOperation({ summary: 'Aggregated metrics for a subject' })
  @ApiQuery({ name: 'periodId', required: false })
  subject(@Param('subjectId') subjectId: string, @Query('periodId') periodId?: string) {
    return this.getAggregatedMetricsUC.subject(subjectId, periodId);
  }
}
