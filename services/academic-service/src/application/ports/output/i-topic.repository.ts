import { TopicEntity } from '../../../domain/entities/topic.entity';

export interface ITopicRepository {
  findById(id: string): Promise<TopicEntity | null>;
  findBySubjectIdOrdered(subjectId: string): Promise<TopicEntity[]>;
  save(topic: TopicEntity): Promise<TopicEntity>;
  update(topic: TopicEntity): Promise<TopicEntity>;
  delete(id: string): Promise<void>;
}
