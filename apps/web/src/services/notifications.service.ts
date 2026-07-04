import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";

export type NotificationStatus = "UNREAD" | "READ";

export interface AppNotification {
  id: string;
  recipientRole: "STUDENT" | "TEACHER";
  type: "RISK_ESCALATION";
  subjectId: string;
  studentId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  readAt: string | null;
}

interface PaginatedNotifications {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

async function getByStatus(status: NotificationStatus) {
  const response = await api.get<PaginatedNotifications>(
    endpoints.notifications.mine,
    { params: { status, page: 1, limit: 20 } },
  );
  return response.data.data;
}

export async function getMyNotifications() {
  const [unread, read] = await Promise.all([
    getByStatus("UNREAD"),
    getByStatus("READ"),
  ]);

  return [...unread, ...read].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await api.patch<AppNotification>(
    endpoints.notifications.read(notificationId),
  );
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch<{ updated: number }>(
    endpoints.notifications.readAll,
  );
  return response.data;
}
