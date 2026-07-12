import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IImageStoragePort } from '../ports/output/i-image-storage.port';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { MulterMemoryFile, validateImage } from '../../infrastructure/storage/upload.util';

@Injectable()
export class UploadSubjectImageUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IImageStoragePort') private readonly imageStorage: IImageStoragePort,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(
    subjectId: string,
    callerId: string,
    callerRole: string,
    file: MulterMemoryFile | undefined,
  ): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, callerId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    validateImage(file);

    // Delete the old file first — never accumulate orphans.
    if (subject.imageUrl) {
      await this.imageStorage.deleteByPublicUrl(subject.imageUrl);
    }

    const { publicUrl } = await this.imageStorage.save('subjects', file as MulterMemoryFile);
    subject.setImage(publicUrl);
    return this.subjectRepo.update(subject);
  }
}
