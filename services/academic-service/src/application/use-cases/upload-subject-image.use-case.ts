import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { MulterMemoryFile, deletePhysicalFileByPublicUrl, saveImageToDisk, validateImage } from '../../infrastructure/storage/upload.util';

@Injectable()
export class UploadSubjectImageUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, teacherId: string, file: MulterMemoryFile | undefined): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const { isOwner } = await this.checkOwnershipUC.execute(subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    validateImage(file);

    // Delete the old physical file first — never accumulate orphans.
    if (subject.imageUrl) {
      deletePhysicalFileByPublicUrl(subject.imageUrl);
    }

    const { publicUrl } = saveImageToDisk('subjects', file as MulterMemoryFile);
    subject.setImage(publicUrl);
    return this.subjectRepo.update(subject);
  }
}
