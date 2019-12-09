import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Config } from 'protractor/built/config';
import { environment} from '../../environments/environment';

@Injectable()
export class ClientService {

  headers ;
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
      localStorage.setItem('access-token', data.headers.get('access-token') );
      localStorage.setItem('client', data.headers.get('client'));
      localStorage.setItem('expiry', data.headers.get('expiry'));
      localStorage.setItem('uid', data.headers.get('uid'));
    }
  }

  createClient(value) {
    this.getHeaders();
    return this.http.post(environment.api_url + '/clients', value, {headers: this.headers,  observe: 'response'} );
  }

  clientDetails(id) {
    this.getHeaders();
    return this.http.get(environment.api_url + '/clients/' + id, {headers: this.headers,  observe: 'response'} );
  }

  getClients() {
    this.getHeaders();
    return this.http.get(environment.api_url + '/clients', {headers: this.headers,  observe: 'response'} );
  }

  updateClient(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/clients/' + value.client.id, value, {headers: this.headers,  observe: 'response'} );
  }

  deleteClient(id) {
    this.getHeaders();
    return this.http.delete((environment.api_url + '/clients/' + id), {headers: this.headers,  observe: 'response'} );
  }
}
