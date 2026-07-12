import { Body, Controller, Get, Headers, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CalculateAverageUseCase } from '../../application/use-cases/calculate-average.use-case';
import { CalculateTrendUseCase } from '../../application/use-cases/calculate-trend.use-case';
import { CalculateComplianceUseCase } from '../../application/use-cases/calculate-compliance.use-case';
import { ClassifyRiskUseCase } from '../../application/use-cases/classify-risk.use-case';
import { GenerateAlertsUseCase } from '../../application/use-cases/generate-alerts.use-case';
import { GetStudentDashboardUseCase } from '../../application/use-cases/get-student-dashboard.use-case';
import { GetTeacherDashboardUseCase } from '../../application/use-cases/get-teacher-dashboard.use-case';
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case';
import { GetStudentSubjectMetricsUseCase } from '../../application/use-cases/get-student-subject-metrics.use-case';
import { GetSubjectMetricsSummaryUseCase } from '../../application/use-cases/get-subject-metrics-summary.use-case';
import { GetSubjectWeeklyProgressUseCase } from '../../application/use-cases/get-subject-weekly-progress.use-case';
import { GetSubjectRiskUseCase } from '../../application/use-cases/get-subject-risk.use-case';
import { GetAlertsUseCase } from '../../application/use-cases/get-alerts.use-case';
import { GetSubjectAlertsUseCase } from '../../application/use-cases/get-subject-alerts.use-case';
import { ComplianceInputDto } from '../../application/dtos/compliance-input.dto';
import { RiskInputDto } from '../../application/dtos/risk-input.dto';
import { GenerateAlertsDto } from '../../application/dtos/generate-alerts.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

@ApiTags("analytics-service")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/analytics")
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
    private readonly getStudentSubjectMetricsUC: GetStudentSubjectMetricsUseCase,
    private readonly getSubjectMetricsSummaryUC: GetSubjectMetricsSummaryUseCase,
    private readonly getSubjectWeeklyProgressUC: GetSubjectWeeklyProgressUseCase,
    private readonly getSubjectRiskUC: GetSubjectRiskUseCase,
    private readonly getAlertsUC: GetAlertsUseCase,
    private readonly getSubjectAlertsUC: GetSubjectAlertsUseCase,
  ) {}

  // ─── Per-subject metrics (Fase 6) ────────────────────────────────────────

  @Get('students/me/subjects/:subjectId/metrics')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Weekly metric history for the authenticated student's subject" })
  @ApiResponse({ status: 200 })
  async getMySubjectMetrics(
    @Param('subjectId') subjectId: string,
    @Req() req: JwtRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.getStudentSubjectMetricsUC.execute(studentId, subjectId, {
      page: parseInt(page ?? '1', 10),
      limit: parseInt(limit ?? '20', 10),
    });
  }

  @Get('subjects/:subjectId/metrics/summary')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Risk-level distribution and average grade across a subject group (TEACHER owner or ADMIN)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  async getSubjectMetricsSummary(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    const callerId = req.user?.sub;
    const callerRole = req.user?.role;
    if (!callerId || !callerRole) throw new UnauthorizedException('Missing caller identity');
    return this.getSubjectMetricsSummaryUC.execute(subjectId, callerId, callerRole);
  }

  @Get('subjects/:subjectId/metrics/progress')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Weekly course average across all students (TEACHER owner or ADMIN)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  async getSubjectWeeklyProgress(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    const callerId = req.user?.sub;
    const callerRole = req.user?.role;
    if (!callerId || !callerRole) throw new UnauthorizedException('Missing caller identity');
    return this.getSubjectWeeklyProgressUC.execute(subjectId, callerId, callerRole);
  }

  // ─── Riesgo consolidado + alertas (Fase 7) ───────────────────────────────

  @Get('students/me/subjects/:subjectId/risk')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Consolidated risk view (level, real trend, factors) for the student's subject" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Not actively enrolled in this subject' })
  async getMySubjectRisk(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.getSubjectRiskUC.execute(studentId, subjectId);
  }

  @Get('students/me/alerts')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Authenticated student's alerts across all subjects" })
  @ApiResponse({ status: 200 })
  async getMyAlerts(
    @Req() req: JwtRequest,
    @Query('status') status?: string,
    @Query('subjectId') subjectId?: string,
    @Query('periodId') periodId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.getAlertsUC.execute(
      studentId,
      { status, subjectId, periodId },
      { page: parseInt(page ?? '1', 10), limit: parseInt(limit ?? '20', 10) },
    );
  }

  @Get('subjects/:subjectId/alerts')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Alerts for every student in a subject (TEACHER owner)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  async getSubjectAlerts(
    @Param('subjectId') subjectId: string,
    @Req() req: JwtRequest,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException('Missing teacher identity');
    return this.getSubjectAlertsUC.execute(
      subjectId,
      teacherId,
      { status, severity },
      { page: parseInt(page ?? '1', 10), limit: parseInt(limit ?? '20', 10) },
    );
  }

  // ─── Métricas ──────────────────────────────────────────────────────────────

  @Post("average/:studentId/:periodId")
  @ApiOperation({ summary: "RF-015: Calculate weighted average" })
  average(
    @Param("studentId") studentId: string,
    @Param("periodId") periodId: string,
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    return this.calculateAverageUC.execute(studentId, periodId, correlationId);
  }

  @Post("trend/:studentId")
  @ApiOperation({ summary: "RF-016: Calculate performance trend" })
  @ApiQuery({
    name: "periodIds",
    description: "Comma-separated period UUIDs (min 3)",
  })
  trend(
    @Param("studentId") studentId: string,
    @Query("periodIds") periodIds: string,
  ) {
    const ids = periodIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    return this.calculateTrendUC.execute(studentId, ids);
  }

  @Post("compliance/:studentId")
  @ApiOperation({ summary: "RF-017: Calculate compliance index" })
  compliance(
    @Param("studentId") studentId: string,
    @Body() dto: ComplianceInputDto,
  ) {
    return this.calculateComplianceUC.execute(studentId, dto);
  }

  @Post("risk")
  @ApiOperation({ summary: "RF-018: Classify student risk" })
  risk(@Body() dto: RiskInputDto) {
    return this.classifyRiskUC.execute(dto);
  }

  @Post("alerts/:studentId")
  @ApiOperation({ summary: "RF-021: Generate alerts for student" })
  generateAlerts(
    @Param("studentId") studentId: string,
    @Body() dto: GenerateAlertsDto,
  ) {
    return this.generateAlertsUC.execute(studentId, dto);
  }

  // ─── Dashboards ────────────────────────────────────────────────────────────

  @Get("dashboard/student/:studentId")
  @ApiOperation({ summary: "RF-023: Student dashboard" })
  studentDashboard(
    @Param("studentId") studentId: string,
    @Query("periodId") periodId: string,
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    return this.getStudentDashboardUC.execute(
      studentId,
      periodId,
      correlationId,
    );
  }

  @Get("dashboard/teacher/:teacherId")
  @ApiOperation({ summary: "RF-024: Teacher dashboard" })
  teacherDashboard(
    @Param("teacherId") teacherId: string,
    @Query("periodId") periodId: string,
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    return this.getTeacherDashboardUC.execute(
      teacherId,
      periodId,
      correlationId,
    );
  }

  @Get("dashboard/admin")
  @ApiOperation({ summary: "RF-025: Admin dashboard" })
  adminDashboard(@Query("periodId") periodId: string) {
    return this.getAdminDashboardUC.execute(periodId);
  }
}
