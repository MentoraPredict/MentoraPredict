/**
 * Shape description for common environment variables.
 * Each service uses this as reference to build its own ConfigService.
 * NO process.env reads happen here — this is a schema contract only.
 */
export const CommonEnvShape = {
  NODE_ENV:  { type: 'string', allowed: ['development', 'test', 'production'] },
  APP_PORT:  { type: 'number' },
  LOG_LEVEL: { type: 'string', allowed: ['debug', 'info', 'warn', 'error'] },
  API_PREFIX: { type: 'string', default: '/api/v1' },
} as const;
