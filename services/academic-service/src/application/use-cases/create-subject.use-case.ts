import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { INotificationClientPort } from '../ports/output/i-notification-client.port';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { ITeacherRolePort } from '../ports/output/i-teacher-role.port';

export interface CreateSubjectDto {
  subjectCatalogId?: string;
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
  careerId?: string;
  maxCapacity?: number;
  teacherId?: string;
}

@Injectable()
export class CreateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
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
    @Inject('ITeacherRolePort')
    private readonly teacherRolePort: ITeacherRolePort,
  ) {}

  async execute(
    dto: CreateSubjectDto,
    callerId: string,
    callerRole: string,
  ): Promise<SubjectEntity> {
    const teacherId = await this.resolveTeacherId(dto, callerId, callerRole);

    const activePeriod = await this.periodRepo.findActive();
    if (!activePeriod) {
      throw new ConflictException(
        'No hay un periodo académico activo. Contacta al administrador.',
      );
    }

    const catalog = await this.resolveCatalog(dto);

    const existingOffering = await this.subjectRepo.findByCatalogAndPeriod(
      catalog.id,
      activePeriod.id,
    );
    if (existingOffering) {
      throw new ConflictException(
        `La materia '${catalog.name}' ya está ofertada en el periodo académico activo.`,
      );
    }

    const now = new Date();
    const subject = new SubjectEntity(
      randomUUID(),
      catalog.name,
      catalog.description,
      catalog.code,
      catalog.credits,
      catalog.careerId,
      activePeriod.id,
      dto.maxCapacity ?? 30,
      teacherId,
      true,
      now,
      now,
      null,
      catalog.id,
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

  // Reoferta (subjectCatalogId) o crea la materia de catálogo de una vez —
  // mismo comportamiento que antes de separar catálogo/oferta cuando no se
  // envía subjectCatalogId, para no romper a los llamadores actuales.
  private async resolveCatalog(dto: CreateSubjectDto): Promise<SubjectCatalogEntity> {
    if (dto.subjectCatalogId) {
      const catalog = await this.catalogRepo.findById(dto.subjectCatalogId);
      if (!catalog) {
        throw new NotFoundException(`Subject catalog entry '${dto.subjectCatalogId}' not found`);
      }
      return catalog;
    }

    if (!dto.name || !dto.code || dto.credits === undefined || !dto.careerId) {
      throw new BadRequestException(
        'Debes enviar subjectCatalogId (para reofertar una materia existente) o name/code/credits/careerId (para crear una materia nueva).',
      );
    }

    const career = await this.careerRepo.findById(dto.careerId);
    if (!career) {
      throw new NotFoundException(`Career with id '${dto.careerId}' not found`);
    }

    const normalizedCode = dto.code.trim().toUpperCase();
    const existingByCode = await this.catalogRepo.findByCode(normalizedCode);
    if (existingByCode) {
      throw new ConflictException(
        `El código '${normalizedCode}' ya está en uso por la materia '${existingByCode.name}'. Elige un código distinto, o usa subjectCatalogId para reofertarla.`,
      );
    }

    const now = new Date();
    return this.catalogRepo.save(
      new SubjectCatalogEntity(
        randomUUID(),
        dto.name,
        dto.description ?? '',
        normalizedCode,
        dto.credits,
        dto.careerId,
        true,
        now,
        now,
      ),
    );
  }

  // ADMIN must name the real teacher (validated against user-service);
  // TEACHER callers always get their own id — any teacherId in the body is
  // ignored so a teacher can't create courses on someone else's behalf.
  private async resolveTeacherId(
    dto: CreateSubjectDto,
    callerId: string,
    callerRole: string,
  ): Promise<string> {
    if (callerRole !== 'ADMIN') {
      return callerId;
    }

    if (!dto.teacherId) {
      throw new BadRequestException(
        'Debes asignar un docente (teacherId) al crear un curso como administrador.',
      );
    }

    const isTeacher = await this.teacherRolePort.isTeacher(dto.teacherId);
    if (!isTeacher) {
      throw new BadRequestException(
        'El usuario asignado no tiene rol TEACHER.',
      );
    }

    return dto.teacherId;
  }
}
