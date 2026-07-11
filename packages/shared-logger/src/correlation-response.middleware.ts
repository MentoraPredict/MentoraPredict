import { correlationContext } from './correlation-context';

interface RequestWithId {
  id?: string | number;
}

/**
 * Must be registered via AppModule's own configure(consumer) — e.g.
 *   consumer.apply(correlationContextMiddleware).forRoutes('*')
 * with createLoggerModule(...) imported before other modules in
 * AppModule.imports. NestJS binds middleware from imported modules'
 * configure() before the importing module's own configure(), so this
 * runs after pino-http's middleware has already assigned req.id.
 *
 * A plain app.use() call in main.ts (registered after NestFactory.create())
 * was tried first and found to run BEFORE nestjs-pino's module-bound
 * middleware, seeing req.id as undefined — hence going through Nest's own
 * middleware-consumer system instead of raw Express registration.
 */
export function correlationContextMiddleware(
  req: RequestWithId,
  _res: unknown,
  next: () => void,
): void {
  const id = req.id ? String(req.id) : undefined;
  if (!id) {
    next();
    return;
  }
  correlationContext.run(id, next);
}
