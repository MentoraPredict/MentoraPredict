import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TeacherObservationEntity, ObservationType,
} from '../../domain/entities/teacher-observation.entity';
import { ITeacherObservationRepository } from '../../application/ports/output/i-teacher-observation.repository';
import { TeacherObservationDoc } from './teacher-observation.schema';

@Injectable()
export class TeacherObservationRepository implements ITeacherObservationRepository {
  constructor(
    @InjectModel(TeacherObservationDoc.name) private readonly model: Model<TeacherObservationDoc>,
  ) {}

  async save(observation: TeacherObservationEntity): Promise<TeacherObservationEntity> {
    await this.model.create({
      _id: observation.id,
      studentId: observation.studentId,
      teacherId: observation.teacherId,
      subjectId: observation.subjectId,
      type: observation.type,
      content: observation.content,
    });
    return observation;
  }

  async findByStudentId(studentId: string): Promise<TeacherObservationEntity[]> {
    const docs = await this.model.find({ studentId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => new TeacherObservationEntity(
      d._id,
      d.studentId,
      d.teacherId,
      d.subjectId,
      d.type as ObservationType,
      d.content,
      (d as unknown as { createdAt: Date }).createdAt ?? new Date(),
    ));
  }
}
