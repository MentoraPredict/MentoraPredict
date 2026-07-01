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
  ForbiddenException,
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
import { GetStudentEnrollmentsUseCase } from "../../application/use-cases/get-student-enrollments.use-case";
import { GetSubjectEnrollmentsUseCase } from "../../application/use-cases/get-subject-enrollments.use-case";
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
import { CreateSubjectDto } from "../../application/dtos/create-subject.dto";
import { UpdateSubjectDto } from "../../application/dtos/update-subject.dto";
import { ChangeSubjectStatusDto } from "../../application/dtos/change-subject-status.dto";

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
    private readonly getStudentEnrollmentsUC: GetStudentEnrollmentsUseCase,
    private readonly getSubjectEnrollmentsUC: GetSubjectEnrollmentsUseCase,
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
  ) {}

  // ─── Enrollments ──────────────────────────────────────────────────────────────

  @Post("enrollments")
  @Roles("ADMIN", "TEACHER")
  @ApiOperation({ summary: "RF-007: Enroll student in a subject" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: "Already enrolled" })
  async enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollStudentUC.execute(dto);
  }

  @Get("enrollments")
  @Roles("ADMIN", "TEACHER", "STUDENT")
  @ApiOperation({ summary: "List enrollments by student" })
  @ApiResponse({ status: 200 })
  async listEnrollments(
    @Req() req: JwtRequest,
    @Query("studentId") studentId?: string,
    @Query("subjectId") subjectId?: string,
  ) {
    const caller = req.user;
    if (!caller?.sub) throw new UnauthorizedException("Invalid authorization token");

    if (subjectId) {
      if (caller.role === "STUDENT") {
        throw new ForbiddenException("Students cannot list subject enrollments");
      }

      return this.getSubjectEnrollmentsUC.execute(subjectId);
    }

    const targetStudentId = studentId ?? caller.sub;

    if (caller.role === "STUDENT" && targetStudentId !== caller.sub) {
      throw new ForbiddenException("Students can only list their own enrollments");
    }

    if (!targetStudentId) {
      throw new BadRequestException("studentId is required");
    }

    return this.getStudentEnrollmentsUC.execute(targetStudentId);
  }

  // ─── Evaluations ──────────────────────────────────────────────────────────────

  @Post("evaluations")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "RF-008: Create evaluation for a subject" })
  @ApiResponse({ status: 201 })
  async createEvaluation(@Body() dto: CreateEvaluationDto) {
    return this.createEvaluationUC.execute(dto);
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
  @Roles("ADMIN", "TEACHER")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new subject (ADMIN or TEACHER)" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return this.createSubjectUC.execute(dto);
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
