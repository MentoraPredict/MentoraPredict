import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationClient,
  UserNotificationPayload,
} from '../../application/ports/output/i-notification-client';
import { InternalJwtService } from '../auth/internal-jwt.service';

@Injectable()
export class NotificationHttpClient implements INotificationClient {
  private readonly logger = new Logger(NotificationHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>(
      'ANALYTICS_SERVICE_URL',
      'http://analytics-service:3004',
    );
  }

  async notify(payload: UserNotificationPayload): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/notifications/internal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Notification create responded ${response.status} for user ${payload.recipientId}`,
        );
      }
    } catch (error) {
      // The role change is already committed in User/Auth. A temporary
      // notification outage must not report that successful operation as failed.
      this.logger.error(
        `Role notification failed for user ${payload.recipientId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
