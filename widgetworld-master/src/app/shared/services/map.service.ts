import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { ThemeService } from './theme.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { Address } from '@interTypes/address';
import {AppConfig} from '../../app-config.service';
@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(
    private themeService: ThemeService,
    private http: HttpClient,
    private config: AppConfig
  ) { }

  public getMapBoundingBox(map: mapboxgl.Map, defaultBounds = false, defaultMapBounds) {
    let lat;
    if (defaultBounds) {
      lat = mapboxgl.LngLatBounds.convert(defaultMapBounds);
    } else {
      lat = map.getBounds();
    }

    const multiPolygon = {
      type: 'MultiPolygon',
      coordinates: [[]]
    };
    const bound = [];
    bound.push(lat.getNorthEast().toArray());
    bound.push(lat.getNorthWest().toArray());
    bound.push(lat.getSouthWest().toArray());
    bound.push(lat.getSouthEast().toArray());
    bound.push(lat.getNorthEast().toArray());
    multiPolygon.coordinates[0].push(bound);
    return multiPolygon;
  }

  /**
   * This function is to create polygon layers to display static polygon
   * @param map Map object
   * @param sourceData feature collection
   */
  public createPolygonLayers(map: mapboxgl.Map, sourceData, displayPrimaryColors = '') {
    const themeSettings = this.themeService.getThemeSettings();
    if (!map.getSource('polygonData')) {
      map.addSource('polygonData', {
        type: 'geojson',
        data: sourceData
      });
    }
    if (!map.getLayer('customPolygon')) {
      map.addLayer({
        id: 'customPolygon',
        type: 'fill',
        source: 'polygonData',
        paint: {
          'fill-opacity': 0.5,
          'fill-color': displayPrimaryColors ? displayPrimaryColors : themeSettings.color_sets.highlight.base
        }
      });
    }
    if (!map.getLayer('customPolygonStroke')) {
      map.addLayer({
        id: 'customPolygonStroke',
        type: 'line',
        source: 'polygonData',
        paint: {
          'line-color': displayPrimaryColors ? displayPrimaryColors : themeSettings.color_sets.highlight.base,
          'line-width': 2
        }
      });
    }
  }


  /**
   * This function is to get coordinates from address using Mapbox Geocoding API
   * @param address 
   * @param noLoader 
   */
  public getPositionByAddress(address: Address = {}, noLoader = false): Observable<any> {
    let requestUrl = `${this.config.envSettings['API_ENDPOINT']}locations/addresses/search?`;
    let searchText = ''
    for (let key in address) {
      if (address[key]) {
        searchText += `${address[key]},`
      }
    }
    if (!searchText) {
      return EMPTY;
    }
    requestUrl += `searchtext=${searchText}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.get(requestUrl, {headers: reqHeaders}).pipe(
      map(response => response['Response']['View'][0]),
      map(view => view && view['Result'] && view['Result'][0])
    );
  }
}
