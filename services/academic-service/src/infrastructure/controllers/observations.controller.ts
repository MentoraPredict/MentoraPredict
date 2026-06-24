import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateObservationUseCase } from '../../application/use-cases/create-observation.use-case';
import { GetObservationsByStudentUseCase } from '../../application/use-cases/get-observations-by-student.use-case';
import { CreateObservationDto } from '../../application/dtos/create-observation.dto';
import { TeacherRoleGuard } from '../guards/teacher-role.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('observations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/academic/observations')
export class ObservationsController {
  constructor(
    private readonly createObservationUC: CreateObservationUseCase,
    private readonly getObservationsUC: GetObservationsByStudentUseCase,
  ) {}

  @Post()
  @UseGuards(TeacherRoleGuard)
  @ApiOperation({ summary: 'RF-022: Create teacher observation' })
  create(@Body() dto: CreateObservationDto) {
    return this.createObservationUC.execute(dto);
  }

  @Get('student/:id')
  @ApiOperation({ summary: 'RF-022: List observations for a student' })
  byStudent(@Param('id') studentId: string) {
    return this.getObservationsUC.execute(studentId);
  }
}
