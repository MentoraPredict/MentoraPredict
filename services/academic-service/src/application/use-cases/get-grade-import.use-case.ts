import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGradeImportRepository } from '../ports/output/i-grade-import.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';

@Injectable()
export class GetGradeImportUseCase {
  constructor(
    @Inject('IGradeImportRepository') private readonly importRepo: IGradeImportRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
  ) {}

  async execute(importId: string, requesterId: string, requesterRole: string) {
    const gradeImport = await this.importRepo.findById(importId);
    if (!gradeImport) throw new NotFoundException('Registro de importación no encontrado');

    if (requesterRole === 'TEACHER') {
      const subject = await this.subjectRepo.findById(gradeImport.subjectId);
      if (!subject) throw new NotFoundException('Materia no encontrada');
      const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
        gradeImport.subjectId,
        requesterId,
        subject.academicPeriodId,
      );
      if (!assignment) throw new ForbiddenException('No tienes acceso a este registro');
    }

    return {
      importId: gradeImport.id,
      subjectId: gradeImport.subjectId,
      importedBy: gradeImport.importedBy,
      fileName: gradeImport.fileName,
      fileSize: gradeImport.fileSize,
      status: gradeImport.status,
      summary: {
        total: gradeImport.totalRows,
        created: gradeImport.createdRows,
        updated: gradeImport.updatedRows,
        unchanged: gradeImport.unchangedRows,
        failed: gradeImport.failedRows,
      },
      errors: gradeImport.errors,
      createdAt: gradeImport.createdAt,
    };
  }
}
