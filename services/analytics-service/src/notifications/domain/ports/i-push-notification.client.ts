export interface PushMessage {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface IPushNotificationClient {
  // Fire-and-forget by convention (same as every other outbound HTTP client
  // in this codebase) — never throws, logs internally instead.
  send(messages: PushMessage[]): Promise<void>;
}
