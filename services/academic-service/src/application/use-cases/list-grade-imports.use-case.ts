import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGradeImportRepository } from '../ports/output/i-grade-import.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';

@Injectable()
export class ListGradeImportsUseCase {
  constructor(
    @Inject('IGradeImportRepository') private readonly importRepo: IGradeImportRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
  ) {}

  async execute(
    subjectId: string,
    requesterId: string,
    requesterRole: string,
    pagination: { page: number; limit: number },
  ) {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    if (requesterRole === 'TEACHER') {
      const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
        subjectId,
        requesterId,
        subject.academicPeriodId,
      );
      if (!assignment) throw new ForbiddenException('No tienes acceso a este curso');
    }

    const { items, total } = await this.importRepo.findBySubjectIdPaginated(subjectId, pagination);
    return {
      data: items.map((imp) => ({
        importId: imp.id,
        subjectId: imp.subjectId,
        importedBy: imp.importedBy,
        fileName: imp.fileName,
        fileSize: imp.fileSize,
        status: imp.status,
        summary: {
          total: imp.totalRows,
          created: imp.createdRows,
          updated: imp.updatedRows,
          unchanged: imp.unchangedRows,
          failed: imp.failedRows,
        },
        createdAt: imp.createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
}
