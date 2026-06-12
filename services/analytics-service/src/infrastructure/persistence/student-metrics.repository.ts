import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentMetricsEntity } from '../../domain/entities/student-metrics.entity';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { StudentMetricsOrmEntity } from './student-metrics.orm-entity';

@Injectable()
export class StudentMetricsRepository implements IStudentMetricsRepository {
  constructor(
    @InjectRepository(StudentMetricsOrmEntity)
    private readonly repo: Repository<StudentMetricsOrmEntity>,
  ) {}

  async findByStudentAndPeriod(studentId: string, periodId: string): Promise<StudentMetricsEntity | null> {
    const [o] = await this.repo.find({
      where: { studentId, periodId },
      order: { version: 'DESC' },
      take: 1,
    });
    return o ? this.toDomain(o) : null;
  }

  async findByPeriod(periodId: string): Promise<StudentMetricsEntity[]> {
    // Obtiene la versión más reciente por estudiante para el período dado
    const rows = await this.repo
      .createQueryBuilder('m')
      .where('m.periodId = :periodId', { periodId })
      .distinctOn(['m.studentId'])
      .orderBy('m.studentId')
      .addOrderBy('m.version', 'DESC')
      .getMany();
    return rows.map((o) => this.toDomain(o));
  }

  async save(m: StudentMetricsEntity): Promise<StudentMetricsEntity> {
    const saved = await this.repo.save(this.toOrm(m));
    return this.toDomain(saved);
  }

  private toDomain(o: StudentMetricsOrmEntity): StudentMetricsEntity {
    return new StudentMetricsEntity(
      o.id, o.studentId, o.periodId, o.subjectAverages,
      Number(o.globalAverage), o.calculatedAt, o.version,
    );
  }

  private toOrm(d: StudentMetricsEntity): StudentMetricsOrmEntity {
    const o = new StudentMetricsOrmEntity();
    o.id = d.id; o.studentId = d.studentId; o.periodId = d.periodId;
    o.subjectAverages = d.subjectAverages; o.globalAverage = d.globalAverage;
    o.calculatedAt = d.calculatedAt; o.version = d.version;
    return o;
  }
}
