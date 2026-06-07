import {
  Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RecordGradeUseCase } from '../../application/use-cases/record-grade.use-case';
import { EnrollStudentUseCase } from '../../application/use-cases/enroll-student.use-case';
import { CreateEvaluationUseCase } from '../../application/use-cases/create-evaluation.use-case';
import { RecordGradeDto } from '../../application/dtos/record-grade.dto';
import { EnrollStudentDto } from '../../application/dtos/enroll-student.dto';
import { CreateEvaluationDto } from '../../application/dtos/create-evaluation.dto';

@ApiTags('academic-service')
@Controller('api/v1/academic')
export class AcademicController {
  constructor(
    private readonly recordGradeUC: RecordGradeUseCase,
    private readonly enrollStudentUC: EnrollStudentUseCase,
    private readonly createEvaluationUC: CreateEvaluationUseCase,
  ) {}

  @Post('enrollments')
  @ApiOperation({ summary: 'RF-007: Enroll student in a subject' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  async enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollStudentUC.execute(dto);
  }

  @Post('evaluations')
  @ApiOperation({ summary: 'RF-008: Create evaluation for a subject' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Weight would exceed 100%' })
  async createEvaluation(@Body() dto: CreateEvaluationDto) {
    return this.createEvaluationUC.execute(dto);
  }

  @Post('grades')
  @ApiOperation({ summary: 'RF-009: Record grade for a student evaluation' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Grade already recorded' })
  async recordGrade(@Body() dto: RecordGradeDto) {
    // teacherId should come from JWT in production; using header for now
    return this.recordGradeUC.execute(dto, 'system');
  }
}
