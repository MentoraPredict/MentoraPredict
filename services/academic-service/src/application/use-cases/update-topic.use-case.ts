import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { UpdateTopicDto } from '../dtos/update-topic.dto';

@Injectable()
export class UpdateTopicUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(topicId: string, teacherId: string, dto: UpdateTopicDto): Promise<TopicEntity> {
    const topic = await this.topicRepo.findById(topicId);
    if (!topic) throw new NotFoundException('Tema no encontrado');

    const { isOwner } = await this.checkOwnershipUC.execute(topic.subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    topic.update(dto);
    return this.topicRepo.update(topic);
  }
}
