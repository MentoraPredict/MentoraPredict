import { randomUUID } from 'crypto';

/** Generates IDs for distributed tracing (RNF-038) */
export function generateCorrelationId(): string {
  return randomUUID();
}

export function generateRequestId(): string {
  return randomUUID();
}
