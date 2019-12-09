import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment} from '../../environments/environment';

@Injectable()
export class TemplatesService {

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

  /* get all Templates */
  getTemplates(cloneTemplate?) {
    this.getHeaders();
    let url = environment.api_url + '/templates' + ( cloneTemplate ? '?clone_template=true' : '' );
    return this.http.get(url, {headers: this.headers,  observe: 'response'} );
  }

  /* Creating Template */
  createTemplate(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/templates', value, {headers: this.headers,  observe: 'response'} );
  }

  /* GET Template by ID*/
  getTemplate(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/templates/' + id, {headers: this.headers,  observe: 'response'} );
  }

  /* Updating Template */
  updateTemplate(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/templates/' + value.template.id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Deleting Template */
  deleteTemplate(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/templates/' + id), {headers: this.headers,  observe: 'response'} );
  }

  /* Updating Template */
  updateTemplateData(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/templates/' + value.id, value, {headers: this.headers,  observe: 'response'} );
  }

}
