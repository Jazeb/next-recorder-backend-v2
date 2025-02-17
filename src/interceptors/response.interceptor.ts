import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from 'src/dtos/dto';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  intercept(
    _,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        if (typeof data == 'object') {
          return new ResponseDto(data);
        } else {
          let response = new ResponseDto({});
          response.success = false;
          response.message = data;
          return response;
        }
      }),
    );
  }
}
