import { Body, Controller, Get, Headers, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CalculateAverageUseCase } from '../../application/use-cases/calculate-average.use-case';
import { CalculateTrendUseCase } from '../../application/use-cases/calculate-trend.use-case';
import { CalculateComplianceUseCase } from '../../application/use-cases/calculate-compliance.use-case';
import { ClassifyRiskUseCase } from '../../application/use-cases/classify-risk.use-case';
import { GenerateAlertsUseCase } from '../../application/use-cases/generate-alerts.use-case';
import { GetStudentDashboardUseCase } from '../../application/use-cases/get-student-dashboard.use-case';
import { GetTeacherDashboardUseCase } from '../../application/use-cases/get-teacher-dashboard.use-case';
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case';
import { ComplianceInputDto } from '../../application/dtos/compliance-input.dto';
import { RiskInputDto } from '../../application/dtos/risk-input.dto';
import { GenerateAlertsDto } from '../../application/dtos/generate-alerts.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('analytics-service')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(
    private readonly calculateAverageUC: CalculateAverageUseCase,
    private readonly calculateTrendUC: CalculateTrendUseCase,
    private readonly calculateComplianceUC: CalculateComplianceUseCase,
    private readonly classifyRiskUC: ClassifyRiskUseCase,
    private readonly generateAlertsUC: GenerateAlertsUseCase,
    private readonly getStudentDashboardUC: GetStudentDashboardUseCase,
    private readonly getTeacherDashboardUC: GetTeacherDashboardUseCase,
    private readonly getAdminDashboardUC: GetAdminDashboardUseCase,
  ) {}

  // ─── Métricas ──────────────────────────────────────────────────────────────

  @Post('average/:studentId/:periodId')
  @ApiOperation({ summary: 'RF-015: Calculate weighted average' })
  average(
    @Param('studentId') studentId: string,
    @Param('periodId') periodId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.calculateAverageUC.execute(studentId, periodId, correlationId);
  }

  @Post('trend/:studentId')
  @ApiOperation({ summary: 'RF-016: Calculate performance trend' })
  @ApiQuery({ name: 'periodIds', description: 'Comma-separated period UUIDs (min 3)' })
  trend(@Param('studentId') studentId: string, @Query('periodIds') periodIds: string) {
    const ids = periodIds.split(',').map((id) => id.trim()).filter(Boolean);
    return this.calculateTrendUC.execute(studentId, ids);
  }

  @Post('compliance/:studentId')
  @ApiOperation({ summary: 'RF-017: Calculate compliance index' })
  compliance(@Param('studentId') studentId: string, @Body() dto: ComplianceInputDto) {
    return this.calculateComplianceUC.execute(studentId, dto);
  }

  @Post('risk')
  @ApiOperation({ summary: 'RF-018: Classify student risk' })
  risk(@Body() dto: RiskInputDto) {
    return this.classifyRiskUC.execute(dto);
  }

  @Post('alerts/:studentId')
  @ApiOperation({ summary: 'RF-021: Generate alerts for student' })
  generateAlerts(@Param('studentId') studentId: string, @Body() dto: GenerateAlertsDto) {
    return this.generateAlertsUC.execute(studentId, dto);
  }

  // ─── Dashboards ────────────────────────────────────────────────────────────

  @Get('dashboard/student/:studentId')
  @ApiOperation({ summary: 'RF-023: Student dashboard' })
  studentDashboard(
    @Param('studentId') studentId: string,
    @Query('periodId') periodId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.getStudentDashboardUC.execute(studentId, periodId, correlationId);
  }

  @Get('dashboard/teacher/:teacherId')
  @ApiOperation({ summary: 'RF-024: Teacher dashboard' })
  teacherDashboard(
    @Param('teacherId') teacherId: string,
    @Query('periodId') periodId: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.getTeacherDashboardUC.execute(teacherId, periodId, correlationId);
  }

  @Get('dashboard/admin')
  @ApiOperation({ summary: 'RF-025: Admin dashboard' })
  adminDashboard(@Query('periodId') periodId: string) {
    return this.getAdminDashboardUC.execute(periodId);
  }
}
