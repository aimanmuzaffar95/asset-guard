import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          data,
          meta: {
            statusCode: response.statusCode,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
          },
        }
      }),
    )
  }
}
