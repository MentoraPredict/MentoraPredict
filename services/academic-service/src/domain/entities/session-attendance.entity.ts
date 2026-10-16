export type AttendanceRecordedBy = 'STUDENT_SELF_REPORT' | 'TEACHER';

export class SessionAttendanceEntity {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    public present: boolean,
    public recordedBy: AttendanceRecordedBy,
    public recordedAt: Date,
  ) {}
}
