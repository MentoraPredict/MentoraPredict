export interface UserNotificationPayload {
  recipientId: string;
  recipientRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  type: 'ROLE_CHANGED';
  title: string;
  message: string;
}

export interface INotificationClient {
  notify(payload: UserNotificationPayload): Promise<void>;
}
