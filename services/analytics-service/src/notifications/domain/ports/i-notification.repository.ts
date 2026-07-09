import { NotificationEntity } from '../entities/notification.entity';

export interface INotificationRepository {
  save(notification: NotificationEntity): Promise<NotificationEntity>;
  update(notification: NotificationEntity): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByRecipientPaginated(
    recipientId: string,
    filters: { status?: string; type?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: NotificationEntity[]; total: number }>;
  // Bulk UNREAD -> READ for a recipient; returns the number of rows updated.
  markAllAsRead(recipientId: string): Promise<number>;
}
