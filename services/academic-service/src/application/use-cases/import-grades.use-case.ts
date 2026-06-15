import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { RegisterGradeUseCase } from './register-grade.use-case';
import { RegisterGradeDto } from '../dtos/register-grade.dto';
import { GradeEntity } from '../../domain/entities/grade.entity';

const REQUIRED_COLUMNS = ['studentId', 'subjectId', 'grade'] as const;

@Injectable()
export class ImportGradesUseCase {
  constructor(
    private readonly registerGradeUC: RegisterGradeUseCase,
  ) {}

  async execute(fileBuffer: Buffer, registeredBy: string): Promise<{ imported: number; grades: GradeEntity[] }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new BadRequestException('File has no worksheets');

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (rows.length === 0) throw new BadRequestException('File has no data rows');

    const headers = Object.keys(rows[0]);
    for (const col of REQUIRED_COLUMNS) {
      if (!headers.includes(col)) {
        throw new BadRequestException(`Missing required column: ${col}`);
      }
    }

    const grades: GradeEntity[] = [];
    for (const row of rows) {
      const dto: RegisterGradeDto = {
        studentId: String(row.studentId).trim(),
        subjectId: String(row.subjectId).trim(),
        grade: Number(row.grade),
      };
      if (!dto.studentId || !dto.subjectId || Number.isNaN(dto.grade)) {
        throw new BadRequestException('Invalid row data in import file');
      }
      grades.push(await this.registerGradeUC.execute(dto, registeredBy));
    }

    return { imported: grades.length, grades };
  }
}
