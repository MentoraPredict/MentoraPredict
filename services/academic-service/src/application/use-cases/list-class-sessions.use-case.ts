import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import { IClassSessionRepository } from '../ports/output/i-class-session.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';

@Injectable()
export class ListClassSessionsUseCase {
  constructor(
    @Inject('IClassSessionRepository') private readonly sessionRepo: IClassSessionRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, callerId: string, callerRole: string): Promise<ClassSessionEntity[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException(`Subject with id '${subjectId}' not found`);

    if (callerRole === 'TEACHER') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, callerId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    return this.sessionRepo.findBySubjectId(subjectId);
  }
}
