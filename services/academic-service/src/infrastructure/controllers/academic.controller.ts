import {
  Controller,
  Post,
  Put,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

type MulterUploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  [key: string]: unknown;
};

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

import { RecordGradeUseCase } from "../../application/use-cases/record-grade.use-case";
import { RegisterGradeUseCase } from "../../application/use-cases/register-grade.use-case";
import { UpdateGradeUseCase } from "../../application/use-cases/update-grade.use-case";
import { EnrollStudentUseCase } from "../../application/use-cases/enroll-student.use-case";
import { CreateEvaluationUseCase } from "../../application/use-cases/create-evaluation.use-case";
import { AssignTeacherUseCase } from "../../application/use-cases/assign-teacher.use-case";
import { ImportGradesUseCase } from "../../application/use-cases/import-grades.use-case";
import { RecordGradeDto } from "../../application/dtos/record-grade.dto";
import { RegisterGradeDto } from "../../application/dtos/register-grade.dto";
import { UpdateGradeDto } from "../../application/dtos/update-grade.dto";
import { EnrollStudentDto } from "../../application/dtos/enroll-student.dto";
import { CreateEvaluationDto } from "../../application/dtos/create-evaluation.dto";
import { AssignTeacherDto } from "../../application/dtos/assign-teacher.dto";

// Faculty use-cases
import { CreateFacultyUseCase } from "../../application/use-cases/create-faculty.use-case";
import { GetFacultyUseCase } from "../../application/use-cases/get-faculty.use-case";
import { ListFacultiesUseCase } from "../../application/use-cases/list-faculties.use-case";
import { UpdateFacultyUseCase } from "../../application/use-cases/update-faculty.use-case";
import { ChangeFacultyStatusUseCase } from "../../application/use-cases/change-faculty-status.use-case";
import { DeleteFacultyUseCase } from "../../application/use-cases/delete-faculty.use-case";
import { CreateFacultyDto } from "../../application/dtos/create-faculty.dto";
import { UpdateFacultyDto } from "../../application/dtos/update-faculty.dto";
import { ChangeFacultyStatusDto } from "../../application/dtos/change-faculty-status.dto";

// Academic Period use-cases
import { CreateAcademicPeriodUseCase } from "../../application/use-cases/create-academic-period.use-case";
import { GetAcademicPeriodUseCase } from "../../application/use-cases/get-academic-period.use-case";
import { ListAcademicPeriodsUseCase } from "../../application/use-cases/list-academic-periods.use-case";
import { GetActivePeriodUseCase } from "../../application/use-cases/get-active-period.use-case";
import { UpdateAcademicPeriodUseCase } from "../../application/use-cases/update-academic-period.use-case";
import { ChangeAcademicPeriodStatusUseCase } from "../../application/use-cases/change-academic-period-status.use-case";
import { DeleteAcademicPeriodUseCase } from "../../application/use-cases/delete-academic-period.use-case";
import { CreateAcademicPeriodDto } from "../../application/dtos/create-academic-period.dto";
import { UpdateAcademicPeriodDto } from "../../application/dtos/update-academic-period.dto";
import { ChangeAcademicPeriodStatusDto } from "../../application/dtos/change-academic-period-status.dto";

// Career use-cases
import { CreateCareerUseCase } from "../../application/use-cases/create-career.use-case";
import { GetCareerUseCase } from "../../application/use-cases/get-career.use-case";
import { ListCareersUseCase } from "../../application/use-cases/list-careers.use-case";
import { UpdateCareerUseCase } from "../../application/use-cases/update-career.use-case";
import { ChangeCareerStatusUseCase } from "../../application/use-cases/change-career-status.use-case";
import { DeleteCareerUseCase } from "../../application/use-cases/delete-career.use-case";
import { CreateCareerDto } from "../../application/dtos/create-career.dto";
import { UpdateCareerDto } from "../../application/dtos/update-career.dto";
import { ChangeCareerStatusDto } from "../../application/dtos/change-career-status.dto";

// Subject use-cases
import { CreateSubjectUseCase } from "../../application/use-cases/create-subject.use-case";
import { GetSubjectUseCase } from "../../application/use-cases/get-subject.use-case";
import { ListSubjectsUseCase } from "../../application/use-cases/list-subjects.use-case";
import { UpdateSubjectUseCase } from "../../application/use-cases/update-subject.use-case";
import { ChangeSubjectStatusUseCase } from "../../application/use-cases/change-subject-status.use-case";
import { DeleteSubjectUseCase } from "../../application/use-cases/delete-subject.use-case";
import { GetTeacherSubjectsUseCase } from "../../application/use-cases/get-teacher-subjects.use-case";
import { GetSubjectEnrollmentsUseCase } from "../../application/use-cases/get-subject-enrollments.use-case";
import { BatchEnrollStudentsUseCase } from "../../application/use-cases/batch-enroll-students.use-case";
import { UpdateEnrollmentStatusUseCase } from "../../application/use-cases/update-enrollment-status.use-case";
import { GetStudentSubjectsUseCase } from "../../application/use-cases/get-student-subjects.use-case";
import { CreateSubjectDto } from "../../application/dtos/create-subject.dto";
import { UpdateSubjectDto } from "../../application/dtos/update-subject.dto";
import { ChangeSubjectStatusDto } from "../../application/dtos/change-subject-status.dto";
import { BatchEnrollDto } from "../../application/dtos/batch-enroll.dto";
import { UpdateEnrollmentStatusDto } from "../../application/dtos/update-enrollment-status.dto";
import { SubjectEvaluationDto } from "../../application/dtos/subject-evaluation.dto";
import { UpdateEvaluationDto } from "../../application/dtos/update-evaluation.dto";
import { ToggleEvaluationStatusDto } from "../../application/dtos/toggle-evaluation-status.dto";
import { ListEvaluationsUseCase } from "../../application/use-cases/list-evaluations.use-case";
import { UpdateEvaluationUseCase } from "../../application/use-cases/update-evaluation.use-case";
import { ArchiveEvaluationUseCase } from "../../application/use-cases/archive-evaluation.use-case";
import { GetWeightSummaryUseCase } from "../../application/use-cases/get-weight-summary.use-case";
import { ImportSubjectGradesUseCase } from "../../application/use-cases/import-subject-grades.use-case";
import { ListGradeImportsUseCase } from "../../application/use-cases/list-grade-imports.use-case";
import { GetGradeImportUseCase } from "../../application/use-cases/get-grade-import.use-case";

// Weekly check-ins (Phase 5)
import { GetCurrentCheckInUseCase } from "../../application/use-cases/get-current-check-in.use-case";
import { UpsertCheckInUseCase } from "../../application/use-cases/upsert-check-in.use-case";
import { UpdateCheckInUseCase } from "../../application/use-cases/update-check-in.use-case";
import { ListCheckInsUseCase } from "../../application/use-cases/list-check-ins.use-case";
import { GetCheckInsSummaryUseCase } from "../../application/use-cases/get-check-ins-summary.use-case";
import { CreateCheckInDto } from "../../application/dtos/create-check-in.dto";
import { UpdateCheckInDto } from "../../application/dtos/update-check-in.dto";

import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../guards/roles.guard";

@ApiTags("academic-service")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/academic")
export class AcademicController {
  constructor(
    private readonly recordGradeUC: RecordGradeUseCase,
    private readonly registerGradeUC: RegisterGradeUseCase,
    private readonly updateGradeUC: UpdateGradeUseCase,
    private readonly enrollStudentUC: EnrollStudentUseCase,
    private readonly createEvaluationUC: CreateEvaluationUseCase,
    private readonly assignTeacherUC: AssignTeacherUseCase,
    private readonly importGradesUC: ImportGradesUseCase,
    // Faculty use-cases
    private readonly createFacultyUC: CreateFacultyUseCase,
    private readonly getFacultyUC: GetFacultyUseCase,
    private readonly listFacultiesUC: ListFacultiesUseCase,
    private readonly updateFacultyUC: UpdateFacultyUseCase,
    private readonly changeFacultyStatusUC: ChangeFacultyStatusUseCase,
    private readonly deleteFacultyUC: DeleteFacultyUseCase,
    // Academic Period use-cases
    private readonly createAcademicPeriodUC: CreateAcademicPeriodUseCase,
    private readonly getAcademicPeriodUC: GetAcademicPeriodUseCase,
    private readonly listAcademicPeriodsUC: ListAcademicPeriodsUseCase,
    private readonly getActivePeriodUC: GetActivePeriodUseCase,
    private readonly updateAcademicPeriodUC: UpdateAcademicPeriodUseCase,
    private readonly changeAcademicPeriodStatusUC: ChangeAcademicPeriodStatusUseCase,
    private readonly deleteAcademicPeriodUC: DeleteAcademicPeriodUseCase,
    // Career use-cases
    private readonly createCareerUC: CreateCareerUseCase,
    private readonly getCareerUC: GetCareerUseCase,
    private readonly listCareersUC: ListCareersUseCase,
    private readonly updateCareerUC: UpdateCareerUseCase,
    private readonly changeCareerStatusUC: ChangeCareerStatusUseCase,
    private readonly deleteCareerUC: DeleteCareerUseCase,
    // Subject use-cases
    private readonly createSubjectUC: CreateSubjectUseCase,
    private readonly getSubjectUC: GetSubjectUseCase,
    private readonly listSubjectsUC: ListSubjectsUseCase,
    private readonly updateSubjectUC: UpdateSubjectUseCase,
    private readonly changeSubjectStatusUC: ChangeSubjectStatusUseCase,
    private readonly deleteSubjectUC: DeleteSubjectUseCase,
    private readonly getTeacherSubjectsUC: GetTeacherSubjectsUseCase,
    private readonly getSubjectEnrollmentsUC: GetSubjectEnrollmentsUseCase,
    private readonly batchEnrollUC: BatchEnrollStudentsUseCase,
    private readonly updateEnrollmentStatusUC: UpdateEnrollmentStatusUseCase,
    private readonly getStudentSubjectsUC: GetStudentSubjectsUseCase,
    // Evaluation CRUD (Phase 4)
    private readonly listEvaluationsUC: ListEvaluationsUseCase,
    private readonly updateEvaluationUC: UpdateEvaluationUseCase,
    private readonly archiveEvaluationUC: ArchiveEvaluationUseCase,
    private readonly getWeightSummaryUC: GetWeightSummaryUseCase,
    // Grade import (Phase 4)
    private readonly importSubjectGradesUC: ImportSubjectGradesUseCase,
    private readonly listGradeImportsUC: ListGradeImportsUseCase,
    private readonly getGradeImportUC: GetGradeImportUseCase,
    // Weekly check-ins (Phase 5)
    private readonly getCurrentCheckInUC: GetCurrentCheckInUseCase,
    private readonly upsertCheckInUC: UpsertCheckInUseCase,
    private readonly updateCheckInUC: UpdateCheckInUseCase,
    private readonly listCheckInsUC: ListCheckInsUseCase,
    private readonly getCheckInsSummaryUC: GetCheckInsSummaryUseCase,
  ) {}

  // ─── Enrollments ──────────────────────────────────────────────────────────────

  @Post("enrollments")
  @Roles("TEACHER")
  @ApiOperation({ summary: "RF-007: Enroll a student in a subject (TEACHER only)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  @ApiResponse({ status: 409, description: "Already enrolled or no capacity" })
  async enroll(@Body() dto: EnrollStudentDto, @Req() req: JwtRequest) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.enrollStudentUC.execute(dto, teacherId);
  }

  @Get("subjects/:subjectId/enrollments")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "List enrolled students for a subject" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  @ApiResponse({ status: 404 })
  async getSubjectEnrollments(
    @Param("subjectId") subjectId: string,
    @Req() req: JwtRequest,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const requesterId = req.user?.sub ?? "";
    const requesterRole = req.user?.role ?? "";
    return this.getSubjectEnrollmentsUC.execute(
      subjectId,
      requesterId,
      requesterRole,
      { status },
      { page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) },
    );
  }

  @Post("subjects/:subjectId/enrollments/batch")
  @Roles("TEACHER")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Batch enroll multiple students in a subject (TEACHER only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  @ApiResponse({ status: 404 })
  async batchEnroll(
    @Param("subjectId") subjectId: string,
    @Body() dto: BatchEnrollDto,
    @Req() req: JwtRequest,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.batchEnrollUC.execute(subjectId, teacherId, dto.studentIds);
  }

  @Patch("enrollments/:enrollmentId/status")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Change enrollment status (TEACHER: own courses only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409, description: "Period is not active" })
  async updateEnrollmentStatus(
    @Param("enrollmentId") enrollmentId: string,
    @Body() dto: UpdateEnrollmentStatusDto,
    @Req() req: JwtRequest,
  ) {
    const requesterId = req.user?.sub ?? "";
    const requesterRole = req.user?.role ?? "";
    return this.updateEnrollmentStatusUC.execute(
      enrollmentId,
      dto.status,
      requesterId,
      requesterRole,
    );
  }

  @Get("students/me/subjects")
  @Roles("STUDENT")
  @ApiOperation({ summary: "Get authenticated student's enrolled subjects" })
  @ApiResponse({ status: 200 })
  async getMyEnrolledSubjects(
    @Req() req: JwtRequest,
    @Query("periodId") periodId?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException("Missing student identity");
    return this.getStudentSubjectsUC.execute(
      studentId,
      { periodId, status },
      { page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) },
    );
  }

  // ─── Weekly check-ins (Phase 5) ─────────────────────────────────────────────

  @Get("students/me/subjects/:subjectId/check-ins/current")
  @Roles("STUDENT")
  @ApiOperation({ summary: "Get the authenticated student's check-in for the current academic week" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Student is not actively enrolled in this subject" })
  async getCurrentCheckIn(@Param("subjectId") subjectId: string, @Req() req: JwtRequest) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException("Missing student identity");
    return this.getCurrentCheckInUC.execute(studentId, subjectId);
  }

  @Post("students/me/subjects/:subjectId/check-ins")
  @Roles("STUDENT")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create or update (upsert) the current week's check-in" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Student is not actively enrolled in this subject" })
  @ApiResponse({ status: 409, description: "No active academic period" })
  async upsertCheckIn(
    @Param("subjectId") subjectId: string,
    @Body() dto: CreateCheckInDto,
    @Req() req: JwtRequest,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException("Missing student identity");
    return this.upsertCheckInUC.execute(studentId, subjectId, dto);
  }

  @Put("students/me/subjects/:subjectId/check-ins/:checkInId")
  @Roles("STUDENT")
  @ApiOperation({ summary: "Update an existing check-in owned by the authenticated student" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Check-in does not belong to this student" })
  @ApiResponse({ status: 404 })
  async updateCheckIn(
    @Param("checkInId") checkInId: string,
    @Body() dto: UpdateCheckInDto,
    @Req() req: JwtRequest,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException("Missing student identity");
    return this.updateCheckInUC.execute(checkInId, studentId, dto);
  }

  @Get("students/me/subjects/:subjectId/check-ins")
  @Roles("STUDENT")
  @ApiOperation({ summary: "List the authenticated student's check-in history for a subject" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Student is not actively enrolled in this subject" })
  async listCheckIns(
    @Param("subjectId") subjectId: string,
    @Req() req: JwtRequest,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const studentId = req.user?.sub;
    if (!studentId) throw new UnauthorizedException("Missing student identity");
    return this.listCheckInsUC.execute(studentId, subjectId, {
      page: parseInt(page ?? "1", 10),
      limit: parseInt(limit ?? "20", 10),
    });
  }

  @Get("subjects/:subjectId/check-ins/summary")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Aggregated weekly check-in averages for a subject (TEACHER owner)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  async getCheckInsSummary(@Param("subjectId") subjectId: string, @Req() req: JwtRequest) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.getCheckInsSummaryUC.execute(subjectId, teacherId);
  }

  // ─── Evaluations ──────────────────────────────────────────────────────────────

  @Post("evaluations")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "RF-008: Create evaluation for a subject (legacy — subjectId in body)" })
  @ApiResponse({ status: 201 })
  async createEvaluation(@Body() dto: CreateEvaluationDto) {
    return this.createEvaluationUC.execute(dto);
  }

  // ─── Evaluations (Phase 4) ─────────────────────────────────────────────────

  @Get("subjects/:subjectId/evaluations/weight-summary")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Get weight summary for a subject's evaluations" })
  @ApiResponse({ status: 200 })
  async getWeightSummary(@Param("subjectId") subjectId: string) {
    return this.getWeightSummaryUC.execute(subjectId);
  }

  @Get("subjects/:subjectId/evaluations")
  @Roles("TEACHER", "ADMIN", "STUDENT")
  @ApiOperation({ summary: "List evaluations for a subject (STUDENT requires active enrollment)" })
  @ApiResponse({ status: 200 })
  async listEvaluations(
    @Param("subjectId") subjectId: string,
    @Req() req: JwtRequest,
  ) {
    const requesterId = req.user?.sub ?? "";
    const requesterRole = req.user?.role ?? "";
    return this.listEvaluationsUC.execute(subjectId, requesterId, requesterRole);
  }

  @Post("subjects/:subjectId/evaluations")
  @Roles("TEACHER")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create evaluation for a subject (TEACHER owner, subjectId from URL)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: "Weight would exceed 100%" })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  async createSubjectEvaluation(
    @Param("subjectId") subjectId: string,
    @Body() dto: SubjectEvaluationDto,
    @Req() req: JwtRequest,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.createEvaluationUC.execute(
      { name: dto.name, weight: dto.weight, subjectId, dueDate: dto.dueDate },
      subjectId,
    );
  }

  @Put("evaluations/:evaluationId")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Update evaluation name/weight/dueDate (TEACHER owner)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: "Weight would exceed 100%" })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async updateEvaluation(
    @Param("evaluationId") evaluationId: string,
    @Body() dto: UpdateEvaluationDto,
    @Req() req: JwtRequest,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.updateEvaluationUC.execute(evaluationId, teacherId, dto);
  }

  @Patch("evaluations/:evaluationId/status")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Archive or reactivate an evaluation (TEACHER owner, no grade deletion)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async toggleEvaluationStatus(
    @Param("evaluationId") evaluationId: string,
    @Body() dto: ToggleEvaluationStatusDto,
    @Req() req: JwtRequest,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.archiveEvaluationUC.execute(evaluationId, teacherId, dto.isActive);
  }

  // ─── Grade import (Phase 4) ────────────────────────────────────────────────

  @Post("subjects/:subjectId/grade-imports")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Import grades from XLSX/CSV for a specific subject (TEACHER owner)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: "Missing columns or invalid rows" })
  @ApiResponse({ status: 403, description: "Teacher does not own this course" })
  @ApiResponse({ status: 409, description: "Period inactive" })
  @ApiResponse({ status: 413, description: "File too large" })
  @ApiResponse({ status: 415, description: "Unsupported file type" })
  @UseInterceptors(FileInterceptor("file"))
  async importSubjectGrades(
    @Param("subjectId") subjectId: string,
    @UploadedFile() file: MulterUploadedFile,
    @Req() req: JwtRequest,
  ) {
    if (!file?.buffer) throw new BadRequestException("Se requiere un archivo");
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException("Missing teacher identity");
    return this.importSubjectGradesUC.execute(
      subjectId,
      teacherId,
      file.buffer,
      file.originalname,
      file.size,
      file.mimetype,
    );
  }

  @Get("subjects/:subjectId/grade-imports")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "List grade import history for a subject" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  async listGradeImports(
    @Param("subjectId") subjectId: string,
    @Req() req: JwtRequest,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const requesterId = req.user?.sub ?? "";
    const requesterRole = req.user?.role ?? "";
    return this.listGradeImportsUC.execute(
      subjectId,
      requesterId,
      requesterRole,
      { page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) },
    );
  }

  @Get("grade-imports/:importId")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Get grade import detail including per-row errors" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async getGradeImport(
    @Param("importId") importId: string,
    @Req() req: JwtRequest,
  ) {
    const requesterId = req.user?.sub ?? "";
    const requesterRole = req.user?.role ?? "";
    return this.getGradeImportUC.execute(importId, requesterId, requesterRole);
  }

  // ─── Grades ───────────────────────────────────────────────────────────────────

  @Post("grades")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "RF-008: Register grade for student/subject" })
  @ApiResponse({ status: 201 })
  async registerGrade(@Body() dto: RegisterGradeDto, @Req() req: JwtRequest) {
    const registeredBy = req.user?.sub ?? "system";
    return this.registerGradeUC.execute(dto, registeredBy);
  }

  @Post("grades/evaluation")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Record grade for a student evaluation" })
  @ApiResponse({ status: 201 })
  async recordGrade(@Body() dto: RecordGradeDto, @Req() req: JwtRequest) {
    const registeredBy = req.user?.sub ?? "system";
    return this.recordGradeUC.execute(dto, registeredBy);
  }

  @Put("grades/:id")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "RF-012: Update grade with audit history" })
  async updateGrade(
    @Param("id") id: string,
    @Body() dto: UpdateGradeDto,
    @Req() req: JwtRequest,
  ) {
    const updatedBy = req.user?.sub ?? "system";
    return this.updateGradeUC.execute(id, dto, updatedBy);
  }

  // ─── Teacher assignment ───────────────────────────────────────────────────────

  @Post("teachers/assign")
  @Roles("ADMIN")
  @ApiOperation({ summary: "RF-011: Assign teacher to subject" })
  async assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.assignTeacherUC.execute(dto);
  }

  // ─── Grade import ─────────────────────────────────────────────────────────────

  @Post("import/grades")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "RF-013: Import grades from CSV/XLSX" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async importGrades(
    @UploadedFile() file: MulterUploadedFile,
    @Req() req: JwtRequest,
  ) {
    if (!file?.buffer) throw new BadRequestException("File is required");
    const registeredBy = req.user?.sub ?? "system";
    return this.importGradesUC.execute(file.buffer, registeredBy);
  }

  // ─── Faculties ───────────────────────────────────────────────────────────────

  @Get("faculties")
  @ApiOperation({ summary: "List all faculties" })
  @ApiResponse({ status: 200 })
  async listFaculties() {
    return this.listFacultiesUC.execute();
  }

  @Get("faculties/:id")
  @ApiOperation({ summary: "Get faculty by ID" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getFaculty(@Param("id") id: string) {
    return this.getFacultyUC.execute(id);
  }

  @Post("faculties")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new faculty (ADMIN only)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.createFacultyUC.execute(dto);
  }

  @Put("faculties/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update faculty data (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateFaculty(@Param("id") id: string, @Body() dto: UpdateFacultyDto) {
    return this.updateFacultyUC.execute(id, dto);
  }

  @Patch("faculties/:id/status")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Change faculty status (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async changeFacultyStatus(
    @Param("id") id: string,
    @Body() dto: ChangeFacultyStatusDto,
  ) {
    return this.changeFacultyStatusUC.execute(id, dto.status);
  }

  @Delete("faculties/:id")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a faculty (ADMIN only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  async deleteFaculty(@Param("id") id: string) {
    return this.deleteFacultyUC.execute(id);
  }

  // ─── Academic Periods ────────────────────────────────────────────────────────

  @Get("periods")
  @ApiOperation({ summary: "List all academic periods" })
  @ApiResponse({ status: 200 })
  async listPeriods() {
    return this.listAcademicPeriodsUC.execute();
  }

  @Get("periods/active")
  @ApiOperation({ summary: "Get the currently active academic period" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getActivePeriod() {
    return this.getActivePeriodUC.execute();
  }

  @Get("periods/:id")
  @ApiOperation({ summary: "Get academic period by ID" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getPeriod(@Param("id") id: string) {
    return this.getAcademicPeriodUC.execute(id);
  }

  @Post("periods")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new academic period (ADMIN only)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  async createPeriod(@Body() dto: CreateAcademicPeriodDto) {
    return this.createAcademicPeriodUC.execute(dto);
  }

  @Put("periods/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update academic period (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updatePeriod(@Param("id") id: string, @Body() dto: UpdateAcademicPeriodDto) {
    return this.updateAcademicPeriodUC.execute(id, dto);
  }

  @Patch("periods/:id/status")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Change academic period status (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 409 })
  async changePeriodStatus(
    @Param("id") id: string,
    @Body() dto: ChangeAcademicPeriodStatusDto,
  ) {
    return this.changeAcademicPeriodStatusUC.execute(id, dto.status);
  }

  @Delete("periods/:id")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an academic period (ADMIN only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  async deletePeriod(@Param("id") id: string) {
    return this.deleteAcademicPeriodUC.execute(id);
  }

  // ─── Careers ─────────────────────────────────────────────────────────────────

  @Get("careers")
  @ApiOperation({ summary: "List all careers" })
  @ApiResponse({ status: 200 })
  async listCareers(@Query("facultyId") facultyId?: string) {
    return this.listCareersUC.execute(facultyId);
  }

  @Get("careers/:id")
  @ApiOperation({ summary: "Get career by ID" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getCareer(@Param("id") id: string) {
    return this.getCareerUC.execute(id);
  }

  @Post("careers")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new career (ADMIN only)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async createCareer(@Body() dto: CreateCareerDto) {
    return this.createCareerUC.execute(dto);
  }

  @Put("careers/:id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update career data (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateCareer(@Param("id") id: string, @Body() dto: UpdateCareerDto) {
    return this.updateCareerUC.execute(id, dto);
  }

  @Patch("careers/:id/status")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Change career status (ADMIN only)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async changeCareerStatus(
    @Param("id") id: string,
    @Body() dto: ChangeCareerStatusDto,
  ) {
    return this.changeCareerStatusUC.execute(id, dto.status);
  }

  @Delete("careers/:id")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a career (ADMIN only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  async deleteCareer(@Param("id") id: string) {
    return this.deleteCareerUC.execute(id);
  }

  // ─── Subjects ─────────────────────────────────────────────────────────────

  @Get("subjects")
  @ApiOperation({ summary: "List subjects" })
  @ApiResponse({ status: 200 })
  async listSubjects(
    @Query("careerId") careerId?: string,
    @Query("periodId") periodId?: string,
  ) {
    return this.listSubjectsUC.execute({ careerId, periodId });
  }

  @Get("subjects/:id")
  @ApiOperation({ summary: "Get subject by ID" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getSubject(@Param("id") id: string) {
    return this.getSubjectUC.execute(id);
  }

  @Post("subjects")
  @Roles("TEACHER")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new subject (TEACHER only)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async createSubject(@Body() dto: CreateSubjectDto, @Req() req: JwtRequest) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException('Missing teacher identity');
    return this.createSubjectUC.execute(dto, teacherId);
  }

  @Get("teachers/me/subjects")
  @Roles("TEACHER")
  @ApiOperation({ summary: "Get authenticated teacher's subjects with pagination" })
  @ApiResponse({ status: 200 })
  async getMySubjects(
    @Req() req: JwtRequest,
    @Query("periodId") periodId?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const teacherId = req.user?.sub;
    if (!teacherId) throw new UnauthorizedException('Missing teacher identity');
    return this.getTeacherSubjectsUC.execute(
      teacherId,
      { periodId, status },
      { page: parseInt(page ?? '1', 10), limit: parseInt(limit ?? '20', 10) },
    );
  }

  @Put("subjects/:id")
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "Update subject data (ADMIN or TEACHER)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateSubject(@Param("id") id: string, @Body() dto: UpdateSubjectDto) {
    return this.updateSubjectUC.execute(id, dto);
  }

  @Patch("subjects/:id/status")
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "Change subject active status (ADMIN or TEACHER)" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async changeSubjectStatus(
    @Param("id") id: string,
    @Body() dto: ChangeSubjectStatusDto,
  ) {
    return this.changeSubjectStatusUC.execute(id, dto.isActive);
  }

  @Delete("subjects/:id")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a subject (ADMIN only)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  async deleteSubject(@Param("id") id: string) {
    return this.deleteSubjectUC.execute(id);
  }
}
