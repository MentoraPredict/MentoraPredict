import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { CreateTopicDto } from '../dtos/create-topic.dto';

@Injectable()
export class CreateTopicUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, teacherId: string, dto: CreateTopicDto): Promise<TopicEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const { isOwner } = await this.checkOwnershipUC.execute(subjectId, teacherId);
    if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');

    const now = new Date();
    const topic = new TopicEntity(
      randomUUID(),
      subjectId,
      dto.title,
      dto.description ?? null,
      dto.order,
      null,
      null,
      null,
      null,
      now,
      now,
    );
    return this.topicRepo.save(topic);
  }
}
