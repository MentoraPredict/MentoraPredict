import { AlertEntity } from '../entities/alert.entity';

export interface IAlertRepository {
  save(alert: AlertEntity): Promise<AlertEntity>;
  findByStudentId(studentId: string, unreadOnly?: boolean): Promise<AlertEntity[]>;
}
