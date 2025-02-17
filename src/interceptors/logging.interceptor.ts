import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle(); // Skip logging for non-HTTP requests
    }

    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    const method = request.method;
    const url = request.url;
    const ip = request.ip;
    const now = process.hrtime();

    return next.handle().pipe(
      tap(() => {
        const diff = process.hrtime(now);
        const time = diff[0] * 1e3 + diff[1] * 1e-6; // Time difference in milliseconds
        console.log(
          `Method: ${method} URL: ${url} IP: ${ip} Status: ${response.statusCode} Time: ${time.toFixed(3)}ms`,
        );
      }),
      catchError((error) => {
        console.error(
          `Error during Request - Method: ${method} URL: ${url} IP: ${ip} Error: ${error.message}`,
        );
        throw error;
      }),
    );
  }
}
