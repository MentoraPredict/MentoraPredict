export class SubjectTeacherEntity {
  constructor(
    public readonly subjectId: string,
    public readonly teacherId: string,
    public readonly periodId: string,
  ) {}
}
