import { io, type Socket } from "socket.io-client";

import { getAccessToken } from "./api/tokenStorage";
import type { AppNotification } from "./notifications.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function resolveSocketOrigin(): string | undefined {
    return API_BASE_URL.startsWith("http")
        ? new URL(API_BASE_URL).origin
        : undefined;
}

export function connectNotificationsSocket(
    onNotification: (notification: AppNotification) => void
): () => void {
    const token = getAccessToken();
    if (!token) {
        return () => {};
    }

    const socket: Socket = io(resolveSocketOrigin(), {
        path: "/api/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
    });

    socket.on("notification:new", onNotification);

    return () => {
        socket.off("notification:new", onNotification);
        socket.disconnect();
    };
}
