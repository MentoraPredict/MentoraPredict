import { Inject, Injectable } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { IDeviceTokenRepository } from '../../domain/ports/i-device-token.repository';
import { IPushNotificationClient } from '../../domain/ports/i-push-notification.client';
import { NotificationsGateway } from '../../infrastructure/gateways/notifications.gateway';

// Single place that fans a persisted notification out to every delivery
// channel — Socket.IO for an open tab/app, Expo push for a backgrounded or
// closed mobile app. Both CreateNotificationUseCase and the risk-escalation
// flow in RecalculateStudentMetricsUseCase go through here so the two
// channels never drift out of sync with each other.
@Injectable()
export class NotificationDeliveryService {
  constructor(
    @Inject('IDeviceTokenRepository') private readonly deviceTokenRepo: IDeviceTokenRepository,
    @Inject('IPushNotificationClient') private readonly pushClient: IPushNotificationClient,
    private readonly gateway: NotificationsGateway,
  ) {}

  async deliver(notification: NotificationEntity): Promise<void> {
    this.gateway.emitToUser(notification.recipientId, notification);

    const devices = await this.deviceTokenRepo.findByUserId(notification.recipientId);
    if (devices.length === 0) return;

    await this.pushClient.send(
      devices.map((device) => ({
        to: device.expoPushToken,
        title: notification.title,
        body: notification.message,
        data: { notificationId: notification.id, type: notification.type },
      })),
    );
  }
}
