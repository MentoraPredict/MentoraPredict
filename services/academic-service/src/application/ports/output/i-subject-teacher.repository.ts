import { SubjectTeacherEntity } from '../../../domain/entities/subject-teacher.entity';

export interface TeacherSubjectRawRow {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  maxCapacity: number;
  isActive: boolean;
  careerId: string;
  careerName: string;
  careerCode: string;
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  periodId: string;
  periodName: string;
  periodCode: string;
  periodStatus: string;
  periodStartDate: Date;
  periodEndDate: Date;
  enrolledCount: number;
}

export interface ISubjectTeacherRepository {
  findBySubjectTeacherAndPeriod(
    subjectId: string, teacherId: string, periodId: string,
  ): Promise<SubjectTeacherEntity | null>;
  save(assignment: SubjectTeacherEntity): Promise<SubjectTeacherEntity>;
  findByTeacherIdWithDetails(
    teacherId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: TeacherSubjectRawRow[]; total: number }>;
}
