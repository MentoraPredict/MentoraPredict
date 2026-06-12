import { Inject, Injectable } from '@nestjs/common';
import { TeacherObservationEntity } from '../../domain/entities/teacher-observation.entity';
import { ITeacherObservationRepository } from '../ports/output/i-teacher-observation.repository';

@Injectable()
export class GetObservationsByStudentUseCase {
  constructor(
    @Inject('ITeacherObservationRepository') private readonly repo: ITeacherObservationRepository,
  ) {}

  async execute(studentId: string): Promise<TeacherObservationEntity[]> {
    return this.repo.findByStudentId(studentId);
  }
}
