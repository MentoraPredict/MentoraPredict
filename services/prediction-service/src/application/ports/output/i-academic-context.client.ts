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

export interface SubjectGradesContext {
  subjectName: string;
  credits: number;
  currentGrade: number | null;
  failedEvaluations: number;
}

export interface SubjectDetails {
  id: string;
  isActive: boolean;
}

export interface PeriodDetails {
  id: string;
  status: string;
}

export interface IAcademicContextClient {
  getStudentContext(studentId: string, periodId: string): Promise<AcademicContext>;
  getEnrollmentsByStudent(studentId: string): Promise<EnrollmentView[]>;
  getSubjectOwnership(teacherId: string, subjectId: string): Promise<SubjectOwnership>;
  getSubjectGradesContext(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<SubjectGradesContext>;
  getSubjectTopics(subjectId: string): Promise<string[]>;
  // Best-effort — used for reference-table sync (see
  // docs/database/entity-relationship-diagram.md §3) and to skip generating
  // predictions for a subject/period no longer eligible. Return null on any
  // failure so an academic-service hiccup never blocks a recalculation.
  getSubjectDetails(subjectId: string): Promise<SubjectDetails | null>;
  getPeriodDetails(periodId: string): Promise<PeriodDetails | null>;
}
