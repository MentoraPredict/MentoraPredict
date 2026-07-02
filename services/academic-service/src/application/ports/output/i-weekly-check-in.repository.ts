import { WeeklyCheckInEntity } from '../../../domain/entities/weekly-check-in.entity';

export interface CheckInWeekSummaryRow {
  academicWeek: number;
  academicYear: number;
  avgAttendance: number;
  avgTaskCompletion: number;
  avgStudyHours: number;
  avgGeneralComprehension: number;
  responseCount: number;
}

export interface UpsertCheckInResult {
  checkIn: WeeklyCheckInEntity;
  wasCreated: boolean;
}

export interface IWeeklyCheckInRepository {
  findById(id: string): Promise<WeeklyCheckInEntity | null>;
  findByStudentSubjectWeek(
    studentId: string,
    subjectId: string,
    academicWeek: number,
    academicYear: number,
  ): Promise<WeeklyCheckInEntity | null>;
  findLatestByStudentSubject(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<WeeklyCheckInEntity | null>;
  findByStudentSubjectPaginated(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: WeeklyCheckInEntity[]; total: number }>;
  getWeeklySummaryBySubject(subjectId: string): Promise<CheckInWeekSummaryRow[]>;
  // Atomic upsert on (studentId, subjectId, academicWeek, academicYear) via ON CONFLICT — avoids
  // a findOne+save race when a student double-submits the same week's check-in concurrently.
  upsert(checkIn: WeeklyCheckInEntity): Promise<UpsertCheckInResult>;
  update(checkIn: WeeklyCheckInEntity): Promise<WeeklyCheckInEntity>;
}
