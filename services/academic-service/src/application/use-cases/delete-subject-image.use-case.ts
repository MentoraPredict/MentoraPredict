import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { deletePhysicalFileByPublicUrl } from '../../infrastructure/storage/upload.util';

@Injectable()
export class DeleteSubjectImageUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, teacherId: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const { isOwner } = await this.checkOwnershipUC.execute(subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    if (subject.imageUrl) {
      deletePhysicalFileByPublicUrl(subject.imageUrl);
      subject.clearImage();
      await this.subjectRepo.update(subject);
    }

    return subject;
  }
}
