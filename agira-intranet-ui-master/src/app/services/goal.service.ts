import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Config } from 'protractor/built/config';
import { environment} from '../../environments/environment';

@Injectable()
export class GoalService {

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

  /* Creating Goal */
  createGoal(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/goals', value, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Goal Details */
  goalDetails(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/goals/' + id, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting All Active Goals  */
  getGoals(active) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/goals?active=' + active, {headers: this.headers,  observe: 'response'} );
  }

  /* Updating All Goals */
  updateGoal(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/goals/' + value.goal.id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Deleting Goals */
  deleteGoal(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/goals/' + id), {headers: this.headers,  observe: 'response'} );
  }
}
