import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { SubjectTeacherEntity } from "../../domain/entities/subject-teacher.entity";
import { ISubjectTeacherRepository } from "../ports/output/i-subject-teacher.repository";
import { ITeacherRolePort } from "../ports/output/i-teacher-role.port";
import { IAcademicPeriodRepository } from "../ports/output/i-academic-period.repository";
import { AssignTeacherDto } from "../dtos/assign-teacher.dto";

@Injectable()
export class AssignTeacherUseCase {
  constructor(
    @Inject("ISubjectTeacherRepository")
    private readonly repo: ISubjectTeacherRepository,
    @Inject("ITeacherRolePort") private readonly teacherRole: ITeacherRolePort,
    @Inject("IAcademicPeriodRepository")
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: AssignTeacherDto): Promise<SubjectTeacherEntity> {
    const period = await this.periodRepo.findById(dto.periodId);
    if (!period || !period.isActive) {
      throw new ConflictException("No se puede asignar un docente en un periodo inactivo");
    }

    const isTeacher = await this.teacherRole.isTeacher(dto.teacherId);
    if (!isTeacher) {
      throw new BadRequestException("User does not have TEACHER role");
    }

    const existing = await this.repo.findBySubjectTeacherAndPeriod(
      dto.subjectId,
      dto.teacherId,
      dto.periodId,
    );
    if (existing) {
      throw new ConflictException(
        "Teacher is already assigned to this subject for the period",
      );
    }

    const assignment = new SubjectTeacherEntity(
      dto.subjectId,
      dto.teacherId,
      dto.periodId,
    );
    return this.repo.save(assignment);
  }
}
