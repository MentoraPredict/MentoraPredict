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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AssignCourseTeacherUseCase,
  CreateSectionCourseUseCase,
  CreateSectionUseCase,
  DeleteSectionUseCase,
  GenerateSectionCoursesUseCase,
  GetCurriculumUseCase,
  ListGradeLevelsUseCase,
  ListSectionsUseCase,
  SetCurriculumUseCase,
  UpdateSectionUseCase,
  UpdateSubjectCatalogUseCase,
} from '../../application/use-cases/academic-structure.use-cases';
import { ListSectionCoursesUseCase } from '../../application/use-cases/section-courses.use-cases';
import {
  AssignCourseTeacherDto,
  CreateSectionCourseDto,
  CreateSectionDto,
  SetCurriculumDto,
  UpdateSectionDto,
  UpdateSubjectCatalogDto,
} from '../../application/dtos/academic-structure.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

@ApiTags('academic-structure')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/academic')
export class AcademicStructureController {
  constructor(
    private readonly listGradeLevelsUC: ListGradeLevelsUseCase,
    private readonly listSectionsUC: ListSectionsUseCase,
    private readonly createSectionUC: CreateSectionUseCase,
    private readonly updateSectionUC: UpdateSectionUseCase,
    private readonly deleteSectionUC: DeleteSectionUseCase,
    private readonly getCurriculumUC: GetCurriculumUseCase,
    private readonly setCurriculumUC: SetCurriculumUseCase,
    private readonly generateCoursesUC: GenerateSectionCoursesUseCase,
    private readonly createSectionCourseUC: CreateSectionCourseUseCase,
    private readonly assignTeacherUC: AssignCourseTeacherUseCase,
    private readonly updateCatalogUC: UpdateSubjectCatalogUseCase,
    private readonly listSectionCoursesUC: ListSectionCoursesUseCase,
  ) {}

  @Get('grade-levels')
  @ApiOperation({ summary: 'Official grades with their level and whether the institution offers it' })
  @ApiResponse({ status: 200 })
  async listGradeLevels() {
    return this.listGradeLevelsUC.execute();
  }

  @Get('grade-levels/:code/curriculum')
  @ApiOperation({ summary: 'Subjects and weekly hours of a grade (curriculum)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getCurriculum(@Param('code') code: string) {
    return this.getCurriculumUC.execute(code);
  }

  @Put('grade-levels/:code/curriculum')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Replace the curriculum of a grade (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async setCurriculum(@Param('code') code: string, @Body() dto: SetCurriculumDto) {
    return this.setCurriculumUC.execute(code, dto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'List sections (paralelos) with their course count' })
  @ApiQuery({ name: 'schoolYearId', required: false })
  @ApiQuery({ name: 'gradeLevelCode', required: false })
  @ApiResponse({ status: 200 })
  async listSections(
    @Query('schoolYearId') schoolYearId?: string,
    @Query('gradeLevelCode') gradeLevelCode?: string,
  ) {
    return this.listSectionsUC.execute({ schoolYearId, gradeLevelCode });
  }

  @Post('sections')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a section (ADMIN only)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  async createSection(@Body() dto: CreateSectionDto) {
    return this.createSectionUC.execute(dto);
  }

  @Put('sections/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a section (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.updateSectionUC.execute(id, dto);
  }

  @Delete('sections/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a section without courses (ADMIN only)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409 })
  async deleteSection(@Param('id') id: string) {
    return this.deleteSectionUC.execute(id);
  }

  @Post('sections/:id/generate-courses')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create the courses of a section from its grade curriculum (ADMIN only)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  async generateCourses(@Param('id') id: string) {
    return this.generateCoursesUC.execute(id);
  }

  @Get('sections/:id/courses')
  @Roles('ADMIN', 'SECRETARY')
  @ApiOperation({ summary: 'Courses of a section with their assigned teacher' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async listSectionCourses(@Param('id') id: string) {
    return this.listSectionCoursesUC.execute(id);
  }

  @Post('sections/:id/courses')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Offer one subject in a section (ADMIN only)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  async createSectionCourse(@Param('id') id: string, @Body() dto: CreateSectionCourseDto) {
    return this.createSectionCourseUC.execute(id, dto);
  }

  @Patch('subjects/:id/teacher')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign or clear the teacher of a course (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  async assignTeacher(@Param('id') id: string, @Body() dto: AssignCourseTeacherDto) {
    return this.assignTeacherUC.execute(id, dto);
  }

  @Put('subject-catalog/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a catalog subject (ADMIN only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateCatalog(@Param('id') id: string, @Body() dto: UpdateSubjectCatalogDto) {
    return this.updateCatalogUC.execute(id, dto);
  }
}
