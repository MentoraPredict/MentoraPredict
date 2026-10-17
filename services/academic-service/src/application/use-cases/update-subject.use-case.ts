import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  maxCapacity?: number;
  teacherId?: string | null;
}

@Injectable()
export class UpdateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, dto: UpdateSubjectDto): Promise<SubjectEntity> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede modificar una materia de un periodo inactivo');
    }

    // name/description pertenecen al catálogo (subject_catalog) —
    // se editan ahí, no en la oferta. Como el catálogo puede estar
    // compartido por otra oferta de un período distinto, el cambio se
    // refleja en todas ellas, que es exactamente el punto de tener un
    // catálogo único (ver docs/database/database-update-plan.md §5.1).
    if (dto.name !== undefined || dto.description !== undefined) {
      const catalog = await this.catalogRepo.findById(subject.subjectCatalogId);
      if (!catalog) {
        throw new NotFoundException(`Subject catalog entry '${subject.subjectCatalogId}' not found`);
      }
      if (dto.name !== undefined) catalog.name = dto.name;
      if (dto.description !== undefined) catalog.description = dto.description;
      catalog.updatedAt = new Date();
      await this.catalogRepo.update(catalog);

      if (dto.name !== undefined) subject.name = dto.name;
      if (dto.description !== undefined) subject.description = dto.description;
    }

    if (dto.maxCapacity !== undefined) subject.maxCapacity = dto.maxCapacity;
    if (dto.teacherId !== undefined) subject.teacherId = dto.teacherId;

    subject.updatedAt = new Date();
    return this.repo.update(subject);
  }
}
