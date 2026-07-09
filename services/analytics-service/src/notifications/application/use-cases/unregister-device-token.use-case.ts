import { Inject, Injectable } from '@nestjs/common';
import { IDeviceTokenRepository } from '../../domain/ports/i-device-token.repository';

@Injectable()
export class UnregisterDeviceTokenUseCase {
  constructor(
    @Inject('IDeviceTokenRepository') private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {}

  async execute(userId: string, expoPushToken: string): Promise<void> {
    await this.deviceTokenRepo.deleteByUserAndToken(userId, expoPushToken);
  }
}
