import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Config } from 'protractor/built/config';
import { environment} from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



@Injectable()
export class AccountsService {

  headers;
  constructor(
    private http: HttpClient
  ) { }

  public profile_pic = new BehaviorSubject('../assets/img/avatar5.png');

  /* Getting Headers */
  getHeaders() {
    this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'access-token': localStorage.getItem('access-token'),
        'client': localStorage.getItem('client'),
        'expiry': localStorage.getItem('expiry'),
        'uid': localStorage.getItem('uid'),
        'multipart': 'true'
     });
     this.headers['key'] = 'key';
  }

  changeProfilePicture(url: string ) {
    this.profile_pic.next(url);
  }

  getProfilePicture(): Observable<any> {
    return this.profile_pic.asObservable();
  }

  /* Getting Acccounts */
  getAccounts(pageNo?, search?) {
    this.getHeaders();
    let query = '/accounts';
    if (pageNo != null) {
      query = query + '?page=' + pageNo + '&search=' + search;
    }
    return this.http.get(environment.api_url + query, {headers: this.headers,  observe: 'response'} );
  }

  getManagers() {
    this.getHeaders();
    return this.http.get(environment.api_url + '/managers', {headers: this.headers,  observe: 'response'} );
  }

  getEmployees(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/employees/' + id, {headers: this.headers,  observe: 'response'} );
  }

  /* Create Account */
  createAccount(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/accounts', value, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Account Details */
  accountDetails(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/accounts/' + id, {headers: this.headers,  observe: 'response'} );
  }

  addProject(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/add_project', value, {headers: this.headers,  observe: 'response'} );
  }

  assignMentor(id, value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/mentors/' +
     value.mentor.employee_id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Forgot Password */
  forgotPassword(value) {
    return this.http.post(environment.api_url + '/forgot_password', value, {observe: 'response'} );
  }

  /* Updating Account */
  updateAccount(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/accounts/' + value.account.id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Delete Account */
  deleteAccount(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/accounts/' + id), {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Metrics */
  getMetrics(id, year) {
    this.getHeaders();
    return this.http.get((environment.api_url + '/accounts/' + id +
     '/metrics?year=' + year), {headers: this.headers, observe: 'response'} );
  }

  /* Create Metrics for the Account */
  createMetrics(value) {
    this.getHeaders();
    return this.http.post((environment.api_url + '/accounts/' +
    value.accounts_metrics['account_id'] + '/metrics'), value, {headers: this.headers,  observe: 'response'} );
  }

  /* Delete Metrics */
  deleteMetrics(account_id, account_metric_id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/accounts/' +
     account_id + '/metrics/' + account_metric_id), {headers: this.headers,  observe: 'response'});
  }
}
