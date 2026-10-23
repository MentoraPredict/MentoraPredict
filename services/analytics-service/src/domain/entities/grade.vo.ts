export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName?: string;
  value: number;
  periodId: string;
  evaluationId: string | null;
}
