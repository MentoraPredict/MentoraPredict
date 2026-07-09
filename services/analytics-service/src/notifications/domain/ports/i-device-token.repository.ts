import { DeviceTokenEntity } from '../entities/device-token.entity';

export interface IDeviceTokenRepository {
  // Keyed by the push token itself (unique) — if the same token re-registers
  // under a different user (device handoff, re-login), it moves ownership
  // instead of creating a duplicate row.
  upsert(token: DeviceTokenEntity): Promise<DeviceTokenEntity>;
  findByUserId(userId: string): Promise<DeviceTokenEntity[]>;
  deleteByUserAndToken(userId: string, expoPushToken: string): Promise<void>;
  deleteByToken(expoPushToken: string): Promise<void>;
}
