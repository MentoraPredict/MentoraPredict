import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TeacherObservationEntity } from '../../domain/entities/teacher-observation.entity';
import { ITeacherObservationRepository } from '../ports/output/i-teacher-observation.repository';
import { CreateObservationDto } from '../dtos/create-observation.dto';

@Injectable()
export class CreateObservationUseCase {
  constructor(
    @Inject('ITeacherObservationRepository') private readonly repo: ITeacherObservationRepository,
  ) {}

  async execute(dto: CreateObservationDto, teacherId: string): Promise<TeacherObservationEntity> {
    const observation = new TeacherObservationEntity(
      randomUUID(),
      dto.studentId,
      teacherId,
      dto.subjectId,
      dto.type,
      dto.content,
      new Date(),
    );
    return this.repo.save(observation);
  }
}
