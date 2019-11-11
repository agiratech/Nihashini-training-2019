
import { throwError as observableThrowError, Observable, BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../app-config.service';
import { catchError } from 'rxjs/operators';
import swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthenticationService {
  public userDataUpdate: Subject<boolean> = new Subject();
  public userData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private userDataArray: any;
  constructor(private router: Router,
    private httpClient: HttpClient,
    private config: AppConfig) {
  }

  login(data): Observable<any> {
    return this.httpClient.post(window.location.origin + '/login', data).pipe(catchError(this.handleError));
  }
  logout(decline = false) {
    localStorage.removeItem('token');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('user_data');
    localStorage.removeItem('module_access');
    localStorage.removeItem('dontShowAgreement');
    localStorage.removeItem('userAgreementAgreed');
    localStorage.removeItem('exploreSession');
    localStorage.removeItem('workSpaceSession');
    localStorage.removeItem('placesSession');
    localStorage.removeItem('savedExploreSession');
    localStorage.removeItem('customColumn');
    localStorage.removeItem('layersSession');
    localStorage.clear();
    zdObject.destroyIdentify();
    fsObject.destroyIdentify();
    this.router.navigate(['/user/login']);
   /* if (!decline) {
      this.router.navigate(['/user/login']).then(() => {
        location.reload();
      });
    }*/
  }
  validateToken(): Observable<any> {
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT'] + 'users');
  }
  getUserData() {
    this.userDataArray = JSON.parse(localStorage.getItem('user_data'));
    const userData = {
      'name': '',
      'family_name': '',
      'email': '',
      'company': '',
      'title': '',
      'picture': '',
      'gpLoginStatus': true,
    };
    if (this.userDataArray) {
      userData.name = this.userDataArray['given-name'];
      userData.family_name = this.userDataArray['family-name'];
      userData.email = this.userDataArray['email'];
      userData.company = this.userDataArray['company'];
      userData.title = this.userDataArray['title'];
      userData.picture = this.userDataArray['picture'];
      userData.gpLoginStatus = this.userDataArray.token['gpLoginStatus'];
    }
    return userData;
  }
  resetPassword(data: any): Observable<any> {
    return this.httpClient.post(window.location.origin + '/reset', data);
    // return this.httpClient.post(this.config.envSettings['API_ENDPOINT'] + 'users/reset', data);
  }
  createIdentify() {
    if (localStorage.getItem('user_data')) {
      const data = JSON.parse(localStorage.getItem('user_data'));
      const email = data['email'];
      const subdomain = window.location.hostname;
      const fsdetails = {
        'subdomain_str': subdomain,
        'placesDemoEnd_date': data['places_demoEnd'],
        'placesSubscriptionEnd_date': data['places_subscriptionEnd'],
        'placesSubscription_str': data['places_subscription'],
        'familyName_str': data['family-name'],
        'givenName_str': data['given-name'],
        'displayName': data['given-name'] + ' '
          + data['family-name'] !== ' ' ? data['given-name'] + ' ' + data['family-name'] : data['email'],
        'displayName_str': data['given-name'] + ' ' + data['family-name'],
        'email': data['email'],
        'version': environment.version
      };
      fsObject.createIdentify(email, fsdetails);
      zdObject.createIdentify(email, fsdetails);
    }
  }
  setModuleAccess(module_access) {
    localStorage.setItem('module_access', JSON.stringify(module_access));
  }
  getModuleAccess(mod) {
    let module_access = {};
    const modules = localStorage.getItem('module_access');
    if (modules != null) {
      module_access = JSON.parse(modules);
      return module_access[mod];
    } else {
      return module_access;
    }

  }
  updateProfile(data) {
    return this.httpClient.patch(this.config.envSettings['API_ENDPOINT'] + 'users', data).pipe(catchError(this.handleError));
  }
  setUserData(data) {
    try {
      const self = this;
      const module_access = data.user_module_access;
      data['places_subscription'] = '';
      data['places_subscriptionEnd'] = '';
      data['places_demoEnd'] = '';
      data['family-name'] = this.checkAndReturn(data, 'family-name');
      data['given-name'] = this.checkAndReturn(data, 'given-name');
      data['company'] = this.checkAndReturn(data, 'company');
      data['title'] = this.checkAndReturn(data, 'title');
      data['picture'] = this.checkAndReturn(data, 'picture');
      data['markets_requested'] = [];
      data['markets_demo'] = [];
      data['markets_subscribed'] = [];
      data['markets_requested'] = [];
      data['places_requested'] = [];
      data['places_demo'] = [];
      data['access_token'] = data.token.access_token;
      localStorage.setItem('user_data', JSON.stringify(data));
      this.setModuleAccess(module_access);
      this.createIdentify();
      self.userDataUpdate.next(true);
      return true;
    } catch (e) {
      return false;
    }
  }

  updateAgreeAccept() {
    return this.httpClient.post(this.config.envSettings['API_ENDPOINT'] + 'users/accept', []).pipe(catchError(this.handleError));
  }
  public handleError = (error: Response) => {
    const err = JSON.parse(error['_body']);
    if (err['statusCode'] === '401') {
      swal('Sorry', 'Authentication fail');
      this.logout();
    }
    return observableThrowError(error);
  }
  public checkAndReturn(data, key) {
    if (data[key]) {
      return data[key];
    }
    return '';
  }


  /**
   *Function to send email on submit of public Login
   *sample data={username:'xxx@domain.com'}
   * @param {object} data
   * @returns {Observable<any>}
   * @memberof AuthenticationService
   */
  publicLoginEmail(data): Observable<any> {
    return this.httpClient.post(window.location.origin + '/login/getcode', data).pipe(catchError(this.handleError));
  }

  /**
   *function is to login for Public site
   *sample data data={username:'xxx.domain.com,password:'.....'}
   * @param {object} data
   * @returns {Observable<any>}
   * @memberof AuthenticationService
   */
  publicLogin(data): Observable<any> {
    return this.httpClient.post(window.location.origin + '/login/passwordless', data).pipe(catchError(this.handleError));
  }
}
