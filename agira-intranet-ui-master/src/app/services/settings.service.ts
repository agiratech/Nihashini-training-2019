import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment} from '../../environments/environment';



@Injectable()
export class SettingsService {

  constructor(
    private http: HttpClient
  ) { }
  headers;

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

  /* Updating the Settings */
  updateSetting(value) {
    this.getHeaders();
    return this.http.put(environment.api_url + '/settings/' + value.settings.id, value, {headers: this.headers,  observe: 'response'} );
  }

  /* Getting Settings Value  */
  getSettings() {
    this.getHeaders();
    return this.http.get(environment.api_url + '/settings', {headers: this.headers,  observe: 'response'} );
  }

  getAssessmentYears() {
    this.getHeaders();
    return this.http.get(environment.api_url + '/assessment_years', {headers: this.headers,  observe: 'response'} );
  }
}
