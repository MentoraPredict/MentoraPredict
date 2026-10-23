import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CurriculumSubject,
  GradeLevel,
  Section,
  SectionSummary,
} from '../../domain/entities/academic-structure.entity';
import { Shift } from '../../domain/entities/institution-config.entity';
import { IAcademicStructureRepository } from '../../application/ports/output/i-academic-structure.repository';
import {
  CurriculumSubjectOrmEntity,
  GradeLevelOrmEntity,
  SectionOrmEntity,
} from './academic-structure.orm-entities';
import { SubjectOrmEntity } from './subject.orm-entity';

@Injectable()
export class AcademicStructureRepository implements IAcademicStructureRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async listGradeLevels(): Promise<GradeLevel[]> {
    const list = await this.ds
      .getRepository(GradeLevelOrmEntity)
      .find({ order: { sortOrder: 'ASC' } });
    return list.map(this.toGradeLevel);
  }

  async findGradeLevel(code: string): Promise<GradeLevel | null> {
    const o = await this.ds.getRepository(GradeLevelOrmEntity).findOne({ where: { code } });
    return o ? this.toGradeLevel(o) : null;
  }

  async listSections(filters: {
    schoolYearId?: string;
    gradeLevelCode?: string;
  }): Promise<SectionSummary[]> {
    const base = this.ds
      .getRepository(SectionOrmEntity)
      .createQueryBuilder('s')
      .orderBy('s.gradeLevelCode', 'ASC')
      .addOrderBy('s.name', 'ASC');
    if (filters.schoolYearId) {
      base.andWhere('s.schoolYearId = :y', { y: filters.schoolYearId });
    }
    if (filters.gradeLevelCode) {
      base.andWhere('s.gradeLevelCode = :g', { g: filters.gradeLevelCode });
    }

    const sections = await base.getMany();
    if (sections.length === 0) return [];

    const counts: { section_id: string; total: string }[] = await this.ds
      .getRepository(SubjectOrmEntity)
      .createQueryBuilder('sub')
      .select('sub.section_id', 'section_id')
      .addSelect('COUNT(*)', 'total')
      .where('sub.section_id IN (:...ids)', { ids: sections.map((s) => s.id) })
      .groupBy('sub.section_id')
      .getRawMany();
    const byId = new Map(counts.map((c) => [c.section_id, Number(c.total)]));

    return sections.map((s) => ({ ...this.toSection(s), courseCount: byId.get(s.id) ?? 0 }));
  }

  async findSection(id: string): Promise<Section | null> {
    const o = await this.ds.getRepository(SectionOrmEntity).findOne({ where: { id } });
    return o ? this.toSection(o) : null;
  }

  async findSectionByKey(
    schoolYearId: string,
    gradeLevelCode: string,
    name: string,
  ): Promise<Section | null> {
    const o = await this.ds
      .getRepository(SectionOrmEntity)
      .findOne({ where: { schoolYearId, gradeLevelCode, name } });
    return o ? this.toSection(o) : null;
  }

  async saveSection(section: Section): Promise<Section> {
    const repo = this.ds.getRepository(SectionOrmEntity);
    await repo.save(repo.create(section));
    const saved = await repo.findOneByOrFail({ id: section.id });
    return this.toSection(saved);
  }

  async deleteSection(id: string): Promise<void> {
    await this.ds.getRepository(SectionOrmEntity).delete(id);
  }

  async countSectionCourses(sectionId: string): Promise<number> {
    return this.ds.getRepository(SubjectOrmEntity).count({ where: { sectionId } });
  }

  async listOfferedCatalogIds(sectionId: string): Promise<string[]> {
    const rows = await this.ds
      .getRepository(SubjectOrmEntity)
      .find({ where: { sectionId }, select: { subjectCatalogId: true } });
    return rows.map((r) => r.subjectCatalogId);
  }

  async getCurriculum(gradeLevelCode: string): Promise<CurriculumSubject[]> {
    const list = await this.ds
      .getRepository(CurriculumSubjectOrmEntity)
      .find({ where: { gradeLevelCode } });
    return list.map((c) => ({
      gradeLevelCode: c.gradeLevelCode,
      subjectCatalogId: c.subjectCatalogId,
      weeklyHours: c.weeklyHours,
    }));
  }

  async replaceCurriculum(
    gradeLevelCode: string,
    items: CurriculumSubject[],
  ): Promise<CurriculumSubject[]> {
    await this.ds.transaction(async (em) => {
      const repo = em.getRepository(CurriculumSubjectOrmEntity);
      await repo.delete({ gradeLevelCode });
      await repo.save(
        items.map((i) =>
          repo.create({
            gradeLevelCode,
            subjectCatalogId: i.subjectCatalogId,
            weeklyHours: i.weeklyHours,
          }),
        ),
      );
    });
    return this.getCurriculum(gradeLevelCode);
  }

  private toGradeLevel = (o: GradeLevelOrmEntity): GradeLevel => ({
    code: o.code,
    levelCode: o.levelCode,
    name: o.name,
    ordinal: o.ordinal,
    sortOrder: o.sortOrder,
  });

  private toSection = (o: SectionOrmEntity): Section => ({
    id: o.id,
    schoolYearId: o.schoolYearId,
    gradeLevelCode: o.gradeLevelCode,
    name: o.name,
    shift: o.shift as Shift,
    capacity: o.capacity,
    tutorId: o.tutorId,
    isActive: o.isActive,
  });
}
