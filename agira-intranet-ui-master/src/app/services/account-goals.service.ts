import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment} from '../../environments/environment';

@Injectable()
export class AccountGoalsService {

  headers;
  constructor(
    private http: HttpClient
  ) { }

  /* Getting Headers */
  getHeaders() {
    this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'access-token': localStorage.getItem('access-token'),
        'client': localStorage.getItem('client'),
        'expiry': localStorage.getItem('expiry'),
        'uid': localStorage.getItem('uid')
     });
  }

  /* Setting Headers */
  setHeaders(data) {
    if (data.headers.get('access-token') != null) {
      localStorage.setItem('access-token', data.headers.get('access-token') );
      localStorage.setItem('client', data.headers.get('client'));
      localStorage.setItem('expiry', data.headers.get('expiry'));
      localStorage.setItem('uid', data.headers.get('uid'));
    }
  }

  /* Getting User Assessment */
  getAccountGoals(id, filter): Observable<any> {
    this.getHeaders();
    return this.http.get(environment.api_url + '/accounts/' + id +
    '/account_goals/?year_filter=' + filter, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Team Assessment  */
  getTeamGoals( duration, assessment_year, status): Observable<any> {
    let login_id = JSON.parse(localStorage.getItem('currentUser')).id;
    this.getHeaders();
    return this.http.get(environment.api_url + '/accounts/' + login_id +
    '/team_goals/?duration=' + duration + '&assessment_year=' + assessment_year +
    '&status=' + status, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Reports */
  getReports(filter, status, user, year): Observable<any> {
    let login_id = JSON.parse(localStorage.getItem('currentUser')).id;
    this.getHeaders();
    return this.http.get(environment.api_url + '/accounts/' +
    login_id + '/reports/?year_filter=' + filter + '&status=' +
    status + '&user=' + user + '&assessment_year=' + year,
    {headers: this.headers,  observe: 'response'} );
  }

  /* Create goal for the user */
  createGoal(value) {
    this.getHeaders();
    return this.http.post((environment.api_url + '/accounts/' +
    value.account_goals.account_id + '/account_goals/'), value, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Assessment Details */
  accountGoalDetails(accountGoal_id) {
    this.getHeaders();
    return this.http.get((environment.api_url + '/account_goals/' + accountGoal_id), {headers: this.headers,  observe: 'response'} );
  }

  /* Publish all assessments which is accepted */
  publishAll(account_id) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/accounts/' + account_id + '/publish_all',
     {},{headers: this.headers,  observe: 'response'});
  }

  /* Cloning all assessment  */
  cloneAll(account_id, value) {
    this.getHeaders();
    return this.http.post((environment.api_url + '/accounts/' + account_id +
     '/clone_all/'), value, {headers: this.headers,  observe: 'response'} );
  }

  /* Freeze all assessment */
  freezeAll(account_id, value) {
    this.getHeaders();
    return this.http.post((environment.api_url + '/accounts/' + account_id + '/freeze_all/'),
    value, {headers: this.headers,  observe: 'response'} );
  }

  /* Updating Assessment for the user */
  updateAccountGoal(account_id, accountGoal_id, value) {
    this.getHeaders();
    return this.http.put((environment.api_url + '/accounts/' +
    account_id + '/account_goals/' + accountGoal_id), value,
    {headers: this.headers,  observe: 'response'} );
  }

  /* delete Assessment  */
  deleteAccountGoal(account_id, accountGoal_id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/accounts/' + account_id +
    '/account_goals/' + accountGoal_id), {headers: this.headers,  observe: 'response'} );
  }

}
