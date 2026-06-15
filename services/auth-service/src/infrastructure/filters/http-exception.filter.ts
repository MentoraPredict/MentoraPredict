import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse<Response>();
    const req    = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const body   = exception.getResponse();

    const message = typeof body === 'string'
      ? body
      : (body as Record<string, unknown>).message as string || exception.message;

    this.logger.warn(`${status} ${req.method} ${req.url} — ${JSON.stringify(message)}`);

    res.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: (req as unknown as { correlationId?: string }).correlationId ?? '',
    });
  }
}
