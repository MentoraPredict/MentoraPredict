import { SessionAttendanceEntity } from '../../../domain/entities/session-attendance.entity';

export interface ISessionAttendanceRepository {
  findBySession(sessionId: string): Promise<SessionAttendanceEntity[]>;
  upsert(attendance: SessionAttendanceEntity): Promise<void>;
  upsertMany(attendances: SessionAttendanceEntity[]): Promise<void>;
}
