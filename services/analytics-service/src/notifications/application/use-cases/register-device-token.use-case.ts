import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DeviceTokenEntity, DevicePlatform } from '../../domain/entities/device-token.entity';
import { IDeviceTokenRepository } from '../../domain/ports/i-device-token.repository';

@Injectable()
export class RegisterDeviceTokenUseCase {
  constructor(
    @Inject('IDeviceTokenRepository') private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {}

  async execute(
    userId: string,
    expoPushToken: string,
    platform: DevicePlatform,
  ): Promise<DeviceTokenEntity> {
    return this.deviceTokenRepo.upsert(
      new DeviceTokenEntity(randomUUID(), userId, expoPushToken, platform, new Date()),
    );
  }
}
