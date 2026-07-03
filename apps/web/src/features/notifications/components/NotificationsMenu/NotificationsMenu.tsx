import { useEffect, useRef, useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import NotificationIconButton from "@/components/molecules/NotificationIconButton";
import useNotifications from "@/features/notifications/hooks/useNotifications";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <NotificationIconButton
        hasUnread={unreadCount > 0}
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen ? (
        <section className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <Heading as="h5" className="text-gray-900">Notificaciones</Heading>
              <Text variant="caption">{unreadCount} sin leer</Text>
            </div>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => void markAllAsRead()}
              >
                Marcar todas
              </Button>
            ) : null}
          </header>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <Text variant="small" className="block px-5 py-8 text-center">
                Cargando notificaciones...
              </Text>
            ) : error ? (
              <Text variant="small" className="block px-5 py-8 text-center text-red-700">
                {error}
              </Text>
            ) : notifications.length === 0 ? (
              <Text variant="small" className="block px-5 py-8 text-center">
                No tienes notificaciones.
              </Text>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (notification.status === "UNREAD") {
                      void markAsRead(notification.id);
                    }
                  }}
                  className={`block w-full border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 ${notification.status === "UNREAD" ? "bg-blue-50/60" : "bg-white"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.status === "UNREAD" ? "bg-red-500" : "bg-gray-300"}`} />
                    <div>
                      <Text variant="small" className="font-semibold text-gray-900">
                        {notification.title}
                      </Text>
                      <Text variant="small" className="mt-1 text-gray-600">
                        {notification.message}
                      </Text>
                      <Text variant="caption" className="mt-2 block text-gray-500">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
