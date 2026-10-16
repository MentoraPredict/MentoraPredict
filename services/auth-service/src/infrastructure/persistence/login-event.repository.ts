import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginEventEntity } from '../../domain/entities/login-event.entity';
import { ILoginEventRepository } from '../../application/ports/output/i-login-event.repository';
import { LoginEventOrmEntity } from './login-event.orm-entity';

@Injectable()
export class LoginEventRepository implements ILoginEventRepository {
  constructor(
    @InjectRepository(LoginEventOrmEntity)
    private readonly repo: Repository<LoginEventOrmEntity>,
  ) {}

  async save(event: LoginEventEntity): Promise<void> {
    const o = new LoginEventOrmEntity();
    o.id = event.id;
    o.userId = event.userId;
    o.occurredAt = event.occurredAt;
    o.loginMethod = event.loginMethod;
    o.ipAddress = event.ipAddress;
    o.userAgent = event.userAgent;
    o.deviceType = event.deviceType;
    await this.repo.save(o);
  }
}
