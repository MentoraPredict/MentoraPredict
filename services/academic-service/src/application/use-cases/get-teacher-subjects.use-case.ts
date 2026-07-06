import { Inject, Injectable } from '@nestjs/common';
import {
  ISubjectTeacherRepository,
  TeacherSubjectRawRow,
} from '../ports/output/i-subject-teacher.repository';

export interface TeacherSubjectItem {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  maxCapacity: number;
  isActive: boolean;
  career: { id: string; name: string; code: string };
  faculty: { id: string; name: string; code: string };
  period: {
    id: string;
    name: string;
    code: string;
    status: string;
    startDate: Date;
    endDate: Date;
  };
  enrolledCount: number;
}

export interface PaginatedTeacherSubjects {
  data: TeacherSubjectItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetTeacherSubjectsUseCase {
  constructor(
    @Inject('ISubjectTeacherRepository')
    private readonly repo: ISubjectTeacherRepository,
  ) {}

  async execute(
    teacherId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ): Promise<PaginatedTeacherSubjects> {
    const { items, total } = await this.repo.findByTeacherIdWithDetails(
      teacherId,
      filters,
      pagination,
    );

    const data: TeacherSubjectItem[] = items.map((row: TeacherSubjectRawRow) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      credits: row.credits,
      maxCapacity: row.maxCapacity,
      isActive: row.isActive,
      career: { id: row.careerId, name: row.careerName, code: row.careerCode },
      faculty: { id: row.facultyId, name: row.facultyName, code: row.facultyCode },
      period: {
        id: row.periodId,
        name: row.periodName,
        code: row.periodCode,
        status: row.periodStatus,
        startDate: row.periodStartDate,
        endDate: row.periodEndDate,
      },
      enrolledCount: row.enrolledCount,
    }));

    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
