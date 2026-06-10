import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
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

@ApiTags("academic-service")
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
}
