import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IImageStoragePort } from '../ports/output/i-image-storage.port';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';

@Injectable()
export class DeleteSubjectImageUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IImageStoragePort') private readonly imageStorage: IImageStoragePort,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, callerId: string, callerRole: string): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, callerId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    if (subject.imageUrl) {
      await this.imageStorage.deleteByPublicUrl(subject.imageUrl);
      subject.clearImage();
      await this.subjectRepo.update(subject);
    }

    return subject;
  }
}
