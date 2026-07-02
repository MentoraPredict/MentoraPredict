import { StudentMetricsEntity } from '../entities/student-metrics.entity';

export interface IStudentMetricsRepository {
  findByStudentAndPeriod(studentId: string, periodId: string): Promise<StudentMetricsEntity | null>;
  findLatestByStudent(studentId: string): Promise<StudentMetricsEntity | null>;
  findByPeriod(periodId: string): Promise<StudentMetricsEntity[]>;
  findLatestPerStudent(): Promise<StudentMetricsEntity[]>;
  save(metrics: StudentMetricsEntity): Promise<StudentMetricsEntity>;
}
