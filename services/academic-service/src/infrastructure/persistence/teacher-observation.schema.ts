import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeacherObservationDocument = HydratedDocument<TeacherObservationDoc>;

@Schema({ collection: 'teacher_observations', timestamps: { createdAt: true, updatedAt: false } })
export class TeacherObservationDoc {
  @Prop({ required: true }) _id!: string;
  @Prop({ required: true }) studentId!: string;
  @Prop({ required: true }) teacherId!: string;
  @Prop({ required: true }) subjectId!: string;
  @Prop({ required: true }) type!: string;
  @Prop({ required: true }) content!: string;
}

export const TeacherObservationSchema = SchemaFactory.createForClass(TeacherObservationDoc);
