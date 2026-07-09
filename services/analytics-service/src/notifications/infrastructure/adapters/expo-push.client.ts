import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPushNotificationClient, PushMessage } from '../../domain/ports/i-push-notification.client';
import { IDeviceTokenRepository } from '../../domain/ports/i-device-token.repository';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const MAX_BATCH_SIZE = 100; // Expo's documented limit per request

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

// Only handles the error Expo already tells us about in the send response
// itself (DeviceNotRegistered). It does not poll /getReceipts for delivery
// confirmation — a known simplification; add receipt polling if silent
// delivery failures become a real problem.
@Injectable()
export class ExpoPushClient implements IPushNotificationClient {
  private readonly logger = new Logger(ExpoPushClient.name);

  constructor(
    @Inject('IDeviceTokenRepository') private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {}

  async send(messages: PushMessage[]): Promise<void> {
    if (messages.length === 0) return;

    for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
      await this.sendBatch(messages.slice(i, i + MAX_BATCH_SIZE));
    }
  }

  private async sendBatch(batch: PushMessage[]): Promise<void> {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(
          batch.map((m) => ({ to: m.to, title: m.title, body: m.body, data: m.data ?? {} })),
        ),
      });

      if (!res.ok) {
        this.logger.warn(`Expo push API responded ${res.status}`);
        return;
      }

      const { data: tickets } = (await res.json()) as { data: ExpoPushTicket[] };

      // Tickets are positional — same order as the batch we sent.
      await Promise.all(
        tickets.map((ticket, index) => {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            return this.deviceTokenRepo.deleteByToken(batch[index].to);
          }
          if (ticket.status === 'error') {
            this.logger.warn(`Push to ${batch[index].to} failed: ${ticket.message ?? 'unknown error'}`);
          }
          return undefined;
        }),
      );
    } catch (err) {
      this.logger.error(
        `Expo push send failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
