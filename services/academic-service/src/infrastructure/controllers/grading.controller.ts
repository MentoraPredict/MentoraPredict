import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ClosePeriodDto,
  ConfirmPromotionDto,
  CreateActivityDto,
  RegisterSupplementaryDto,
  ReopenPeriodDto,
  SaveGradesDto,
  ToggleActivityDto,
  UpdateActivityDto,
  UpdateGradingComponentsDto,
} from '../../application/dtos/grading.dto';
import {
  ClosePeriodUseCase,
  ConfirmPromotionUseCase,
  CreateActivityUseCase,
  GetGradebookUseCase,
  GetGradingComponentsUseCase,
  GetPeriodClosureUseCase,
  GetSectionPromotionUseCase,
  GetStudentResultsUseCase,
  ListSupplementaryCandidatesUseCase,
  RegisterSupplementaryUseCase,
  ReopenPeriodUseCase,
  SaveGradesUseCase,
  ToggleActivityUseCase,
  UpdateActivityUseCase,
  UpdateGradingComponentsUseCase,
} from '../../application/use-cases/grading.use-cases';
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

@ApiTags('grading')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/academic')
export class GradingController {
  constructor(
    private readonly getComponentsUC: GetGradingComponentsUseCase,
    private readonly updateComponentsUC: UpdateGradingComponentsUseCase,
    private readonly getGradebookUC: GetGradebookUseCase,
    private readonly createActivityUC: CreateActivityUseCase,
    private readonly updateActivityUC: UpdateActivityUseCase,
    private readonly toggleActivityUC: ToggleActivityUseCase,
    private readonly saveGradesUC: SaveGradesUseCase,
    private readonly getClosureUC: GetPeriodClosureUseCase,
    private readonly closePeriodUC: ClosePeriodUseCase,
    private readonly reopenPeriodUC: ReopenPeriodUseCase,
    private readonly studentResultsUC: GetStudentResultsUseCase,
    private readonly listSupplementaryUC: ListSupplementaryCandidatesUseCase,
    private readonly registerSupplementaryUC: RegisterSupplementaryUseCase,
    private readonly sectionPromotionUC: GetSectionPromotionUseCase,
    private readonly confirmPromotionUC: ConfirmPromotionUseCase,
  ) {}

  // ── Componentes de la nota ─────────────────────────────────────────────────

  @Get('grading/components')
  @Roles('ADMIN', 'SECRETARY', 'TEACHER')
  @ApiOperation({ summary: 'Components of the period grade and their weights' })
  @ApiResponse({ status: 200 })
  getComponents() {
    return this.getComponentsUC.execute();
  }

  @Put('grading/components')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Replace the grade components (weights must add up to 100)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  updateComponents(@Body() dto: UpdateGradingComponentsDto) {
    return this.updateComponentsUC.execute(dto);
  }

  // ── Libro de calificaciones ────────────────────────────────────────────────

  @Get('subjects/:subjectId/gradebook')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Gradebook of a course for one grading period (defaults to the current one)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  getGradebook(
    @Param('subjectId') subjectId: string,
    @Query('periodId') periodId: string | undefined,
    @Req() req: JwtRequest,
  ) {
    return this.getGradebookUC.execute(subjectId, periodId, caller(req));
  }

  @Post('subjects/:subjectId/activities')
  @Roles('TEACHER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an evaluable activity in a grading period' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Period closed or past its grading deadline' })
  createActivity(
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateActivityDto,
    @Req() req: JwtRequest,
  ) {
    return this.createActivityUC.execute(subjectId, dto, caller(req));
  }

  @Put('activities/:id')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Rename an activity, change its component or due date' })
  @ApiResponse({ status: 200 })
  updateActivity(@Param('id') id: string, @Body() dto: UpdateActivityDto, @Req() req: JwtRequest) {
    return this.updateActivityUC.execute(id, dto, caller(req));
  }

  @Patch('activities/:id/status')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Archive or reactivate an activity (its grades are kept)' })
  @ApiResponse({ status: 200 })
  toggleActivity(@Param('id') id: string, @Body() dto: ToggleActivityDto, @Req() req: JwtRequest) {
    return this.toggleActivityUC.execute(id, dto.isActive, caller(req));
  }

  @Put('subjects/:subjectId/gradebook/grades')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Save grades in bulk (all or nothing)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Invalid rows listed in the message' })
  @ApiResponse({ status: 409, description: 'Period closed or past its grading deadline' })
  saveGrades(@Param('subjectId') subjectId: string, @Body() dto: SaveGradesDto, @Req() req: JwtRequest) {
    return this.saveGradesUC.execute(subjectId, dto, caller(req));
  }

  // ── Cierre de periodos ─────────────────────────────────────────────────────

  @Get('periods/:id/closure')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Closure status and pending grades of a grading period' })
  @ApiResponse({ status: 200 })
  getClosure(@Param('id') id: string) {
    return this.getClosureUC.execute(id);
  }

  @Post('periods/:id/close')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a grading period and freeze its grades' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 409, description: 'Already closed or students without complete grades' })
  closePeriod(@Param('id') id: string, @Body() dto: ClosePeriodDto, @Req() req: JwtRequest) {
    return this.closePeriodUC.execute(id, dto, caller(req));
  }

  @Post('periods/:id/reopen')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reopen a closed grading period (requires a reason)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409 })
  reopenPeriod(@Param('id') id: string, @Body() dto: ReopenPeriodDto, @Req() req: JwtRequest) {
    return this.reopenPeriodUC.execute(id, dto, caller(req));
  }

  // ── Resultados, supletorio y promoción ─────────────────────────────────────

  @Get('students/:id/results')
  @Roles('ADMIN', 'SECRETARY', 'STUDENT', 'GUARDIAN')
  @ApiOperation({ summary: 'Period grades, annual average and result per course' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  getStudentResults(
    @Param('id') id: string,
    @Query('schoolYearId') schoolYearId: string | undefined,
    @Req() req: JwtRequest,
  ) {
    return this.studentResultsUC.execute(id, schoolYearId, caller(req));
  }

  @Get('subjects/:subjectId/supplementary')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Students of the course that must take the supplementary exam' })
  @ApiResponse({ status: 200 })
  listSupplementary(@Param('subjectId') subjectId: string, @Req() req: JwtRequest) {
    return this.listSupplementaryUC.execute(subjectId, caller(req));
  }

  @Put('subjects/:subjectId/supplementary')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Register supplementary exam grades' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  registerSupplementary(
    @Param('subjectId') subjectId: string,
    @Body() dto: RegisterSupplementaryDto,
    @Req() req: JwtRequest,
  ) {
    return this.registerSupplementaryUC.execute(subjectId, dto, caller(req));
  }

  @Get('sections/:id/promotion')
  @Roles('ADMIN', 'SECRETARY')
  @ApiOperation({ summary: 'Promotion suggestion and decision per student of a section' })
  @ApiResponse({ status: 200 })
  getSectionPromotion(@Param('id') id: string) {
    return this.sectionPromotionUC.execute(id);
  }

  @Post('sections/:id/promotion')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm promotion or repetition decisions' })
  @ApiResponse({ status: 200, description: 'Per-student result; some may fail validation' })
  confirmPromotion(@Param('id') id: string, @Body() dto: ConfirmPromotionDto, @Req() req: JwtRequest) {
    return this.confirmPromotionUC.execute(id, dto, caller(req));
  }
}
