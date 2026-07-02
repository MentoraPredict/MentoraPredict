export type GradeImportStatus = 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';

export interface GradeImportError {
  row: number;
  studentId: string | null;
  evaluationId: string | null;
  value: number | null;
  reason: string;
}

export class GradeImportEntity {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly importedBy: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly totalRows: number,
    public readonly createdRows: number,
    public readonly updatedRows: number,
    public readonly unchangedRows: number,
    public readonly failedRows: number,
    public readonly status: GradeImportStatus,
    public readonly errors: GradeImportError[],
    public readonly createdAt: Date,
  ) {}
}
