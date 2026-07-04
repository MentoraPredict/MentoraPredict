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

export interface EnrollmentView {
  studentId: string;
  subjectId: string;
  periodId: string;
  status: string;
}

export interface SubjectOwnership {
  isOwner: boolean;
}

export interface IAcademicContextClient {
  getStudentContext(studentId: string, periodId: string): Promise<AcademicContext>;
  getEnrollmentsByStudent(studentId: string): Promise<EnrollmentView[]>;
  getSubjectOwnership(teacherId: string, subjectId: string): Promise<SubjectOwnership>;
}
