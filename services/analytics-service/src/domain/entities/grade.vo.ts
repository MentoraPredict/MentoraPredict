export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName?: string;
  subjectCredits: number;
  value: number;
  periodId: string;
  evaluationId: string | null;
}
