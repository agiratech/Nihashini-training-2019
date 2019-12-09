import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Config } from 'protractor/built/config';
import { environment} from '../../environments/environment';

@Injectable()
export class MetricService {

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

  /* Metrics Creation */
  createMetric(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/metrics', value, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Metric Details  */
  metricDetails(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/metrics/' + id, {headers: this.headers,  observe: 'response'} );
  }

  /* Updating Metrics */
  updateMetric(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/metrics/' + value.metric.id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Delete MEtrics  */
  deleteMetric(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/metrics/' + id), {headers: this.headers,  observe: 'response'} );
  }

}
