import { useCallback, useEffect, useRef, useState } from "react";

import {
  getReadNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  sortNotificationsByNewest,
  type AppNotification,
} from "@/services/notifications.service";
import { connectNotificationsSocket } from "@/services/notifications.socket";

export default function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRead = useRef(false);

  // Only the unread count is needed for the bell badge, which is always
  // visible — the read list is only ever rendered once the dropdown opens,
  // so it's fetched lazily via loadReadOnce() instead of on every mount.
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications(await getUnreadNotifications());
    } catch {
      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadReadOnce = useCallback(async () => {
    if (hasLoadedRead.current) {
      return;
    }
    hasLoadedRead.current = true;

    try {
      const read = await getReadNotifications();
      setNotifications((current) =>
        sortNotificationsByNewest([...current, ...read]),
      );
    } catch {
      hasLoadedRead.current = false;
      setError("No se pudieron cargar las notificaciones leídas.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const disconnect = connectNotificationsSocket((notification) => {
      setNotifications((current) => [notification, ...current]);
    });

    return disconnect;
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const updated = await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? updated : notification,
        ),
      );
    } catch {
      setError("No se pudo marcar la notificación como leída.");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          status: "READ" as const,
          readAt: notification.readAt ?? readAt,
        })),
      );
    } catch {
      setError("No se pudieron marcar las notificaciones como leídas.");
    }
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(({ status }) => status === "UNREAD").length,
    isLoading,
    error,
    reload: load,
    loadReadOnce,
    markAsRead,
    markAllAsRead,
  };
}
