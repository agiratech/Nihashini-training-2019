import {Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {
  ThemeService,
  ExploreDataService,
  FormatService,
  CommonService
} from '@shared/services';
import {takeWhile, map, switchMap} from 'rxjs/operators';
import {ResizeEvent} from 'angular-resizable-element';
import * as mapboxgl from 'mapbox-gl';
import {environment} from '../../../environments/environment';
import {LayersService} from '../layer-display-options/layers.service';

@Component({
  selector: 'app-explore-top-zip-market',
  templateUrl: './explore-top-zip-market.component.html',
  styleUrls: ['./explore-top-zip-market.component.less']
})
export class ExploreTopZipMarketComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dimensionsDetails: any;
  style: any = {};
  mapStyle: any = {};
  dragHandleStyle: any = {};
  @Output() exploreTopZipMarketWidth = new EventEmitter();
  @Output() onCloseTopMap = new EventEmitter();
  map: mapboxgl.Map;
  popupDistributor: any;
  marketPanelPopup: any;
  zipCodePanelPopup: any;
  mapPopup: any;
  colors: any = [];
  mapCenter: any = [-98.5, 39.8];
  unSubscribe: any = true;

  inventoryData: any = {};
  getpanelDetail: any = {};
  topMarkets: any = [];
  topZipCodes: any = [];
  features: any = [];
  current_page: any;
  current_e: any;
  topMapLoadedEvent: any = false;
  zipCodeLoadedLayers: any = [];
  layerDisplayOptions: any = {};
  selectedMapStyle: any = '';
  currentMapStyle: any;
  private themeSettings: any;
  baseMaps: any;
  @ViewChild('topMapReference', {static: false}) elementView: ElementRef;

  constructor(
    private _exploreData: ExploreDataService,
    private format: FormatService,
    private common: CommonService,
    private layersService: LayersService,
    private themeService: ThemeService,
  ) {
    this.themeSettings = this.themeService.getThemeSettings();
    this.baseMaps = this.themeSettings.basemaps;
  }

  ngOnInit() {
    const layersSession = this.layersService.getlayersSession();
    if (layersSession && layersSession['display'] && layersSession.display['baseMap']) {
      this.layerDisplayOptions = layersSession.display;
      this.selectedMapStyle = layersSession.display['baseMap'];
    } else {
      this.baseMaps.filter(maps => {
          if (maps.default) {
            this.mapStyle = maps.label;
          }
      });
      this.selectedMapStyle = this.mapStyle;
    }

    const currentReference = this;
    this.resizeLayout();
    this.initializeMap();
    this.mapPopup = new mapboxgl.Popup();
    this._exploreData.getTopMapData().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(data => {
        this.inventoryData = data;
        this.loadData();
      });

    this.popupDistributor = (e) => {
      let f = [];

      //  let features = this.map.queryRenderedFeatures(e.point);
      if (this.map.getLayer('marketPanel')) {
        f = this.map.queryRenderedFeatures(e.point, {layers: ['marketPanel']});
        if (f.length) {
          // this.marketPanelPopup(e);
          return;
        }
      }
      if (this.map.getLayer('zipHeatMap') && this.zipCodeLoadedLayers.length > 0) {
        f = this.map.queryRenderedFeatures(e.point, {layers: this.zipCodeLoadedLayers});
        let feature;
        if (f.length) {
          if (f.length > 0) {
            feature = f[0];
            // this.zipCodePanelPopup(e, feature);
            return;
          }
          /*this.map.flyTo({center: f[0].geometry.coordinates, zoom: 9});
		        this.map.once('moveend', function () {
		          this.venuesClicked = true;
		        });*/
          return;
        }
      }
    };
    this.marketPanelPopup = function (e) {
      currentReference.buildMarketPanelPopup(e, 0, currentReference.map, currentReference.mapPopup, 'marketPanel');
    };
    this.zipCodePanelPopup = function (e, f) {
      currentReference.buildZipcodePanelPopup(e, f, 0, currentReference.map, currentReference.mapPopup);
    };
    this.layersService.getDisplayOptions().subscribe((layers) => {
      this.layerDisplayOptions = layers;
    });
    /*this.layersService.getApplyLayers().subscribe((value) => {
      if (value) {
        this.applyViewLayers();
      } else {
        //this.removeLayers();
      }
    });*/

    this.colors = this.layersService.colorGenerater(this.themeSettings['color_sets']['primary']['base']);
    this.colors.pop();
  }

  applyViewLayers() {
    if (this.layerDisplayOptions) {
      if (this.layerDisplayOptions['baseMap'] && this.selectedMapStyle != this.layerDisplayOptions['baseMap']) {
        this.selectedMapStyle = this.layerDisplayOptions['baseMap'];
        this.currentMapStyle = this.common.getMapStyle(this.baseMaps, this.selectedMapStyle);
        this.map.setStyle(this.currentMapStyle['uri']);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dimensionsDetails && changes.dimensionsDetails.currentValue) {
      this.resizeLayout();
    }
  }

  buildMarketPanelPopup(e, i = 0, map, popup, layer) {
    const self = this;
    if (popup.isOpen()) {
      popup.remove();
    }
    this.features = map.queryRenderedFeatures(e.point, {layers: [layer]});
    const feature = this.features[i];
    this.current_page = i;
    this.current_e = e;
    const htmlContent = this.getMarketPanelPopupHTML(feature);
    setTimeout(() => {
      popup.setLngLat(e.lngLat)
        .setHTML(htmlContent).addTo(map);
    }, 100);
  }

  getMarketPanelPopupHTML(feature, type = 'map') {
    const prop = feature.properties;
    const self = this;
    let selectBtn = '';
    let address = '';
    let index = this.getMarketIndexValue(prop.id);
    const i = this.current_page + 1;


    var description =
      `<div class='z-depth-2 mapPopUpBlk' id="inventoryShortOverview">
      <div class='mapPopUpBlk2'>
        <div class='mapPopUpBlk2-content'>
          <div class='mapPopupLeftPanel flex-center flex-column'>
    `;
    description += `<img src='../../../assets/images/no_photo.png' crossorigin="anonymous">`;
    description += `
          </div>
          <div class='mapPopupRightPanel'>`;
    description += `<span id="under-review-flag" class='data-under-review'>DATA UNDER REVIEW</span>
    <div class='panel_content'>
      <!-- Heading Start -->
      <div class='panel_header'>
        <span class="oppTitle" title="${prop.longName}">${this.common.truncateString(prop.longName, 10, true)}</span>
      </div>
      <!-- Heading End -->
      <ul class="no-bullets">
        <li>INDEX: <span title="${prop['panels']}">${index['pct']}%</span></li>
        <li>PANELS: <span title="${prop['panels']}">${prop['panels']}</span></li>
      </ul>
    </div>
    `;
    description += `
        </div>
      </div>
    </div>`;

    description += `</div>`;
    return description;
  }

  getMarketIndexValue(id) {
    const topMarkets = this.topMarkets;
    let market = {};
    if (topMarkets.length > 0) {
      market = topMarkets.find((m) => m.id === id);
    }
    return market;
  }

  buildZipcodePanelPopup(e, f, i = 0, map, popup) {
    const self = this;
    if (popup.isOpen()) {
      popup.remove();
    }
    /*this.features = map.queryRenderedFeatures(e.point, {layers: [layer]});
    console.log("this.features",this.features);*/
    const feature = f;
    this.current_page = i;
    this.current_e = e;
    const htmlContent = this.getZipCodePanelPopupHTML(feature);
    setTimeout(() => {
      popup.setLngLat(e.lngLat)
        .setHTML(htmlContent).addTo(map);
    }, 100);
  }

  getZipCodePanelPopupHTML(feature, type = 'map') {
    const prop = feature.properties;
    const self = this;
    let selectBtn = '';
    let address = '';
    let index = this.getZipCodeIndexValue(prop.ZIPCODE);
    const i = this.current_page + 1;


    var description =
      `<div class='z-depth-2 mapPopUpBlk' id="inventoryShortOverview">
      <div class='mapPopUpBlk2'>
        <div class='mapPopUpBlk2-content'>
          <div class='mapPopupLeftPanel flex-center flex-column'>
    `;
    description += `<img src='../../../assets/images/no_photo.png' crossorigin="anonymous">`;
    description += `
          </div>
          <div class='mapPopupRightPanel'>`;
    description += `
    <div class='panel_content'>
      <!-- Heading Start -->
      <div class='panel_header'>
        <span class="oppTitle">${prop.ZIPCODE}</span>
      </div>
      <!-- Heading End -->
      <ul class="no-bullets">
        <li>INDEX: <span title="${prop['panels']}">${index['pct']}%</span></li>
      </ul>
    </div>
    `;
    description += `
        </div>
      </div>
    </div>`;

    description += `</div>`;
    return description;
  }

  getZipCodeIndexValue(zip) {
    const topZipCodes = this.topZipCodes;
    let zipcode = {};
    if (topZipCodes.length > 0) {
      zipcode = topZipCodes.find((m) => m.zip === zip);
    }
    return zipcode;
  }

  loadData() {
    const data = this.inventoryData;
    this.layersService.cleanUpMap(this.map);
    if (this.topMapLoadedEvent && data['type'] && this.inventoryData && this.inventoryData['inventoryDetail']) {
      this.getpanelDetail = this.inventoryData['inventoryDetail'];
      if (data['type'] === 'dma' && data['inventoryDetail']['dmaresults']) {
        // this.loadTopMarket(data['inventoryDetail']['dmaresults']);
        this.layersService.loadTopMarket(data['inventoryDetail']['dmaresults'], this.map, this.colors[0], 'zip');
      } else if (data['type'] === 'zip' && data['inventoryDetail']['zipcodes']) {
        this.layersService.loadTopZipCode(data['inventoryDetail']['zipcodes'], this.map, this.colors[0], 'zip');
      }
      if (data && data['inventoryFeature'] && data['inventoryFeature']) {
        this.markInventory(data['inventoryFeature']);
      }
    }
  }

  private markInventory(unitData) {

    if (this.map.getLayer('map-my-icon')) {
      this.map.removeLayer('map-my-icon')
    }

    if (this.map.getSource('map-my-icon')) {
      this.map.removeSource('map-my-icon')
    }

    const dataSource = {
      type: 'FeatureCollection',
      features: []
    };
    dataSource.features.push(unitData);

    this.map.addSource('map-my-icon', {
      type: 'geojson',
      data: dataSource
    });

    this.map.addLayer({
      id: 'map-my-icon',
      type: 'symbol',
      source: 'map-my-icon',
      layout: {
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': 'A',
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 24,
        'text-offset': [0, 0.6]
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': this.themeSettings['color_sets']['primary']['600']
      }
    });
  }

  removeLayers() {
    if (this.mapPopup && this.mapPopup.isOpen()) {
      this.mapPopup.remove();
    }
    // to clean up mapbox all layer, source and event
    this.layersService.cleanUpMap(this.map);
  }

  getTopList(data, count = 5) {
    return data.slice(0, count);
  }

  initializeMap() {
    mapboxgl.accessToken = environment.mapbox.access_token;
    const style = this.common.getMapStyle(this.baseMaps, this.selectedMapStyle);

    this.map = new mapboxgl.Map({
      container: 'mapTopZipMarket',
      style: style['uri'],
      minZoom: 0,
      maxZoom: 22,
      preserveDrawingBuffer: true,
      center: this.mapCenter, // starting position
      zoom: 3 // starting zoom
    });
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    /*this.map.on('zoom', () => {
	    console.log("zoom",this.map.getZoom());
	  });*/
    this.map.on('style.load', () => {
      this.loadMapLayers();
    });
  }

  loadMapLayers() {
    this.resizeLayout();
    this.map.on('click', this.popupDistributor);
    this.topMapLoadedEvent = true;
    this.loadData();
  }

  resizeLayout() {
    const width = ((this.dimensionsDetails.windowWidth - 40) / 2);
    const height = this.dimensionsDetails.windowHeight - this.dimensionsDetails.headerHeight;
    const handleDrag = height / 2;
    this.style = {
      width: `${width}px`,
      height: `${height}px`,
    };
    this.mapStyle = {
      height: `${height}px`,
      width: `${width - 20}px`,
    };
    this.dragHandleStyle = {
      marginTop: `${handleDrag}px`,
    };
    if (this.map) {
      this.map.resize();
    }
  }

  onResizing(event) {
    const handleDrag = event.rectangle.height / 2;
    this.style = {
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };
    this.mapStyle = {
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height - 20}px`,
    };
    this.dragHandleStyle = {
      marginTop: `${handleDrag}px`,
    };
  }

  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };
    this.mapStyle = {
      width: `${event.rectangle.width - 20}px`,
      height: `${event.rectangle.height}px`,
    };
    this.exploreTopZipMarketWidth.emit(event.rectangle.width);
    setTimeout(() => {
      this.map.resize();
    }, 500);
  }

  onResize(event) {
    this.mapStyle = {
      width: `${this.elementView.nativeElement.offsetWidth - 20}px`,
      height: `${this.elementView.nativeElement.offsetHeight}px`,
    };
    this.exploreTopZipMarketWidth.emit(this.elementView.nativeElement.offsetWidth);
    setTimeout(() => {
      this.map.resize();
    }, 500);
    /*const mapHeight = this.elementView.nativeElement.offsetHeight;
    const top = event.currentTarget.innerHeight - mapHeight;
    if (top > 200) {
      this.tablurMapHeight.emit(mapHeight);
      this.style = {
        position: 'fixed',
        top: `${top }px`,
        height: `${mapHeight}px`
      };
    } else {
      this.tablurMapHeight.emit(250);
      this.style = {
        position: 'fixed',
        top: `${event.currentTarget.innerHeight - 250 }px`,
        height: `${250}px`
      };
      this.tableHeight = 130;
    }
    */
  }

  closeTopMap() {
    this._exploreData.setMapViewPostionState('mapView');
    this.removeLayers();
    this.onCloseTopMap.emit();
  }

  ngOnDestroy() {
    this.unSubscribe = false;
    this.removeLayers();
    this._exploreData.setMapViewPostionState('inventoryView');
  }

  convertToPercentage(key, decimal = 0) {
    return this.format.convertToPercentageFormat(key, decimal);
  }

}
