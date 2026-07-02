import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../../application/ports/output/i-topic.repository';
import { TopicOrmEntity } from './topic.orm-entity';

@Injectable()
export class TopicRepository implements ITopicRepository {
  constructor(
    @InjectRepository(TopicOrmEntity)
    private readonly repo: Repository<TopicOrmEntity>,
  ) {}

  async findById(id: string): Promise<TopicEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findBySubjectIdOrdered(subjectId: string): Promise<TopicEntity[]> {
    const list = await this.repo.find({
      where: { subjectId },
      order: { order: 'ASC' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async save(t: TopicEntity): Promise<TopicEntity> {
    const saved = await this.repo.save(this.toOrm(t));
    return this.toDomain(saved);
  }

  async update(t: TopicEntity): Promise<TopicEntity> {
    await this.repo.save(this.toOrm(t));
    return t;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain = (o: TopicOrmEntity): TopicEntity =>
    new TopicEntity(
      o.id,
      o.subjectId,
      o.title,
      o.description,
      o.order,
      o.fileUrl,
      o.originalFileName,
      o.fileSize,
      o.mimeType,
      o.createdAt,
      o.updatedAt,
    );

  private toOrm(d: TopicEntity): TopicOrmEntity {
    const o = new TopicOrmEntity();
    o.id = d.id;
    o.subjectId = d.subjectId;
    o.title = d.title;
    o.description = d.description;
    o.order = d.order;
    o.fileUrl = d.fileUrl;
    o.originalFileName = d.originalFileName;
    o.fileSize = d.fileSize;
    o.mimeType = d.mimeType;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
