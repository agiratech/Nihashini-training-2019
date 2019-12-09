import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment} from '../../environments/environment';

@Injectable()
export class ProjectService {

  headers;
  constructor(
    private http: HttpClient
  ) { }

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
      localStorage.setItem('access-token', data.headers.get('access-token'));
      localStorage.setItem('client', data.headers.get('client'));
      localStorage.setItem('expiry', data.headers.get('expiry'));
      localStorage.setItem('uid', data.headers.get('uid'));
    }

  }

  getProjects(defaultValue?, pageNo?, search?, order?, orderType?): Observable<any> {
    this.getHeaders();
    let query = '/projects';
    if (defaultValue != null) {
      query += '?default=' + defaultValue + (pageNo ? '&page=' + pageNo : '') + (search ? '&search=' + search : '') + (order ? '&order=' + order : '') + (orderType ? '&order_type=' + orderType : '');
    }
    return this.http.get(environment.api_url + query, {headers: this.headers,  observe: 'response'} );
  }

  // getIndividualProjects(): Observable<any> {
  //   this.getHeaders();
  //   return this.http.get(environment.api_url + '/individual_projects', {headers: this.headers,  observe: 'response'} );
  // }

  // getMyProjects(): Observable<any> {
  //   this.getHeaders();
  //   return this.http.get(environment.api_url + '/individual_projects/false', {headers: this.headers,  observe: 'response'} );
  // }

  projectDetails(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/projects/' + id, {headers: this.headers,  observe: 'response'} );
  }

  updateProject(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/projects/' + value.project.id, value, {headers: this.headers,  observe: 'response'} );
  }

  deleteProject(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/projects/' + id), {headers: this.headers,  observe: 'response'} );
  }

  createProject(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/projects/', value, {headers: this.headers,  observe: 'response'} );
  }

  addAccounts(value) {
    this.getHeaders();
    return this.http.post((environment.api_url + '/projects/' +
    value.project_accounts['project_id'] + '/add_account'), value,
    {headers: this.headers,  observe: 'response'});
  }

  deleteAccount(project_id, account_project_id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/projects/' + project_id +
    '/delete_account?account_project_id=' + account_project_id),
    {headers: this.headers,  observe: 'response'});
  }
  projectDetailsWithName(name) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/project_details/?name=' + name, {headers: this.headers,  observe: 'response'} );
  }

  projectSummary(id, start_date, end_date) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/summary/projects/?project_id=' + id +
    '&start_date=' + start_date + '&end_date=' + end_date,
    {headers: this.headers,  observe: 'response'} );
  }
}
