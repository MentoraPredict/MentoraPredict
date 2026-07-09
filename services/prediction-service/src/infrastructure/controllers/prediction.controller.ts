import { Controller, ForbiddenException, Get, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GeneratePredictionUseCase } from '../../application/use-cases/generate-prediction.use-case';
import { GetPredictionHistoryUseCase } from '../../application/use-cases/get-prediction-history.use-case';
import { GetMySubjectPredictionUseCase } from '../../application/use-cases/get-my-subject-prediction.use-case';
import { GetStudentSubjectPredictionUseCase } from '../../application/use-cases/get-student-subject-prediction.use-case';
import { ListSubjectPredictionsUseCase } from '../../application/use-cases/list-subject-predictions.use-case';
import { RequestStudentPredictionUseCase } from '../../application/use-cases/request-student-prediction.use-case';
import { RequestSubjectPredictionUseCase } from '../../application/use-cases/request-subject-prediction.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

@ApiTags('prediction-service')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/prediction')
export class PredictionController {
  constructor(
    private readonly generatePredictionUC: GeneratePredictionUseCase,
    private readonly getHistoryUC: GetPredictionHistoryUseCase,
    private readonly getMySubjectPredictionUC: GetMySubjectPredictionUseCase,
    private readonly getStudentSubjectPredictionUC: GetStudentSubjectPredictionUseCase,
    private readonly listSubjectPredictionsUC: ListSubjectPredictionsUseCase,
    private readonly requestStudentPredictionUC: RequestStudentPredictionUseCase,
    private readonly requestSubjectPredictionUC: RequestSubjectPredictionUseCase,
  ) {}

  // ─── Per-subject predictions (Fase 8) ────────────────────────────────────

  @Get('students/me/subjects/:subjectId/prediction')
  @Roles('STUDENT')
  @ApiOperation({ summary: "Rule-based per-subject prediction for the authenticated student" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Not actively enrolled in this subject' })
  getMySubjectPrediction(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.getMySubjectPredictionUC.execute(studentId, subjectId);
  }

  @Get('subjects/:subjectId/students/:studentId/prediction')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: "A specific student's per-subject prediction (TEACHER owner or ADMIN)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  getStudentSubjectPrediction(
    @Param('subjectId') subjectId: string,
    @Param('studentId') studentId: string,
    @Req() req: JwtRequest,
  ) {
    const requesterId = req.user?.sub ?? '';
    const requesterRole = req.user?.role ?? '';
    return this.getStudentSubjectPredictionUC.execute(subjectId, studentId, requesterId, requesterRole);
  }

  @Get('subjects/:subjectId/predictions')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Latest prediction per student for a subject (TEACHER owner or ADMIN)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Teacher does not own this course' })
  listSubjectPredictions(
    @Param('subjectId') subjectId: string,
    @Req() req: JwtRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const requesterId = req.user?.sub ?? '';
    const requesterRole = req.user?.role ?? '';
    return this.listSubjectPredictionsUC.execute(
      subjectId,
      requesterId,
      requesterRole,
      { page: parseInt(page ?? '1', 10), limit: parseInt(limit ?? '20', 10) },
    );
  }

  // ─── Global prediction (IA-powered) ──────────────────────────────────────
  // Both endpoints below accept any authenticated role at the guard level,
  // but a STUDENT caller may only ever read their OWN data — without this
  // check, any authenticated user could read (and, worse, silently trigger
  // real OpenAI spend on) another student's academic risk data just by
  // guessing/enumerating a studentId in the URL.

  @Get('students/:studentId/periods/:periodId')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  @ApiOperation({
    summary: 'Generate a risk prediction + AI recommendations for a student in a period',
    description:
      'Risk is computed deterministically by analytics-service. OpenAI is used only to ' +
      'produce the natural-language summary and the actionable recommendation plan.',
  })
  @ApiResponse({ status: 403, description: 'Student requesting another student\'s prediction' })
  generate(
    @Param('studentId') studentId: string,
    @Param('periodId') periodId: string,
    @Req() req: JwtRequest,
  ) {
    this.assertCanAccessStudent(studentId, req);
    return this.generatePredictionUC.execute(studentId, periodId);
  }

  @Get('students/:studentId/history')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'List past predictions generated for a student (global by default, or scoped to one subject)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiResponse({ status: 403, description: 'Student requesting another student\'s history' })
  history(
    @Param('studentId') studentId: string,
    @Req() req: JwtRequest,
    @Query('limit') limit?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    this.assertCanAccessStudent(studentId, req);
    return this.getHistoryUC.execute(studentId, limit ? parseInt(limit, 10) : undefined, subjectId ?? null);
  }

  @Post('students/me/periods/:periodId/generate')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'On-demand: generate a fresh global AI recommendation for the authenticated student',
    description: 'Rate-limited to one generation per hour per student — each call is a real OpenAI request.',
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 429, description: 'Cooldown still active' })
  requestPrediction(@Param('periodId') periodId: string, @Req() req: JwtRequest) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.requestStudentPredictionUC.execute(studentId, periodId);
  }

  @Post('students/me/subjects/:subjectId/generate')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'On-demand: generate a fresh AI recommendation for the authenticated student, scoped to one subject',
    description:
      'Grounded in that subject\'s weekly-progress metrics and syllabus topics. Rate-limited to one ' +
      'generation per hour PER SUBJECT — independent from the global per-period cooldown.',
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'Not actively enrolled in this subject' })
  @ApiResponse({ status: 429, description: 'Cooldown still active for this subject' })
  requestSubjectPrediction(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException('Missing student identity');
    return this.requestSubjectPredictionUC.execute(studentId, subjectId);
  }

  // TEACHER/ADMIN can look up any student; a STUDENT caller may only access their own id.
  private assertCanAccessStudent(studentId: string, req: JwtRequest): void {
    if (req.user?.role === 'STUDENT' && req.user.sub !== studentId) {
      throw new ForbiddenException('No puedes consultar la predicción de otro estudiante');
    }
  }
}
