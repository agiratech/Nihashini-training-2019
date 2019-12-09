import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { accessSync } from 'fs';
import { environment} from '../../environments/environment';

@Injectable()
export class AccountMetricsService {

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

  /* Getting Account Metrics */
  getAccountMetrics(account_id, accounts_goal_id) {
    this.getHeaders();
    return this.http.get(environment.api_url+'/account_goals/'+accounts_goal_id+'/metrics',{headers: this.headers,  observe: 'response'} )
  }

  /* Delete Account Metrics */
  deleteAccountMetrics(account_id, accounts_goal_id, account_metric_id) {
    this.getHeaders();
    return this.http.delete(environment.api_url+'/accounts/'+account_id+'/account_goals/'+accounts_goal_id+'/metrics/'+account_metric_id,{headers: this.headers,  observe: 'response'} )
  }

  /* Update Account MEtrics */
  updateAccountMetrics(account_id, accounts_goal_id, account_metric_id, value) {
    this.getHeaders();
    return this.http.put(environment.api_url+'/accounts/'+account_id+'/account_goals/'+accounts_goal_id+'/metrics/'+account_metric_id,value,{headers: this.headers,  observe: 'response'} )
  }

  /* Create Metrics */
  createMetric(value, account_id, accountGoal_id) {
    this.getHeaders();
    return this.http.post((environment.api_url+'/accounts/'+account_id+'/account_goals/'+accountGoal_id+'/metrics'),value,{headers: this.headers,  observe: 'response'} )
  }

  /* getting account metric details */
  getAccountMetricDetails(account_id, accounts_goal_id, account_metric_id) {
    this.getHeaders();
    return this.http.get(environment.api_url+'/accounts/'+account_id+'/account_goals/'+accounts_goal_id+'/metrics/'+account_metric_id,{headers: this.headers,  observe: 'response'} )
  }

  /* Updating Appraiser Score */
  updateAppraiserScore(account_id, accountGoal_id, goal_id, value) {
    this.getHeaders();
    return this.http.put(environment.api_url+'/accounts/'+account_id+'/account_goals/'+accountGoal_id+'/assessments/'+goal_id,value,{headers: this.headers,  observe: 'response'})
  }

}
