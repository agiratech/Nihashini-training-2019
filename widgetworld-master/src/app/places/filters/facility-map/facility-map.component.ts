import { Component, OnInit, Input, Output, EventEmitter,
   ChangeDetectionStrategy, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../../../environments/environment.prod';
import { CommonService, ThemeService, MapService } from '@shared/services';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from './../../../Interfaces/workspaceV2';
import { Polygon, AreaType } from '@interTypes/Place-audit-types';
import turfUnion from '@turf/union';
import turfCenter from '@turf/center';
import { PlacesFiltersService } from '../places-filters.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-facility-map',
  templateUrl: './facility-map.component.html',
  styleUrls: ['./facility-map.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacilityMapComponent implements OnInit, OnChanges, OnDestroy {
  map: mapboxgl.Map;
  marker: mapboxgl.Marker;
  mapCenter: any = [-98.5, 39.8];
  themeSettings: any;
  featuresCollection: any;
  public buidlingAreaCollection = { 'type': 'FeatureCollection', 'features': [] };
  draw: MapboxDraw;
  @Input() polygonFeature: Polygon;
  @Input() facilityAreaType: AreaType;
  @Input() placePosition;
  @Input() enableEditPolygon = true;
  @Input() zoom: number = 3;
  @Input() buildingAreaFeature: Polygon;
  @Output() updatePolygonInfo: EventEmitter<any> = new EventEmitter();
  @Output() closeFacilityMap: EventEmitter<any> = new EventEmitter();
  @Output() updatePlacePosition: EventEmitter<any> = new EventEmitter();
  @Input() openFacilityArea;
  private unSubscribe: Subject<void> = new Subject<void>();
  public isCollapseDrawMap = false;
  constructor(
    private commonService: CommonService,
    private themeService: ThemeService,
    public dialog: MatDialog,
    private mapService: MapService,
    private placeFiltersService: PlacesFiltersService
    ) { }

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    this.themeSettings = this.themeService.getThemeSettings();
    if (userData && typeof userData['layers'] !== 'undefined') {
      if (typeof userData['layers']['center'] !== 'undefined') {
        this.mapCenter = userData['layers']['center'];
      }
    }
    this.placeFiltersService.getPlaceCoords().pipe(takeUntil(this.unSubscribe)).subscribe(coords => {
      this.placePosition = coords;
      this.setMarkerPosition();
    });
    this.initializeMap();
    setTimeout(() => {
      this.placeFiltersService.setNewColumnOpened(true);
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.openFacilityArea && changes.openFacilityArea.currentValue !== 'undefined') {
      this.isCollapseDrawMap = false;
    }
    if (changes.facilityAreaType && changes.facilityAreaType.currentValue) {
      this.facilityAreaType = changes.facilityAreaType.currentValue;
      if (this.map && this.map.getSource('polygonData')) {
        this.buidlingAreaCollection.features = [];
        this.map.getSource('polygonData').setData(this.buidlingAreaCollection);
      }
    }
    if (this.map && this.draw) {
      this.setMapData();
    }
    if (changes.buildingAreaFeature && changes.buildingAreaFeature.currentValue) {
      if (this.facilityAreaType === 'property' && this.buildingAreaFeature['type']) {
        this.buidlingAreaCollection.features = [];
        this.buidlingAreaCollection.features.push({
          type: 'Feature',
          geometry: {
            'type': this.buildingAreaFeature.type,
            'coordinates': this.buildingAreaFeature.coordinates
          },
          properties: {
            fill: this.themeSettings['color_sets'] && this.themeSettings.color_sets.secondary.base,
            stroke: this.themeSettings['color_sets'] && this.themeSettings.color_sets.primary.base
          }
        });
        if (!this.map.getSource('polygonData')) {
          this.mapService.createPolygonLayers(this.map, this.buidlingAreaCollection,
            '#2196F3');
        } else {
          this.map.getSource('polygonData').setData(this.buidlingAreaCollection);
        }
      }
    }
  }
  initializeMap() {
    mapboxgl.accessToken = environment.mapbox.access_token;
    this.map = new mapboxgl.Map({
      container: 'facilityMap',
      style: this.themeService.getMapStyleURL('satellite'),
      minZoom: 2,
      maxZoom: 22,
      preserveDrawingBuffer: true,
      center: this.mapCenter,
      zoom: this.zoom, // starting zoom
      interactive: this.enableEditPolygon
    });
    // this.draw = new MapboxDraw({
    //   userProperties: true,
    //   displayControlsDefault: false,
    //   styles: this.commonService.getStylesData(),
    //   keybindings: this.enableEditPolygon,
    //   touchEnabled: this.enableEditPolygon,
    //   boxSelect: this.enableEditPolygon,
    //   controls: {
    //     polygon: true,
    //     trash: true
    //   }
    // });

    const el = document.createElement('div');
    el.className = 'place-audit-marker icon icon-place';
    this.marker = new mapboxgl.Marker(el);
    this.marker.setDraggable(true);
    this.marker.on('dragend', this.updatePlaceCoordinates.bind(this));
    this.map.on('draw.create', this.updateFeatures.bind(this));
    this.map.on('load', () => {
      // this.map.addControl(this.draw);
      this.setMapData();
    });
  }

  /**
   * This function is to add features to the map if place polygon data present
   */
  public setMapData() {
    this.featuresCollection = { 'type': 'FeatureCollection', 'features': [] };
    if (this.draw && this.draw.getAll().features.length > 0) {
      this.draw.deleteAll();
    }
    if (this.draw) {
      this.map.removeControl(this.draw);
    }
    this.draw = new MapboxDraw({
      userProperties: true,
      displayControlsDefault: false,
      styles: this.commonService.getStylesData(this.facilityAreaType === 'building' ? '#2196F3' : '#DD6666'),
      keybindings: this.enableEditPolygon,
      touchEnabled: this.enableEditPolygon,
      boxSelect: this.enableEditPolygon,
      controls: {
        polygon: true,
        trash: true
      }
    });
    this.map.addControl(this.draw);
    if (this.polygonFeature && this.polygonFeature.type) {
        this.featuresCollection.features.push({
          type: 'Feature',
          geometry: {
            'type': this.polygonFeature.type,
            'coordinates': this.polygonFeature.coordinates
          },
          properties: {
            areaType: this.facilityAreaType,
            fill: this.themeSettings['color_sets'] && this.themeSettings.color_sets.secondary.base,
            stroke: this.themeSettings['color_sets'] && this.themeSettings.color_sets.primary.base
          }
        });
      this.draw.add(this.featuresCollection);
    }
    if (this.placePosition.length > 0) {
      this.setMarkerPosition();
    } else {
      this.map.setZoom(3);
    }
  }

  private setMarkerPosition() {
    this.map.flyTo({ center: this.placePosition, zoom: this.zoom });
    this.marker.setLngLat(this.placePosition).addTo(this.map);
  }
  /**
   * This function is to save the edited polygon data
   */
  public saveMapData() {
    this.draw.changeMode('simple_select');
    this.polygonFeature = this.getPolygonData();
    let centerCoordinates = {};
    if (this.polygonFeature && this.polygonFeature['type']) {
      centerCoordinates = turfCenter(this.polygonFeature);
    }
    this.updatePolygonInfo.emit({
      type: this.facilityAreaType,
      polygonData: this.polygonFeature,
      center: centerCoordinates && centerCoordinates['geometry'] && centerCoordinates['geometry']['coordinates'].length ? centerCoordinates['geometry']['coordinates'] : []
    });
  }

  /**
   * close facility edit map
   */
  public closeFacilityEdit() {
    const data: ConfirmationDialog = {
      notifyMessage: false,
      confirmDesc: '<h4 class="confirm-text-icon">Your changes to the' + (this.facilityAreaType === 'building' ? ' building area ' : ' property area ') +'will not be saved. Would you like to continue?</h4>',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      headerCloseIcon: false
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: '586px'
    }).afterClosed().subscribe(result => {
      if (result && result.action) {
       this.closeFacilityMap.emit({'close': true});
      }
    });
  }
  /**
   * To get the features drawn in map
   */
  private getPolygonData() {
    const featuresCollection = this.draw.getAll();
    let combinedFeature: any;
    // If features empty returning empty object
    if (featuresCollection.features.length === 0) {
      return {};
    }
     // If only one feature present converting that in to multipolygon
    if (featuresCollection.features.length === 1) {
      if (featuresCollection.features[0]['geometry']['type'] === 'MultiPolygon') {
        return featuresCollection.features[0]['geometry'];
      }
      combinedFeature = {type: 'MultiPolygon', coordinates: []};
      combinedFeature.coordinates.push(featuresCollection.features[0]['geometry']['coordinates']);
      return combinedFeature;
    }
    // If more than one feature present then combining them in to multipolygon
    combinedFeature = turfUnion(...featuresCollection.features);

    combinedFeature.geometry.coordinates.map((coordinate, index) => {
      if (coordinate.length > 1) {
        combinedFeature.geometry.coordinates[index] = [coordinate];
      }
    });
    return combinedFeature.geometry;
  }

  /**
   * Map zoom out function
   */
  public zoomOutMap() {
    this.map.fitBounds([[-128.94797746113613, 18.917477970597474], [-63.4, 50.0]]);
  }

  /**
   * This function is to update the place coordinates
   */
  private updatePlaceCoordinates() {
    const position = this.marker.getLngLat();
    this.updatePlacePosition.emit([position['lng'], position['lat']]);
  }

  // This method will set the property areaType to the feature
  private updateFeatures() {
    const featuresCollection = this.draw.getAll();
    const updatedFeatures = [];
    featuresCollection['features'].forEach(feature => {
      feature.properties['areaType'] = this.facilityAreaType;
      updatedFeatures.push(feature);
    });
    this.draw.deleteAll();
    featuresCollection['features'] = updatedFeatures;
    this.draw.add(featuresCollection);
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  collapseDrawMap() {
    this.isCollapseDrawMap = !this.isCollapseDrawMap;
  }
}
