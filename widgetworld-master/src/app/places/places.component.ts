import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AuthenticationService,
  ThemeService,
  PlacesDataService,
  CommonService,
  DynamicComponentService,
  MapService,
  LoaderService,
  ExploreDataService,
  MapLegendsService
} from '@shared/services';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
import { LocateMeControl } from '../classes/locate-me-control';
import { ActivatedRoute } from '@angular/router';
import { PlacesFiltersService } from './filters/places-filters.service';
import {
  takeWhile,
  map
} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { PlacesSimplePopupComponent } from './places-simple-popup/places-simple-popup.component';
import { PlacesPopupComponent } from './places-popup/places-popup.component';
import { PlacesDetailPopupComponent } from './places-detail-popup/places-detail-popup.component';
import { PlacesStatisticPopupComponent } from './places-statistic-popup/places-statistic-popup.component';
import bbox from '@turf/bbox';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import { RadiusMode } from '../classes/radius-mode';
import { LayersService } from '../explore/layer-display-options/layers.service';
import turfCenter from '@turf/center';
import { PlacesElasticsearchService } from './filters/places-elasticsearch.service';
import { MatDialog } from '@angular/material/dialog';
import { SavePlaceSetsDialogComponent } from '@shared/components/save-place-sets-dialog/save-place-sets-dialog.component';
import { RequestAuditDialogComponent } from './request-audit-dialog/request-audit-dialog.component';
@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.less']
})
export class PlacesComponent implements OnInit, OnDestroy {
  map: mapboxgl.Map;
  poiData: any = { 'type': 'FeatureCollection', 'features': [] };
  poiStarData: any = { 'type': 'FeatureCollection', 'features': [] };
  poiMapPoup: any;
  poiMapGrayedPoup: any;
  mapPopup: any;
  features: any = [];
  places: any = [];
  current_page: any;
  current_e: any;
  userData: any;
  mapCenter: any = [-98.5, 39.8];
  mapBounds: any = [];
  zoomLevel = 0;
  headerHeight: any;
  mapHeight: any;
  mapWidth: any;
  themeSettings: any;
  baseMaps: any;
  iconColor: any;
  dimensionsDetails: any;
  selectedMapStyle: any = '';
  isPlaceFilterOpen = false;
  public openFilter = false;
  private unSubscribe = true;
  public filterLevel = {
    filterLevel: 1,
    searchHide: false,
    placeResultExpand: false
  };
  public mapStyle: any = '';
  public nationalWideData = {'type': 'FeatureCollection', 'features': []};
  popupDistributor: any;
  loadPOIPopup: any;
  nationalBubbleZoom: any;
  poiPolygonZoom: any;
  poiDetailAPICall = null;
  filterOpenDetails: any = {};
  currentTab = 'findAndDefine';
  mapLayers = {};
  public filteredData =  {};
  // Polygon Related vars
  draw: MapboxDraw;
  circularPolyDrawEnabled = false;
  normalPolyDrawEnabled = false;
  radiusPolyDrawEnabled = false;
  geoPolygonEnabled = false;
  customPolygon: any = { 'type': 'MultiPolygon', 'coordinates': [] };
  customCenterPoint: any = { 'type': 'Point', 'coordinates': [] };
  polygonData: any = { 'type': 'FeatureCollection', 'features': [] };
  customPolygonFeature: any = {
    id: '1234234234234234',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: []
    },
    properties: {}
  };
  // end
  popupOpenType = 'map';
  enableMapInteractionFlag = true;
  popUpData = {};
  placeAccess: any = {};
  allowPlace = '';
  public loadMoreChild: boolean;
  public loadMoreChildVisitorsWork: boolean;
  // Layers & display options related vars
  public showMapControls: any = true;
  style: any;
  public showMapLegends: any = true;
  // public displayTextInfo = {};
  public layerDisplayOptions: any = {};
  public customTextStyle: object = {};
  public mapWidthHeight = {};
  public activeDraggableTextPosition = { x: 0, y: 0 };
  public logoStyle: object = {};
  public activeDraggablePosition = { x: 0, y: 0 };
  public venuesClicked = false;
  private layerInventorySetLayers = [];
  public mapPlaceHash5Layer: any;
  public mapPlaceHash6Layer: any;
  private markerIcon: any = environment.fontMarker;
  public keyLegendsTimeer = null;
  public selectedPlaceData = {};
  // end
  private sfids = [];
  private selectedValue = 'Last Year, Last Month';
  public navigationCollapseState = false;
  public initialFilterOpen = false;
  constructor(
    private theme: ThemeService,
    private placeDataService: PlacesDataService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private placeFilterService: PlacesFiltersService,
    private dynamicComponentService: DynamicComponentService,
    private mapService: MapService,
    private auth: AuthenticationService,
    private layersService: LayersService,
    private loaderService: LoaderService,
    private exploreDataService: ExploreDataService,
    private legendService: MapLegendsService,
    private elasticSearch: PlacesElasticsearchService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.placeFilterService.setFilterLevel({});
    this.placeAccess = this.auth.getModuleAccess('places');
    if (this.placeAccess['features'] && this.placeAccess['features']['placeDetails']) {
      this.allowPlace = this.placeAccess['features']['placeDetails']['status'];
    }
    this.theme.getDimensions().subscribe(data => {
      this.dimensionsDetails = data;
      this.headerHeight = data.headerHeight;
      this.mapHeight = data.windowHeight - data.headerHeight;
      this.dynamicResize();
    });
    this.themeSettings = this.theme.getThemeSettings();
    this.baseMaps = this.themeSettings.basemaps;
    this.baseMaps.filter(maps => {
      if (maps.default) {
        this.mapStyle = maps.label;
      }
    });

    this.selectedMapStyle = this.mapStyle;
    this.iconColor = this.themeSettings['color_sets']['primary']['base'];
    this.mapPopup = new mapboxgl.Popup();
    this.initializeMap();
    const selfReferance = this;
    this.poiMapPoup = function (e) {
      selfReferance.buildPopup(e, 0, selfReferance.map, selfReferance.mapPopup, 'poiPointLayer');
    };
    this.poiMapGrayedPoup = function (e) {
      selfReferance.buildPopup(e, 0, selfReferance.map, selfReferance.mapPopup, 'grayed_frames_panel');
    };
    this.userData = JSON.parse(localStorage.getItem('user_data'));
    if (typeof this.userData['layers'] !== 'undefined') {
      this.mapLayers = this.userData['layers'];
      if (typeof this.userData['layers']['center'] !== 'undefined') {
        this.mapCenter = this.userData['layers']['center'];
      }
      if (typeof this.userData['layers']['bounds'] !== 'undefined') {
        this.mapBounds = this.userData['layers']['bounds'];
      }
    }
    const existingPlaceSet = this.route.snapshot.data.existingPlaseSet && this.route.snapshot.data.existingPlaseSet['data'] || [];
    this.placeDataService.setExistingPlaceSet(existingPlaceSet);

    this.placeFilterService.getFilterSidenav().subscribe(data => {
      this.filterOpenDetails = data;
      if (data) {
        this.isPlaceFilterOpen = data.open;
      }
      this.openFilter = data.open;
      if(this.openFilter) {
        this.initialFilterOpen = true;
      }
    });


    /* this.placeFilterService.getPoiData().subscribe(data => {
      console.log('getPoiData', JSON.stringify(data));
    }); */
    this.placeFilterService
    .getFilterLevelState()
    .pipe(takeWhile(() => this.unSubscribe))
    .subscribe(data => {
      setTimeout(() => {
        if (this.filterOpenDetails && this.filterOpenDetails['tab'] === 'myPlaces') {
          this.filterLevel = data[1] && data[1];
        } else {
          this.filterLevel = data[0] && data[0];
        }
        this.placeFilterService.savePlacesSession('filterLevelState', data);
      }, 300);
    });

    this.popupDistributor = (e) => {
      let f = [];

      /* f = this.map.queryRenderedFeatures(e.point, {layers: ['poiPolygonLayer']});
      if (f.length) {
        this.poiPolygonZoom(e);
        return;
      }*/
      // f = this.map.queryRenderedFeatures(e.point, {layers: ['poiPointHash5Layer']});
      // if (f.length) {
      //   // this.loadPOIPopup(e);
      //   return;
      // }
      // const  hash6 = this.map.queryRenderedFeatures(e.point, {layers: ['poiPointHash6Layer']});

      f = this.map.queryRenderedFeatures(e.point, {layers: ['poiPointLayer']});
      if (f.length) {
        this.loadPOIPopup(e);
        return;
      }

      f = this.map.queryRenderedFeatures(e.point, {layers: ['nationalWideBubble']});
      if (f.length) {
        this.nationalBubbleZoom(f);
        return;
      }

    };
    this.loadPOIPopup = (e) => {
      this.buildPopup(e, 0, this.map, this.mapPopup, 'poiPointLayer');
    };
    this.nationalBubbleZoom = (e) => {
      this.map.flyTo({center: e[0].geometry.coordinates, zoom: this.mapLayers['hash5']['minzoom']});
    };
    this.poiPolygonZoom = (e) => {
      this.map.flyTo({center: e[0].geometry.coordinates, zoom: 12});
    };
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: this.commonService.getStylesData(),
      modes: Object.assign({
        draw_radius: RadiusMode,
      }, MapboxDraw.modes)
    });

    this.layersService.getApplyLayers().pipe(takeWhile(() => this.unSubscribe)).subscribe((value) => {
      if (value) {
        this.clearLayerView(false);
        this.layersService.cleanUpMap(this.map);
        this.applyViewLayers();
      } else {
        this.clearLayerView();
      }
    });
    this.placeDataService.onMapLoad().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(event => {
        if (event) {
          this.setMapPosition();
        }
    });
    combineLatest(this.layersService.getDisplayOptions()).pipe(takeWhile(() => this.unSubscribe)).subscribe((layers) => {
      this.layerDisplayOptions = layers[0];
    });
  }
  ngOnDestroy() {
    this.unSubscribe = false;
  }
  initializeMap() {
    mapboxgl.accessToken = environment.mapbox.access_token;
    this.map = new mapboxgl.Map({
      container: 'mapbox',
      style: this.commonService.getMapStyle(this.baseMaps, this.selectedMapStyle)['uri'],
      minZoom: 2,
      maxZoom: 16,
      center: this.mapCenter, // starting position
      zoom: 3 // starting zoom
    });
    this.exploreDataService.setMapObject(this.map);
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.addControl(new LocateMeControl(), 'bottom-left');
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'bottom-left');
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    setTimeout(() => {
      this.commonService.loadLocateMe();
    }, 100);
    this.map.on('style.load', () => {
      this.loadLayers();
    });
    this.map.on('load', () => {
      this.setMapPosition();
    });
  }
  loadLayers() {
    // this.setMapPosition();
    this.map.on('zoom', () => {
      this.zoomLevel = this.map.getZoom();
    });
    this.map.addSource('nationalWideData', {
      type: 'geojson',
      data: this.nationalWideData
    });
    this.map.addSource('poiPolygons', {
      type: 'vector',
      url: 'mapbox://intermx.3453kd6z'
    });
    this.map.addSource('poiPoints', {
      type: 'vector',
      url: 'mapbox://intermx.bwhq804q'
    });

    this.map.addLayer({
      id: 'nationalWideBubble',
      type: 'circle',
      source: 'nationalWideData',
      minzoom: 0,
      maxzoom: 6,
      layer: {
          'visibility': 'visible',
      },
      paint: {
        'circle-opacity': 0.6,
        'circle-color': this.iconColor,
        'circle-radius': ['get', 'radius']
      }
    });
    this.map.addLayer({
      id: 'nationalWideCount',
      type: 'symbol',
      source: 'nationalWideData',
      minzoom: 0,
      maxzoom: 6,
      // filter: ['>', 'radius', 10],
      layout: {
        'visibility': 'none',
        'text-field': '{count}',
        'text-font': ['Product Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': [
          'step',
          ['get', 'radius'],
          9,
          15,
          12,
          25,
          24
        ]
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    this.map.addLayer({
      id: 'poiPolygonLayer',
      type: 'fill',
      // source: 'poiPolygons',
      // 'source-layer': 'poi_polys',
      // minzoom: 0,
      // maxzoom: 12,
      // layout: {
      //   'visibility': 'none',
      // },
      source: {
        type: 'vector',
        url: this.mapLayers['placePolys']['url']
      },
      'source-layer': this.mapLayers['placePolys']['source-layer'],
      minzoom: this.mapLayers['placePolys']['minzoom'],
      maxzoom: this.mapLayers['placePolys']['maxzoom'],
      paint: {
        'fill-opacity': {
          'base': 0.5,
          'stops': [[9, 0.5], [12, 0.3]]
        },
        'fill-color': this.iconColor
      }
    });
    /* this.map.on('mouseenter', 'poiPolygonLayer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'poiPolygonLayer',  () => {
      self.map.getCanvas().style.cursor = '';
    }); */
    this.map.addLayer({
      id: 'poiPointHash5Layer',
      type: 'circle',
      // source: 'poiPoints',
      // 'source-layer': 'poi_points',
      // minzoom: 12,
      source: {
        type: 'vector',
        url: this.mapLayers['hash5']['url']
      },
      'source-layer': this.mapLayers['hash5']['source-layer'],
      minzoom: this.mapLayers['hash5']['minzoom'],
      maxzoom: this.mapLayers['hash5']['maxzoom'],
      layout: {
        'visibility': 'none',
      },
      paint: {
        'circle-radius': {
          'base': 3,
          'stops': [[6, 4], [8, 5], [10, 6]]
        },
        'circle-color': this.iconColor
      }
    });
    /* Hiding this as per Matthew's suggestion (24-04-2019)
    /* this.map.on('mouseenter', 'poiPointHash5Layer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'poiPointHash5Layer',  () => {
      self.map.getCanvas().style.cursor = '';
    }); */
    this.map.addLayer({
      id: 'poiPointHash6Layer',
      type: 'circle',
      source: {
        type: 'vector',
        url: this.mapLayers['hash6']['url']
      },
      'source-layer': this.mapLayers['hash6']['source-layer'],
      minzoom: this.mapLayers['hash6']['minzoom'],
      maxzoom: this.mapLayers['hash6']['maxzoom'],
      /* layout: {
        'visibility': 'none',
      }, */
      paint: {
        'circle-radius': {
          'base': 3,
          'stops': [[6, 4], [8, 5], [10, 6]]
        },
        'circle-color': this.iconColor
      }
    });
    /* this.map.on('mouseenter', 'poiPointHash6Layer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'poiPointHash6Layer',  () => {
      self.map.getCanvas().style.cursor = '';
    }); */

    this.map.addLayer({
      id: 'poiPointLayer',
      type: 'circle',
      // source: 'poiPoints',
      // 'source-layer': 'poi_points',
      // minzoom: 12,
      source: {
        type: 'vector',
        url: this.mapLayers['placePoints']['url']
      },
      'source-layer': this.mapLayers['placePoints']['source-layer'],
      minzoom: this.mapLayers['placePoints']['minzoom'],
      maxzoom: this.mapLayers['placePoints']['maxzoom'],
      paint: {
        // 'circle-opacity': 0.8,
        // 'circle-radius': 3,
        'circle-radius': {
          'base': 3,
          'stops': [[6, 4], [8, 5], [10, 6]]
        },
        'circle-color': this.iconColor
      }
    });
    this.map.addLayer({
      id: 'poiStarLayer',
      type: 'symbol',
      source: 'poiPoints',
      'source-layer': 'poi_points',
      minzoom: 3,
      layout: {
        'visibility': 'none',
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': 'j' ,
        'text-offset': [0, 0.7],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 20
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': this.iconColor
      }
    });

    this.map.on('mouseenter', 'poiPointLayer', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'poiPointLayer',  () => {
      this.map.getCanvas().style.cursor = '';
    });
    this.map.on('click', this.popupDistributor);

    // Layers and Sources for polygons
    this.map.addSource('polygonData', {
      type: 'geojson',
      data: this.polygonData
    });

    this.map.addLayer({
      id: 'customPolygon',
      type: 'fill',
      source: 'polygonData',
      paint: {
        'fill-opacity': .01,
        'fill-color': this.themeSettings.color_sets.highlight.base
      }
    });

    this.map.addLayer({
      id: 'customPolygonStroke',
      type: 'line',
      source: 'polygonData',
      paint: {
        'line-opacity': .8,
        'line-color': this.themeSettings.color_sets.highlight.base,
        'line-width': 2
      }
    });
    // self.map.on('click', 'poiPointLayer', self.poiMapPoup);
    this.map.on('moveend', (e) => {
      if (!e.mapResize) {
        if (e.polygonData) {
          this.placeFilterService.savePlacesSession('mapPosition', e.polygonData);
        } else {
          if (e.eventType && e.eventType === 'default') {
            this.placeFilterService.savePlacesSession('mapPosition', this.mapService.getMapBoundingBox(this.map, true, this.mapBounds));
          } else {
            this.placeFilterService.savePlacesSession('mapPosition', this.mapService.getMapBoundingBox(this.map, false, this.mapBounds));
          }
        }
      }
    });
    this.onPushNationalData(this.filteredData);
    this.bindRender();
    this.placeDataService.mapLoaded(true);
  }
  bindRender() {
    this.map.on('render', (e) => {
      clearTimeout(this.keyLegendsTimeer);
      this.keyLegendsTimeer = setTimeout(() => {
        const layerSession = this.layersService.getlayersSession(true);
        this.placeDataService.generateKeyLegends(this.map, layerSession, this.mapStyle, this.zoomLevel);
      }, 500);
    });
  }
  buildPopup(e, i = 0, mapobj, popup, layer) {
    $('.mapboxgl-popup-content').removeClass('open_inventory_popup');
    $('.map-div').removeClass('opened_detailed_popup');
    this.features = mapobj.queryRenderedFeatures(e.point, { layers: [layer] });
    const feature = this.features[i];
    this.current_page = i;
    this.current_e = e;
    if (popup.isOpen()) {
      popup.remove();
    }
    this.popupOpenType = 'map';
    const place = {};
    place['safegraph_place_id'] = feature['properties']['safegraph_place_id'];
    place['geometry'] = feature.geometry;
    this.setPopupHTML(mapobj, popup, place);
  }
  setPopupHTML(mapobj, popup, feature, openType = 'map') {
    if (this.poiDetailAPICall !== null) {
      this.poiDetailAPICall.unsubscribe();
    }
    const place_id = feature['safegraph_place_id'];
    setTimeout(() => {
        popup.setLngLat(feature.geometry.coordinates.slice())
          .setHTML('<div class="placePopup"><div id="loader"></div></div>')
          .addTo(mapobj);
          if (this.mapStyle !== 'light') {
            if (!$('.mapboxgl-popup-content').hasClass('hide-shadow')) {
              $('.mapboxgl-popup-content').addClass('hide-shadow');
            }
          } else {
            $('.mapboxgl-popup-content').removeClass('hide-shadow');
          }
        this.poiDetailAPICall = this.placeFilterService
            .getDetailOfSinglePoi(place_id, 'Last Year, Last Month', true)
            .pipe(map(data => data['data']), takeWhile(() => this.unSubscribe))
            .subscribe(data => {
              this.selectedValue = 'Last Year, Last Month';
              const htmlContent = this.getPopupHTML(data, openType);
              this.popUpData = data;
              setTimeout(() => {
                popup.setLngLat(feature.geometry.coordinates.slice())
                    .setHTML(htmlContent.innerHTML).addTo(mapobj);
                this.loadFunction(popup, mapobj, feature);
              }, 100);
            });
    }, 100);
  }

  openRequestAudit(feature, type = 'map', page = 'overview') {
    const prop = feature;
    prop['length'] = this.features.length;
    prop['type'] = type;
    const i = this.current_page + 1;
    prop['current'] = i;
    prop['popupStatus'] = this.allowPlace;
    if (this.allowPlace !== 'hidden') {
      if (this.mapPopup.isOpen()) {
        this.mapPopup.remove();
      }
      const ref = this.dialog.open(RequestAuditDialogComponent, {
        data: { placeDetail: prop},
        width: '1250px',
        backdropClass: 'hide-backdrop',
        disableClose: true,
        panelClass: 'request-audit-dialog'
      });
      ref.afterClosed().subscribe(res => {
        if (res === 'detailsSheet') {
          this.openDetailedSheetPopup(this.mapPopup, this.map, feature, 'detail');
        }
      });
    }
  }


  getPopupHTML(feature, type = 'map', page = 'overview') {
    const prop = feature;
    prop['length'] = this.features.length;
    prop['type'] = type;
    const i = this.current_page + 1;
    prop['current'] = i;
    prop['popupStatus'] = this.allowPlace;
    let description;
    if (this.allowPlace !== 'hidden') {
      if (page === 'detail' || page === 'originaldetail') {
        prop['sampleData'] = page === 'detail' ? false : true;
        description = this.dynamicComponentService
                          .injectComponent( PlacesDetailPopupComponent,  x => x.placeDetail = prop);
      } else if (page === 'statistic') {
        description = this.dynamicComponentService
                          .injectComponent( PlacesStatisticPopupComponent,  x => x.placeDetail = prop);
      } else {
        description = this.dynamicComponentService
                          .injectComponent( PlacesPopupComponent,  x => x.placeDetail = prop);
      }
    } else {
      description = this.dynamicComponentService
                          .injectComponent( PlacesSimplePopupComponent,  x => x.placeDetail = prop);
    }
    return description;
  }
  next(popup, mapObj) {
    let i = this.current_page + 1;
    if (i >= this.features.length) {
      i = 0;
    }
    if (this.current_page !== i) {
      this.current_page = i;
      const feature = this.features[i];
      const place = {};
      place['safegraph_place_id'] = feature['properties']['safegraph_place_id'];
      place['geometry'] = feature.geometry;
      this.setPopupHTML(mapObj, popup, place, this.popupOpenType);
    }
  }

  prev(popup, mapObj) {
    let i = this.current_page - 1;
    const len = this.features.length;
    if (i < 0) {
      i = this.features.length - 1;
    }
    if (this.current_page !== i) {
      this.current_page = i;
      const feature = this.features[i];
      const place = {};
      place['safegraph_place_id'] = feature['properties']['safegraph_place_id'];
      place['geometry'] = feature.geometry;
      this.setPopupHTML(mapObj, popup, place, this.popupOpenType);
    }
    // const description = this.getPopupHTML(feature);
    // popup.setHTML(description);
    // this.loadFunction(popup, map, feature);
  }
  openDetailedSheetPopup(popup, mapobj, feature, page = 'detail') {
    if (this.poiDetailAPICall !== null) {
      this.poiDetailAPICall.unsubscribe();
    }
    setTimeout(() => {
        popup
          .setHTML('<div class="placePopup"><div id="loader"></div></div>')
          .addTo(mapobj);
          if (this.mapStyle !== 'light') {
            if (!$('.mapboxgl-popup-content').hasClass('hide-shadow')) {
              $('.mapboxgl-popup-content').addClass('hide-shadow');
            }
          } else {
            $('.mapboxgl-popup-content').removeClass('hide-shadow');
          }
          const htmlContent = this.getPopupHTML(this.popUpData, this.popupOpenType, page);
              setTimeout(() => {
                popup.setHTML(htmlContent.innerHTML).addTo(mapobj);
                if (page === 'detail') {
                  $('#selectPeriod').val(this.selectedValue);
                } else {
                  $('#selectStatsPeriod').val(this.selectedValue);
                }
                this.loadFunction(popup, mapobj, feature);
              }, 100);
    }, 100);
  }
  loadFunction(popup, mapObj, feature) {
    const self = this;
    const next = document.getElementsByClassName('next');
    if (next.length) {
      next[0].addEventListener('click', function(e) {
        self.next(popup, mapObj);
      }, false);
    }
    const prev = document.getElementsByClassName('prev');
    if (prev.length) {
      prev[0].addEventListener('click', function(e) {
        self.prev(popup, mapObj);
      }, false);
    }
    const detailSheetBtn = document.getElementsByClassName('detailSheetBtn');
    if (detailSheetBtn.length) {
      detailSheetBtn[0].addEventListener('click', function(e) {
        document.getElementsByClassName('map-div')[0].classList.add('opened_detailed_popup');
        document.getElementsByClassName('mapboxgl-popup-content')[0].classList.add('open_inventory_popup');
        self.openDetailedSheetPopup(popup, mapObj, feature, 'detail');
      }, false);
    }
    const sampleStatisticsBtn = document.getElementById('sampleStatisticsBtn');
    if (sampleStatisticsBtn) {
      sampleStatisticsBtn.addEventListener('click', function(e) {
        document.getElementsByClassName('map-div')[0].classList.add('opened_detailed_popup');
        document.getElementsByClassName('mapboxgl-popup-content')[0].classList.add('open_inventory_popup');
        self.openDetailedSheetPopup(popup, mapObj, feature, 'statistic');
      }, false);
    }
    const moreAndLessBtn = document.getElementById('moreAndLessBtn');
    if (moreAndLessBtn) {
      moreAndLessBtn.addEventListener('click', function(e) {
        self.loadMoreChild = !self.loadMoreChild;
        if (self.loadMoreChild) {
          moreAndLessBtn.innerHTML = 'Fewer Items';
          document.getElementsByClassName('arrow-down')[0].classList.add('display-show-and-less');
          document.getElementsByClassName('arrow-up')[0].classList.remove('display-show-and-less');
          document.getElementById('show-and-less-live').classList.remove('show-more-filter');
        } else {
          moreAndLessBtn.innerHTML = 'More Items';
          document.getElementsByClassName('arrow-down')[0].classList.remove('display-show-and-less');
          document.getElementsByClassName('arrow-up')[0].classList.add('display-show-and-less');
          document.getElementById('show-and-less-live').classList.add('show-more-filter');
        }
      }, false);
    }
    const moreAndLessBtnVisitorsWork = document.getElementById('moreAndLessBtnVisitorsWork');
    if (moreAndLessBtnVisitorsWork) {
      moreAndLessBtnVisitorsWork.addEventListener('click', function(e) {
        self.loadMoreChildVisitorsWork = self.loadMoreChildVisitorsWork;
        if (self.loadMoreChildVisitorsWork) {
          moreAndLessBtnVisitorsWork.innerHTML = 'Fewer Items';
          document.getElementsByClassName('arrow-down-visitors-work')[0].classList.add('display-show-and-less');
          document.getElementsByClassName('arrow-up-visitors-work')[0].classList.remove('display-show-and-less');
          document.getElementById('show-and-less-work').classList.remove('show-more-filter');
        } else {
          moreAndLessBtnVisitorsWork.innerHTML = 'More Items';
          document.getElementsByClassName('arrow-down-visitors-work')[0].classList.remove('display-show-and-less');
          document.getElementsByClassName('arrow-up-visitors-work')[0].classList.add('display-show-and-less');
          document.getElementById('show-and-less-work').classList.add('show-more-filter');
        }
      }, false);
    }
    const requestAuditBtn = document.getElementById('requestAuditBtn');
    if (requestAuditBtn) {
      requestAuditBtn.addEventListener('click', function(e) {
        document.getElementsByClassName('map-div')[0].classList.add('opened_detailed_popup');
        document.getElementsByClassName('mapboxgl-popup-content')[0].classList.add('open_inventory_popup');
        self.openDetailedSheetPopup(popup, mapObj, feature, 'originaldetail');
      }, false);
    }
    const requestAuditLink = document.getElementsByClassName('request-Audit-link');
    Array.from(requestAuditLink).forEach(function(element) {
      element.addEventListener('click', function(e) {
        document.getElementsByClassName('map-div')[0].classList.add('opened_detailed_popup');
        document.getElementsByClassName('mapboxgl-popup-content')[0].classList.add('open_inventory_popup');
        self.openRequestAudit(self.popUpData, self.popupOpenType, 'requestAudit');
      }, false);
    });

    const overviewBtn = document.getElementById('overviewBtn');
    if (overviewBtn) {
      overviewBtn.addEventListener('click', function(e) {
        document.getElementsByClassName('map-div')[0].classList.remove('opened_detailed_popup');
        const htmlContent = self.getPopupHTML(self.popUpData, self.popupOpenType);
        setTimeout(function () {
          popup.setHTML(htmlContent.innerHTML).addTo(mapObj);
          self.loadFunction(popup, mapObj, feature);
        }, 100);
      }, false);
    }
    const selectPeriod = document.getElementById('selectPeriod');
    if (selectPeriod) {
      selectPeriod.addEventListener('change', function(e) {
        let selected = '';
        [].forEach.call(this, function(el) {
          if (el.selected) {
            selected = el.value;
          }
        });
        self.detailSheet(popup, mapObj, feature, 'detail', selected);
      }, false);
    }
    const selectStatsPeriod = document.getElementById('selectStatsPeriod');
    if (selectStatsPeriod) {
      selectStatsPeriod.addEventListener('click', function() {
        let selected = '';
        [].forEach.call(this, function(el) {
          if (el.selected) {
            selected = el.value;
          }
        });
        self.detailSheet(popup, mapObj, feature, 'statistic', selected);
      }, false);
    }
    const placeList = document.getElementById('place_list');
    if (placeList) {
      placeList.addEventListener('click', function(e) {
        const $this = document.getElementById('show_menu').style.display;
        if ($this === 'none' || !$this) {
          document.getElementById('show_menu').style.display = 'block';
        } else {
          document.getElementById('show_menu').style.display = 'none';
        }
      }, false);
    }
    const openSavePlaseSetDialogNew = document.getElementById('e2e-openSavePlaseSetDialogNew');
    if (openSavePlaseSetDialogNew) {
      openSavePlaseSetDialogNew.addEventListener('click', function(e) {
        self.onOpenSavePlaseSet(feature['safegraph_place_id']);
        document.getElementById('show_menu').style.display = 'none';
      }, false);
    }
    const openSaveToExistingPlaseSetNew = document.getElementById('e2e-openSaveToExistingPlaseSetNew');
    if (openSaveToExistingPlaseSetNew) {
      openSaveToExistingPlaseSetNew.addEventListener('click', function(e) {
        self.onOpenSaveToExistingPlaseSet(feature['safegraph_place_id']);
        document.getElementById('show_menu').style.display = 'none';
      }, false);
    }
    if (this.mapStyle !== 'light') {
      if (!$('.mapboxgl-popup-content').hasClass('hide-shadow')) {
        $('.mapboxgl-popup-content').addClass('hide-shadow');
      }
    } else {
      $('.mapboxgl-popup-content').removeClass('hide-shadow');
    }
  }
  private detailSheet (popup, mapObj, feature, type, selectedValue) {
    if (this.poiDetailAPICall !== null) {
      this.poiDetailAPICall.unsubscribe();
    }
    this.selectedValue = selectedValue;
    this.poiDetailAPICall = this.placeFilterService
        .getDetailOfSinglePoi(feature['safegraph_place_id'], selectedValue, true)
        .pipe(map(data => data['data']), takeWhile(() => this.unSubscribe))
        .subscribe(data => {
          this.popUpData = data;
          this.openDetailedSheetPopup(popup, mapObj, feature, type);
      });
  }
  openPanelPopup(place) {
    if (this.mapPopup.isOpen()) {
      this.mapPopup.remove();
    }
    let zoom = 15;
    if (this.map.getZoom() > 13) {
      zoom = this.map.getZoom();
    }
    this.popupOpenType = 'outside';
    const feature = {};
    feature['safegraph_place_id'] = place['ids']['safegraph_place_id'];
    feature['geometry'] = place['location']['point'];
    const coordinates = place['location']['point']['coordinates'];
    this.map.flyTo({ center: coordinates, zoom: zoom, animate: true });
    this.map.once('moveend', () => {
      this.setPopupHTML(this.map, this.mapPopup, feature, 'outside');
    });
  }
  zoomOutMap() {
    localStorage.removeItem('zoomPlace');
    this.map.fitBounds(this.mapBounds,  {duration: 100}, {eventType: 'default'});
  }
  hoverOnCard(place) {
    const poiStarDataSet = { 'type': 'FeatureCollection', 'features': [] };
    poiStarDataSet['features'][0] = place;
    if (poiStarDataSet !== undefined && this.map.getSource('poiStarData')) {
      this.map.setPaintProperty('frameClustersStar', 'icon-color', this.iconColor);
      this.map.getSource('poiStarData').setData(poiStarDataSet);
    }
    if (this.map.getLayer('poiStarLayer')) {
      this.map.setLayoutProperty('poiStarLayer', 'visibility', 'visible');
      this.map.setFilter('poiStarLayer', ['==', 'safegraph_place_id', place['ids']['safegraph_place_id']]);
    }
  }

  hoverOutOnCard() {
    if (this.map.getLayer('poiStarLayer')) {
      this.map.setLayoutProperty('poiStarLayer', 'visibility', 'none');
      this.map.setFilter('poiStarLayer', ['!=', 'safegraph_place_id', 0]);
    }
  }
  leaveOnCard() {
    const poiStarDataSet = { 'type': 'FeatureCollection', 'features': [] };
    if (poiStarDataSet !== undefined && this.map.getSource('poiStarData')) {
      this.map.getSource('poiStarData').setData(poiStarDataSet);
    }
  }

  dynamicResize() {
    this.mapWidth = this.dimensionsDetails.windowWidth - 40;
    setTimeout(() => {
      this.map.resize({mapResize: true});
    }, 100);
  }
  onCloseFilter() {
    this.placeFilterService.savePlacesSession('selectedTab', {open: false, tab:  this.filterOpenDetails['tab']});
    this.placeFilterService.setFilterSidenav({open: false, tab:  this.filterOpenDetails['tab']});
    // console.log('sidenavOptions', sidenavOptions);
  }

  onPushNationalData(data) {
    this.filteredData = data;
    if (data && (typeof data['states'] === 'undefined' || typeof data['ids'] === 'undefined')) {
      if (this.map.getLayer('nationalWideBubble')) {
        this.map.setLayoutProperty('nationalWideBubble', 'visibility', 'none');
      }
      if (this.map.getLayer('nationalWideCount')) {
        this.map.setLayoutProperty('nationalWideCount', 'visibility', 'none');
      }
      if (this.map.getSource('nationalWideData')) {
        this.map.getSource('nationalWideData').setData({'type': 'FeatureCollection', 'features': []});
      }
      if (this.map.getLayer('poiPolygonLayer')) {
        // this.map.setLayoutProperty('poiPolygonLayer', 'visibility', 'visible');
        this.map.setLayerZoomRange('poiPolygonLayer', this.mapLayers['placePolys']['minzoom'], this.mapLayers['placePolys']['maxzoom']);
        this.map.setFilter('poiPolygonLayer', ['!=', 'safegraph_place_id', 'null']);
      }
      if (this.map.getLayer('poiPointHash5Layer')) {
        this.map.setLayoutProperty('poiPointHash5Layer', 'visibility', 'none');
      }
      if (this.map.getLayer('poiPointHash6Layer')) {
        this.map.setLayoutProperty('poiPointHash6Layer', 'visibility', 'none');
      }
      if (this.map.getLayer('poiPointLayer')) {
        this.map.setFilter('poiPointLayer', ['!=', 'safegraph_place_id', 'null']);
      }
      if (this.map.getLayer('poiPointHash5Layer')) {
        this.map.setFilter('poiPointHash5Layer', ['!=', 'geohash', 'null']);
      }
      if (this.map.getLayer('poiPointHash6Layer')) {
        this.map.setFilter('poiPointHash6Layer', ['!=', 'geohash', 'null']);
      }
      return true;
    } else if (data && data['states']) {
      let nationalData = {'type': 'FeatureCollection', 'features': []};
      if (data['states']['features']) {
        nationalData = this.formatUpNationalData(data['states']);
      }
      if (this.map.getLayer('nationalWideBubble')) {
        this.map.setLayoutProperty('nationalWideBubble', 'visibility', 'visible');
      }
      if (this.map.getLayer('nationalWideCount')) {
        this.map.setLayoutProperty('nationalWideCount', 'visibility', 'visible');
      }
      if (this.map.getLayer('poiPolygonLayer')) {
        // this.map.setLayoutProperty('poiPolygonLayer', 'visibility', 'visible');
        this.map.setLayerZoomRange('poiPolygonLayer', this.mapLayers['hash5']['minzoom'], this.mapLayers['placePolys']['maxzoom']);
      }
      if (this.map.getLayer('poiPointHash5Layer')) {
        this.map.setLayoutProperty('poiPointHash5Layer', 'visibility', 'visible');
      }
      if (this.map.getLayer('poiPointHash6Layer')) {
        this.map.setLayoutProperty('poiPointHash6Layer', 'visibility', 'visible');
      }
      /* if (this.map.getLayer('poiPointLayer')) {
        this.map.setLayoutProperty('poiPointLayer', 'visibility', 'visible');
        this.map.setFilter('poiPointLayer', data['ids']);
      } */
      if (this.map.getSource('nationalWideData')) {
        this.map.getSource('nationalWideData').setData(nationalData);
      }
    }
    if (data && data['ids']) {
      let filters = ['0'];
      if (data['ids']) {
        filters = [...data['ids']];
      }
      filters.unshift('in', 'safegraph_place_id');
      if (this.map.getLayer('poiPointLayer')) {
        this.map.setLayoutProperty('poiPointLayer', 'visibility', 'visible');
        this.map.setFilter('poiPointLayer', filters);
      }
      if (this.map.getLayer('poiPolygonLayer')) {
        this.map.setFilter('poiPolygonLayer', filters);
      }
    }
    if (data && data['geohash5']) {
      let geohashFilters = ['0'];
      if (data['geohash5']) {
        geohashFilters = [...data['geohash5']];
      }
      geohashFilters.unshift('in', 'geohash');
      if (this.map.getLayer('poiPointHash5Layer')) {
        this.map.setLayoutProperty('poiPointHash5Layer', 'visibility', 'visible');
        this.map.setFilter('poiPointHash5Layer', geohashFilters);
      }
    }
    if (data && data['geohash6']) {
      let geohashFilters = ['0'];
      if (data['geohash6']) {
        geohashFilters = [...data['geohash6']];
      }
      geohashFilters.unshift('in', 'geohash');
      if (this.map.getLayer('poiPointHash6Layer')) {
        this.map.setLayoutProperty('poiPointHash6Layer', 'visibility', 'visible');
        this.map.setFilter('poiPointHash6Layer', geohashFilters);
      }
    }
  }
  formatUpNationalData(data) {
    data.features.sort(function (a, b) {
      return b.properties.count - a.properties.count;
    });
    // Top 2% with the largest circles, top 25% medium, bottom 75% small.
    for (let i = 0, len = data.features.length; i < len; i++) {
      if (Math.ceil((i / len) * 100) <= 2 || i <= 1) {
        data.features[i].properties['radius'] = 40;  // 75;
      } else if (Math.ceil((i / len) * 100) <= 25 || i <= 3) {
        data.features[i].properties['radius'] = 20;  // 45;
      } else {
        data.features[i].properties['radius'] = 10;  // 25;
      }
    }
    return data;
  }

  private setMapPosition() {
    const placesSession = this.placeFilterService.getPlacesSession();
    if (placesSession && placesSession['mapPosition']) {
      const boundBox = bbox(placesSession['mapPosition']);
      this.map.fitBounds(boundBox, {}, { polygonData: placesSession['mapPosition'], eventType: 'session'});
    } else {
      this.map.fitBounds(
        this.mapBounds, { duration: 300 }, { eventType: 'default'}
      );
    }
  }
  onChangeTab (eve) {
    this.currentTab = eve;
  }

  private closeSideNav() {
    const sidenavOptions = {open: false, tab: ''};
    this.placeFilterService.setFilterSidenav(sidenavOptions);
  }

  /**
   * This function is to draw the polygon based on market
   * @param polygon
   */
  public geoPolygon(polygonInfo) {
    this.closeSideNav();
    if (this.circularPolyDrawEnabled || this.normalPolyDrawEnabled || this.radiusPolyDrawEnabled) {
      this.removeFeatures();
      this.removePolygon(false);
    }
    this.customPolygon.coordinates = [];
    this.geoPolygonEnabled = true;
    this.customPolygon.coordinates.push([].concat.apply([], polygonInfo['polygon']['geometry']['coordinates']));
    this.customPolygonFeature.geometry = polygonInfo['polygon']['geometry'];
    this.polygonData.features.push(this.customPolygonFeature);
    this.togglePolygonLayerView(true);
    if (!polygonInfo['session']) {
      this.placeFilterService.savePlacesSession('marketFeature', polygonInfo['polygon']);
      this.placeFilterService.setLocationFilter({
        region: this.customPolygon,
        type: 'filterLocationByMarket',
        market: polygonInfo['market']
      });
    }
  }

  /**
   * This function is to draw the polygon on map based on radius
   */
  public filterLocationsByRadius(polygonInfo) {
    this.closeSideNav();
    if (this.circularPolyDrawEnabled || this.normalPolyDrawEnabled || this.geoPolygonEnabled || this.radiusPolyDrawEnabled) {
      this.removePolygon(false);
    }
    if (polygonInfo.radius > 0) {
      this.polygonData = polygonInfo.featureCollection;
      this.customCenterPoint.coordinates = polygonInfo.polygon.coordinates;
      this.radiusPolyDrawEnabled = true;
      this.togglePolygonLayerView(true);
    }
    if (!polygonInfo['session']) {
      this.placeFilterService.savePlacesSession('radiusPolyFeatureCollection', polygonInfo.featureCollection);
      this.placeFilterService.setLocationFilter({
        region: this.customCenterPoint,
        type: 'filterLocationByRadius',
        radius: polygonInfo.radius});
    }
  }
  /**
   * This function is to draw the normal polygon on map
   */
  public drawPolygon() {
    this.closeSideNav();
    if (this.circularPolyDrawEnabled || this.radiusPolyDrawEnabled || this.geoPolygonEnabled || this.normalPolyDrawEnabled) {
      this.removePolygon(true);
    }
    if (!this.map.getSource('mapbox-gl-draw-cold')) {
      this.map.addControl(this.draw);
    }
    this.normalPolyDrawEnabled = true;
    if (this.draw.getAll().features.length > 0) {
      this.draw.deleteAll();
    }
    this.polygonData.features = [];
    this.draw.changeMode('draw_polygon');
    this.map.on('draw.create', this.updateFiltersFromPolygon.bind(this));
    this.disableMapInteraction();
    this.togglePolygonLayerView(false);
  }
  /**
   * This function is to draw the circular polygon on map
   */
  public drawCircularPolygon() {
    this.closeSideNav();
    if (this.normalPolyDrawEnabled || this.radiusPolyDrawEnabled || this.geoPolygonEnabled) {
      this.removePolygon(true);
    }
    if (!this.map.getSource('mapbox-gl-draw-cold')) {
      this.map.addControl(this.draw);
    }
    this.circularPolyDrawEnabled = true;
    if (this.draw.getAll().features.length > 0) {
      this.draw.deleteAll();
    }
    this.polygonData.features = [];
    this.customPolygonFeature.geometry = {
      type: 'Polygon',
      coordinates: []
    };
    this.draw.changeMode('draw_radius');
    this.map.on('draw.create', this.updateFiltersFromPolygon.bind(this));
    this.disableMapInteraction();
    this.togglePolygonLayerView(false);
  }

  /**
   * This function is to remove normal and circular polygons from map
   * @param updateMap Set to false if no need to clear the location filters
   */
  public removePolygon(updateMap = true) {
    this.togglePolygonLayerView(false);
    if (this.normalPolyDrawEnabled || this.circularPolyDrawEnabled) {
      if (this.map.getSource('mapbox-gl-draw-cold')) {
        this.draw.deleteAll();
        this.map.removeControl(this.draw);
        this.map.getContainer().classList.remove('mouse-add');
      }
      this.enableMapInteraction();
      if (this.normalPolyDrawEnabled) {
        this.normalPolyDrawEnabled = false;
      } else if (this.circularPolyDrawEnabled) {
        this.circularPolyDrawEnabled = false;
      }
      this.removeFeatures();
    }
    if (this.radiusPolyDrawEnabled) {
      this.customCenterPoint.coordinates = [];
      this.radiusPolyDrawEnabled = false;
      this.placeFilterService.savePlacesSession('radiusPolyFeatureCollection', '');
    }
    if (this.geoPolygonEnabled) {
      this.geoPolygonEnabled = false;
      this.placeFilterService.savePlacesSession('marketFeature', '');
      this.placeFilterService.savePlacesSession('selectedGeoMarket', '');
      this.removeFeatures();
    }
    this.placeFilterService.savePlacesSession('appliedPolygonType', '');
    if (updateMap) {
      this.placeFilterService.setLocationFilter({});
    }
  }


  private removeFeatures() {
    this.customPolygon.coordinates = [];
    this.customPolygonFeature.geometry = {
      type: 'Polygon',
      coordinates: []
    };
    this.polygonData.features = [];
  }
  /**
   * This function is to update map with new layers when drawing polygon is done
   * @param polygonFromSession
   */
  updateFiltersFromPolygon(polygonFromSession = {}) {
    if (((this.normalPolyDrawEnabled || this.circularPolyDrawEnabled) &&
      this.draw.getAll().features.length > 0) || polygonFromSession['appliedPolygonType']) {
      this.customPolygon.coordinates = [];
      if (polygonFromSession['region']) {
        this.closeSideNav();
        this.customPolygon.coordinates.push([].concat.apply([], polygonFromSession['region']['coordinates']));
        switch (polygonFromSession['appliedPolygonType']) {
          case 'normalPolygon':
          this.normalPolyDrawEnabled = true;
          break;
          case 'circularPolygon':
          this.circularPolyDrawEnabled = true;
          break;
        }
        this.customPolygonFeature.geometry = polygonFromSession['region'];
        this.polygonData.features.push(this.customPolygonFeature);
      } else {
        let appliedPolygonType = '';
        if (this.circularPolyDrawEnabled) {
          this.customPolygon.coordinates = [];
          this.customPolygon.coordinates.push([RadiusMode.circleCoordinates]);
          this.customPolygonFeature.geometry.coordinates.push(RadiusMode.circleCoordinates);
          this.polygonData.features.push(this.customPolygonFeature);
          appliedPolygonType = 'circularPolygon';
        } else {
          this.customPolygon.coordinates.push(this.draw.getAll().features[0].geometry.coordinates);
          this.polygonData.features.push(this.draw.getAll().features[0]);
          appliedPolygonType = 'normalPolygon';
        }
        this.placeFilterService.setLocationFilter({region: this.customPolygon, type: appliedPolygonType});
      }
      // enabling polygon layer view
      this.togglePolygonLayerView(true);

      if (!polygonFromSession['region']) {
        this.draw.deleteAll();
      }
      setTimeout(() => {
        this.enableMapInteraction();
      }, 200);
    }
  }


  /**
   * To turn on or off polygon layers
   * @param enable set value true or flase
   */
  private togglePolygonLayerView(enable = false) {
    if (!this.map.getSource('polygonData')) {
      return;
    }
    if (enable) {
      this.map.getSource('polygonData').setData(this.polygonData);
      this.map.setLayoutProperty('customPolygon', 'visibility', 'visible');
      this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'visible');
    } else {
      const emptyData = Object.assign({}, this.polygonData);
      emptyData.features = [];
      this.map.getSource('polygonData').setData(emptyData);
      this.map.setLayoutProperty('customPolygon', 'visibility', 'none');
      this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'none');
    }
  }

  /**
   * This function is to disable the map interactions while drawing a polygon
   */
  private disableMapInteraction() {
    if (this.enableMapInteractionFlag) {
      this.enableMapInteractionFlag = false;
      this.map['boxZoom'].disable();
      this.map['doubleClickZoom'].disable();
      this.map['scrollZoom'].disable();
      this.map.off('click', this.popupDistributor);
    }

  }

  /**
   * This function is to enable the map interactions when drawing a polygon is completed
   */
  enableMapInteraction() {
    if (!this.enableMapInteractionFlag) {
      this.enableMapInteractionFlag = true;
      this.map['boxZoom'].enable();
      this.map['doubleClickZoom'].enable();
      this.map['scrollZoom'].enable();
      this.map.on('click', this.popupDistributor);
    }
  }

  private applyViewLayers() {
    this.loaderService.display(true);
    const layersSession = this.layersService.getlayersSession(true);
    if (layersSession && layersSession['display']) {
      const mapStyle = layersSession['display']['baseMap'];
      this.style = this.commonService.getMapStyle(this.baseMaps, mapStyle);
      layersSession['display']['baseMap'] = this.style['label'];
      if (layersSession['display']['baseMap'] && this.mapStyle !== layersSession['display']['baseMap']) {
        if (this.mapPopup.isOpen()) {
          this.mapPopup.remove();
        }
        this.mapStyle = layersSession['display']['baseMap'];
        this.selectedMapStyle = this.mapStyle;
        this.style = this.commonService.getMapStyle(this.baseMaps, this.mapStyle);
        this.map.setStyle(this.style['uri']);
        this.map.once('load', () => {
          this.map.fitBounds(this.mapBounds);
          this.map.setZoom(this.zoomLevel);
        });
      } else {
        if (typeof layersSession['display']['mapControls'] !== 'undefined') {
          this.showMapControls = layersSession['display']['mapControls'];
        }
        if (typeof layersSession['display']['mapLegend'] !== 'undefined') {
          this.showMapLegends = layersSession['display']['mapLegend'];
        }
        if (layersSession['display']) {
          if (layersSession['display']['screen']) {
            this.mapWidthHeight = layersSession['display']['screen'];
          }
        }
        this.loadViewLayers();
      }
    }
    this.loaderService.display(false);
  }

  private clearLayerView(clearAll = true) {
    this.showMapControls = true;
    this.showMapLegends = true;
    this.removeLayers();
    this.removeGeographyLayers();
    if (clearAll && this.mapStyle !== 'light') {
      if (this.mapPopup.isOpen()) {
        this.mapPopup.remove();
      }
      this.mapStyle = this.layersService.getDefaultMapStyle(this.baseMaps);
      this.style = this.commonService.getMapStyle(this.baseMaps, this.mapStyle);
      this.map.setStyle(this.style['uri']);
      this.map.once('style.load', () => {
        this.map.fitBounds(this.mapBounds);
        this.map.setZoom(this.zoomLevel);
      });
    }
  }

  loadViewLayers() {
    this.removeLayers();
    this.layerInventorySetLayers = [];
    const layersSession = this.layersService.getlayersSession(true);
    if (layersSession
      && layersSession['selectedLayers']
      && layersSession['selectedLayers'].length > 0) {
      const geoLayerData = [];
      const geoMarkerIconData = [];
      for (let i = layersSession['selectedLayers'].length - 1; i >= 0; i--) {
        const layerData = layersSession['selectedLayers'][i];
        switch (layerData.type) {
          case 'place collection':
            const placeSetNationalLevelSource = 'layerPlaceViewData' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            const placeSetLayerSource = 'layerPlaceViewData' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            const params = { 'ids': [layerData.id] };
            const placeSetLayer = 'layerPlacesLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.layerInventorySetLayers.push(placeSetLayer);
            if (layerData['data']['pois'].length > 100) {
              const nationalWideBubblePlaceLayer = 'nationalWideBubblePlaceLayer' + Date.now().toString(36) +
                Math.random().toString(36).substr(2);
              const nationalWideCountPlaceLayer = 'nationalWideCountPlaceLayer' + Date.now().toString(36) +
                Math.random().toString(36).substr(2);
              this.layerInventorySetLayers.push(nationalWideBubblePlaceLayer);
              this.layerInventorySetLayers.push(nationalWideCountPlaceLayer);
              this.map.addSource(placeSetNationalLevelSource, {
                type: 'geojson',
                data: {
                  'type': 'FeatureCollection',
                  'features': []
                }
              });
              this.map.addLayer({
                id: nationalWideBubblePlaceLayer,
                type: 'circle',
                source: placeSetNationalLevelSource,
                // minzoom: 0,
                minzoom: 0,
                maxzoom: 6,
                layer: {
                  'visibility': 'visible',
                },
                paint: {
                  'circle-opacity': 0.6,
                  'circle-color': layerData['color'],
                  'circle-radius': ['get', 'radius']
                }
              });
              this.map.addLayer({
                id: nationalWideCountPlaceLayer,
                type: 'symbol',
                source: placeSetNationalLevelSource,
                minzoom: 0,
                maxzoom: 6,
                // filter: ['>', 'radius', 10],
                layout: {
                  'text-field': '{count}',
                  'text-font': ['Product Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
                  'text-size': [
                    'step',
                    ['get', 'radius'],
                    9,
                    15,
                    12,
                    25,
                    24
                  ]
                },
                paint: {
                  'text-color': '#ffffff'
                }
              });
              this.placeFilterService.getPlaceSetsSummary(params, true).subscribe(layer => {
                const data = layer['data'][0];
                const layerInfo = {
                  type: 'FeatureCollection',
                  features: data['pois']
                };
                this.map.getSource(placeSetNationalLevelSource).setData(this.formatUpPlaceNationalData(layerInfo));
              });
            }
            this.map.addSource(placeSetLayerSource, {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              }
            });
            this.map.addLayer({
              id: placeSetLayer,
              type: 'symbol',
              source: placeSetLayerSource,
              minzoom: layerData['data']['pois'].length > 100 ? 6 : 0,
              layout: {
                'text-line-height': 1,
                'text-padding': 0,
                'text-anchor': 'bottom',
                'text-allow-overlap': true,
                'text-field': layerData['icon'] && this.markerIcon[layerData['icon']] || this.markerIcon['place'],
                'icon-optional': true,
                'text-font': ['imx-map-font-31 map-font-31'],
                'text-size': layerData['icon'] === 'lens' ? 18 : 24,
                'text-offset': [0, 0.6]
              },
              paint: {
                'text-translate-anchor': 'viewport',
                'text-color': layerData['color']
              }
            });
            this.map.on('mouseenter', placeSetLayer, () => {
              this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', placeSetLayer, () => {
              this.map.getCanvas().style.cursor = '';
            });

            this.placeFilterService.getPlaceSetsSummary(params, false).subscribe(layer => {
              const data = layer['data'][0];
              const layerInfo = {
                type: 'FeatureCollection',
                features: data['pois']
              };
              this.map.getSource(placeSetLayerSource).setData(layerInfo);
            });
            break;
          case 'place':
            const placeLayerId =  'placeLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            const placeLayerDataId =  'placeLayerData' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.layerInventorySetLayers.push(placeLayerId);
            this.addNewPlaceLayer(placeLayerId, placeLayerDataId, layerData, true);
            break;
          case 'geography':
            layerData['data']['properties']['icon'] = layerData['icon'];
            layerData['data']['properties']['color'] = layerData['color'];
            layerData['data']['properties']['id'] = layerData['id'];

            const name = layerData['data']['properties']['name'];
            const pointGeo = turfCenter(layerData['data']);
            pointGeo['properties']['icon'] =  layerData['icon'];
            pointGeo['properties']['color'] =  layerData['color'];
            pointGeo['properties']['id'] =  layerData['id'];
            pointGeo['properties']['name'] =  name;

            delete layerData['data']['id'];
            delete layerData['data']['name'];
            geoLayerData.push(layerData['data']);
            geoMarkerIconData.push(pointGeo);
            break;
        }
      }

      this.addNewGeographyLayers(geoLayerData, geoMarkerIconData);

    } else {
      this.removeGeographyLayers();
      this.removeLayers();
    }
  }

  private removeLayers() {
    if (this.layerInventorySetLayers.length > 0) {
      this.layerInventorySetLayers.map(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.off('mouseenter', layerId);
          this.map.off('mouseleave', layerId);
          this.map.removeLayer(layerId);
        }
      });
    }
    this.layerInventorySetLayers = [];
  }

  private formatUpPlaceNationalData(data) {
    data.features.sort(function (a, b) {
      return b.properties.count - a.properties.count;
    });
    // Top 2% with the largest circles, top 25% medium, bottom 75% small.
    for (let i = 0, len = data.features.length; i < len; i++) {
      if (Math.ceil((i / len) * 100) <= 2 || i <= 1) {
        data.features[i].properties['radius'] = 40;  // 75;
      } else if (Math.ceil((i / len) * 100) <= 25 || i <= 3) {
        data.features[i].properties['radius'] = 20;  // 45;
      } else {
        data.features[i].properties['radius'] = 10;  // 25;
      }
    }
    return data;
  }

  /**
   * A method to create a new place layer
   * @param layerId
   * @param dataSourceId
   */
  private addNewPlaceLayer(layerId, dataSourceId, layerData, singlePlaceLayer = false) {
    this.map.addSource(dataSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: singlePlaceLayer ? [layerData['data']] : []
      }
    });
    this.map.addLayer({
      id: layerId,
      type: 'symbol',
      source: dataSourceId,
      layout: {
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': layerData['icon'] && this.markerIcon[layerData['icon']] || this.markerIcon['place'],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': layerData['icon'] === 'lens' ? 18 : 24,
        'text-offset': [0, 0.6]
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': layerData['color']
      }
    });
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  private addNewGeographyLayers (geoLayerData, geoMarkerIconData) {
    this.removeGeographyLayers();
    // to draw the polygon line
    this.map.addSource( 'geoDataline' , {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoLayerData
      }
    });
    // to fill the color inside the polygon area
    this.map.addSource( 'geoDataFill' , {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoLayerData
      }
    });
    // Add the icon in center places of polygon area
    this.map.addSource( 'geoDataPoint' , {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoMarkerIconData
      }
    });

    this.map.addLayer({
      id: 'geographyLayerLine',
      type: 'line',
      source: 'geoDataline',
      paint: {
        'line-opacity': .8,
        'line-color': ['get', 'color'],
        'line-width': 1
      }
    });

    this.map.addLayer({
      id: 'geographyLayerFill',
      type: 'fill',
      source: 'geoDataFill',
      paint: {
        'fill-opacity': .08,
        'fill-color': ['get', 'color']
      }
    });

    this.map.addLayer({
      id: 'geoDataPointCenter',
      type: 'symbol',
      source: 'geoDataPoint',
      layout: {
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': ['get', ['to-string', ['get', 'icon']], ['literal', this.markerIcon]],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 18,
        'text-offset': [0 , 0.6]
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': ['get', 'color']
      }
    });
  }

  private removeGeographyLayers() {
    if (this.map.getLayer('geographyLayerLine')) {
       this.map.removeLayer('geographyLayerLine');
       this.map.removeSource('geoDataline');
    }
    if (this.map.getLayer('geographyLayerFill')) {
      this.map.removeLayer('geographyLayerFill');
      this.map.removeSource('geoDataFill');
    }
    if (this.map.getLayer('geoDataPointCenter')) {
      this.map.removeLayer('geoDataPointCenter');
      this.map.removeSource('geoDataPoint');
    }
  }

  onOpenSavePlaseSet(place_id) {
    this.placeDataService.setPOIPlacesData([{id: place_id, selected: true}]);
    const filters = this.placeFilterService.getPlacesSession();
    const data = {
      title: 'Save as New Place Set',
      buttonText: 'Create Place Set',
      isSavePlaceSet: false,
      type: 'single'
      // summaryId: filters['filters']['summaryId']
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data,
      panelClass: 'placesSet-dialog-container'
    });
  }
  onOpenSaveToExistingPlaseSet(place_id) {
    this.placeDataService.setPOIPlacesData([{id: place_id, selected: true}]);
    const filters = this.placeFilterService.getPlacesSession();
    const data = {
      title: 'Save to Existing Place Set',
      buttonText: 'Save to selected Place Set',
      isExistingPlaceSet: true,
      type: 'single'
      // summaryId: filters['filters']['summaryId']
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data
    });
  }
  public selectedFilterFids($event) {
    this.sfids = $event;
  }
  public onNavigationStatus(flag) {
    this.navigationCollapseState = flag;
  }
  public openFilterNav() {
    this.placeFilterService.setFilterSidenav({open: true, tab:  this.filterOpenDetails['tab']});
  }
}
