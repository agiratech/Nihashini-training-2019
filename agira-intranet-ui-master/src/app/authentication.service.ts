import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { HttpResponse } from '@angular/common/http/src/response';
import { HttpParamsOptions } from '@angular/common/http/src/params';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { environment } from '../environments/environment';


@Injectable()
export class AuthenticationService {

  headers ;

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public is_Admin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
  }



  register(data) {
    return this.http.post(environment.api_url + '/accounts/', data, { observe: 'response' });
  }
  changeLogin(value: boolean) {
    this.loggedIn.next(value);
  }

  changeAdmin(value: boolean) {
    this.is_Admin.next(value);
  }

  login(data) {
    this.loggedIn.next(true);
    return this.http.post(environment.api_url + '/accounts/sign_in', data , { observe: 'response' });
  }

  getHeaders() {
     this.headers = new HttpHeaders({
         'Content-Type': 'application/json',
         'access-token': localStorage.getItem('access-token'),
         'client': localStorage.getItem('client'),
         'expiry': localStorage.getItem('expiry'),
         'uid': localStorage.getItem('uid')
      });
  }

  signOut() {
      this.getHeaders();
      this.loggedIn.next(false);
    return this.http.delete(environment.api_url + '/accounts/sign_out', {headers: this.headers});
  }

  getRoles() {
    this.getHeaders();
    return this.http.get(environment.api_url + '/roles', {headers: this.headers});
  }

}
