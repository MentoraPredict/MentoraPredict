export type DevicePlatform = 'ios' | 'android' | 'web';

export class DeviceTokenEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly expoPushToken: string,
    public readonly platform: DevicePlatform,
    public readonly createdAt: Date,
  ) {}
}
