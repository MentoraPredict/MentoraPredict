export interface NotifyPayload {
  // Either target one specific recipient...
  recipientId?: string;
  recipientRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  // ...or broadcast to every active user with this role.
  broadcastToRole?: 'ADMIN';
  type: string;
  title: string;
  message: string;
}

export interface INotificationClientPort {
  notify(payload: NotifyPayload): Promise<void>;
}
