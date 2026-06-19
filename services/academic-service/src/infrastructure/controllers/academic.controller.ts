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
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
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

// Faculty DTOs
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

// Academic Period DTOs
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

// Career DTOs
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

// Subject DTOs
import { CreateSubjectDto } from "../../application/dtos/create-subject.dto";
import { UpdateSubjectDto } from "../../application/dtos/update-subject.dto";
import { ChangeSubjectStatusDto } from "../../application/dtos/change-subject-status.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("academic-service")
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
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
  ) {}

  @Post("enrollments")
  @ApiOperation({ summary: "RF-007: Enroll student in a subject" })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: "Already enrolled" })
  async enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollStudentUC.execute(dto);
  }

  @Post("evaluations")
  @ApiOperation({ summary: "RF-008: Create evaluation for a subject" })
  @ApiResponse({ status: 201 })
  async createEvaluation(@Body() dto: CreateEvaluationDto) {
    return this.createEvaluationUC.execute(dto);
  }

  @Post("grades")
  @ApiOperation({ summary: "RF-008: Register grade for student/subject" })
  @ApiResponse({ status: 201 })
  async registerGrade(@Body() dto: RegisterGradeDto) {
    return this.registerGradeUC.execute(dto, "system");
  }

  @Post("grades/evaluation")
  @ApiOperation({ summary: "Record grade for a student evaluation" })
  @ApiResponse({ status: 201 })
  async recordGrade(@Body() dto: RecordGradeDto) {
    return this.recordGradeUC.execute(dto, "system");
  }

  @Put("grades/:id")
  @ApiOperation({ summary: "RF-012: Update grade with audit history" })
  async updateGrade(@Param("id") id: string, @Body() dto: UpdateGradeDto) {
    return this.updateGradeUC.execute(id, dto, "system");
  }

  @Post("teachers/assign")
  @ApiOperation({ summary: "RF-011: Assign teacher to subject" })
  async assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.assignTeacherUC.execute(dto);
  }

  @Post("import/grades")
  @ApiOperation({ summary: "RF-013: Import grades from CSV/XLSX" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async importGrades(@UploadedFile() file: MulterUploadedFile) {
    if (!file?.buffer) throw new BadRequestException("File is required");
    return this.importGradesUC.execute(file.buffer, "system");
  }

  // ─── Faculties ───────────────────────────────────────────────────────────────

  @Get("faculties")
  @ApiOperation({ summary: "List all faculties" })
  @ApiResponse({ status: 200, description: "Returns list of all faculties" })
  async listFaculties() {
    return this.listFacultiesUC.execute();
  }

  @Get("faculties/:id")
  @ApiOperation({ summary: "Get faculty by ID" })
  @ApiResponse({ status: 200, description: "Returns the faculty" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  async getFaculty(@Param("id") id: string) {
    return this.getFacultyUC.execute(id);
  }

  @Post("faculties")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new faculty" })
  @ApiResponse({ status: 201, description: "Faculty created successfully" })
  @ApiResponse({ status: 409, description: "Faculty with same code or name already exists" })
  async createFaculty(@Body() dto: CreateFacultyDto) {
    return this.createFacultyUC.execute(dto);
  }

  @Put("faculties/:id")
  @ApiOperation({ summary: "Update faculty data" })
  @ApiResponse({ status: 200, description: "Faculty updated successfully" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 409, description: "Code or name conflict with existing faculty" })
  async updateFaculty(@Param("id") id: string, @Body() dto: UpdateFacultyDto) {
    return this.updateFacultyUC.execute(id, dto);
  }

  @Patch("faculties/:id/status")
  @ApiOperation({ summary: "Change faculty status (ACTIVE / INACTIVE)" })
  @ApiResponse({ status: 200, description: "Faculty status updated" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  async changeFacultyStatus(
    @Param("id") id: string,
    @Body() dto: ChangeFacultyStatusDto,
  ) {
    return this.changeFacultyStatusUC.execute(id, dto.status);
  }

  @Delete("faculties/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a faculty (only if no associated careers)" })
  @ApiResponse({ status: 204, description: "Faculty deleted" })
  @ApiResponse({ status: 400, description: "Cannot delete faculty with associated careers" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  async deleteFaculty(@Param("id") id: string) {
    return this.deleteFacultyUC.execute(id);
  }

  // ─── Academic Periods ────────────────────────────────────────────────────────

  @Get("periods")
  @ApiOperation({ summary: "List all academic periods" })
  @ApiResponse({ status: 200, description: "Returns list of all academic periods" })
  async listPeriods() {
    return this.listAcademicPeriodsUC.execute();
  }

  @Get("periods/active")
  @ApiOperation({ summary: "Get the currently active academic period" })
  @ApiResponse({ status: 200, description: "Returns the active period" })
  @ApiResponse({ status: 404, description: "No active period found" })
  async getActivePeriod() {
    return this.getActivePeriodUC.execute();
  }

  @Get("periods/:id")
  @ApiOperation({ summary: "Get academic period by ID" })
  @ApiResponse({ status: 200, description: "Returns the academic period" })
  @ApiResponse({ status: 404, description: "Academic period not found" })
  async getPeriod(@Param("id") id: string) {
    return this.getAcademicPeriodUC.execute(id);
  }

  @Post("periods")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new academic period" })
  @ApiResponse({ status: 201, description: "Academic period created successfully" })
  @ApiResponse({ status: 400, description: "Invalid date range" })
  @ApiResponse({ status: 409, description: "Period with same code or name already exists" })
  async createPeriod(@Body() dto: CreateAcademicPeriodDto) {
    return this.createAcademicPeriodUC.execute(dto);
  }

  @Put("periods/:id")
  @ApiOperation({ summary: "Update academic period data" })
  @ApiResponse({ status: 200, description: "Academic period updated successfully" })
  @ApiResponse({ status: 404, description: "Academic period not found" })
  @ApiResponse({ status: 409, description: "Code or name conflict" })
  async updatePeriod(@Param("id") id: string, @Body() dto: UpdateAcademicPeriodDto) {
    return this.updateAcademicPeriodUC.execute(id, dto);
  }

  @Patch("periods/:id/status")
  @ApiOperation({ summary: "Change academic period status (PLANNED / ACTIVE / FINISHED / CANCELLED)" })
  @ApiResponse({ status: 200, description: "Status updated" })
  @ApiResponse({ status: 409, description: "Another period is already active" })
  async changePeriodStatus(
    @Param("id") id: string,
    @Body() dto: ChangeAcademicPeriodStatusDto,
  ) {
    return this.changeAcademicPeriodStatusUC.execute(id, dto.status);
  }

  @Delete("periods/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an academic period (only if no associated records)" })
  @ApiResponse({ status: 204, description: "Academic period deleted" })
  @ApiResponse({ status: 400, description: "Cannot delete period with associated records" })
  @ApiResponse({ status: 404, description: "Academic period not found" })
  async deletePeriod(@Param("id") id: string) {
    return this.deleteAcademicPeriodUC.execute(id);
  }

  // ─── Careers ─────────────────────────────────────────────────────────────────

  @Get("careers")
  @ApiOperation({ summary: "List all careers, optionally filtered by facultyId" })
  @ApiResponse({ status: 200, description: "Returns list of careers" })
  async listCareers(@Query('facultyId') facultyId?: string) {
    return this.listCareersUC.execute(facultyId);
  }

  @Get("careers/:id")
  @ApiOperation({ summary: "Get career by ID" })
  @ApiResponse({ status: 200, description: "Returns the career" })
  @ApiResponse({ status: 404, description: "Career not found" })
  async getCareer(@Param("id") id: string) {
    return this.getCareerUC.execute(id);
  }

  @Post("careers")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new career" })
  @ApiResponse({ status: 201, description: "Career created successfully" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 409, description: "Career with same code already exists" })
  async createCareer(@Body() dto: CreateCareerDto) {
    return this.createCareerUC.execute(dto);
  }

  @Put("careers/:id")
  @ApiOperation({ summary: "Update career data" })
  @ApiResponse({ status: 200, description: "Career updated successfully" })
  @ApiResponse({ status: 404, description: "Career not found" })
  @ApiResponse({ status: 409, description: "Code conflict with existing career" })
  async updateCareer(@Param("id") id: string, @Body() dto: UpdateCareerDto) {
    return this.updateCareerUC.execute(id, dto);
  }

  @Patch("careers/:id/status")
  @ApiOperation({ summary: "Change career status (ACTIVE / INACTIVE)" })
  @ApiResponse({ status: 200, description: "Career status updated" })
  @ApiResponse({ status: 404, description: "Career not found" })
  async changeCareerStatus(
    @Param("id") id: string,
    @Body() dto: ChangeCareerStatusDto,
  ) {
    return this.changeCareerStatusUC.execute(id, dto.status);
  }

  @Delete("careers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a career (only if no associated subjects)" })
  @ApiResponse({ status: 204, description: "Career deleted" })
  @ApiResponse({ status: 400, description: "Cannot delete career with associated subjects" })
  @ApiResponse({ status: 404, description: "Career not found" })
  async deleteCareer(@Param("id") id: string) {
    return this.deleteCareerUC.execute(id);
  }

  // ─── Subjects ─────────────────────────────────────────────────────────────

  @Get("subjects")
  @ApiOperation({ summary: "List all subjects, optionally filtered by careerId and/or periodId" })
  @ApiResponse({ status: 200, description: "Returns list of subjects" })
  async listSubjects(
    @Query('careerId') careerId?: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.listSubjectsUC.execute({ careerId, periodId });
  }

  @Get("subjects/:id")
  @ApiOperation({ summary: "Get subject by ID" })
  @ApiResponse({ status: 200, description: "Returns the subject" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  async getSubject(@Param("id") id: string) {
    return this.getSubjectUC.execute(id);
  }

  @Post("subjects")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new subject" })
  @ApiResponse({ status: 201, description: "Subject created successfully" })
  @ApiResponse({ status: 400, description: "Period not active" })
  @ApiResponse({ status: 404, description: "Career or period not found" })
  @ApiResponse({ status: 409, description: "Subject with same name in period or same code already exists" })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return this.createSubjectUC.execute(dto);
  }

  @Put("subjects/:id")
  @ApiOperation({ summary: "Update subject data" })
  @ApiResponse({ status: 200, description: "Subject updated successfully" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  async updateSubject(@Param("id") id: string, @Body() dto: UpdateSubjectDto) {
    return this.updateSubjectUC.execute(id, dto);
  }

  @Patch("subjects/:id/status")
  @ApiOperation({ summary: "Change subject active status" })
  @ApiResponse({ status: 200, description: "Subject status updated" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  async changeSubjectStatus(
    @Param("id") id: string,
    @Body() dto: ChangeSubjectStatusDto,
  ) {
    return this.changeSubjectStatusUC.execute(id, dto.isActive);
  }

  @Delete("subjects/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a subject (only if no academic records)" })
  @ApiResponse({ status: 204, description: "Subject deleted" })
  @ApiResponse({ status: 400, description: "Cannot delete subject with academic records" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  async deleteSubject(@Param("id") id: string) {
    return this.deleteSubjectUC.execute(id);
  }
}
