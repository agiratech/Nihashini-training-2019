import { saveAs } from 'file-saver';

import { BulkExportRequest } from '@interTypes/bulkExport';
import { throwError as observableThrowError, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { LoaderService } from './loader.service';
import swal from 'sweetalert2';
import { AppConfig } from '../../app-config.service';
import { catchError } from 'rxjs/operators';
import { ExploreDataService } from './explore-data.service';
import { ThemeService } from './theme.service';
import { GradientColor } from 'app/classes/gradient-color';
import { environment } from './../../../environments/environment';
import { MapLegendsService } from '@shared/services/map-legends.service';
// import {LayersService} from '../../explore/layer-display-options/layers.service';

@Injectable()
export class ExploreService {
  public hideLoaders = new Subject();
  private timer: any;
  public savedLayes = new Subject();
  public openThresholds = new Subject();
  constructor(
    private httpClient: HttpClient,
    private auth: AuthenticationService,
    public loader: LoaderService,
    public exploreDataService: ExploreDataService,
    public theme: ThemeService,
    public mapLegendsService: MapLegendsService,
    private config: AppConfig) {
  }

  slowCalcMessage(self: ExploreService, triggerSource = 'unknown') {
    this.cancelSlowMessage(self);
    self.timer = setTimeout(() => {
      // hide loader when popup appears
      this.loader.display(false);
      swal({
        html: `<div class="smiling-face">
                <i class="material-icons">tag_faces</i>
             </div>
             <h3>We've received your request!</h3>
             <p class="content-area">These types of queries typically take 1 to 2 minutes to execute.
              Feel free to browse during the process.
              <span>
                Please search again in a couple of minutes, and it will appear immediately!
              </span>
             </p>`,
        customClass: 'slow-calc-msg',
        confirmButtonText: 'CONTINUE',
        confirmButtonColor: 'var(--button-bg-color)',
        showCloseButton: true,
        confirmButtonClass: 'waves-effect waves-light',
        cancelButtonClass: 'waves-effect waves-light'
      }).then(confirm => {
        if (confirm) {
          self.loader.display(false);
          self.hideLoaders.next(true);
        }
      });
    }, 30000);
  }

  cancelSlowMessage(self: ExploreService) {
    if (swal.isVisible()) {
      swal.close();
    }
    if (self.timer) {
      clearTimeout(self.timer);
    }
  }

  getInventorySummary(data, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }

    return this.httpClient.post(this.config.envSettings['API_ENDPOINT']
      + 'inventory/summary/', data, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  public handleError = (error: Response) => {
    if (error.status === 401) {
      this.auth.logout();
    }
    this.cancelSlowMessage(this);
    return observableThrowError(error);
  }

  getMarketData(noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT']
      + 'inventory/markets', { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  getInventoryDetailZipDMA(data, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    let url = this.config.envSettings['API_ENDPOINT'] +
    'inventory/homes?panel_id=' + data['fid'] + '&reporting_level=' + data['replevel'] +
     '&target_segment=' + data['target_segment'];
    if (data['target_geography']) {
      url += `&target_geography=${data['target_geography']}`;
    }
    return this.httpClient.get(url, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  getVenuesData(placeid): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'inventory/places?placeid=' + placeid;
    return this.httpClient.get(url).pipe(catchError(this.handleError));
  }
  getImageURL(geoPanelId: number, imageType = 'h180p'): string {
    return 'https://assets.geopath.io/inventory/images/photo_' +
      String(geoPanelId).trim() +
      '_0_' + imageType + '.jpeg';
  }
  getBigImageURL(geoPanelId: number): string {
    return 'https://assets.geopath.io/inventory/images/photo_' +
      String(geoPanelId).trim() +
      '_0.jpeg';
  }
  getmarketSearch(location, noLoader = false): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'markets?q=' + location;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient
      .get(url, { headers: reqHeaders })
      .pipe(catchError(this.handleError));
  }
  getmarketGeometry(marketlocation): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'] + 'markets/' + marketlocation.type + '/' + marketlocation.id;
    return this.httpClient.get(url).pipe(catchError(this.handleError));
  }
  /**
   *
   * @param layers saved view layers
   */
  saveLayerView(layers): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'];
    return this.httpClient.post(this.config.envSettings['API_ENDPOINT'] + 'views/collections/', layers).pipe(catchError(this.handleError));
  }
  updateLayerView(layers, id): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'];
    return this.httpClient
      .patch(this.config.envSettings['API_ENDPOINT'] + 'views/collections/' + id, layers)
      .pipe(catchError(this.handleError));
  }
  getLayerViews(): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'];
    let reqHeaders;
    reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    return this.httpClient
      .get(this.config.envSettings['API_ENDPOINT'] + 'views/collections', { headers: reqHeaders })
      .pipe(catchError(this.handleError));
  }
  /**
   * get saved layer by ID
   * @param id the saved view id
   * @param details the flag to define retrive details or not.
   */
  getLayerView(id, details = false): Observable<any> {
    const url = this.config.envSettings['API_ENDPOINT'];
    let detailParam = '';
    if (details) {
      detailParam = '?details=true';
    }
    let reqHeaders;
    reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    return this.httpClient
      .get(this.config.envSettings['API_ENDPOINT'] + 'views/collections/' + id + detailParam, { headers: reqHeaders })
      .pipe(catchError(this.handleError));
  }
  public getSavedLayers(): Observable<any> {
    return this.savedLayes.asObservable();
  }
  public setSavedLayes(layers) {
    this.savedLayes.next(layers);
  }


  public uploadLogo(id, data, prevoisLocation = ''): Observable<any> {
    let imageInfo: any;
    if (data) {
      imageInfo = data;
    }
    if (prevoisLocation) {
      return this.httpClient.patch(this.config.envSettings['API_ENDPOINT'] + 'views/collections/'
        + id + '/logo?key=' + prevoisLocation, imageInfo).pipe(catchError(this.handleError));
    } else {
      return this.httpClient.patch(this.config.envSettings['API_ENDPOINT'] + 'views/collections/'
        + id + '/logo', imageInfo).pipe(catchError(this.handleError));
    }
  }

  /**
   *
   * @param id delete the saved layer view using id
   */
  deleteLayer(id) {
    return this.httpClient.delete(this.config.envSettings['API_ENDPOINT'] + 'views/collections/' + id);
  }

  // download pdf
  public downloadPdf(data, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const url = this.config.envSettings['API_ENDPOINT'] + 'reports/inventory';
    return this.httpClient.post(url, data, { headers: reqHeaders, observe: 'response', responseType: 'blob' }).pipe(catchError(this.handleError));
  }

  // openThresholds panel
  public getThresholdsPanel(): Observable<any> {
    return this.openThresholds.asObservable();
  }
  public setThresholdsPanel(state) {
    this.openThresholds.next(state);
  }

  /** The below API won't work as database is deprecated.
   * We need to request new API when this functionality is enabled.
  */
  getThresholdHistogram(data, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }

    return this.httpClient.post(this.config.envSettings['API_ENDPOINT']
      + 'inventory/histogram/', data, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  public inventoriesBulkExport(data: BulkExportRequest, noLoader = false) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const url = this.config.envSettings['API_ENDPOINT'] + 'reports/inventory';
    return this.httpClient.post(url, data, { observe: 'response', responseType: 'blob', headers: reqHeaders })
      .pipe(catchError(this.handleError));
  }

  /**
  * getInventoryFilters function to get the data from inventory/filters.
  * @param data it contains the applied filters information
  * @param noLoader it will control loader.
  * @returns returns a http post subscriber.
  */
  public getInventoryFilters(data: object, noLoader = false) {
    delete data['sort'];
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }

    return this.httpClient.post(this.config.envSettings['API_ENDPOINT']
      + 'inventory/filters/', data, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  generateKeyLegends(exploreMap, layerSession, mapStyle, zoomLevel) {
    let relatedFeatures;
    const inventoriesMarkers = [];
    const inventoryGroups = this.exploreDataService.getInventoryGroups();
    const inventoryGroupsPlaces = this.exploreDataService.getInventoryGroupsPlaces();
    const themeSettings = this.theme.getThemeSettings();
    this.mapLegendsService.clearKeyLegend(['inventoriesMarkers', 'customLayerMarkers', 'placesMarkers']);
    const layers = [
      'grayed_frames_panel',
      'color_frames_panel'
    ];
    if (exploreMap.getLayer('places') && exploreMap.getLayoutProperty('places', 'visibility') === 'visible') {
      const poiFeatures = exploreMap.queryRenderedFeatures({ layers: ['places'] });
      const placeIcon = { 'displayName': 'Place-Based', 'icons': [] };
      if (poiFeatures && poiFeatures.length > 0) {
        placeIcon['icons'].push({
          color: inventoryGroupsPlaces[0]['colors'][mapStyle],
          font: 'place',
          type: 'icon'
        });
      }
      if (exploreMap.getLayer('framesLayer')) {
        const poiFFeatures = exploreMap.queryRenderedFeatures({ layers: ['framesLayer'] });
        if (poiFFeatures && poiFFeatures.length > 0) {
          placeIcon['icons'].push({
            color: inventoryGroupsPlaces[0]['colors'][mapStyle],
            font: inventoryGroupsPlaces[0]['print']['font'],
            type: 'icon'
          });
        }
      }
      if (placeIcon['icons'].length > 0) {
        inventoriesMarkers.push(placeIcon);
      }
    }
    if (zoomLevel < 7) {
      const tempKey = { 'displayName': 'Spot', 'icons': [] };
      tempKey['icons'].push({
        color: themeSettings['color_sets']['secondary']['base'],
        font: 'icon-circle',
        type: 'icon'
      });
      inventoriesMarkers.push(tempKey);
    }
    if (zoomLevel >= 7) {
      relatedFeatures = exploreMap.queryRenderedFeatures({
        layers
      });
      // gettting mtid from features
      let media_types = relatedFeatures.map(feature => feature.properties.mtid);
      // Removing duplicates from media type id
      media_types = Array.from(new Set(media_types));
      for (const group in inventoryGroups) {
        if (inventoryGroups.hasOwnProperty(group)) {
          const groupData = JSON.parse(JSON.stringify(inventoryGroups[group]));
          const mtidPrintRes = media_types.filter(type => groupData.mtidPrint.indexOf(type) !== -1);
          const mtidDigitalRes = media_types.filter(type => groupData.mtidDigital.indexOf(type) !== -1);
          if (mtidPrintRes.length > 0 || mtidDigitalRes.length > 0) {
            const inventoryLegend = { 'displayName': groupData['displayName'], 'icons': [] };
            if (zoomLevel < 11) {
              if (mtidPrintRes.length > 0 || mtidDigitalRes.length > 0) {
                inventoryLegend['icons'].push({
                  color: groupData['colors'][mapStyle],
                  font: 'icon-circle',
                  type: 'icon'
                });
              }
            } else {
              if (mtidPrintRes.length > 0) {
                inventoryLegend['icons'].push({
                  color: groupData['colors'][mapStyle],
                  font: groupData['print']['font'],
                  type: 'icon'
                });
              }
              if (mtidDigitalRes.length > 0) {
                inventoryLegend['icons'].push({
                  color: groupData['colors'][mapStyle],
                  font: groupData['digital']['font'],
                  type: 'icon'
                });
              }
            }
            if (inventoryLegend['icons'].length > 0) {
              inventoriesMarkers.push(inventoryLegend);
            }
          }
        }
      }
    }
    if (exploreMap.getLayer('pointOfInterests')) {
      const pointOfInterests = exploreMap.queryRenderedFeatures({ layers: ['pointOfInterests'] });
      if (pointOfInterests && pointOfInterests.length > 0) {
        const poiIcon = { 'displayName': 'SAVED PLACE', 'icons': [] };
        poiIcon['icons'].push({
          color: themeSettings['color_sets']['primary']['base'],
          font: 'icon-android-radio-button-on',
          type: 'icon'
        });
        inventoriesMarkers.push(poiIcon);
      }
    }
    if (inventoriesMarkers.length > 0) {
      this.mapLegendsService.pushKeyLegends(inventoriesMarkers, 'inventoriesMarkers');
    }

    // Pushing Key Legends of Custom Layer and Display Views.

    // const layerSession = this.layersService.getlayersSession();
    if (layerSession && layerSession.selectedLayers) {
      const viewLayerkeyLegends = [];
      layerSession.selectedLayers.map(layer => {
        const viewLegend = { 'displayName': '', 'icons': [] };
        // const iconType = layer.icon && layer.icon || (layer.type === 'place collection' && 'place' || 'lens');
        // const font = iconType === 'place' ? 'map-marker' : (iconType !== 'lens' ? 'android-radio-button-on' : 'circle');
        const font = layer.icon;
        switch (layer.type) {
          case 'place':
            viewLegend['displayName'] = layer['data']['properties']['location_name'];
            viewLegend['icons'].push({
              color: layer.color && layer.color
                || themeSettings['color_sets']['primary']
                && themeSettings['color_sets']['primary']['base'],
              font: font,
              type: 'icon'
            });
            viewLayerkeyLegends.push(viewLegend);
            break;
          case 'geopathId':
            viewLegend['displayName'] = 'Geopath Spot ID ' + layer.id;
            const color = layer.color || themeSettings['color_sets']['primary']['base'];
            viewLegend['icons'].push({
              color: color,
              font: font,
              type: 'icon'
            });
            viewLayerkeyLegends.push(viewLegend);
            break;
          default:
            viewLegend['displayName'] = layer['data']['name'];
            viewLegend['icons'].push({
              color: layer.color && layer.color
                || themeSettings['color_sets']['primary']
                && themeSettings['color_sets']['primary']['base'],
              font: font,
              type: 'icon'
            });
            viewLayerkeyLegends.push(viewLegend);
            break;
        }
      });
      if (viewLayerkeyLegends.length > 0) {
        this.mapLegendsService.pushKeyLegends(viewLayerkeyLegends, 'customLayerMarkers');
      }
    }
  }
  /**
 * generate 5 colors using parent color
 * @param color primary or secondary color
 * @return 5 colors based on parents color
 */
  public colorGenerater(color: string) {
    const grad = new GradientColor();
    const colors = grad.generate(
      color,
      7);
    // remove laste index color
    colors.pop();
    return colors;
  }

  /**
   * This function is to add a new note to the Inventory
   * @param featureID Inventory Id
   * @param note
   * @param noLoader
   */
  public addNotesToInventory(featureID: number, note: string, noLoader = false): Observable<any> {
    let reqHeaders = new HttpHeaders();
    if (noLoader) {
      reqHeaders = reqHeaders.set('hide-loader', 'hide-loader');
    }
    let url = '';
    if (environment.production) {
      url = `${this.config.envSettings['API_ENDPOINT']}notes/inventory/${featureID}?type=inventory`;
    } else {
      // As we have to change origin for local testing, here we are calling front end node API for development
      url = `${window.location.origin}/notes/inventory/${featureID}?type=inventory`;
    }
    return this.httpClient.post(url, { notes: note }, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }

  /**
   * This function is to update the existing note of an Inventory
   * @param noteId The id of note which we need to update
   * @param note The text which we need to do update
   * @param noLoader
   */
  public updateInventoryNote(noteId: number, note: string, noLoader = false): Observable<any> {
    let reqHeaders = new HttpHeaders();
    if (noLoader) {
      reqHeaders = reqHeaders.set('hide-loader', 'hide-loader');
    }
    let url = '';
    if (environment.production) {
      url = `${this.config.envSettings['API_ENDPOINT']}notes/${noteId}`;
    } else {
      // As we have to change origin for local testing, here we are calling front end node API for development
      url = `${window.location.origin}/notes/${noteId}`;
    }
    return this.httpClient.patch(url, { notes: note }, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }


  /**
   * This function is to get all notes of a given inventory
   * @param userID User Id
   * @param noLoader
   */
  public getAllNotesOfUser(userID: number, noLoader = false): Observable<any> {
    let reqHeaders = new HttpHeaders();
    if (noLoader) {
      reqHeaders = reqHeaders.set('hide-loader', 'hide-loader');
    }
    let url = '';
    if (environment.production) {
      url = `${this.config.envSettings['API_ENDPOINT']}notes/users/${userID}`;
    } else {
      // As we have to change origin for local testing, here we are calling front end node API for development
      url = `${window.location.origin}/notes/users/${userID}?`;
    }
    return this.httpClient.get(url, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }
  /**
   * This function is to get all notes of a given inventory
   * @param featureID inventory Id
   * @param noLoader
   */
  public getAllNotesOfInventory(featureID: number, noLoader = false): Observable<any> {
    let reqHeaders = new HttpHeaders();
    if (noLoader) {
      reqHeaders = reqHeaders.set('hide-loader', 'hide-loader');
    }
    let url = '';
    if (environment.production) {
      url = `${this.config.envSettings['API_ENDPOINT']}notes/inventory/${featureID}`;
    } else {
      // As we have to change origin for local testing, here we are calling front end node API for development
      url = `${window.location.origin}/notes/inventory/${featureID}?`;
    }
    return this.httpClient.get(url, { headers: reqHeaders }).pipe(catchError(this.handleError));
  }
}
