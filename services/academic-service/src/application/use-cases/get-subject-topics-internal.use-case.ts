import { Inject, Injectable } from '@nestjs/common';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../ports/output/i-topic.repository';

// Internal (service-to-service) read of a subject's syllabus — no
// enrollment/ownership check, unlike ListTopicsUseCase, since the trust
// boundary here is the InternalServiceGuard, not an end-user request.
@Injectable()
export class GetSubjectTopicsInternalUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
  ) {}

  execute(subjectId: string): Promise<TopicEntity[]> {
    return this.topicRepo.findBySubjectIdOrdered(subjectId);
  }
}
