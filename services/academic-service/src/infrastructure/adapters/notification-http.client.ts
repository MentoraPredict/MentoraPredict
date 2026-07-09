import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INotificationClientPort, NotifyPayload } from '../../application/ports/output/i-notification-client.port';
import { InternalJwtService } from '../auth/internal-jwt.service';

@Injectable()
export class NotificationHttpClient implements INotificationClientPort {
  private readonly logger = new Logger(NotificationHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('ANALYTICS_SERVICE_URL', 'http://analytics-service:3004');
  }

  async notify(payload: NotifyPayload): Promise<void> {
    const url = `${this.baseUrl}/api/v1/notifications/internal`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        this.logger.warn(`Notification create responded ${res.status} for type ${payload.type}`);
      }
    } catch (err) {
      this.logger.error(
        `Notification create failed for type ${payload.type}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
