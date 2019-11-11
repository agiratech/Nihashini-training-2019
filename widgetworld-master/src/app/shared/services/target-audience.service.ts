import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {throwError as observableThrowError, Observable, of, BehaviorSubject} from 'rxjs';
import {map, publishReplay, refCount, tap} from 'rxjs/operators';
import {catchError, share} from 'rxjs/operators';
import {AppConfig} from '../../app-config.service';
import {LoaderService} from './loader.service';
import swal from 'sweetalert2';

@Injectable()
export class TargetAudienceService {
  private timer: any;
  public defaultAudience: any;
  private audience: Observable<any>;
  private savedAudience$: Observable<any> = null;
  private formattedSavedAudience$: Observable<any> = null;

  constructor(
    private httpClient: HttpClient,
    private auth: AuthenticationService,
    private config: AppConfig,
    public loader: LoaderService) {
  }

  private buildQueryString(data) {
    const params = [];
    Object.keys(data)
      .map(item => {
        if (data[item] && data[item] !== '') {
          params.push(item + '=' + data[item]);
        }
      });
    return params.join('&');
  }

  public getAudiencesFromApi(data = {}, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + 'audiences';
    const queryString = this.buildQueryString(data);
    return this.httpClient.get(requestUrl + '?' + queryString, {headers: reqHeaders}).pipe(catchError(this.handleError));
  }

  public searchAudiences(data): Observable<any> {
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + 'audiences/autocomplete';
    const queryString = this.buildQueryString(data);
    return this.httpClient
      .get(requestUrl + '?' + queryString)
      .pipe(catchError(this.handleError));
  }

  public handleError = (error: Response) => {
    if (error.status === 401) {
      this.auth.logout();
    }
    this.cancelSlowMessage(this);
    return observableThrowError(error);
  };

  public cancelSlowMessage(self: TargetAudienceService) {
    if (swal.isVisible()) {
      swal.close();
    }
    if (self.timer) {
      clearTimeout(self.timer);
    }
  }

  public getSavedAudiences(): Observable<any> {
    if (!this.savedAudience$) {
      const requestUrl = this.config.envSettings['API_ENDPOINT'] + 'audiences/collections';
      this.savedAudience$ = this.httpClient.get(requestUrl)
        .pipe(
          publishReplay(1),
          refCount(),
          catchError(this.handleError)
        );
    }
    return this.savedAudience$;
  }

  public getFormattedSavedAudiences(): Observable<any> {
    if (!this.formattedSavedAudience$) {
      this.formattedSavedAudience$ = this.getSavedAudiences()
        .pipe(map(response => {
            return response.audienceList.map(item => {
              const normalized = this.normalizeSavedAudienceData(item);
              item.displayLabel = normalized.displayLabel;
              item.selectedAudiences = normalized.selectedAudiences;
              return item;
            });
          }),
          publishReplay(1),
          refCount()
        );
    }
    return this.formattedSavedAudience$;
  }

  private normalizeSavedAudienceData(savedAudienceItem) {
    if (savedAudienceItem.audiencesInfo.length <= 0) {
      return {};
    }
    let final = '';
    const selected = [];
    savedAudienceItem.audiencesInfo.forEach(character => {
      Object.keys(character).forEach(item1 => {
        character[item1].forEach(item2 => {
          final += item2.catalog.split('.').pop() + ':' + item2.description + ' / ';
          selected.push({
            category: item2.catalog.split('.').pop(),
            description: item2.description,
          });
        });
      });
    });
    return {
      displayLabel: final.replace(/ \/ $/, ''),
      selectedAudiences: selected,
    };
  }

  public deleteAudience(id) {
    return this.httpClient.delete(this.config.envSettings['API_ENDPOINT'] + 'audiences/collections/' + id)
      .pipe(tap(res => {
        this.savedAudience$ = null;
        this.formattedSavedAudience$ = null;
      }));
  }

  public updateAudience(audience, audienceId): Observable<any> {
    return this.httpClient
      .patch(this.config.envSettings['API_ENDPOINT'] + 'audiences/collections/' + audienceId, audience)
      .pipe(tap(x => {
        this.savedAudience$ = null;
        this.formattedSavedAudience$ = null;
      }));
  }

  public saveAudience(audience): Observable<any> {
    return this.httpClient
      .post(this.config.envSettings['API_ENDPOINT'] + 'audiences/collections', audience)
      .pipe(tap(x => {
        this.savedAudience$ = null;
        this.formattedSavedAudience$ = null;
      }));
  }

  public getExploreSession() {
    return JSON.parse(localStorage.getItem('exploreSession'));
  }

  public findSavedAudienceById(id, audiences) {
    return audiences.filter((option) => option._id === id)[0];
  }

  public getDefaultAudience(noLoader = false) {
    const localStorageAudience = JSON.parse(localStorage.getItem('defaultAudience'));
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    if (this.defaultAudience) {
      return of(this.defaultAudience);
    } else if (this.audience) {
      return this.audience;
    } else if (localStorageAudience && Object.keys(localStorageAudience).length > 0) {
      return of(localStorageAudience);
    } else {
      this.audience = this.httpClient
        .get(this.config.envSettings['API_ENDPOINT'] + 'audiences/default', {headers: reqHeaders})
        .pipe(
          map(response => {
            this.audience = null;
            this.defaultAudience = response;
            localStorage.setItem('defaultAudience', JSON.stringify(response));
            return this.defaultAudience;
          }, err => {
            this.defaultAudience = {
              'audienceKey': 2032,
              'description': 'Persons 0+ yrs'
            };
            return this.defaultAudience;
          }),
          share());
      return this.audience;
    }
  }
}
