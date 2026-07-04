import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';

@Injectable()
export class ListTopicsUseCase {
  constructor(
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, requesterId: string, requesterRole: string): Promise<TopicEntity[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    if (requesterRole === 'TEACHER') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, requesterId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    } else if (requesterRole === 'STUDENT') {
      const enrollment = await this.enrollmentRepo.findByStudentAndSubject(requesterId, subjectId);
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new ForbiddenException('No estás matriculado activo en este curso');
      }
    }

    return this.topicRepo.findBySubjectIdOrdered(subjectId);
  }
}
