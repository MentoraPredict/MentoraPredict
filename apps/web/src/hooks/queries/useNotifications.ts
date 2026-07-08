import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/services/notifications.service";

export default function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch: reload,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<AppNotification[]>(
        ["notifications"],
        (current) =>
          current?.map((n) => (n.id === updated.id ? updated : n)) ?? []
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData<AppNotification[]>(
        ["notifications"],
        (current) => {
          const readAt = new Date().toISOString();
          return (
            current?.map((n) => ({
              ...n,
              status: "READ" as const,
              readAt: n.readAt ?? readAt,
            })) ?? []
          );
        }
      );
    },
  });

  return {
    notifications,
    unreadCount: notifications.filter(({ status }) => status === "UNREAD")
      .length,
    isLoading,
    error: error ? "No se pudieron cargar las notificaciones." : null,
    reload,
    markAsRead: (notificationId: string) =>
      markAsReadMutation.mutateAsync(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
  };
}
