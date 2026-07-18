import { LoginEventEntity } from '../../../domain/entities/login-event.entity';

export interface ILoginEventRepository {
  save(event: LoginEventEntity): Promise<void>;
}
