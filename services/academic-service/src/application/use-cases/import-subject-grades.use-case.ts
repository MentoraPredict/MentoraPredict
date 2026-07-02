import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as XLSX from 'xlsx';
import { GradeEntity } from '../../domain/entities/grade.entity';
import { GradeHistoryEntity } from '../../domain/entities/grade-history.entity';
import {
  GradeImportEntity,
  GradeImportError,
  GradeImportStatus,
} from '../../domain/entities/grade-import.entity';
import { IGradeRepository } from '../ports/output/i-grade.repository';
import { IGradeHistoryRepository } from '../ports/output/i-grade-history.repository';
import { IGradeImportRepository } from '../ports/output/i-grade-import.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { IAnalyticsClientPort } from '../ports/output/i-analytics-client.port';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]);
const REQUIRED_COLS = ['studentId', 'evaluationId', 'value'] as const;

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export interface ImportGradeResult {
  importId: string;
  subjectId: string;
  importedBy: string;
  processedAt: string;
  summary: {
    total: number;
    created: number;
    updated: number;
    unchanged: number;
    failed: number;
  };
  errors: GradeImportError[];
}

@Injectable()
export class ImportSubjectGradesUseCase {
  private readonly logger = new Logger(ImportSubjectGradesUseCase.name);

  constructor(
    @Inject('IGradeRepository') private readonly gradeRepo: IGradeRepository,
    @Inject('IGradeHistoryRepository') private readonly historyRepo: IGradeHistoryRepository,
    @Inject('IGradeImportRepository') private readonly importRepo: IGradeImportRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('IAnalyticsClientPort') private readonly analyticsClient: IAnalyticsClientPort,
  ) {}

  async execute(
    subjectId: string,
    teacherId: string,
    fileBuffer: Buffer,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ): Promise<ImportGradeResult> {
    // 1. MIME type validation
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new HttpException(
        `Tipo de archivo no permitido. Aceptados: xlsx, csv. Recibido: ${mimeType}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    // 2. Size validation
    if (fileSize > MAX_FILE_SIZE) {
      throw new HttpException(
        `Archivo demasiado grande. Máximo: 5 MB. Recibido: ${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    // 3. Subject exists and teacher owns it
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject || !subject.isActive) {
      throw new NotFoundException('Materia no encontrada o inactiva');
    }

    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    if (!assignment) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    // 4. Period must be active
    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede importar notas en un periodo inactivo');
    }

    // 5. Parse file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) {
      throw new BadRequestException('El archivo no contiene hojas de cálculo');
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    if (rows.length === 0) {
      throw new BadRequestException('El archivo no tiene filas de datos');
    }

    // 6. Required columns check
    const headers = Object.keys(rows[0]);
    const missingCols = REQUIRED_COLS.filter((col) => !headers.includes(col));
    if (missingCols.length > 0) {
      throw new BadRequestException(`Columnas faltantes en el archivo: ${missingCols.join(', ')}`);
    }

    const hasSubjectIdCol = headers.includes('subjectId');

    // Pre-load all evaluations for this subject once
    const evaluations = await this.evalRepo.findBySubjectId(subjectId);
    const evalMap = new Map(evaluations.map((e) => [e.id, e]));

    const errors: GradeImportError[] = [];
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    const changedStudentIds = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const rawStudentId = row.studentId != null ? String(row.studentId).trim() : null;
      const rawEvalId = row.evaluationId != null ? String(row.evaluationId).trim() : null;
      const rawValue = row.value != null ? Number(row.value) : null;

      // Optional cross-check: subjectId column in file must match URL param
      if (hasSubjectIdCol && row.subjectId != null) {
        const fileSubjectId = String(row.subjectId).trim();
        if (fileSubjectId !== subjectId) {
          errors.push({
            row: rowNum,
            studentId: rawStudentId,
            evaluationId: rawEvalId,
            value: rawValue,
            reason: `subjectId en la fila (${fileSubjectId}) no coincide con el curso importado (${subjectId})`,
          });
          continue;
        }
      }

      // Validate studentId
      if (!rawStudentId || !isUUID(rawStudentId)) {
        errors.push({ row: rowNum, studentId: rawStudentId, evaluationId: rawEvalId, value: rawValue, reason: 'studentId inválido o no es un UUID' });
        continue;
      }

      // Validate evaluationId
      if (!rawEvalId || !isUUID(rawEvalId)) {
        errors.push({ row: rowNum, studentId: rawStudentId, evaluationId: rawEvalId, value: rawValue, reason: 'evaluationId inválido o no es un UUID' });
        continue;
      }

      // Validate value range
      if (rawValue === null || Number.isNaN(rawValue) || rawValue < 0 || rawValue > 10) {
        errors.push({ row: rowNum, studentId: rawStudentId, evaluationId: rawEvalId, value: rawValue, reason: 'value debe estar entre 0 y 10 (inclusive)' });
        continue;
      }

      // Validate evaluation belongs to this subject
      if (!evalMap.has(rawEvalId)) {
        errors.push({ row: rowNum, studentId: rawStudentId, evaluationId: rawEvalId, value: rawValue, reason: 'evaluationId no pertenece a este curso' });
        continue;
      }

      // Validate student has ACTIVE enrollment in this subject/period
      const enrollment = await this.enrollmentRepo.findByStudentSubjectAndPeriod(
        rawStudentId,
        subjectId,
        subject.academicPeriodId,
      );
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        errors.push({ row: rowNum, studentId: rawStudentId, evaluationId: rawEvalId, value: rawValue, reason: 'Estudiante no está matriculado activo en este curso' });
        continue;
      }

      // Upsert grade with idempotency
      try {
        const existing = await this.gradeRepo.findByStudentAndEvaluation(rawStudentId, rawEvalId);

        if (existing) {
          if (existing.value === rawValue) {
            unchanged++;
          } else {
            const previousValue = existing.value;
            existing.update(rawValue);
            await this.gradeRepo.update(existing);
            await this.historyRepo.save(
              new GradeHistoryEntity(randomUUID(), existing.id, previousValue, rawValue, teacherId, new Date()),
            );
            updated++;
            changedStudentIds.add(rawStudentId);
          }
        } else {
          const now = new Date();
          const grade = new GradeEntity(
            randomUUID(),
            rawStudentId,
            subjectId,
            rawValue,
            teacherId,
            now,
            now,
            now,
            rawEvalId,
          );
          await this.gradeRepo.save(grade);
          created++;
          changedStudentIds.add(rawStudentId);
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          studentId: rawStudentId,
          evaluationId: rawEvalId,
          value: rawValue,
          reason: err instanceof Error ? err.message : 'Error interno al procesar la nota',
        });
      }
    }

    const total = rows.length;
    const failed = errors.length;

    let status: GradeImportStatus;
    if (failed === 0) status = 'COMPLETED';
    else if (failed === total) status = 'FAILED';
    else status = 'COMPLETED_WITH_ERRORS';

    const importId = randomUUID();
    const processedAt = new Date();

    await this.importRepo.save(
      new GradeImportEntity(
        importId, subjectId, teacherId, fileName, fileSize,
        total, created, updated, unchanged, failed, status, errors, processedAt,
      ),
    );

    // Fire-and-forget: trigger analytics recalculation for changed students
    const changedIds = [...changedStudentIds];
    if (changedIds.length > 0) {
      this.analyticsClient
        .triggerRecalculate(subjectId, subject.academicPeriodId, changedIds)
        .catch((err) =>
          this.logger.error(`Analytics trigger failed: ${err instanceof Error ? err.message : String(err)}`),
        );
    }

    return {
      importId,
      subjectId,
      importedBy: teacherId,
      processedAt: processedAt.toISOString(),
      summary: { total, created, updated, unchanged, failed },
      errors,
    };
  }
}
