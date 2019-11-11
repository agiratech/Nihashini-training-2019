import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AuthenticationService} from '@shared/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthenticationService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(tap(event => {
      }, (error: HttpErrorResponse)  => {
        if (error.status === 401 && error.headers.has('WWW-Authenticate')) {
          this.auth.logout(false);
        }
      }));
  }
}
