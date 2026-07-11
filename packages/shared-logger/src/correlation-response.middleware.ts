import { correlationContext } from './correlation-context';

interface RequestWithId {
  id?: string | number;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
}

type MiddlewareFn = (req: RequestWithId, res: ResponseLike, next: () => void) => void;

interface AppWithMiddleware {
  use(fn: MiddlewareFn): unknown;
}

/**
 * pino-http assigns req.id via genReqId before any route middleware runs.
 * Registering this with app.use() after NestFactory.create() guarantees it
 * runs after nestjs-pino's own middleware, so req.id is already populated.
 *
 * Running next() inside correlationContext.run() makes the id available via
 * correlationContext.getId() anywhere downstream in this request's async
 * chain (use-cases, outbound HTTP clients) without threading it through
 * every function signature.
 */
export function attachCorrelationIdHeader(app: AppWithMiddleware): void {
  app.use(
    (req: RequestWithId, res: ResponseLike, next: () => void): void => {
      const id = req.id ? String(req.id) : undefined;
      if (!id) {
        next();
        return;
      }
      res.setHeader('x-correlation-id', id);
      correlationContext.run(id, next);
    },
  );
}
