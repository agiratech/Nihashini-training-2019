import { Injectable } from '@angular/core';
import {BaseResponse} from '@interTypes/BaseResponse';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { AppConfig } from '../../app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlaceDetailsRequest, PlaceFilterParams } from '@interTypes/placeFilters';
import {PlaceAuditState, PlaceDetails, Status, OutCome, CreatePlaceReq, PlaceCreateResponse, PlaceType} from '@interTypes/Place-audit-types';
import {filter, map, publishReplay, refCount, take, retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesFiltersService {
  private filterSidenav = new Subject();
  private filterSidenavOut = new Subject();
  private poiData = new Subject();
  private filterLevelState = new Subject();
  public openFilterTab: number;
  private placeSets = new Subject();
  private selectedPlaceSet = new Subject();
  private locationFilterData = new Subject();
  private clearPlaseSetFilter = new Subject();
  private placeCoordinates = new Subject();
  private placeAuditState: BehaviorSubject<PlaceAuditState> = new BehaviorSubject<PlaceAuditState>(null);
  private newColumnOpened = new Subject();
  filterState = [{
    filterLevel: 1,
    searchHide: false,
    placeResultExpand: false
  }, {
    filterLevel: 1,
    searchHide: false,
    placeResultExpand: false
  }];
  private isNextPlace = new Subject();
  private isReloadAuditPlace = new Subject();
  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) { }
  /**
   * Use this function to set sidenav object
   * @param sidenav: MatSidenav object which will use to control filter sidenav.
   **/
  public setFilterSidenav(filterSidenav): void {
    this.filterSidenav.next(filterSidenav);
  }
  public getFilterSidenav(): Observable<any>  {
    return this.filterSidenav.asObservable();
  }

  /**
   * Use this function to set & update place coordinates
   * @param coordinates
   */
  public setPlaceCoords(coordinates): void {
    this.placeCoordinates.next(coordinates);
  }
  public getPlaceCoords(): Observable<any>  {
    return this.placeCoordinates.asObservable();
  }
  public setFilterSidenavOut(state): void {
    this.filterSidenavOut.next(state);
  }
  public getFilterSidenavOut(): Observable<any>  {
    return this.filterSidenavOut.asObservable();
  }

  public setLocationFilter(state): void {
    this.locationFilterData.next(state);
  }
  public getLocationFilter(): Observable<any>  {
    return this.locationFilterData.asObservable();
  }
  /**
   *
   * @param state set the applied palce in plase set dialog
   */
  public setSelectedPlaceSet(place): void {
    this.selectedPlaceSet.next(place);
  }
  /**
   * This function is to get the applied places
   */
  public getSelectedPlaceSet(): Observable<any>  {
    return this.selectedPlaceSet.asObservable();
  }

  /**
   * This function is to get the places data from API
   * @param params api body will pass.
   */
  public getPlaces(params: Partial<PlaceFilterParams>) {

    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/poi/summary';
    // if (params['summaryId']) {
    //   url += '/' + params['summaryId'];
    // }
    return this.http.post(url, params);
  }

  /**
   * To get place details of a single or multiple places using their name
   * @param body Type of PlaceDetailsRequest API
   * @param noLoader boolean to decide whether to display the loding spinner
   * @return Observable<PlaceDetailsModel>
   */
  public getPlaceDetails(body: PlaceDetailsRequest, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(this.config.envSettings['API_ENDPOINT'] + 'locations/poi', body, {headers: reqHeaders});
  }

  public setPoiData(data): void {
    this.poiData.next(data);
  }
  public getPoiData(): Observable<any>  {
    return this.poiData.asObservable();
  }

  public getFilterLevelState(): Observable<any>  {
    return this.filterLevelState.asObservable();
  }
  public setFilterLevelState(state): void {
    this.filterLevelState.next(state);
  }
  public setFilterLevel(state) {
    if (this.openFilterTab >= 0 && this.openFilterTab !== 2) {
      if (state['filterLevel']) {
        this.filterState[this.openFilterTab]['filterLevel'] = state['filterLevel'];
      }
      if (state['searchHide']) {
        this.filterState[this.openFilterTab]['searchHide'] = state['searchHide'];
      } else if (!state['searchHide'] && state['searchHide'] !== undefined) {
        this.filterState[this.openFilterTab]['searchHide'] = state['searchHide'];
      }
      if (state['placeResultExpand']) {
        this.filterState[this.openFilterTab]['placeResultExpand'] = state['placeResultExpand'];
      } else if (!state['placeResultExpand'] && state['placeResultExpand'] !== undefined) {
        this.filterState[this.openFilterTab]['placeResultExpand'] = state['placeResultExpand'];
      }
      if (state['clear'] <= 1) {
        this.filterState[state['clear']]['filterLevel'] = 1;
        this.filterState[state['clear']]['searchHide'] = false;
        this.filterState[state['clear']]['placeResultExpand'] = false;
      }
      this.setFilterLevelState(this.filterState);
    }
  }

  /**
   * @param filter Here filter is text, like: mcd, cms.
   * @param keyword.
   * @param noLoader Here 'noLoader' is boolean, decide whether to display the loader or not.
  */
  getPOISuggestion(filter, keyword, noLoader = false): Observable<any> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/poi/autocomplete?text=${filter}&category=${keyword}`;
    let reqHeaders;
    
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders});
  }

   /**
   * This function is to get particular POI details by ID
   * @param placeId
   */
  getSinglePoi(placeId, noLoader = false) {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/poi/${placeId}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders});
  }

  /**
   * This service is to get mutliple pois information
   * @param poids array of poids to get data
   */
  getMultiplePois(poids) {
    const data = {
      ids: poids
    };
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/poi/groups';
    return this.http.post(requestUrl, data);
  }
  public savePlacesSession(type, data) {
    let sessionData = this.getPlacesSession();
    if (sessionData) {
      sessionData[type] = data;
    } else {
      sessionData = {};
      sessionData[type] = data;
    }
    localStorage.setItem('placesSession', JSON.stringify(sessionData));
  }
  public getPlacesSession() {
    return JSON.parse(localStorage.getItem('placesSession'));
  }

  /**
   * This funcation used to get places set and based on place id to get places set detils
   * @param placeId
   */
  getPlacesSet(placeId = null, loader = false) {

    let requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/place/collections`;
    let reqHeaders;

    if (placeId) {
      requestUrl += `/${placeId}?details=true`;
    }
    if (loader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, { headers: reqHeaders });
  }
  /**
  * This function is to save the places set
  * @param places
  */
  savePlaceSet(places) {
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + `locations/place/collections`;
    return this.http.post(requestUrl, places);
  }

  /**
    * This function is to update the existing place set
    * @param placeSet
    * @param placeId
    */
  updatePlaceSet(placeSet, placeId) {
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + `locations/place/collections/${placeId}`;
    return this.http.patch(requestUrl, placeSet);
  }

  /**
    * This function used to delete the particular place set using place id
    * @param placeId
    */
  deletePlaceSet(placeId) {
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + `locations/place/collections/${placeId}`;
    return this.http.delete(requestUrl);
  }
 
  /** Place Audit Related APIs */

  /**
   * This function is to get the places data from API
   * @param params api body will pass.
   */
  getPlaceSetsSummary(params, group: boolean = false, noLoader = false) {
    let reqHeaders = null;
    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/place/collections/summary?group=' + group;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(url, params);
  }
  /**
   * This function is to get particular POI details by ID
   * @param placeId
   */
  getDetailOfSinglePoi(placeId, period = 'Last Year, Latest Month', noLoader = false) {
    let requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/places/${placeId}/details`;
    if (period) {
      requestUrl = requestUrl + `?measure_period=${period}`;
    }
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders});
  }
  /**
   *
   * @param placeId  safegraph_place_id
   * @param message This is send email params
   */
  requestAudit(placeId, message) {
    const URL =  this.config.envSettings['API_ENDPOINT'] + `locations/places/${placeId}/audits/requests`;
    return this.http.post(URL, message);
  }
  public getUnAuditedPlaceByID(placeId: string | number, clientId: string | number): Observable<PlaceDetails> {
    const URL =  `${this.config.envSettings['API_ENDPOINT']}locations/accounts/${clientId}/places/${placeId}`;
    return this.http.get<PlaceDetails>(URL);
  }
  public getAuditedPlaceByID(placeId: number | string): Observable<PlaceDetails> {
    const URL =  `${this.config.envSettings['API_ENDPOINT']}locations/places/${placeId}`;
    return this.http.get<PlaceDetails>(URL);
  }
  public getPlaceAudit(): Observable<PlaceAuditState> {
    return this.placeAuditState.asObservable();
  }
  public setPlaceAudit(data: PlaceAuditState | null): void {
    this.placeAuditState.next(data);
  }
  public loadNextPlace(): Observable<any> {
    return this.isNextPlace.asObservable();
  }
  public setLoadNextPlace(data): void {
    this.isNextPlace.next(data);
  }
  public reloadAuditPlace(): Observable<any> {
    return this.isReloadAuditPlace.asObservable();
  }
  public setReloadAuditPlace(data): void {
    this.isReloadAuditPlace.next(data);
  }
  /**
   * This functions is to get the customers/clients list
   */
  public getCustomersList(noLoader = false): Observable<any> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/accounts/';
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders});
  }


  /**
   * This function is to upload places csv
   * @param customerId selected customer Id
   * @param logoInfo uploaded file info
   * @param noLoader
   */
  public uploadFile(customerId, logoInfo, noLoader = false): Observable<any> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/accounts/${customerId}/places/import?type=document`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(requestUrl, logoInfo, {headers: reqHeaders});
  }

  /**
   * This functions is to get the db field names for places
   */
  public getDBFields(noLoader = false, csv = false): Observable<any> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/places/user_defined/fields';
    let reqHeaders = new HttpHeaders();
    let options = {};
    if (noLoader) {
      reqHeaders = reqHeaders.set('hide-loader', 'hide-loader');
    }
    if (csv) {
      reqHeaders = reqHeaders.set('Accept', 'text/csv');
      options = {observe: 'response', responseType: 'blob'};
    }
    options['headers'] = reqHeaders;
    return this.http.get(requestUrl, options);
  }

  /**
   * This functions is to send matched field names of csv and places db
   * @param customerId selected customer Id
   * @param filename uploaded file name sent by API
   * @param mappingInfo csv and db fields mapping info
   * @param noLoader
   */
  public updateCsvFieldsMapping(customerId, filename, mappingInfo, noLoader = false): Observable<any> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + `locations/accounts/${customerId}/places/import/${filename}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(requestUrl, mappingInfo, {headers: reqHeaders});
  }


  /**
   * This functions is to get the updated csv file status info
   */
  public getJobs(noLoader = false): Observable<any> {
    // TODO: Below url need to be changed when we get original URL.
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/places/user_defined/fields';
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders});
  }

  /**
   * This function is used to get the requested audited places group by statuses.
   */
  getAuditPlaces(noLoader = false, size = 0, client = null, status = null, page = 1) {
    let reqHeaders = null;
    let url = this.config.envSettings['API_ENDPOINT'] + 'locations/accounts/places/audited?page_size=' + size;
    if (status !== null) {
      url += '&status=' + status;
    }
    if (status !== null) {
      url += '&client=' + client;
    }
    if (page !== null) {
      url += '&page=' + page;
    }
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(url, {headers : reqHeaders});
  }

  /**
   * This functions is to get the list of statuses for the audited places
   */
  public getPlaceStatuses(noLoader = false): Observable<Status[]> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/accounts/places/statuses';
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders})
      .pipe(
        filter(response => response['statuses']),
        map(response => response['statuses']),
        publishReplay(1, 10000),
        refCount(),
        take(1));
  }

  /**
    * This function is to update the existing place set
    * @param placeId The audit place id which needs to be updated
    * @param statusId The id of the status need to assign to the place
    */
   public updateAuditPlaceStatus(placeId: number, statusId: number, noLoader = false) {
    const status = { status_id: statusId };
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + `locations/places/${placeId}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.patch(requestUrl, status, {headers: reqHeaders});
  }

  public createAuditedPlace(data: CreatePlaceReq): Observable<BaseResponse<PlaceCreateResponse>> {
    const URL = `${this.config.envSettings['API_ENDPOINT']}locations/places/audited`;
    return this.http.post<BaseResponse<PlaceCreateResponse>>(URL, data);
  }
  public updateAuditedPlace(data: CreatePlaceReq, placeId: string | number): Observable<BaseResponse<any>> {
    const URL = `${this.config.envSettings['API_ENDPOINT']}locations/places/${placeId}`;
    return this.http.put<BaseResponse<any>>(URL, data);
  }



  /**
   * This functions is to get the list of place outcomes for the auditing
   */
  public getPlacesOutcomes(noLoader = false): Observable<OutCome[]> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/accounts/places/outcomes';
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders})
      .pipe(
        filter(response => response['outcomes']),
        map(response => response['outcomes']),
        publishReplay(1, 10000),
        refCount(),
        take(1));
  }

  /**
   * This functions is to get the list of place types for the auditing
   */
  public getPlaceTypes(noLoader = false): Observable<PlaceType[]> {
    const requestUrl =  this.config.envSettings['API_ENDPOINT'] + 'locations/accounts/places/types';
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders})
      .pipe(
        filter(response => response['place_types']),
        map(response => response['place_types']),
        publishReplay(1, 10000),
        refCount(),
        take(1));
  }

  /**
    * This function is to link the place id with user defined place
    * @param clientId The Id of the client
    * @param placeId The audit place id which needs to be updated
    * @param userPlaceId The user defined place id which needs to be link with place
    */
   public linkPlacetoUserPlace(clientId: number, placeId: number, userPlaceId: number, noLoader = false) {
    const placeObj = { place_id: placeId };
    const requestUrl = this.config.envSettings['API_ENDPOINT'] + `locations/accounts/${clientId}/places/${userPlaceId}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.patch(requestUrl, placeObj, {headers: reqHeaders})
    .pipe(retry(3));
  }

  public setClearPlaseSetFilter(clearType): void {
    this.clearPlaseSetFilter.next(clearType);
  }
  /**
   * This function is to get the place set close
   */
  public getClearPlaseSetFilter(): Observable<any>  {
    return this.clearPlaseSetFilter.asObservable();
  }

  public setNewColumnOpened(clearType): void {
    this.newColumnOpened.next(clearType);
  }
  /**
   * This function is to get the place set close
   */
  public getNewColumnOpened(): Observable<any>  {
    return this.newColumnOpened.asObservable();
  }
  

}
