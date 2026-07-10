import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { INotificationClientPort } from '../ports/output/i-notification-client.port';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  credits: number;
  careerId: string;
  maxCapacity?: number;
}

@Injectable()
export class CreateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ICareerRepository')
    private readonly careerRepo: ICareerRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('INotificationClientPort')
    private readonly notificationClient: INotificationClientPort,
    @Inject('IUserProfilePort')
    private readonly userProfilePort: IUserProfilePort,
  ) {}

  async execute(dto: CreateSubjectDto, teacherId: string): Promise<SubjectEntity> {
    const activePeriod = await this.periodRepo.findActive();
    if (!activePeriod) {
      throw new ConflictException(
        'No hay un periodo académico activo. Contacta al administrador.',
      );
    }

    const career = await this.careerRepo.findById(dto.careerId);
    if (!career) {
      throw new NotFoundException(`Career with id '${dto.careerId}' not found`);
    }

    const existingByNamePeriod = await this.subjectRepo.findByNameAndPeriod(
      dto.name,
      activePeriod.id,
    );
    if (existingByNamePeriod) {
      throw new ConflictException(
        `Ya existe una materia con el nombre '${dto.name}' en el periodo académico activo. Elige otro nombre.`,
      );
    }

    const normalizedCode = dto.code.trim().toUpperCase();
    const existingByCode = await this.subjectRepo.findByCode(normalizedCode);
    if (existingByCode) {
      throw new ConflictException(
        `El código '${normalizedCode}' ya está en uso por la materia '${existingByCode.name}'. Elige un código distinto.`,
      );
    }

    const now = new Date();
    const subject = new SubjectEntity(
      randomUUID(),
      dto.name,
      dto.description ?? '',
      normalizedCode,
      dto.credits,
      dto.careerId,
      activePeriod.id,
      dto.maxCapacity ?? 30,
      teacherId,
      true,
      now,
      now,
    );

    const saved = await this.subjectRepo.save(subject);

    await this.subjectTeacherRepo.save(
      new SubjectTeacherEntity(saved.id, teacherId, activePeriod.id),
    );

    const teacherProfile = await this.userProfilePort.getProfile(teacherId).catch(() => null);
    const teacherName = teacherProfile
      ? `${teacherProfile.firstName} ${teacherProfile.lastName}`.trim()
      : null;

    void this.notificationClient.notify({
      broadcastToRole: 'ADMIN',
      type: 'COURSE_CREATED',
      title: 'Nuevo curso creado',
      message: teacherName
        ? `${teacherName} creó el curso ${saved.name}.`
        : `Se creó el curso ${saved.name}.`,
    });

    return saved;
  }
}
