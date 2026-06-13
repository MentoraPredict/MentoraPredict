import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetStudentGradesUseCase } from '../../application/use-cases/get-student-grades.use-case';
import { GetStudentEnrollmentsUseCase } from '../../application/use-cases/get-student-enrollments.use-case';
import { InternalServiceGuard } from '../guards/internal-service.guard';

@ApiTags('academic-internal')
@Controller('api/v1/academic/internal')
@UseGuards(InternalServiceGuard)
export class InternalAcademicController {
  constructor(
    private readonly getGradesUC: GetStudentGradesUseCase,
    private readonly getEnrollmentsUC: GetStudentEnrollmentsUseCase,
  ) {}

  @Get('students/:studentId/grades')
  @ApiOperation({ summary: 'Internal: grades by student and period' })
  grades(@Param('studentId') studentId: string, @Query('periodId') periodId: string) {
    return this.getGradesUC.execute(studentId, periodId);
  }

  @Get('students/:studentId/enrollments')
  @ApiOperation({ summary: 'Internal: enrollments by student' })
  enrollments(@Param('studentId') studentId: string) {
    return this.getEnrollmentsUC.execute(studentId);
  }
}
