import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceTokenEntity, DevicePlatform } from '../../domain/entities/device-token.entity';
import { IDeviceTokenRepository } from '../../domain/ports/i-device-token.repository';
import { DeviceTokenOrmEntity } from './device-token.orm-entity';

@Injectable()
export class DeviceTokenRepository implements IDeviceTokenRepository {
  constructor(
    @InjectRepository(DeviceTokenOrmEntity)
    private readonly repo: Repository<DeviceTokenOrmEntity>,
  ) {}

  async upsert(token: DeviceTokenEntity): Promise<DeviceTokenEntity> {
    const existing = await this.repo.findOne({ where: { expoPushToken: token.expoPushToken } });

    const orm = existing ?? new DeviceTokenOrmEntity();
    orm.id = existing?.id ?? token.id;
    orm.userId = token.userId;
    orm.expoPushToken = token.expoPushToken;
    orm.platform = token.platform;

    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<DeviceTokenEntity[]> {
    const rows = await this.repo.find({ where: { userId } });
    return rows.map((row) => this.toDomain(row));
  }

  async deleteByUserAndToken(userId: string, expoPushToken: string): Promise<void> {
    await this.repo.delete({ userId, expoPushToken });
  }

  async deleteByToken(expoPushToken: string): Promise<void> {
    await this.repo.delete({ expoPushToken });
  }

  private toDomain(orm: DeviceTokenOrmEntity): DeviceTokenEntity {
    return new DeviceTokenEntity(
      orm.id,
      orm.userId,
      orm.expoPushToken,
      orm.platform as DevicePlatform,
      orm.createdAt,
    );
  }
}
