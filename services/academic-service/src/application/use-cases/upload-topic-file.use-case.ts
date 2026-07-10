import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import {
  MulterMemoryFile,
  deletePhysicalFileByPublicUrl,
  saveTopicFileToDisk,
  validateTopicFile,
} from '../../infrastructure/storage/upload.util';

interface MulterFileWithName extends MulterMemoryFile {
  originalname: string;
}

@Injectable()
export class UploadTopicFileUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(topicId: string, teacherId: string, file: MulterFileWithName | undefined): Promise<TopicEntity> {
    const topic = await this.topicRepo.findById(topicId);
    if (!topic) throw new NotFoundException('Tema no encontrado');

    const { isOwner } = await this.checkOwnershipUC.execute(topic.subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    validateTopicFile(file);

    // Delete the old physical file first — never accumulate orphans, same
    // replacement pattern as subject image / avatar (Fase 10).
    if (topic.fileUrl) {
      deletePhysicalFileByPublicUrl(topic.fileUrl);
    }

    const uploaded = file as MulterFileWithName;
    const { publicUrl } = saveTopicFileToDisk('topics', uploaded);
    topic.setFile({
      fileUrl: publicUrl,
      originalFileName: uploaded.originalname,
      fileSize: uploaded.size,
      mimeType: uploaded.mimetype,
    });
    return this.topicRepo.update(topic);
  }
}
