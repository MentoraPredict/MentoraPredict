import { Controller, Get, Param, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GeneratePredictionUseCase } from '../../application/use-cases/generate-prediction.use-case';
import { GetPredictionHistoryUseCase } from '../../application/use-cases/get-prediction-history.use-case';
import { GetMySubjectPredictionUseCase } from '../../application/use-cases/get-my-subject-prediction.use-case';
import { GetStudentSubjectPredictionUseCase } from '../../application/use-cases/get-student-subject-prediction.use-case';
import { ListSubjectPredictionsUseCase } from '../../application/use-cases/list-subject-predictions.use-case';
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

  // ─── Global prediction (existing, unchanged) ─────────────────────────────

  @Get('students/:studentId/periods/:periodId')
  @ApiOperation({
    summary: 'Generate a risk prediction + AI recommendations for a student in a period',
    description:
      'Risk is computed deterministically by analytics-service. OpenAI is used only to ' +
      'produce the natural-language summary and the actionable recommendation plan.',
  })
  generate(@Param('studentId') studentId: string, @Param('periodId') periodId: string) {
    return this.generatePredictionUC.execute(studentId, periodId);
  }

  @Get('students/:studentId/history')
  @ApiOperation({ summary: 'List past predictions generated for a student' })
  @ApiQuery({ name: 'limit', required: false })
  history(@Param('studentId') studentId: string, @Query('limit') limit?: string) {
    return this.getHistoryUC.execute(studentId, limit ? parseInt(limit, 10) : undefined);
  }
}
