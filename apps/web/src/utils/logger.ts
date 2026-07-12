export type LogContext = Record<string, unknown>;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
}

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(import.meta.env.DEV ? { stack: error.stack } : {}),
    };
  }

  return error;
}

function write(level: LogLevel, message: string, context: LogContext = {}) {
  if (level === "debug" && !import.meta.env.DEV) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  switch (level) {
    case "error":
      console.error(entry);
      break;
    case "warn":
      console.warn(entry);
      break;
    case "info":
      console.info(entry);
      break;
    default:
      console.debug(entry);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    write("debug", message, context),
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  warn: (message: string, context?: LogContext) =>
    write("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    write("error", message, {
      ...context,
      ...(error === undefined ? {} : { error: serializeError(error) }),
    }),
};
