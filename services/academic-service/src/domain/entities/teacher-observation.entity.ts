export enum ObservationType {
  ACADEMIC = 'ACADEMIC',
  BEHAVIORAL = 'BEHAVIORAL',
  ATTENDANCE = 'ATTENDANCE',
  PERFORMANCE = 'PERFORMANCE',
}

export class TeacherObservationEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly subjectId: string,
    public readonly type: ObservationType,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}
}
