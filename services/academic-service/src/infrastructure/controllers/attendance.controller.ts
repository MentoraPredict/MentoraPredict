import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JustificationStatus, JUSTIFICATION_STATUSES } from '../../domain/entities/attendance.entity';
import { RequestJustificationDto, ResolveJustificationDto } from '../../application/dtos/attendance.dto';
import {
  GetCourseAttendanceUseCase,
  GetSectionAttendanceUseCase,
  GetSessionAttendanceUseCase,
  GetStudentAttendanceUseCase,
  ListJustificationsUseCase,
  RequestJustificationUseCase,
  ResolveJustificationUseCase,
} from '../../application/use-cases/attendance.use-cases';
import { Caller } from '../../application/use-cases/people-enrollment.use-cases';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

const caller = (req: JwtRequest): Caller => ({
  id: req.user?.sub ?? '',
  role: req.user?.role ?? '',
});

@ApiTags('attendance')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/academic')
export class AttendanceController {
  constructor(
    private readonly courseAttendanceUC: GetCourseAttendanceUseCase,
    private readonly sectionAttendanceUC: GetSectionAttendanceUseCase,
    private readonly sessionAttendanceUC: GetSessionAttendanceUseCase,
    private readonly studentAttendanceUC: GetStudentAttendanceUseCase,
    private readonly requestJustificationUC: RequestJustificationUseCase,
    private readonly listJustificationsUC: ListJustificationsUseCase,
    private readonly resolveJustificationUC: ResolveJustificationUseCase,
  ) {}

  @Get('subjects/:subjectId/attendance')
  @Roles('TEACHER', 'ADMIN', 'SECRETARY', 'INSPECTOR', 'DECE')
  @ApiOperation({ summary: 'Attendance summary of every student of a course, against the institution rule' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  getCourseAttendance(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    return this.courseAttendanceUC.execute(subjectId, caller(req));
  }

  @Get('subjects/:subjectId/sessions/:sessionId/attendance')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Attendance already recorded for one class' })
  @ApiResponse({ status: 200 })
  getSessionAttendance(
    @Param('subjectId') subjectId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: JwtRequest,
  ) {
    return this.sessionAttendanceUC.execute(subjectId, sessionId, caller(req));
  }

  @Get('sections/:id/attendance')
  @Roles('ADMIN', 'SECRETARY', 'INSPECTOR', 'DECE')
  @ApiOperation({ summary: 'Attendance status of every student of a section, worst first' })
  @ApiResponse({ status: 200 })
  getSectionAttendance(@Param('id') id: string) {
    return this.sectionAttendanceUC.execute(id);
  }

  @Get('students/:id/attendance')
  @Roles('STUDENT', 'GUARDIAN', 'ADMIN', 'SECRETARY', 'INSPECTOR', 'DECE')
  @ApiOperation({ summary: 'Attendance of a student per course, with absences and their justification' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  getStudentAttendance(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.studentAttendanceUC.execute(id, caller(req));
  }

  @Post('students/:id/absence-justifications')
  @Roles('GUARDIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'A linked guardian asks to justify an absence (within the configured deadline)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Already justified or deadline expired' })
  requestJustification(
    @Param('id') id: string,
    @Body() dto: RequestJustificationDto,
    @Req() req: JwtRequest,
  ) {
    return this.requestJustificationUC.execute(id, dto, caller(req));
  }

  @Get('absence-justifications')
  @Roles('ADMIN', 'INSPECTOR', 'SECRETARY', 'DECE')
  @ApiOperation({ summary: 'Absence justifications, optionally filtered by status' })
  @ApiResponse({ status: 200 })
  listJustifications(@Query('status') status: string | undefined, @Req() req: JwtRequest) {
    const filter = JUSTIFICATION_STATUSES.includes(status as JustificationStatus)
      ? (status as JustificationStatus)
      : undefined;
    return this.listJustificationsUC.execute(filter, caller(req));
  }

  @Patch('absence-justifications/:id')
  @Roles('ADMIN', 'INSPECTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Approve or reject a justification' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409, description: 'Already resolved' })
  resolveJustification(
    @Param('id') id: string,
    @Body() dto: ResolveJustificationDto,
    @Req() req: JwtRequest,
  ) {
    return this.resolveJustificationUC.execute(id, dto, caller(req));
  }
}
