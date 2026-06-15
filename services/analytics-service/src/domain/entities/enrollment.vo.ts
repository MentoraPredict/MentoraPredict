export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName?: string;
  subjectCredits: number;
  periodId: string;
  status: string;
}
