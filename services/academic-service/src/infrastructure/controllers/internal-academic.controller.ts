import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetStudentGradesUseCase } from '../../application/use-cases/get-student-grades.use-case';
import { GetStudentEnrollmentsUseCase } from '../../application/use-cases/get-student-enrollments.use-case';
import { GetSubjectEvaluationWeightsUseCase } from '../../application/use-cases/get-subject-evaluation-weights.use-case';
import { GetLatestCheckInUseCase } from '../../application/use-cases/get-latest-check-in.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('academic-internal')
@Controller('api/v1/academic/internal')
@UseGuards(InternalServiceGuard)
export class InternalAcademicController {
  constructor(
    private readonly getGradesUC: GetStudentGradesUseCase,
    private readonly getEnrollmentsUC: GetStudentEnrollmentsUseCase,
    private readonly getEvalWeightsUC: GetSubjectEvaluationWeightsUseCase,
    private readonly getLatestCheckInUC: GetLatestCheckInUseCase,
  ) {}

  @Get('students/:studentId/grades')
  @ApiOperation({ summary: 'Internal: grades by student and period (one per evaluation)' })
  grades(@Param('studentId') studentId: string, @Query('periodId') periodId: string) {
    return this.getGradesUC.execute(studentId, periodId);
  }

  @Get('students/:studentId/enrollments')
  @ApiOperation({ summary: 'Internal: enrollments by student' })
  enrollments(@Param('studentId') studentId: string) {
    return this.getEnrollmentsUC.execute(studentId);
  }

  @Get('subjects/:subjectId/evaluations')
  @ApiOperation({ summary: 'Internal: evaluation weights for a subject (used by analytics)' })
  evaluationWeights(@Param('subjectId') subjectId: string) {
    return this.getEvalWeightsUC.execute(subjectId);
  }

  @Get('students/:studentId/check-ins/latest')
  @ApiOperation({ summary: 'Internal: latest weekly check-in summary for risk calculation' })
  latestCheckIn(
    @Param('studentId') studentId: string,
    @Query('subjectId') subjectId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.getLatestCheckInUC.execute(studentId, subjectId, periodId);
  }
}
