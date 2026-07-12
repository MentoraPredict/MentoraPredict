import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";

export type NotificationStatus = "UNREAD" | "READ";

export interface AppNotification {
  id: string;
  recipientRole: "STUDENT" | "TEACHER" | "ADMIN";
  type:
    | "RISK_ESCALATION"
    | "ENROLLMENT_CREATED"
    | "ENROLLMENT_WITHDRAWN"
    | "COURSE_CREATED";
  subjectId: string | null;
  studentId: string | null;
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

// Unread-only — this is all the bell icon's badge count needs, so it's
// fetched on mount regardless of whether the dropdown is ever opened.
export async function getUnreadNotifications() {
  return getByStatus("UNREAD");
}

// Read notifications are only ever displayed once the dropdown is open —
// callers should defer this until then instead of fetching it eagerly.
export async function getReadNotifications() {
  return getByStatus("READ");
}

export function sortNotificationsByNewest(notifications: AppNotification[]) {
  return [...notifications].sort(
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
