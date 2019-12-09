import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response,  RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment} from '../../environments/environment';

@Injectable()
export class TemplatesMetricService {

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


  createMetric(model, template_id){
    this.getHeaders();
    return this.http.post((environment.api_url+'/templates/'+template_id+'/template_metrics'),model,{headers: this.headers,  observe: 'response'} )
  }

  getTemplateMetrics(template_id){
    this.getHeaders();
    return this.http.get((environment.api_url+'/templates/'+template_id+'/template_metrics'),{headers: this.headers,  observe: 'response'} )
  }

}
