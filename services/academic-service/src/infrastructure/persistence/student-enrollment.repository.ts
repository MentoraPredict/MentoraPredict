import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  StudentEnrollment,
  StudentEnrollmentStatus,
} from '../../domain/entities/people.entity';
import {
  IStudentEnrollmentRepository,
  SectionCourse,
} from '../../application/ports/output/i-student-enrollment.repository';
import { StudentEnrollmentOrmEntity } from './people.orm-entities';
import { SubjectOrmEntity } from './subject.orm-entity';

@Injectable()
export class StudentEnrollmentRepository implements IStudentEnrollmentRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private get repo() {
    return this.ds.getRepository(StudentEnrollmentOrmEntity);
  }

  async findById(id: string): Promise<StudentEnrollment | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findActive(studentId: string, schoolYearId: string): Promise<StudentEnrollment | null> {
    const o = await this.repo.findOne({ where: { studentId, schoolYearId, status: 'ACTIVE' } });
    return o ? this.toDomain(o) : null;
  }

  async listBySection(
    sectionId: string,
    status?: StudentEnrollmentStatus,
  ): Promise<StudentEnrollment[]> {
    const list = await this.repo.find({
      where: status ? { sectionId, status } : { sectionId },
      order: { enrolledAt: 'ASC' },
    });
    return list.map(this.toDomain);
  }

  async listByStudent(studentId: string): Promise<StudentEnrollment[]> {
    const list = await this.repo.find({ where: { studentId }, order: { enrolledAt: 'DESC' } });
    return list.map(this.toDomain);
  }

  countActiveInSection(sectionId: string): Promise<number> {
    return this.repo.count({ where: { sectionId, status: 'ACTIVE' } });
  }

  async save(e: StudentEnrollment): Promise<StudentEnrollment> {
    await this.repo.save(this.repo.create(e));
    return this.toDomain(await this.repo.findOneByOrFail({ id: e.id }));
  }

  async update(e: StudentEnrollment): Promise<StudentEnrollment> {
    return this.save(e);
  }

  async listSectionCourses(sectionId: string): Promise<SectionCourse[]> {
    const rows = await this.ds.getRepository(SubjectOrmEntity).find({
      where: { sectionId },
      select: { id: true, academicPeriodId: true },
    });
    return rows.map((r) => ({ id: r.id, academicPeriodId: r.academicPeriodId }));
  }

  async withdrawCourseEnrollments(studentId: string, sectionId: string): Promise<number> {
    const result = await this.ds.query(
      `UPDATE enrollments e SET status = 'WITHDRAWN'
         FROM subjects s
        WHERE s.id = e.subject_id AND s.section_id = $1
          AND e.student_id = $2 AND e.status = 'ACTIVE'`,
      [sectionId, studentId],
    );
    // pg devuelve [filas, conteo] en UPDATE con TypeORM
    return Array.isArray(result) ? Number(result[1] ?? 0) : 0;
  }

  private toDomain = (o: StudentEnrollmentOrmEntity): StudentEnrollment => ({
    id: o.id,
    studentId: o.studentId,
    sectionId: o.sectionId,
    schoolYearId: o.schoolYearId,
    status: o.status as StudentEnrollmentStatus,
    enrolledAt: o.enrolledAt,
    endedAt: o.endedAt,
    notes: o.notes,
  });
}
