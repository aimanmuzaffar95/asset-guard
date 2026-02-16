import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let messages: string[] = [];

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const m = (exceptionResponse as { message?: unknown }).message;
      messages = Array.isArray(m) ? m.map(String) : [String(m)];
    } else if (typeof exceptionResponse === 'string') {
      messages = [exceptionResponse];
    } else if (exception instanceof Error) {
      messages = [exception.message];
    } else {
      messages = ['Internal server error'];
    }

    if (statusCode === 429) {
      messages = ['Too many requests'];
    }

    const code =
      statusCode === 404
        ? 'NOT_FOUND'
        : statusCode === 400
          ? 'BAD_REQUEST'
          : statusCode === 401
            ? 'UNAUTHORIZED'
            : statusCode === 403
              ? 'FORBIDDEN'
              : statusCode === 409
                ? 'CONFLICT'
                : statusCode === 429
                  ? 'TOO_MANY_REQUESTS'
                  : 'INTERNAL_ERROR';

    response.status(statusCode).json({
      success: false,
      error: {
        messages,
        code,
      },
      meta: {
        statusCode,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
