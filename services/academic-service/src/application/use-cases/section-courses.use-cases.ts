import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { IGradingRepository } from '../ports/output/i-grading.repository';

export interface SectionCourseView {
  id: string;
  name: string;
  code: string;
  teacherId: string | null;
}

@Injectable()
export class ListSectionCoursesUseCase {
  constructor(
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
  ) {}

  /** Asignaturas de un paralelo con su docente, para asignarlo desde el panel. */
  async execute(sectionId: string): Promise<SectionCourseView[]> {
    if (!(await this.structure.findSection(sectionId))) {
      throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);
    }
    const courses = await this.grading.listSectionCourses(sectionId);
    return courses.map(({ id, name, code, teacherId }) => ({ id, name, code, teacherId }));
  }
}
