import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { deletePhysicalFileByPublicUrl } from '../../infrastructure/storage/upload.util';

@Injectable()
export class DeleteTopicUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(topicId: string, teacherId: string): Promise<void> {
    const topic = await this.topicRepo.findById(topicId);
    if (!topic) throw new NotFoundException('Tema no encontrado');

    const { isOwner } = await this.checkOwnershipUC.execute(topic.subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    if (topic.fileUrl) {
      deletePhysicalFileByPublicUrl(topic.fileUrl);
    }
    await this.topicRepo.delete(topicId);
  }
}
