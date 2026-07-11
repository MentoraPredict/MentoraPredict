import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule, Params } from 'nestjs-pino';
import { LOG_REDACT_PATHS } from './redact-paths';

type LogLevel = 'error' | 'warn' | 'info';

function resolveCorrelationId(req: IncomingMessage): string {
  const header = req.headers['x-correlation-id'];
  const value = Array.isArray(header) ? header[0] : header;
  return value || randomUUID();
}

export function buildLoggerOptions(serviceName: string): Params {
  return {
    pinoHttp: {
      genReqId: (req: IncomingMessage) => resolveCorrelationId(req),
      customProps: (req: IncomingMessage) => ({
        service: serviceName,
        correlationId: (req as IncomingMessage & { id?: string }).id,
      }),
      redact: LOG_REDACT_PATHS,
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      customLogLevel: (
        _req: IncomingMessage,
        res: ServerResponse,
        err?: Error,
      ): LogLevel => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    },
  };
}

// Returns `any` on purpose: services in this monorepo span both NestJS v10
// and v11, whose `DynamicModule` shapes are not structurally assignable to
// each other. A precise return type here would pin every consumer to
// whichever @nestjs/common major version this package happened to compile
// against.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLoggerModule(serviceName: string): any {
  return LoggerModule.forRoot(buildLoggerOptions(serviceName));
}
