import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConfig} from '../app-config.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private config: AppConfig) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey');
    const isToken = request.url.indexOf('locations/places/search') === -1 ? true : false;
    const accept = request.headers.get('Accept');
    if (token && apiKey) {
      if (isToken) {
        request = request.clone({
          setHeaders: {
            Accept: accept && accept || 'application/json',
            Authorization: 'Bearer ' + token,
            apikey: apiKey,
            'Cache-Control': 'no-store',
          }
        });
      } else {
        request = request.clone({
          setHeaders: {
            Accept: 'application/json',
            apikey: apiKey,
            'Cache-Control': 'no-store',
          }
        });
      }
    }
    return next.handle(request);
  }
}
