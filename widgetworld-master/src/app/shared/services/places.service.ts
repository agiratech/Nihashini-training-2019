import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppConfig} from '../../app-config.service';


@Injectable()
export class PlacesService {
  public headers = new Headers({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*, *'});

  constructor(
    private httpClient: HttpClient,
    private config: AppConfig
  ) {
  }

  /* getPlacesSet() {
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT'] + 'locations/places');
  } */
  /**
   * This funcation used to get places set and based on place id to get places set detils
   * @param placeId
   */
  getPlacesSet(placeId = null) {

    let requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/place/collections`;
    let reqHeaders;

    if (placeId) {
      requestUrl += `/${placeId}?details=true`;
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient.get(requestUrl, { headers: reqHeaders });
  }
  /**
   * This used to get the places data from API
   * @param params api body will pass.
   */
  getPlaceSetsSummary(params, group: boolean = false, noLoader = false) {
    let reqHeaders = null;
    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/place/collections/summary?group=' + group;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient.post(url, params);
  }
}
