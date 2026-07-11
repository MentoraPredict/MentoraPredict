import { logger } from "./logger";

export function registerGlobalErrorHandlers() {
  window.addEventListener("error", (event) => {
    logger.error("Unhandled browser error", event.error ?? event.message, {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection", event.reason);
  });
}
