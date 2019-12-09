import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { environment} from '../../environments/environment';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class TimesheetService {

  headers;
  is_Admin;
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });
   }

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

  setHeaders(data) {
    if (data.headers.get('access-token') != null) {
      localStorage.setItem('access-token', data.headers.get('access-token') );
      localStorage.setItem('client', data.headers.get('client'));
      localStorage.setItem('expiry', data.headers.get('expiry'));
      localStorage.setItem('uid', data.headers.get('uid'));
    }
  }

  createTimesheet(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/timesheets/', value, {headers: this.headers,  observe: 'response'} );
  }

  getTimesheets(time, user_id, pg_no, project, activity, start_date?, end_date?) {
    this.getHeaders();
    let query = 'page_no=' + pg_no;
    query = query.concat((time == 'between') ? '&start_date=' + start_date + '&end_date=' + end_date : '&duration=' + time);
    query = query.concat((user_id != 'all') ? '&user_id=' + user_id : '');
    query = query.concat((project != 'all') ? '&project_id=' + project : '');
    query = query.concat((activity != 'all') ? '&activity_id=' + activity : '');
    return this.http.get(environment.api_url + '/timesheets/?' + query, {headers: this.headers,  observe: 'response'} );
  }
  deleteTimesheet(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/timesheets/' + id), {headers: this.headers,  observe: 'response'} );
  }

  getTimesheet(id) {
    this.getHeaders();
    return this.http.get((environment.api_url + '/timesheets/' + id), {headers: this.headers,  observe: 'response'});
  }

  updateTimesheet(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/timesheets/' + value.id, value, {headers: this.headers,  observe: 'response'} );
  }

  getCharts(time, user_id, project, activity, category, start_date?, end_date?) {
    this.getHeaders();
    let query = '';
    query = query.concat((time == 'between') ? '&start_date=' + start_date + '&end_date=' + end_date : '&duration=' + time);
    query = query.concat((user_id != 'all') ? '&user_id=' + user_id : '');
    query = query.concat((project != 'all') ? '&project_id=' + project : '');
    query = query.concat((activity != 'all') ? '&activity_id=' + activity : '');
    query = query.concat((category != 'all') ? '&category_id=' + category : '');

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return this.http.get(environment.api_url + '/charts/?' + query, {headers: this.headers,  observe: 'response'} );
  }

  getAdminCharts(time, user_id, project, activity, category, start_date?, end_date?) {
    this.getHeaders();
    let query = '';
    query = query.concat((time == 'between') ? '&start_date=' + start_date + '&end_date=' + end_date : '&duration=' + time);
    query = query.concat((user_id != 'all') ? '&user_id=' + user_id : '');
    query = query.concat((project != 'all') ? '&project_id=' + project : '');
    query = query.concat((activity != 'all') ? '&activity_id=' + activity : '');
    query = query.concat((category != 'all') ? '&category_id=' + category : '');
    return this.http.get(environment.api_url + '/admin_charts/?' + query, {headers: this.headers,  observe: 'response'} );
  }
}
