import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Caller,
  EndStudentEnrollmentUseCase,
  EnrollStudentsInSectionUseCase,
  GetStudentProfileUseCase,
  GrantConsentUseCase,
  LinkGuardianUseCase,
  ListMyStudentsUseCase,
  ListSectionEnrollmentsUseCase,
  ListStudentConsentsUseCase,
  ListStudentEnrollmentsUseCase,
  ListStudentGuardiansUseCase,
  RevokeConsentUseCase,
  UnlinkGuardianUseCase,
  UpsertStudentProfileUseCase,
} from '../../application/use-cases/people-enrollment.use-cases';
import {
  EndStudentEnrollmentDto,
  EnrollStudentsDto,
  GrantConsentDto,
  LinkGuardianDto,
  UpsertStudentProfileDto,
} from '../../application/dtos/people-enrollment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

const caller = (req: JwtRequest): Caller => ({
  id: req.user?.sub ?? '',
  role: req.user?.role ?? '',
});

@ApiTags('people-enrollment')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/academic')
export class PeopleEnrollmentController {
  constructor(
    private readonly getProfileUC: GetStudentProfileUseCase,
    private readonly upsertProfileUC: UpsertStudentProfileUseCase,
    private readonly listGuardiansUC: ListStudentGuardiansUseCase,
    private readonly linkGuardianUC: LinkGuardianUseCase,
    private readonly unlinkGuardianUC: UnlinkGuardianUseCase,
    private readonly listConsentsUC: ListStudentConsentsUseCase,
    private readonly grantConsentUC: GrantConsentUseCase,
    private readonly revokeConsentUC: RevokeConsentUseCase,
    private readonly listMyStudentsUC: ListMyStudentsUseCase,
    private readonly listStudentEnrollmentsUC: ListStudentEnrollmentsUseCase,
    private readonly listSectionEnrollmentsUC: ListSectionEnrollmentsUseCase,
    private readonly enrollStudentsUC: EnrollStudentsInSectionUseCase,
    private readonly endEnrollmentUC: EndStudentEnrollmentUseCase,
  ) {}

  @Get('students/:id/profile')
  @Roles('ADMIN', 'SECRETARY', 'GUARDIAN')
  @ApiOperation({ summary: 'Student record (staff or a linked guardian)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  getProfile(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.getProfileUC.execute(id, caller(req));
  }

  @Put('students/:id/profile')
  @Roles('ADMIN', 'SECRETARY')
  @ApiOperation({ summary: 'Create or update the student record (ADMIN/SECRETARY)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  upsertProfile(@Param('id') id: string, @Body() dto: UpsertStudentProfileDto) {
    return this.upsertProfileUC.execute(id, dto);
  }

  @Get('students/:id/guardians')
  @Roles('ADMIN', 'SECRETARY', 'GUARDIAN')
  @ApiOperation({ summary: 'Guardians linked to a student' })
  @ApiResponse({ status: 200 })
  listGuardians(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.listGuardiansUC.execute(id, caller(req));
  }

  @Post('students/:id/guardians')
  @Roles('ADMIN', 'SECRETARY')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a guardian to a student (ADMIN/SECRETARY)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  linkGuardian(@Param('id') id: string, @Body() dto: LinkGuardianDto) {
    return this.linkGuardianUC.execute(id, dto);
  }

  @Delete('students/:id/guardians/:guardianId')
  @Roles('ADMIN', 'SECRETARY')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a guardian from a student (ADMIN/SECRETARY)' })
  @ApiResponse({ status: 204 })
  unlinkGuardian(@Param('id') id: string, @Param('guardianId') guardianId: string) {
    return this.unlinkGuardianUC.execute(id, guardianId);
  }

  @Get('students/:id/consents')
  @Roles('ADMIN', 'SECRETARY', 'GUARDIAN')
  @ApiOperation({ summary: 'Consent history of a student' })
  @ApiResponse({ status: 200 })
  listConsents(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.listConsentsUC.execute(id, caller(req));
  }

  @Post('students/:id/consents')
  @Roles('GUARDIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Grant a consent (linked guardian only)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 403 })
  grantConsent(@Param('id') id: string, @Body() dto: GrantConsentDto, @Req() req: JwtRequest) {
    return this.grantConsentUC.execute(id, dto, caller(req).id);
  }

  @Delete('students/:id/consents/:purpose')
  @Roles('GUARDIAN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a consent (linked guardian only)' })
  @ApiResponse({ status: 204 })
  revokeConsent(
    @Param('id') id: string,
    @Param('purpose') purpose: string,
    @Req() req: JwtRequest,
  ) {
    return this.revokeConsentUC.execute(id, purpose, caller(req).id);
  }

  @Get('guardians/me/students')
  @Roles('GUARDIAN')
  @ApiOperation({ summary: 'Students represented by the caller, with their current enrollment' })
  @ApiResponse({ status: 200 })
  listMyStudents(@Req() req: JwtRequest) {
    return this.listMyStudentsUC.execute(caller(req).id);
  }

  @Get('students/:id/enrollments')
  @Roles('ADMIN', 'SECRETARY', 'GUARDIAN')
  @ApiOperation({ summary: 'Enrollment history of a student' })
  @ApiResponse({ status: 200 })
  listStudentEnrollments(@Param('id') id: string, @Req() req: JwtRequest) {
    return this.listStudentEnrollmentsUC.execute(id, caller(req));
  }

  @Get('sections/:id/enrollments')
  @Roles('ADMIN', 'SECRETARY')
  @ApiOperation({ summary: 'Students enrolled in a section (ADMIN/SECRETARY)' })
  @ApiResponse({ status: 200 })
  listSectionEnrollments(@Param('id') id: string) {
    return this.listSectionEnrollmentsUC.execute(id);
  }

  @Post('sections/:id/enrollments')
  @Roles('ADMIN', 'SECRETARY')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enroll students in a section; returns one result per student (ADMIN/SECRETARY)',
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  enrollStudents(@Param('id') id: string, @Body() dto: EnrollStudentsDto) {
    return this.enrollStudentsUC.execute(id, dto);
  }

  @Patch('student-enrollments/:id/end')
  @Roles('ADMIN', 'SECRETARY')
  @ApiOperation({ summary: 'Withdraw or transfer an enrolled student (ADMIN/SECRETARY)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 409 })
  endEnrollment(@Param('id') id: string, @Body() dto: EndStudentEnrollmentDto) {
    return this.endEnrollmentUC.execute(id, dto);
  }
}
