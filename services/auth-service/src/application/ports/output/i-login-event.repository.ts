import { LoginEventEntity } from '../../../domain/entities/login-event.entity';

export interface ILoginEventRepository {
  save(event: LoginEventEntity): Promise<void>;
  /** Último ingreso y cantidad de ingresos de un usuario desde `since`. */
  summarize(
    userId: string,
    since: Date,
  ): Promise<{ lastLoginAt: Date | null; count: number }>;
}
