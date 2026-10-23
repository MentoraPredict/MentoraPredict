import {
  CurriculumSubject,
  GradeLevel,
  Section,
  SectionSummary,
} from '../../../domain/entities/academic-structure.entity';

export const ACADEMIC_STRUCTURE_REPOSITORY_TOKEN = 'IAcademicStructureRepository';

export interface IAcademicStructureRepository {
  listGradeLevels(): Promise<GradeLevel[]>;
  findGradeLevel(code: string): Promise<GradeLevel | null>;

  listSections(filters: {
    schoolYearId?: string;
    gradeLevelCode?: string;
  }): Promise<SectionSummary[]>;
  findSection(id: string): Promise<Section | null>;
  findSectionByKey(
    schoolYearId: string,
    gradeLevelCode: string,
    name: string,
  ): Promise<Section | null>;
  saveSection(section: Section): Promise<Section>;
  deleteSection(id: string): Promise<void>;
  countSectionCourses(sectionId: string): Promise<number>;
  listOfferedCatalogIds(sectionId: string): Promise<string[]>;

  getCurriculum(gradeLevelCode: string): Promise<CurriculumSubject[]>;
  replaceCurriculum(gradeLevelCode: string, items: CurriculumSubject[]): Promise<CurriculumSubject[]>;
}
