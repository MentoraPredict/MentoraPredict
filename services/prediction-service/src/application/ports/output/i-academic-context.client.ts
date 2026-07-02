export interface AcademicContext {
  studentId: string;
  periodId: string;
  subjects: Array<{
    subjectId: string;
    name: string;
    currentGrade: number | null;
    credits: number;
  }>;
}

export interface IAcademicContextClient {
  getStudentContext(studentId: string, periodId: string): Promise<AcademicContext>;
}
