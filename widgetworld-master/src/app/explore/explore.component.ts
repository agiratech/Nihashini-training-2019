import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BulkExportRequest } from '@interTypes/bulkExport';
import { Filters } from '@interTypes/filters';
import { SummaryRequest } from '@interTypes/summary';
import { WorkflowLables, NewProjectDialog } from '@interTypes/workspaceV2';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import {
  AuthenticationService,
  CommonService,
  CSVService,
  ExploreDataService,
  ExploreService,
  FormatService,
  LoaderService,
  ThemeService,
  WorkSpaceService,
  WorkSpaceDataService,
  DynamicComponentService,
  MapService
} from '@shared/services';
import bbox from '@turf/bbox';
import { saveAs } from 'file-saver';
import * as mapboxgl from 'mapbox-gl';
import * as mobiledetect from 'mobile-detect';
import {BehaviorSubject, forkJoin, from, zip, Subject, Observable, EMPTY} from 'rxjs';
import {catchError, map, tap, filter, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import swal from 'sweetalert2';
import { environment } from '../../environments/environment';
import { LocateMeControl } from '../classes/locate-me-control';
import { Orientation } from '../classes/orientation';
import { RadiusMode } from '../classes/radius-mode';
import { ProjectDataStoreService } from '../dataStore/project-data-store.service';
import { ExploreSaveScenariosComponent } from './explore-save-scenarios/explore-save-scenarios.component';
import { FiltersService } from './filters/filters.service';
import { InventoryBulkExportComponent } from './inventory-bulk-export/inventory-bulk-export.component';
import { LayersService } from './layer-display-options/layers.service';
import { ExploreInventoryDetailComponent } from "./explore-inventory-popup/explore-inventory-detail/explore-inventory-detail.component"
import { ExploreInventoryIntersetComponent } from './explore-inventory-popup/explore-inventory-interset/explore-inventory-interset.component';
import { InventoryDetailViewComponent } from './explore-inventory-popup/inventory-detail-view/inventory-detail-view.component';
import { InventoryDetailViewLayoutComponent } from './explore-inventory-popup/inventory-detail-view-layout/inventory-detail-view-layout.component';
import { ExploreInventoryInformationComponent } from './explore-inventory-popup/explore-inventory-information/explore-inventory-information.component';
import { PlacesFiltersService } from '../places/filters/places-filters.service';
import { InventoryService } from '@shared/services/inventory.service';
import turfCenter from '@turf/center';
import { Representation } from '@interTypes/inventorySearch';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialog } from './../Interfaces/workspaceV2';
import { NewProjectDialogComponent } from '@shared/components/new-project-dialog/new-project-dialog.component';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { ElasticIndexName } from '@interTypes/inventoryElasticSearch';
@Component({
  selector: 'app-geo-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.less'],
  providers: [TruncatePipe]
})
export class ExploreComponent implements OnInit, OnDestroy {
  tempTab: any;
  tempOpen = false;
  constructor(private common: CommonService,
    private exploreService: ExploreService,
    private exploreDataService: ExploreDataService,
    private loaderService: LoaderService,
    private theme: ThemeService,
    private CSV: CSVService,
    private auth: AuthenticationService,
    private workSpaceDataService: WorkSpaceDataService,
    private workSpace: WorkSpaceService,
    public format: FormatService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public filterService: FiltersService,
    private layersService: LayersService,
    private dynamicComponentService: DynamicComponentService,
    private mapService: MapService,
    private placesFiltersService: PlacesFiltersService,
    private inventoryService: InventoryService,
    private truncate: TruncatePipe,
    private projectStore: ProjectDataStoreService,
    private newWorkSpaceService: NewWorkspaceService,
  ) { }

  @ViewChild(ExploreSaveScenariosComponent, { static: false }) exploreScenario: ExploreSaveScenariosComponent;
  public workFlowLabels: WorkflowLables;
  public sidebarState = false;
  public start = 0;
  public selectedCount = 0;
  private defaultAudience: any;
  public sortQuery = { name: 'Target Composition Percentage', value: 'pct_comp_imp_target' };
  public selectQuery = 'All';
  public selectQueryLimited = -1;
  public selectQueryPText = 'All';
  public selectedBaseID = 'pf_pop_a18p';
  public selectedAudienceID: string = null;
  public selectedMarket = {};
  public selectedTarget: string = null;
  public filterCacheID = '';
  public placeLayerVisibility;
  public sortables: any;
  public sortKeyNoMarket: any;
  public sortKeyAll: any;
  public selectOptions = ['All', 'Top 25', 'Top 50', 'Top 100', 'None', 'Custom'];
  public inventoryGroups;
  public inventoryGroupIds;
  public places = [];
  public tempPlaces = [];
  public draggedHeight = null;
  public isVisible = false;
  public redraw = false;
  public placesForCSV: any;
  public totalInventory: number;
  public totalGPInventory: number;
  private unSubscribe: Subject<void> = new Subject<void>();
  mapLayers: any = {};
  packages = [];
  selectedPackage = {};
  map: mapboxgl.Map;
  features: any = {};
  current_page: any;
  current_e: any;
  themeSettings: any;
  baseMaps: any;
  zoomLevel = 0;
  mod_permission: any;
  allowInventory: string = '';
  allowInventoryAudience: string = '';
  csvExportEnabled: string;
  pdfExportEnabled: string;
  inventorySetEnabled: string;
  isSelectEnabled = false;
  isScenarioEnabled: boolean;
  isMeasureEnabled: boolean;
  mapPopup: any;
  style: any;
  nationalWideData: any = { 'type': 'FeatureCollection', 'features': [] };
  levelLayerData: any = { 'type': 'FeatureCollection', 'features': [] };
  areaLayerData: any = { 'type': 'FeatureCollection', 'features': [] };
  frameLayerData: any = { 'type': 'FeatureCollection', 'features': [] };
  footPrintLayerData: any = { 'type': 'FeatureCollection', 'features': [] };
  emptyFeatures: any = { 'type': 'FeatureCollection', 'features': [] };
  public selectedInventories: any;
  draw: MapboxDraw;
  mapDrawEnable = false;
  circleDrawEnable = false;
  placeSetsDisplay = false;
  polygonInfo: any;
  setSelectedEnable = false;
  public mapViewSearch = 0;
  public commonFilter: any = {};
  public nationalWideDataLoad = true;
  public filterApiCallLoaded = true;
  inventoryMarketData: any = [];
  customPolygon: any = { 'type': 'MultiPolygon', 'coordinates': [] };
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
  public page: any = 1;
  addingMapDraw = false;
  fids: any = [];
  layersChanging = false;
  selectedFidsArray: any = [];
  dynamicMapView = 0;
  popOpenedType = '';
  inventoryDetailApiCall = null;
  inventoryDetailApiZipCall = null;
  inventoryDetailApiDmaCall = null;
  inventoryDetailApiData = new BehaviorSubject({});
  inventoryDetailApiZipData = new BehaviorSubject({});
  inventoryDetailApiDmaData = new BehaviorSubject({});
  private toggleClicks = new Subject();
  private toggleUnsubscribe: any;
  public openedInventoryDetail = false;
  public openedPopupObj = null;
  public openedMapObj = null;
  public openedFeatureObj = null;
  framCluster0ZoomIn: any;
  framCluster5ZoomIn: any;
  framClusterZoomIn: any;
  totalPage = 0;
  placeFramePopup: any;
  poiPopup: any;
  poiLayerPopup: any;
  popupDistributor: any;
  disablePopupDistributor: any;
  outSideClick: any;
  framesZoomIn: any;
  colorFrameZoomIn: any;
  customFrameZoomIn: any;
  mapLabelZoomIn: any;
  greyedFrameZoomIn: any;
  placesZoomIn: any;
  layerInventorySetPopup: any;
  hoverOnInventoryCard = false;
  clearFlagtimeout: any = null;
  inventoriesApiCall: any = null;
  recallInventoryApiTimer: any = null;
  inventoryDetailTimer: any = null;
  mobileLoader: boolean = false;
  // Color used as the store outline
  outlineColor = '#616161';
  // Brown-gray color used for the floorplan of the building
  floorColor = '#EFEBE9';
  // Darker gray used to show hollow areas in the floorplan
  hollowColor = '#9B9F9E';

  eatingColor = '';
  // Gray used to show restrcited areas or restrooms/etc. in the venue
  blockedColor = '#CFCFD0';
  // Set facility area to be the the company selected color (either primary or secondary)
  facilityAreaColor = '';
  // Set the stores to be this same color
  shoppingColor = '';

  facilityID = [
    3, 9, 10, 11, 17, 20, 26, 36, 52, 54, 61, 62, 73, 74,
    101, 102, 103, 105, 106, 7522, 9509, 9515, 7011, 79, 9516,
    7389, 6, 16, 25, 29, 65, 9221, 8060, 1, 2, 19, 21,
    60, 66, 70, 77, 80, 81, 85, 97, 104, 108, 109, 120, 121, 12, 64
  ];
  foodID = [27, 30, 43, 59, 115, 5800, 9532, 9533, 9996, 9534, 9536, 9597, 9545, 9548];
  shoppingID = [91, 100, 9537, 9538, 9539, 9540, 9541, 7510, 7538, 9503, 9504, 9507, 9508, 9510, 9511, 9512, 9530, 9578, 9581, 9595, 9992, 9523, 9527, 9556, 9559, 9561, 9987, 5400, 9535, 6512, 9546, 9547, 9558, 9560, 9562, 9563, 9564, 9565, 9566, 9567, 9568, 9569, 9570, 9988, 9990, 9995];
  levelNumber = 1;
  selectedPlaceData = {};
  showLevels = false;
  venuesClicked = false;
  showPlaceMoreInfo = false;
  loadingPlaceData = false;
  mobileView: boolean;
  hideMapViewPopup = true;
  mapFeature = {};
  mobileImageSrc = '';
  checkPopupSource = '';
  userData = {};
  detailPopupDescription = '';
  detailPlacePopupDescription = '';
  staticMapURL = '';
  mapViewPostionState = '';
  geoPolygon = false;
  hideplaceMapViewPopup = true;
  geoFilter: any = {};
  isSafariBrowser: boolean = false;
  inventorySummary: any;
  mapCenter: any = [-98.5, 39.8];
  mapBounds: any = [];
  enableMapInteractionFlag = true;
  public styleHeight: any;
  public mapHeight: any;
  public styleHeightBack: any;
  public mapWidth: any;
  public dimensionsDetails: any;
  public mobilepopupHeight: any;
  public headerHeight: any;
  public inventoryPanelHeight: any;
  public isSaveMapPosition = false;
  public isFilterOpen = false;
  clearGPFIltertimeout: any = null;
  public audienceLicense = {};
  sessionFilter = false;
  routeParams = {};
  public viewLayers: any = [];
  public layerDisplayOptions: any = {};
  public mapStyle: any = '';
  public defaultMapStyle: any = '';
  public showMapLegend: any = true;
  public showMapControls: any = true;
  public showCustomLogo: any = true;
  public showCustomText: any = true;
  public projects: any = [];
  public markerIcon: any = environment.fontMarker;
  public defaultPrimaryColor = '';
  public defaultSceondaryColor = '';
  public layerInventorySetLayers = [];
  public layerInventorySetDataSets = [];
  public logoInfo = {};
  public displayTextInfo = {};
  public logoStyle: object = {};
  public customTextStyle: object = {};
  activeDraggablePosition = { x: 0, y: 0 };
  activeDraggableTextPosition = { x: 0, y: 0 };
  mapWidthHeight = {};
  showDragLogo = true;
  showDragTextLogo = true;
  viewLayerApplied = false;
  inBounds = true;
  aspectRatio = true;
  enableDraggable = true;
  resizingInProcess = '';
  public today: number = Date.now();
  public dateTimeZoneName: any;
  public inventoryGroupsPlaces;
  public locationFilterData: any;
  public keyLegendsTimeer = null;
  private isLandscape: boolean = true;
  private apiZipCall = false;
  private apiDmaCall = false;
  public openFilter = true;
  public isKeylegend = false;
  public keyLegendColors: any;
  public currentSingleInventory: any;
  mapPlaceHash5Layer: any;
  mapPlaceHash6Layer: any;
  public filtersAttributes = [
    'operatorPanelIdList',
    'geopathPanelIdList',
    'media_attributes',
    'audienceMarket',
    'region',
    'threshold',
    'audience', 'base',
    'target_segment',
    'operator_name_list',
    'media_type_list',
    'id_type', 'id_list',
    'inventory_market_list',
    'digital',
    'construction_type_list',
    'orientation',
    'frame_width',
    'frame_height',
    'frame_media_name_list',
    'classification_type_list'];
  private selectedFrameId = {};
  public updateTabularView = 0;
  public defaultIcon;
  public searchlayer = [];
  private isStatus = false;
  public isLoader: Boolean = false;
  current_layer: any;
  public outSideOpenPlace: any;
  public addNotesAccess;
  counties: any;
  public measuresLicense: any;
  public customInventories: any;
  public isScenarioLicense: string;
  public site;
  public client_id;
  ngOnInit() {
    // this.inventoryService.tempCreateFile();
    this.projectStore.start();
    // let popupContent = this.dynamicComponentService.injectComponent(  ExploreInventoryDetailComponent, x => x.inventory = 'testing');
    const calTimeZone = this.timeZoneName();
    this.dateTimeZoneName = calTimeZone['timezone'];
    this.themeSettings = this.theme.getThemeSettings();
    this.workFlowLabels = this.common.getWorkFlowLabels();
    this.baseMaps = this.themeSettings.basemaps;
    this.client_id = this.themeSettings.client_id;
    const layersSession = this.layersService.getlayersSession();
    if (layersSession && layersSession['display'] && layersSession.display['baseMap']) {
      const mapStyle = layersSession.display['baseMap'];
      this.style = this.common.getMapStyle(this.baseMaps, mapStyle);
      layersSession['display']['baseMap'] = this.style['label'];
      this.mapStyle = this.style['label'];
    } else {
      this.mapStyle = this.getDefaultMapStyle();
    }
    this.mobileView = this.common.isMobile();
    this.filterService.getFilterSidenav().subscribe(data => {
      if (data) {
        this.isFilterOpen = data.open;
      }
      if (data.open) {
        this.tempOpen = true;
        this.tempTab = data.tab;
      }
    });
    this.theme.getDimensions().pipe(takeUntil(this.unSubscribe)).subscribe(data => {
      this.dimensionsDetails = data;
      this.headerHeight = data.headerHeight;
      this.mobilepopupHeight = data.windowHeight - (data.headerHeight + 40);
      if (this.allowInventoryAudience !== 'hidden') {
        this.inventoryPanelHeight = data.windowHeight - (data.headerHeight + 350);
      } else {
        this.inventoryPanelHeight = data.windowHeight - (data.headerHeight + 200);
        if (this.mod_permission['features']['gpMeasures']['status'] === 'active') {
          this.inventoryPanelHeight = data.windowHeight - (data.headerHeight + 350);
        }
      }
      // this.isSaveMapPosition = false;
      this.resizeLayout();
    });
    this.defaultAudience = this.activatedRoute.snapshot.data.defaultAudience;
    this.filterService.defaultAudience = this.activatedRoute.snapshot.data.defaultAudience;
    // this.inventoryMarketData = this.activatedRoute.snapshot.data['markets'] || [];
    this.inventoryMarketData = this.activatedRoute.snapshot.data['dummyMarkets'] || [];
    this.counties = this.activatedRoute.snapshot.data['counties'] || [];
    this.filterService.setCounties(this.counties);
    this.selectedTarget = this.defaultAudience.description;
    this.selectedAudienceID = this.defaultAudience.audienceKey;


    const md = new mobiledetect(window.navigator.userAgent);
    if (md.userAgent() === 'Safari') {
      this.isSafariBrowser = true;
    } else {
      this.isSafariBrowser = false;
    }

    this.sortables = this.exploreDataService.getSortables();
    this.sortKeyNoMarket = this.exploreDataService.getSortKeyWithoutMarkets();
    this.sortKeyAll = this.exploreDataService.getAllSortKeys();
    this.inventoryGroups = this.exploreDataService.getInventoryGroups();
    this.inventoryGroupsPlaces = this.exploreDataService.getInventoryGroupsPlaces();
    this.inventoryGroupIds = this.exploreDataService.getInventoryGroupIds();
    this.zoomLevel = 0;
    this.theme.generateColorTheme();
    this.facilityAreaColor = this.themeSettings['color_sets']['secondary']['base'];
    this.shoppingColor = this.themeSettings['color_sets']['secondary']['base'];
    this.eatingColor = this.themeSettings['color_sets']['secondary']['base'];
    this.defaultPrimaryColor = this.themeSettings['color_sets']['primary'] && this.themeSettings['color_sets']['primary']['base'];
    this.defaultSceondaryColor = this.themeSettings['color_sets']['secondary'] && this.themeSettings['color_sets']['secondary']['base'];
    this.common.homeClicked.subscribe(flag => {
      if (flag) {
        this.zoomOutMap();
      }
    });
    this.theme.themeSettings.subscribe(res => {
      this.themeSettings = this.theme.getThemeSettings();
      this.facilityAreaColor = this.themeSettings['color_sets']['secondary']['base'];
      // Set the stores to be this same color
      this.shoppingColor = this.themeSettings['color_sets']['secondary']['base'];
      this.eatingColor = this.themeSettings['color_sets']['secondary']['base'];

    });
    this.exploreService.hideLoaders.subscribe(value => {
      this.loaderService.display(false);
    });

    this.mod_permission = this.auth.getModuleAccess('explore');
    if (this.mod_permission
      && this.mod_permission.features
      && this.mod_permission.features.orderInventories
      && this.mod_permission.features.orderInventories.status
      && this.mod_permission.features.orderInventories.status === 'active') {
      this.isStatus = true;
    }
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.measuresLicense = this.mod_permission['features']['gpMeasures']['status'];
    this.addNotesAccess = this.mod_permission['features']['notes']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.allowInventoryAudience = this.audienceLicense['status'];
    this.csvExportEnabled = this.mod_permission['features']['csvExport']['status'];
    this.pdfExportEnabled = this.mod_permission['features']['pdfExport']['status'];
    this.inventorySetEnabled = this.mod_permission['features']['inventorySet']['status'];
    const projectMod = this.auth.getModuleAccess('projects');
    this.isScenarioEnabled = (projectMod['status'] === 'active');
    this.isScenarioLicense = projectMod['status'];
    this.customInventories = this.mod_permission['features']['customInventories']['status'];
    // Enable select buttons only if any feature related to selection is enabled.
    this.isSelectEnabled = this.csvExportEnabled === 'active'
      || this.pdfExportEnabled === 'active'
      || this.inventorySetEnabled === 'active'
      || this.isScenarioEnabled;
    this.isMeasureEnabled = this.mod_permission['features']['gpMeasures']['status'] === 'active';
    this.selectedInventories = { 'type': 'FeatureCollection', 'features': [] };
    this.mapPopup = new mapboxgl.Popup();
    this.mapPopup.on('close', (e) => {
      $('.map-div').removeClass('opened_detailed_popup');
      this.exploreService.cancelSlowMessage(this.exploreService);
    });
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: this.common.getStylesData(),
      modes: Object.assign({
        draw_radius: RadiusMode,
      }, MapboxDraw.modes)
    });
    this.userData = JSON.parse(localStorage.getItem('user_data'));
    if (this.userData) {
      this.mapLayers = this.userData['layers'];
    }
    if (typeof this.mapLayers !== 'undefined') {
      if (typeof this.mapLayers.center !== 'undefined') {
        this.mapCenter = this.mapLayers.center;
      }
      if (typeof this.mapLayers.bounds !== 'undefined') {
        this.mapBounds = this.mapLayers.bounds;
      }
    }
    this.buildMap();
    this.exploreDataService.getNationalFeatures().subscribe(data => {
      this.setNationalLevelData(data);
    });
    this.exploreDataService.getPlaces().subscribe(places => {
      if (places.length > 0) {
        this.places = places;
        this.places.map((place) => {
          place.selected = true;
        });
      } else {
        this.places = [];
      }
      this.modifySearchResultMapFormat();
    });
    this.exploreDataService.getFids().pipe(takeUntil(this.unSubscribe)).subscribe(fids => {
      if (typeof fids !== 'undefined' && fids.length > 0) {
        this.fids = fids;
        const filters = [];
        if (fids.length <= 50000) {
          if (!this.filterService.isSessionFilter) {
            this.selectQuery = 'All';
            this.selectQueryLimited = -1;
            this.selectedFidsArray = [];
            this.fids.map((fid) => {
              this.selectedFidsArray.push({ 'fid': fid, 'selected': true });
            });
            this.selectedCount = this.fids.length;
          } else {
            if (!this.selectedFidsArray.length) {
              this.selectedFidsArray = [];
              this.fids.map((fid) => {
                this.selectedFidsArray.push({ 'fid': fid, 'selected': true });
              });
              this.selectedCount = this.fids.length;
            }
            this.sessionFilter = true;
          }
          this.places.map((unit, i) => {
            const index = this.fids.indexOf(unit.properties.fid);
            if (index > -1 && index !== i) {
              this.fids.splice(index, 1);
              this.fids.splice(i, 0, unit.properties.fid);
            }
          });
          this.filterService.saveSelectedFids(this.selectedFidsArray);
          if (this.map.isStyleLoaded()) {
            this.metricsCalc();
          }
          if (this.fids.length > 0) {
            let seletedPanels = JSON.parse(JSON.stringify(this.fids));
            if (seletedPanels.length < 0) {
              seletedPanels = [0];
            }
            filters.unshift('all');
            seletedPanels.unshift('in', 'fid');
            filters.push(seletedPanels);
          }
        } else {
          this.selectedFidsArray = [];
          this.fids.map((fid) => {
            this.selectedFidsArray.push({ 'fid': fid, 'selected': true });
          });
          filters.unshift('all');
          fids.unshift('in', 'fid');
          filters.push(fids);
        }
        if (this.fids.length > 0 && this.fids.length <= 50000) {
          // default call even if the 'map.isStyleLoaded' is loaded or not
          this.addFiltersToMap(filters);

          // checking if map is loaded or not, if not loaded listen to load event
          if (!this.map.isStyleLoaded()) {
            // call once the 'map.isStyleLoaded' is loaded
            this.map.once('style.load', () => {
              this.addFiltersToMap(filters);
            });
          }
        } else {
          this.addFiltersToMap(null);
        }
      } else {
        this.selectQuery = 'All';
        this.selectQueryLimited = -1;
        this.selectedFidsArray = [];
        this.selectedCount = 0;
        const filters = [];
        const fidtemp = ['0'];
        filters.unshift('all');
        fidtemp.unshift('in', 'fid');
        filters.push(fidtemp);
        this.addFiltersToMap(filters);
      }
    });
    this.exploreDataService.getSummary()
      .subscribe(summary => {
        this.inventorySummary = summary;
      });
    this.inventoryDetailApiData.subscribe(data => {
      if (typeof data['unitDetails'] !== 'undefined') {
        if (this.mobileView) {
          const description = this.getPopupDetailedHTML(data, this.mapFeature, 'mobile', true);
          // Not able to render two components html files file in same
          // reason: two components are overriding if call same time so here have added settimeout to handle the problem.
          setTimeout(() => {
            this.detailPopupDescription = description.innerHTML;
            const description1 = this.getInventoryInfoPopupHtml('mobile');
            setTimeout(() => {
              this.detailPopupDescription += description1.innerHTML;
            }, 100);
          }, 100);
          // this.openInventoryDetailedPopup(popup, map, feature,true);
        } else if (this.openedInventoryDetail) {
          this.exploreService.cancelSlowMessage(this.exploreService);
          const description = this.getPopupDetailedHTML(data, this.openedFeatureObj, 'map', this.isLandscape);
          setTimeout(() => {
            this.openedPopupObj.setHTML(description.innerHTML);
            this.loadFunction(this.openedPopupObj, this.openedMapObj, this.openedFeatureObj);
          }, 300);
        }
      }
    });

    this.inventoryDetailApiZipData.subscribe(zdata => {
      if (zdata !== null && Object.keys(zdata).length) {
        const inventoryDetail = this.inventoryDetailApiData.getValue();
        inventoryDetail['zipcodes'] = zdata;
        // if (this.mobileView || this.apiZipCall) {
        const description = this.getTopZipcodesHTML(inventoryDetail);
        this.replaceHTML(description, 'div.topzip-card', 'zip');
        // }
        // this.loadMapItFunction('zip');
      } else if (zdata === null) {
        setTimeout(() => {
          this.replaceHTML(this.getTopZipcodesHTML(null), 'div.topzip-card', 'zip');
        }, 200);
      }
    });

    this.inventoryDetailApiDmaData.subscribe(ddata => {
      if (ddata !== null && Object.keys(ddata).length) {
        const inventoryDetail = this.inventoryDetailApiData.getValue();
        inventoryDetail['dmaresults'] = ddata;
        // if (this.mobileView || this.apiDmaCall) {
        const dmadescription = this.getTopDmasHTML(inventoryDetail);
        this.replaceHTML(dmadescription, 'div.topmarket-card', 'dma');
        // }
        // this.loadMapItFunction('dma');
      } else if (ddata === null) {
        setTimeout(() => {
          this.replaceHTML(this.getTopDmasHTML(null), 'div.topmarket-card', 'dma');
        }, 200);
      }
    });
    const currentReference = this;
    this.framCluster0ZoomIn = function (e) {
      currentReference.map.flyTo({ center: e[0].geometry.coordinates, zoom: 7.1 });
    };
    this.framCluster5ZoomIn = function (e) {
      currentReference.map.flyTo({ center: e[0].geometry.coordinates, zoom: 7.1 });
    };
    this.greyedFrameZoomIn = function (e) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, 'grayed_frames_panel');
    };
    this.customFrameZoomIn = function (e, l) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, l);
    };
    this.colorFrameZoomIn = function (e) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, 'color_frames_panel');
    };
    this.mapLabelZoomIn = function (e) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, 'mapLabel');
    };
    this.framesZoomIn = function (e) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, 'frames_panel');
    };
    this.placesZoomIn = function (features) {
      let feature = {};
      if (features.length > 0) {
        feature = features[0];
      }
      currentReference.loadVenuesData(feature);
      if (currentReference.zoomLevel < 15) {
        currentReference.map.flyTo({ center: features[0].geometry.coordinates, zoom: 15 });
        currentReference.map.once('moveend', function () {
          currentReference.venuesClicked = true;
        });
      }

    };
    this.framClusterZoomIn = function (e) {
      currentReference.map.flyTo({ center: e[0].geometry.coordinates, zoom: 7.1 });
    };
    this.outSideClick = function (e) {
      let features = currentReference.map.queryRenderedFeatures(e.point);
      let checkingLayer = ['facilityFill', 'levelLayer', 'areaLayer', 'framesLayer'];

      let layers = features.filter(feature => ((checkingLayer.indexOf(feature['layer']['id']) > -1)));
      if (layers.length <= 0) {
        currentReference.loadingPlaceData = true;
        currentReference.map.setFilter('levelLayer', ['!=', 'levelNumber', 1]);
        currentReference.map.getSource('levelLayerData').setData(currentReference.emptyFeatures);
        currentReference.map.getSource('frameLayerData').setData(currentReference.emptyFeatures);
        currentReference.map.getSource('footPrintLayerData').setData(currentReference.emptyFeatures);
        currentReference.map.getSource('areaLayerData').setData(currentReference.emptyFeatures);
        currentReference.map.setLayerZoomRange('footPrintLayer', 10, 20);
        currentReference.levelLayerData = currentReference.emptyFeatures;
        currentReference.venuesClicked = false;
      }
    };
    this.placeFramePopup = function (e) {

      currentReference.buildPlaceFramePopup(e, 0, currentReference.map, currentReference.mapPopup, 'framesLayer');
    };
    this.poiPopup = function (e) {
      currentReference.buildPointOfInterestPopup(e, 0, currentReference.map, currentReference.mapPopup, 'pointOfInterests');
    };
    this.poiLayerPopup = function (e, layer) {
      currentReference.buildPointOfInterestPopup(e, 0, currentReference.map, currentReference.mapPopup, layer);
    };
    this.layerInventorySetPopup = function (e, layer) {
      currentReference.buildPopup(e, 0, currentReference.map, currentReference.mapPopup, layer);
    };
    this.disablePopupDistributor = function (e) {
    };
    this.popupDistributor = function (e) {
      currentReference.outSideClick(e);
      currentReference.closeTopMapZipCode();
      let f = [];
      if (currentReference.layerInventorySetLayers.length > 0) {
        for (let i = currentReference.layerInventorySetLayers.length - 1; i >= 0; i--) {
          // for (let i = 0; i < currentReference.layerInventorySetLayers.length; i++) {
          f = currentReference.map.queryRenderedFeatures(e.point, { layers: [currentReference.layerInventorySetLayers[i]] });
          if (f.length) {
            if (currentReference.layerInventorySetLayers[i].search('layerInventoryLayer') > -1
              || currentReference.layerInventorySetLayers[i].search('layerInventoryColorLayer') > -1
              || currentReference.layerInventorySetLayers[i].search('layerInventoryWinksLayer') > -1) {
              currentReference.layerInventorySetPopup(e, currentReference.layerInventorySetLayers[i]);
            } else if (currentReference.layerInventorySetLayers[i].search('layerPlacesLayer') > -1) {
              currentReference.poiLayerPopup(e, currentReference.layerInventorySetLayers[i]);
            } else if (currentReference.layerInventorySetLayers[i].search('placeLayer') > -1) {
              currentReference.poiLayerPopup(e, currentReference.layerInventorySetLayers[i]);
            } else if (currentReference.layerInventorySetLayers[i].search('nationalWideBubblePlaceLayer') > -1) {
              currentReference.map.flyTo({ center: f[0].geometry.coordinates, zoom: 6 });
            }
            return;
          }
        }
      }
      if (currentReference.map.getLayer('pointOfInterests')) {
        f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['pointOfInterests'] });
        if (f.length) {
          currentReference.poiPopup(e);
          return;
        }
      }
      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['framesLayer'] });
      if (f.length) {
        currentReference.placeFramePopup(e);
        return;
      }
      if (currentReference.map.getLayer('frames_panel')) {
        f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['frames_panel'] });
      } else {
        f = [];
      }
      if (f.length) {
        currentReference.framesZoomIn(e);
        return;
      }
      if (currentReference.map.getLayer('numberedLabelCircle')) {
        f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['numberedLabelCircle'] });
        if (f.length) {
          currentReference.customFrameZoomIn(e, 'numberedLabelCircle');
          return;
        }
      }
      if (currentReference.map.getLayer('numberedLabelValue')) {
        f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['numberedLabelValue'] });
        if (f.length) {
          currentReference.customFrameZoomIn(e, 'numberedLabelValue');
          return;
        }
      }
      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['color_frames_panel'] });
      if (f.length) {
        currentReference.colorFrameZoomIn(e);
        return;
      }

      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['mapLabel'] });
      if (f.length) {
        currentReference.mapLabelZoomIn(e);
        return;
      }

      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['grayed_frames_panel'] });
      if (f.length) {
        currentReference.greyedFrameZoomIn(e);
        return;
      }
      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['frameClusters'] });
      if (f.length) {
        currentReference.framClusterZoomIn(f);
        return;
      }
      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['frameCluster5'] });
      if (f.length) {
        currentReference.framCluster5ZoomIn(f);
        return;
      }
      f = currentReference.map.queryRenderedFeatures(e.point, { layers: ['frameCluster0'] });
      if (f.length) {
        currentReference.framCluster0ZoomIn(f);
        return;
      }
    };

    this.exploreDataService
      .getMapViewPostionState()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(state => {
        if (state === 'inventoryView') {
          this.sidebarState = true;
        } else {
          this.sidebarState = false;
        }
        if (this.mapViewPostionState !== state) {
          this.mapViewPostionState = state;
          this.resizeLayout();
        } else {
          this.mapViewPostionState = state;
        }

        if (!this.mobileView && (state === 'tabularView' || state === 'mapView')) {
          this.mapWidth = this.dimensionsDetails.windowWidth - 40;
        }
      });
    if (this.allowInventoryAudience === 'hidden' || this.mobileView) {
      if (!this.mobileView && this.allowInventory === 'active') {
        this.sidebarState = true;
      } else {
        this.sidebarState = false;
      }
    }

    this.workSpaceDataService
      .getSelectedPackage()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(selectedPackage => {
        this.selectedPackage = selectedPackage;
      });
    const sessionFilter = this.filterService.getExploreSession();
    if (sessionFilter && sessionFilter['data']) {
      if (sessionFilter['data']['mapViewPostionState']) {
        this.mapViewPostionState = sessionFilter['data']['mapViewPostionState'];
        this.exploreDataService.setMapViewPostionState(this.mapViewPostionState);
      } else if (this.themeSettings.publicSite && !sessionFilter['data']['mapViewPostionState']) {
        this.exploreDataService.setMapViewPostionState('mapView');
      }
    } else if (!sessionFilter && this.themeSettings.publicSite) {
      this.exploreDataService.setMapViewPostionState('mapView');
    }
    this.exploreDataService.onMapLoad().pipe(takeUntil(this.unSubscribe))
      .subscribe(event => {
        this.activatedRoute.queryParams.subscribe(params => {
          this.routeParams = params;
        });
        if (event) {
          this.loadFilterSession();
        }
      });
    this.workSpace
      .getExplorePackages().subscribe(response => {
        if (typeof response['packages'] !== 'undefined' && response['packages'].length > 0) {
          this.workSpaceDataService.setPackages(response['packages']);
        }
      });
    this.workSpaceDataService
      .getPackages()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(packages => {
        this.packages = packages;
      });
    this.filterService.getFilters()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.unSubscribe),
        tap(data => {
          this.saveSession(data);
          if (data['data']['location']) {
            this.locationFilterData = data['data']['location'];
          } else {
            this.locationFilterData = {};
          }
          this.manageFilterPills(data['data']);
        }),
        map(data => {
          /**
           * To change the filter format and modify scenario and inventory
           * set into geoPanelID array we're using the below function
           */
          return this.filterService.normalizeFilterDataNew(data);
        })
        , map(data => {
          /**
           * To change the filter format according to the gpFilter API input
           */
          return this.formatFiltersForGpFilterAPI(data);
        }))
      .subscribe((filters: Partial<Filters>) => {
        if (this.mapPopup.isOpen()) {
          this.mapPopup.remove();
        }
        this.commonFilter = filters;
        let initialCall = true;
        this.initializeValues();
        if ((['media_attributes',
          'audienceMarket',
          'region',
          'threshold',
          'target_geography',
          'operator_name_list',
          'media_type_list',
          'id_type',
          'id_list',
          'inventory_market_list',
          'digital',
          'construction_type_list',
          'orientation',
          'frame_width',
          'frame_height',
          'frame_media_name_list',
          'classification_type_list'].some(key => filters[key])
          || (filters['measures_range_list'] && filters['measures_range_list'].length > 1))) {
          initialCall = false;
        }
        setTimeout(() => {
          this.sessionFilter = false;
          this.searchFromGPFilter(filters, initialCall);
          // this.searchFromElasticFilter(filters, initialCall);
        }, 200);
      });
    this.filterService.onReset()
      .subscribe(type => {
        this.resetFilter();
      });
    this.layersService.getLayers().subscribe((layers) => {
      this.viewLayers = layers;
      const searchResult = layers.find((layer) => layer.data['_id'] === 'default');
      if (!searchResult) {
        this.defaultIcon = undefined;
        this.removeSearchResultLayers(true);
      }
    });
    this.layersService.getDisplayOptions().subscribe((layers) => {
      this.layerDisplayOptions = layers;
    });
    this.layersService.getApplyLayers().pipe(takeUntil(this.unSubscribe)).subscribe((value) => {
      if (value) {
        this.clearLayerView(false);
        this.layersService.cleanUpMap(this.map);
        this.applyViewLayers();
      } else {
        this.clearLayerView();
      }
    });
    this.exploreDataService
      .getSelectedMarket()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(market => {
        if (market && market.name) {
          this.selectedMarket = market;
        } else {
          this.selectedMarket = {};
        }
      });
    this.exploreDataService.getSelectedTarget().pipe(takeUntil(this.unSubscribe)).subscribe(target => {
      if (target) {
        this.selectedAudienceID = target;
      }
    });
    this.exploreDataService
      .getSelectedTargetName()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(audienceName => {
        this.selectedTarget = audienceName;
      });
    this.layersService
      .getClearView()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(value => {
        if (value) {
          const element: HTMLElement = document.querySelector('.mapboxgl-ctrl-locate-active') as HTMLElement;
          if (element) {
            element.click();
          }
          this.zoomOutMap();
          this.filterService.resetAll();
          this.filterService.removeFilterPill('saved view');
          this.exploreDataService.setMapViewPostionState('inventoryView');
        }
      });
    // for scenario create
    this.workSpace
      .getProjects()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(response => {
        if (response['projects'] && response['projects'].length > 0) {
          this.projects = response['projects'];
        }
      });

    this.filterService.checkSessionDataPushed()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(val => {
        if (val) {
          this.loadFilterSession();
        }
      });
    this.layersService.getClearLogoStyle().subscribe((value) => {
      if (value) {
        this.logoStyle = {};
      }
    });

    // sidebar toggle select | unselect, debounce action to avoid unnecessary API call
    this.toggleUnsubscribe = this.toggleClicks.pipe(
      debounceTime(300)
    ).subscribe(e => {
      this.updateBubblesCount(true);
    });
    this.newWorkSpaceService.clearProjectsForScenario();
  }

  private replaceHTML(description: any, tag: string, type: string) {
    $(tag).replaceWith(description);
    this.loadMapItFunction(type);
    if (!$(tag)) {
      this.replaceHTML(description, tag, type);
    }
  }

  private formatFiltersForGpFilterAPI(filters: any) {
    this.hideMapViewPopup = true;
    this.sortables = this.sortKeyNoMarket;
    if (filters['target_segment'] === this.defaultAudience['audienceKey']) {
      this.exploreDataService.setSelectedTarget(this.defaultAudience['audienceKey']);
    }

    if (filters['target_geography']) {
      const market = this.getMarket(filters['target_geography']);
      if (filters['target_geography']) {
        this.sortables = this.sortKeyAll;
      } else {
        this.sortables = this.sortKeyNoMarket;
      }
      if (market && typeof market.name !== 'undefined') {
        this.exploreDataService.setSelectedMarket(market);
      }
    } else {
      this.exploreDataService.setSelectedMarket({});
    }
    return filters;
  }
  private loadFilterSession() {
    const sessionFilter = this.filterService.getExploreSession();
    if (sessionFilter && sessionFilter['data'] && typeof this.routeParams['scenario'] === 'undefined') {
      if (sessionFilter['data']['sortQuery']) {
        this.sortQuery = sessionFilter['data']['sortQuery'];
      }
      if (sessionFilter['data']['selectQuery']) {
        this.selectQuery = sessionFilter['data']['selectQuery'];
        this.selectQueryLimited = sessionFilter['data']['selectQueryLimited'];
      }
      if (sessionFilter['data']['selectedFids']) {
        this.updateFidsInfo(sessionFilter);
      }
      if (sessionFilter['data']['mapViewPostionState']) {
        if (sessionFilter['data']['mapViewPostionState'] !== 'topZipMarketView') {
          this.mapViewPostionState = sessionFilter['data']['mapViewPostionState'];
          this.exploreDataService.setMapViewPostionState(this.mapViewPostionState);
          this.resizeLayout();
        } else {
          this.mapViewPostionState = 'inventoryView';
          this.exploreDataService.setMapViewPostionState('inventoryView');
        }
      }
      this.sessionFilter = true;
      this.filterService.setFilterFromSession(sessionFilter);
      if (sessionFilter['data'] && sessionFilter['data']['mapPosition']) {
        this.filterService.saveMapPosition(sessionFilter['data']['mapPosition']);
        this.setMapPosition();
      }
    } else {
      this.filterService.setFilterFromSession({});
      /* const filterData = this.formatFiltersForGpFilterAPI({});
      filterData['base'] = this.selectedBaseID;
      console.log('search 2');
      this.searchFromGPFilter(filterData, true); */
    }
  }
  private saveSession(filters) {
    this.filterService.saveExploreSession(filters);
  }

  private resetFilter() {
    if (this.commonFilter['location'] && this.commonFilter['location']['region']) {
      this.dynamicMapView = 0;
      this.mapViewSearch = 0;
      this.geoPolygon = false;
      this.mapDrawEnable = false;
      this.circleDrawEnable = false;
      this.customPolygon.coordinates = [];
      this.customPolygonFeature.geometry = {
        type: 'Polygon',
        coordinates: []
      };
      this.polygonData.features = [];
    }
    this.sortQuery = { name: 'Target Composition Percentage', value: 'pct_comp_imp_target' };
    this.selectQuery = 'All';
  }

  private setNationalLevelData(data) {
    if (typeof data.features !== 'undefined') {
      this.nationalWideData = this.formatUpNationalData(data);
      this.nationalWideDataLoad = false;
      if (this.map.getSource('nationalWideData')) {
        this.map.getSource('nationalWideData').setData(this.nationalWideData);
      }
    }
  }

  private addFiltersToMap(filters: any[]) {
    if (this.map.getLayer('frames_panel')) {
      this.map.setFilter('frames_panel', filters);
    }
    if (this.map.getLayer('color_frames_panel')) {
      this.map.setFilter('color_frames_panel', filters);
    }
    if (this.map.getLayer('grayed_frames_panel')) {
      this.map.setFilter('grayed_frames_panel', filters);
    }
    if (this.map.getLayer('mapLabel')) {
      this.map.setFilter('mapLabel', filters);
    }
  }

  ngOnDestroy() {
    this.exploreService.cancelSlowMessage(this.exploreService);
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.initializeValues();
    this.toggleUnsubscribe.unsubscribe();
  }

  initializeValues() {
    this.exploreDataService.setSelectedMarket({});
    this.exploreDataService.setPlaces([]);
    // this.exploreDataService.setSummary({reset: true});
    // this.exploreDataService.setMapObject({});
  }

  buildMap() {
    this.style = this.common.getMapStyle(this.baseMaps, this.mapStyle);
    // this.style = environment.mapbox.new_style;
    /* let style = environment.mapbox.new_style;
    if (this.mapStyle === 'satellite') {
      this.style = environment.mapbox.new_satellite_style;
    } */
    if (!mapboxgl.supported()) {
      fsObject.mapBoxNotSupported();
    }
    this.initializeMap(this.style['uri']);
  }

  bindRender() {
    const self = this;
    self.map.resize({ mapResize: true });
    self.map.on('render', function (e) {
      if (self.dynamicMapView > 0) {
        if (self.map.loaded() && self.map.isSourceLoaded('allPanels')) {
          if (
            !self.mapDrawEnable
            && !self.setSelectedEnable
            && self.nationalWideDataLoad
            && !self.addingMapDraw
            && !self.layersChanging
            && !self.hoverOnInventoryCard
          ) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
              self.loadData();
            }, 500);
          } else {
            clearTimeout(this.clearFlagtimeout);
            this.clearFlagtimeout = setTimeout(function () {
              self.setSelectedEnable = false;
              self.nationalWideDataLoad = true;
              self.addingMapDraw = false;
              self.layersChanging = false;
              self.loadingPlaceData = false;
              // self.hoverOnInventoryCard = false;
            }, 1000);
          }
        }
      }
      clearTimeout(this.keyLegendsTimeer);
      this.keyLegendsTimeer = setTimeout(function () {
        const layerSession = self.layersService.getlayersSession();
        self.exploreService.generateKeyLegends(self.map, layerSession, self.mapStyle, self.zoomLevel);
      }, 500);
    });
  }

  toggleMapView() {
    if (this.dynamicMapView > 0) {
      this.dynamicMapView = 0;
    } else {
      this.dynamicMapView = 1;
    }
    if (this.dynamicMapView === 1) {
      this.removePolygon(false);
      const boundBox = this.mapService.getMapBoundingBox(this.map, false, this.mapBounds);
      this.filterService.setFilter('location', { region: boundBox, type: 'dynamicMapView' });
    } else {
      this.filterService.setFilter('location', {});
    }
  }

  getImage(properties): string {
    return this.exploreService.getImageURL(properties.fid);
  }

  convertToPercentage(key, decimal = 0) {
    return this.format.convertToPercentageFormat(key, decimal);
  }

  sortBy(item) {
    this.sortQuery = item;
    this.exploreDataService.setFids([]);
    this.exploreDataService.setPlaces([]);
    this.filterService.setFilter('sortQuery', this.sortQuery);
  }

  /**
   * The function is called when user do any selection or filter applied
   * @param type type of selection
   * @param {boolean} autoCall
   * The above param is whether the user selection triggered the call or
   * its a filter call, If its true
   */
  select(type, autoCall = false) {
    this.selectQuery = type;
    this.selectQueryPText = type;
    switch (this.selectQuery) {
      case 'All':
        this.selectQueryLimited = -1;
        this.selectedFidsArray.map((f) => {
          f.selected = true;
        });
        this.places.map((place) => {
          place.selected = true;
        });
        this.selectedCount = this.selectedFidsArray.length;
        if (this.selectedCount <= 50000) {
          this.saveFidsInSession();
        }
        break;
      case 'None':
        this.selectQueryLimited = 0;
        this.selectedFidsArray.map((f) => {
          f.selected = false;
        });
        this.places.map((place) => {
          place.selected = false;
        });
        this.selectedCount = 0;
        this.saveFidsInSession();
        break;
      case 'Custom':
        this.selectQueryLimited = -2;
        break;
      case 'Top 25':
        this.selectQueryLimited = 25;
        this.selectLimited(25);
        break;
      case 'Top 50':
        this.selectQueryLimited = 50;
        this.selectLimited(50);
        break;
      case 'Top 100':
        this.selectQueryLimited = 100;
        this.selectLimited(100);
        break;
      default:
        this.selectedFidsArray.map((f) => {
          f.selected = false;
        });
        this.places.map((place) => {
          place.selected = false;
        });
        this.selectedCount = 0;
        this.saveFidsInSession();
        break;
    }
    this.metricsCalc();
    // TODO: Commented while implement GPATH API integration need to implement
    if (!autoCall) {
      this.updateBubblesCount(true);
    }
    const layersSession = this.layersService.getlayersSession();
    if (layersSession && layersSession['selectedLayers']) {
      const layerData = layersSession['selectedLayers'].find((layer) => layer.data['_id'] === 'default');
      if (layerData) {
        this.modifySearchResultMapFormat();
      }
    }

  }
  /**
   * inventory CSV export function
   */
  exportCSV() {
    const selectedids = this.selectedFidsArray.filter(s => s.selected);
    let fidLists = selectedids.map(fid => fid.fid);
    if (fidLists.length <= 0) {
      swal('Sorry', 'There is no data available for exporting');
      return;
    }
    const headerData: any = this.exploreDataService.getCSVHeaders();
    /** Allow only 1000 items to export . it will remove once resolve the API gatway timeout issue */
    if (fidLists.length > 1000) {
      fidLists = fidLists.splice(0, 1000);
    }
    const exportParmas: BulkExportRequest = {
      panel_id: fidLists,
      aud: this.selectedAudienceID,
      aud_name: this.selectedTarget,
      type: 'inventory_details',
      site: this.themeSettings.site,
      report_format: 'csv',
      columns: headerData,
      target_segment: this.selectedAudienceID
    };
    if (this.selectedMarket && this.selectedMarket['id']) {
      exportParmas['target_geography'] = this.selectedMarket['id'];
      exportParmas['market_type'] = this.selectedMarket['type'];
      exportParmas['market_name'] = this.selectedMarket['name'];
    }
    this.isLoader = true;
    /**
     * exportParmas Export csv params
     * second params : true - common loader not showing
     */
    this.exploreService.inventoriesBulkExport(exportParmas, true).pipe(takeUntil(this.unSubscribe))
      .subscribe(res => {
        this.isLoader = false;
        const contentDispose = res.headers.get('content-disposition');
        const matches = contentDispose.split(';')[1].trim().split('=')[1];
        const filename = matches && matches.length > 1 ? matches : (new Date()).getUTCMilliseconds() + '.csv';
        saveAs(res.body, filename);
      }, error => {
        this.isLoader = false;
        const data: ConfirmationDialog = {
          notifyMessage: true,
          confirmTitle: 'Error',
          messageText: 'There is a problem generating the file. Please try again later.',
        };
        this.dialog.open(ConfirmationDialogComponent, {
          data: data,
          width: '450px',
        });
      });
  }
  exportPDF() {
    const selected = this.places
      .filter(place => place.selected)
      .map(place => place.spot_id.toString());
    this.exportInventory(selected);
  }
  exportInventory(selected, type = 'list') {
    const customColumns = {};
    if (type === 'tabular') {
      const localCustomColum = JSON.parse(localStorage.getItem('exploreCustomColumn'));
      if (localCustomColum && localCustomColum.length > 0) {
        localCustomColum.map(column => {
          if (column['name'] !== 'CHECKBOX' && column['name'] !== 'SLNO') {
            customColumns[column['value']] = column['displayname'];
          }
        });
      }
    }
    if (selected.length <= 0) {
      return swal('Sorry', 'There is no data available for exporting');
    }
    if (selected <= 0) {
      return swal('Sorry', 'Please select inventories to export');
    }
    if (selected.length > 25) {
      return swal({
        title: 'Sorry',
        text: 'Only 25 units can be exported at a time. Please limit your selection to 25 to continue.',
        type: 'warning',
        confirmButtonText: 'CONTINUE',
        confirmButtonClass: 'waves-effect waves-light',
      });
    }
    const orientation = this.themeSettings.orientation;

    const reqData: BulkExportRequest = {
      panel_id: selected,
      aud: this.selectedAudienceID,
      aud_name: this.selectedTarget,
      orientation: orientation,
      type: 'inventory_details',
      site: this.themeSettings.site,
      report_format: 'pdf',
      columns: customColumns,
      target_segment: this.selectedAudienceID
    };
    if (this.selectedMarket && this.selectedMarket['id']) {
      reqData['target_geography'] = this.selectedMarket['id'];
      reqData['market_type'] = this.selectedMarket['type'];
      reqData['market_name'] = this.selectedMarket['name'];
    }
    this.dialog.open(InventoryBulkExportComponent, {
      width: '450px',
      data: reqData
    });
  }

  selectLimited(count: number) {
    this.places.map(item => item.selected = false);
    this.selectedFidsArray.map(item => item.selected = false);
    const selectedPlaces = [];
    this.places.slice(0, count).map(item => {
      item.selected = true;
      selectedPlaces.push(item.spot_id);
    });
    selectedPlaces.map(id => {
      this.selectedFidsArray.map(i => {
        if (i.fid === id) {
          i.selected = true;
        }
      });
    });
    this.saveFidsInSession();
    this.selectedCount = count;
  }

  abbrNum(number, decPlaces) {
    return this.format.abbreviateNumber(number, decPlaces);
  }

  loadMorePanels() {
    if (this.totalPage >= this.page ) {
      this.page = this.page + 1;
      const filterData = this.commonFilter;
      filterData['page'] = this.page;
      const count = this.totalGPInventory - 100;
      let totalGPPage = 0;
      if (count > 0) {
        totalGPPage = Math.ceil(count / 100);
      }
      if (this.page > totalGPPage && this.customInventories === 'active') {
        this.getInventoriesFromES(filterData, true);
      } else {
        this.getInventories(filterData, true);
      }
    }
    /* if (this.tempPlaces.length > 0) {
      this.loadNextBatchPanels(100);
    } else if (this.totalPage >= (this.page + 1)) {
      this.page = this.page + 1;
      const filterData = this.commonFilter;
      filterData['page'] = this.page;
      this.getInventories(filterData, true);
    } */
  }

  loadNextBatchPanels(count = 100) {
    if (this.tempPlaces.length > 0) {
      const self = this;
      const batch = this.tempPlaces.splice(0, count);
      $.each(batch, function (i, val) {
        if (self.selectQuery !== 'All') {
          val.selected = true;
        } else {
          val.selected = false;
        }
        self.places.push(val);
      });
      // this.metricsCalc();
    }
  }

  initializeMap(style) {
    mapboxgl.accessToken = environment.mapbox.access_token;
    const self = this;
    this.map = new mapboxgl.Map({
      container: 'mapbox',
      style: style,
      minZoom: 2,
      maxZoom: 16,
      preserveDrawingBuffer: true,
      center: self.mapCenter, // starting position
      zoom: 3 // starting zoom
    });
    this.exploreDataService.setMapObject(this.map);
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    if (this.allowInventory === 'active') {
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      this.map.addControl(new LocateMeControl(), 'bottom-left');
      this.map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), 'bottom-left');
    }

    setTimeout(() => {
      // for getting current location
      this.common.loadLocateMe();
    }, 100);
    if (self.allowInventory === 'active') {
      /*self.map.on('load', function () {
        self.loadLayers()
      });*/
      self.map.on('style.load', function () {
        self.loadLayers();
      });
    }
  }
  loadLayers() {
    this.setMapPosition();
    this.map.on('centerEnd', (ev) => {
      setTimeout(() => {
        this.map.fire('click', { lngLat: ev.coords });
      }, 600);
    });
    this.map.on('zoom', () => {
      this.zoomLevel = this.map.getZoom();
    });
    // add 0 to 5 cluster this.map...
    this.map.addSource('allPanels', {
      type: 'vector',
      url: this.mapLayers['allPanels']['url']
    });
    this.map.addSource('starFramePanels', {
      type: 'vector',
      url: this.mapLayers['allPanels']['url']
    });
    this.map.addSource('nationalWideData', {
      type: 'geojson',
      data: this.nationalWideData
    });
    this.map.addSource('polygonData', {
      type: 'geojson',
      data: this.polygonData
    });
    /* Inventory in Venues */
    this.map.addSource('footPrintLayerData', {
      type: 'geojson',
      data: this.footPrintLayerData
    });
    this.map.addSource('levelLayerData', {
      type: 'geojson',
      data: this.levelLayerData
    });
    this.map.addSource('areaLayerData', {
      type: 'geojson',
      data: this.areaLayerData
    });
    this.map.addSource('frameLayerData', {
      type: 'geojson',
      data: this.frameLayerData
    });

    // This source is used to handle Filters -> Location -> Place Set and Radius based filters.
    this.map.addSource('poiDataSet', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    /* End Inventory in Venues */

    /* Dotted layer */
    this.map.addLayer({
      id: 'frameCluster0',
      type: 'circle',
      source: {
        type: 'vector',
        url: this.mapLayers['frameCluster0']['url']
      },
      'source-layer': this.mapLayers['frameCluster0']['source-layer'],
      minzoom: this.mapLayers['frameCluster0']['minzoom'],
      maxzoom: this.mapLayers['frameCluster0']['maxzoom'],
      paint: {
        'circle-opacity': .6,
        'circle-color': this.themeSettings.color_sets.secondary.base,
        'circle-radius': 1
      }
    });
    // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
    this.map.on('mouseenter', 'frameCluster0', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'frameCluster0', () => {
      this.map.getCanvas().style.cursor = '';
    });
    // this.map.on('click', 'frameCluster0', this.framCluster0ZoomIn);

    // add 5 to 7 this.map...
    this.map.addLayer({
      id: 'frameCluster5',
      type: 'circle',
      source: {
        type: 'vector',
        url: this.mapLayers['frameCluster5']['url']
      },
      'source-layer': this.mapLayers['frameCluster5']['source-layer'],
      minzoom: this.mapLayers['frameCluster5']['minzoom'],
      maxzoom: this.mapLayers['frameCluster5']['maxzoom'],
      paint: {
        'circle-opacity': .6,
        'circle-color': this.themeSettings.color_sets.secondary.base,
        'circle-radius': {
          'base': 1,
          'stops': [[this.mapLayers['frameCluster5']['minzoom'], 1], [this.mapLayers['frameCluster5']['maxzoom'], 3]]
        }
      }
    });

    // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
    this.map.on('mouseenter', 'frameCluster5', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'frameCluster5', () => {
      this.map.getCanvas().style.cursor = '';
    });
    // this.map.on('click', 'frameCluster5', this.framCluster5ZoomIn);


    /*national layer*/
    this.map.addLayer({
      id: 'frameClusters',
      type: 'circle',
      source: 'nationalWideData',
      minzoom: 0,
      maxzoom: 7,
      layer:
      {
        'visibility': 'visible',
      },
      paint: {
        'circle-opacity': 0.3,
        'circle-color': '#008da4',
        'circle-radius': ['get', 'radius']
      }
    });

    // Click to zoom in to the panel detail level
    // this.map.on('click', 'frameClusters', this.framClusterZoomIn);

    // add the cluster count label
    this.map.addLayer({
      id: 'frameCount',
      type: 'symbol',
      source: 'nationalWideData',
      minzoom: 0,
      maxzoom: 7,
      filter: ['>', 'radius', 10],
      layout: {
        'visibility': 'none',
        'text-field': '{panelCount}',
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
        'text-color': '#fefefe'
      }
    });

    this.map.addLayer({
      id: 'grayed_frames_panel',
      type: 'circle',
      source: 'allPanels',
      'source-layer': this.mapLayers['allPanels']['source-layer'],
      minzoom: 7,
      layer:
      {
        'visibility': 'visible',
      },
      paint: {
        'circle-opacity': 0.2,
        'circle-radius': {
          'base': 3,
          'stops': [[9, 3], [11, 4]]
        },
        'circle-color': '#878787'
      }
    });
    this.map.on('mouseenter', 'grayed_frames_panel', () => {

      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'grayed_frames_panel', () => {
      this.map.getCanvas().style.cursor = '';
    });
    this.map.addLayer({
      id: 'color_frames_panel',
      type: 'circle',
      source: 'allPanels',
      'source-layer': this.mapLayers['allPanels']['source-layer'],
      minzoom: 7,
      maxzoom: 11,
      paint: {
        'circle-opacity': 0.8,
        'circle-radius': 3,
        'circle-color': [
          'match',
          ['get', 'mtid'],
          this.inventoryGroups[0].mtidPrint.concat(this.inventoryGroups[0].mtidDigital),
          this.inventoryGroups[0].colors[this.mapStyle],
          this.inventoryGroups[1].mtidPrint.concat(this.inventoryGroups[1].mtidDigital),
          this.inventoryGroups[1].colors[this.mapStyle],
          this.inventoryGroups[2].mtidPrint.concat(this.inventoryGroups[2].mtidDigital),
          this.inventoryGroups[2].colors[this.mapStyle],
          this.inventoryGroups[3].mtidPrint.concat(this.inventoryGroups[3].mtidDigital),
          this.inventoryGroups[3].colors[this.mapStyle],
          this.inventoryGroups[4].mtidPrint.concat(this.inventoryGroups[4].mtidDigital),
          this.inventoryGroups[4].colors[this.mapStyle],
          this.inventoryGroups[3].colors[this.mapStyle]
        ]
      }
    });

    this.map.on('mouseenter', 'color_frames_panel', () => {

      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'color_frames_panel', () => {
      this.map.getCanvas().style.cursor = '';
    });
    // this.map.on('click', 'color_frames_panel', this.colorFrameZoomIn);
    // layer for draw polypon
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
    this.map.addLayer({
      id: 'frames_panel',
      type: 'symbol',
      source: 'allPanels',
      'source-layer': this.mapLayers['allPanels']['source-layer'],
      minzoom: 10.5,
      layout: {
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': [
          'match',
          ['get', 'mtid'],
          this.inventoryGroups[4].mtidPrint, this.inventoryGroups[4].print['symbol'],
          this.inventoryGroups[3].mtidPrint, this.inventoryGroups[3].print['symbol'],
          this.inventoryGroups[2].mtidPrint, this.inventoryGroups[2].print['symbol'],
          this.inventoryGroups[1].mtidPrint, this.inventoryGroups[1].print['symbol'],
          this.inventoryGroups[0].mtidPrint, this.inventoryGroups[0].print['symbol'],
          this.inventoryGroups[4].mtidDigital, this.inventoryGroups[4].digital['symbol'],
          this.inventoryGroups[3].mtidDigital, this.inventoryGroups[3].digital['symbol'],
          this.inventoryGroups[2].mtidDigital, this.inventoryGroups[2].digital['symbol'],
          this.inventoryGroups[1].mtidDigital, this.inventoryGroups[1].digital['symbol'],
          this.inventoryGroups[0].mtidDigital, this.inventoryGroups[0].digital['symbol'],
          this.inventoryGroups[2].print['symbol']
        ],
        'text-offset': [0, 0.7],
        'text-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 17,
        'text-rotation-alignment': 'map',
        'text-rotate': ['get', 'o']
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': [
          'match',
          ['get', 'mtid'],
          this.inventoryGroups[4].mtidPrint, this.inventoryGroups[4].colors[this.mapStyle],
          this.inventoryGroups[3].mtidPrint, this.inventoryGroups[3].colors[this.mapStyle],
          this.inventoryGroups[2].mtidPrint, this.inventoryGroups[2].colors[this.mapStyle],
          this.inventoryGroups[1].mtidPrint, this.inventoryGroups[1].colors[this.mapStyle],
          this.inventoryGroups[0].mtidPrint, this.inventoryGroups[0].colors[this.mapStyle],
          this.inventoryGroups[4].mtidDigital, this.inventoryGroups[4].colors[this.mapStyle],
          this.inventoryGroups[3].mtidDigital, this.inventoryGroups[3].colors[this.mapStyle],
          this.inventoryGroups[2].mtidDigital, this.inventoryGroups[2].colors[this.mapStyle],
          this.inventoryGroups[1].mtidDigital, this.inventoryGroups[1].colors[this.mapStyle],
          this.inventoryGroups[0].mtidDigital, this.inventoryGroups[0].colors[this.mapStyle],
          this.inventoryGroups[2].colors[this.mapStyle]
        ],
      }

      /*layout: {
        'icon-image': [
          'match',
          ['get', 'mtid'],
          this.inventoryGroups[3].mtidPrint, this.inventoryGroups[3].printSymbol,
          this.inventoryGroups[2].mtidPrint, this.inventoryGroups[2].printSymbol,
          this.inventoryGroups[1].mtidPrint, this.inventoryGroups[1].printSymbol,
          this.inventoryGroups[0].mtidPrint, this.inventoryGroups[0].printSymbol,
          this.inventoryGroups[3].mtidDigital, this.inventoryGroups[3].digitalSymbol,
          this.inventoryGroups[2].mtidDigital, this.inventoryGroups[2].digitalSymbol,
          this.inventoryGroups[1].mtidDigital, this.inventoryGroups[1].digitalSymbol,
          this.inventoryGroups[0].mtidDigital, this.inventoryGroups[0].digitalSymbol,
          this.inventoryGroups[2].printSymbol
        ],
        'icon-size': 1,
        'icon-rotation-alignment': 'map',
        'icon-anchor': 'center',
        'icon-offset': [0, -3],
        'icon-rotate': ['get', 'o'],
        'icon-allow-overlap': true
      }*/
    });
    // Popup and display properties of first feature in the array.
    this.map.on('mouseenter', 'frames_panel', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'frames_panel', () => {
      this.map.getCanvas().style.cursor = '';
    });
    /*  let heloColor = '#ffffff';
     let textColor = '#8a8a8a';
     switch (this.mapStyle) {
       case 'dark':
         textColor = '#858585';
         heloColor = '#2e3133';
         break;
       case 'light':
         textColor = '#8a8a8a';
         heloColor = '#ffffff';
         break;
       case 'satellite':
         textColor = '#858585';
         heloColor = '#2e3133';
         break;
       case 'readdead':
         textColor = '#303030';
         heloColor = '#dec29b';
         break;
     } */
    // to display inventory details(geo path id or plant unit id)
    this.map.addLayer({
      'id': 'mapLabel',
      'type': 'symbol',
      'source': 'allPanels',
      'source-layer': this.mapLayers['allPanels']['source-layer'],
      'minzoom': 11,
      'layout': {
        'visibility': 'none',
        'text-field': '{fid}',
        'text-offset': [0, 0.7],
        'text-optional': true,
        'text-size': 12,
        'text-rotation-alignment': 'map',
        'text-justify': 'center',
        'text-padding': 10,
        'text-letter-spacing': 0.05,
        'text-line-height': 1.1,
        'text-max-width': 8
        // 'text-rotate': ['get', 'o']
      },
      paint: {
        'text-opacity': 0.9,
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 10,
        'text-halo-blur': 2,
        'text-translate': [0, 10]
      }
    });

    this.map.on('mouseenter', 'mapLabel', () => {

      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'mapLabel', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // this.map.on('click', 'frames_panel', this.framesZoomIn);
    this.map.addLayer({
      id: 'footPrintLayer',
      type: 'fill',
      source: 'footPrintLayerData',
      paint: {
        'fill-opacity': {
          // Slowly make the venue more opaque
          'stops': [[8, 0.7], [12, 0.9]]
        },
        'fill-color': this.floorColor
      },
      minzoom: 10,
      // Turn off this layer when the levels become dominant
      maxzoom: 14
    });


    this.map.addLayer({
      id: 'levelLayer',
      type: 'fill',
      source: 'levelLayerData',
      filter: ['==', 'levelNumber', 1],
      paint: {
        'fill-opacity': 0.9,
        'fill-color': this.floorColor
      },
      minzoom: 13
    });
    this.map.addLayer({
      id: 'areaLayer',
      type: 'fill',
      source: 'areaLayerData',
      filter: ['==', 'levelNumber', 1],
      paint: {
        'fill-opacity': {
          'stops': [[14, 0.1], [17, .8]]
        },
        'fill-color': [
          'match',
          ['get', 'openArea'],
          'CLOSED', ['match',
            ['get', 'areaType'],
            'HOLLOW', this.hollowColor,
            this.blockedColor],
          'VIRTUAL OPEN', ['match',
            ['get', 'categoryID'],
            this.facilityID, this.blockedColor,
            this.foodID, this.eatingColor,
            this.shoppingID, this.shoppingColor,
            -1, this.blockedColor,
            this.shoppingColor],
          'OPEN', this.shoppingColor,
          this.blockedColor
        ],
        'fill-outline-color': this.outlineColor
      },
      minzoom: 14
    });
    this.map.addLayer({
      id: 'framesLayer',
      type: 'symbol',
      source: 'frameLayerData',
      minzoom: 13,
      filter: ['==', 'levelNumber', this.levelNumber],
      layout: {
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': this.inventoryGroupsPlaces[0]['print']['symbol'],
        'text-offset': [-0.2, 0.7],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 17,
        'text-rotate': {
          'type': 'identity',
          'property': 'orientation'
        },
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': this.inventoryGroupsPlaces[0].colors[this.mapStyle]
      }
      // layout: {
      //   'icon-image': 'squinks_mt21',
      //   'icon-size': {
      //     'stops': [[15, 1], [17, 2]]
      //   },
      //   'icon-rotation-alignment': 'map',
      //   'icon-anchor': 'center',
      //   'icon-offset': [0, 0],
      //   'icon-rotate': {
      //     'type': 'identity',
      //     'property': 'orientation'
      //   },
      //   'icon-allow-overlap': true
      // },
      // paint: {
      //   'icon-opacity': {
      //     'stops': [[13, 0], [15, 1]]
      //   }
      // }
    });

    this.map.on('mouseenter', 'framesLayer', () => {

      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'framesLayer', () => {
      this.map.getCanvas().style.cursor = '';
    });
    // this.map.on('click', 'framesLayer', this.placeFramePopup);
    this.map.addLayer({
      id: 'frameClustersStar',
      type: 'symbol',
      source: 'nationalWideData',
      minzoom: 0,
      maxzoom: 7,
      layout: {
        'visibility': 'none',
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': 'j',
        'text-offset': [0, 0.7],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 20
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': this.themeSettings['color_sets']['primary']['base']
      }
    });
    this.map.addLayer({
      id: 'showStarPanel',
      type: 'symbol',
      source: 'starFramePanels',
      'source-layer': this.mapLayers['allPanels']['source-layer'],
      minzoom: 0,
      layout: {
        'visibility': 'none',
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': 'j',
        'text-offset': [0, 0.7],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 20
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-color': this.themeSettings['color_sets']['primary']['base']
      }
    });
    /* This layer is used to handle Filters -> Location -> Place Set and Radius based filters. */
    /* POI (Place Set Places) Layer start */
    this.map.addLayer({
      id: 'pointOfInterests',
      type: 'symbol',
      source: 'poiDataSet',
      layout: {
        'visibility': 'none',
        'text-line-height': 1,
        'text-padding': 0,
        'text-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': 'A',
        'text-offset': [0, 0.7],
        'icon-optional': true,
        'text-font': ['imx-map-font-31 map-font-31'],
        'text-size': 20
      },
      paint: {
        'text-translate-anchor': 'viewport',
        'text-halo-color': 'rgba(255,255,255,1)',
        'text-halo-width': 1,
        'text-halo-blur': 2,
        'text-color': this.themeSettings['color_sets']['primary']['base']
      }
    });
    this.map.on('mouseenter', 'pointOfInterests', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'pointOfInterests', () => {
      this.map.getCanvas().style.cursor = '';
    });
    /* POI (Place Set Places) Layer END */

    // To prevent pinch-to browser effect in IOS
    this.map.on('touchmove', function (e) {
      e.originalEvent.preventDefault();
    });
    // To save map position
    this.map.on('moveend', (e) => {
      if (!e.mapResize) {
        if (e.polygonData) {
          this.filterService.saveMapPosition(e.polygonData);
        } else {
          if (e.eventType && e.eventType === 'default') {
            this.filterService.saveMapPosition(this.mapService.getMapBoundingBox(this.map, true, this.mapBounds));
          } else {
            this.filterService.saveMapPosition(this.mapService.getMapBoundingBox(this.map, false, this.mapBounds));
          }
        }
      }
    });
    this.map.on('click', this.popupDistributor);
    this.bindRender();
    this.exploreDataService.mapLoaded(true);
    // this.loadViewLayers();
  }
  getPopupHTML(place, type = 'map') {
    // Inject Component and Render Down to HTMLDivElement Object
    if (place['id'] === undefined) {
      place['id'] = place['spot_references'] && place['spot_references'][0] && place['spot_references'][0]['spot_id'];
    }
    const inventoryInformation = {
      isAllowInventoryAudience: this.allowInventoryAudience,
      isMeasureAllowed: this.isMeasureEnabled,
      currentPage: this.current_page + 1,
      type: type,
      feature: place,
      selectedFids: this.selectedFidsArray,
      features: type !== 'outside' && this.features || [],
      count: this.selectedFidsArray.length,
      mapStyle: this.mapStyle
    };

    let description = this.dynamicComponentService.injectComponent(ExploreInventoryDetailComponent, x => x.inventory = inventoryInformation);

    // have to check following these variables
    this.popOpenedType = type;
    this.openedInventoryDetail = false;
    return description;
  }



  openPanelPopup(place) {
    this.outSideOpenPlace = place;
    this.inventoryService.getInventories(this.prepareInventoryQuery(place['spot_id'])).subscribe(inventoryItems => {
      const feature = inventoryItems[0] || {};
      feature['plant_frame_id'] = place.plant_frame_id;
      // if (Object.keys(inventoryItems).length > 0 && place.spot_id !== result.frame_id) {
      //   feature['id'] = place.spot_id;
      //   if (result['layouts'].length > 0 && result['layouts'][0]['faces'].length > 0) {
      //     result['layouts'][0]['faces'][0]['spots'].map( spot => {
      //       if (place.spot_id === spot.id) {
      //         feature['plant_frame_id'] = spot.plant_spot_id;
      //       }
      //     });
      //   }
      // }
      const description = this.getPopupHTML(feature, 'outside');
      if (feature['location'] && feature['location']['geometry']) {
        setTimeout(() => {
          if (this.mapPopup.isOpen()) {
            this.mapPopup.remove();
          }
          let zoom = 16;
          if (this.map.getZoom() > 7) {
            zoom = this.map.getZoom();
          }
          if (this.mobileView) {
            this.openMobilePopup(feature, zoom, 'mapView');
          } else {
            if (this.dynamicMapView) {
              clearTimeout(this.inventoryDetailTimer);
              this.mapPopup
                .setLngLat(place.location.geometry.coordinates)
                .setHTML(description.innerHTML)
                .addTo(this.map);
              this.loadFunction(this.mapPopup, this.map, feature);
              // add inventory detail if the inventory not in top 100 list
              if (this.allowInventoryAudience !== 'hidden') {
                this.getSingleInventory(feature, 'desktop');
              }
            } else {
              this.map.flyTo({ center: place.location.geometry.coordinates, zoom: zoom, animate: true });
              this.map.once('moveend', () => {
                clearTimeout(this.inventoryDetailTimer);
                this.mapPopup
                  .setLngLat(place.location.geometry.coordinates)
                  .setHTML(description.innerHTML)
                  .addTo(this.map);
                this.openedFeatureObj = feature;
                this.loadFunction(this.mapPopup, this.map, feature);
                // add inventory detail if the inventory not in top 100 list
                if (this.allowInventoryAudience !== 'hidden') {
                  this.getSingleInventory(feature, 'desktop');
                }
              });
            }
          }
        }, 100);
      }
    });
  }

  /**
   * This method will prepare the query needed to get single spot data
   * @param spotID
   */
  private prepareInventoryQuery(spotID) {
    const query: Partial<SummaryRequest> = {};
    query['target_segment'] = this.selectedAudienceID;
    query['target_geography'] = this.selectedMarket['id'];
    query['base_segment'] = this.defaultAudience.audienceKey;
    query['measures_range_list'] = [{ 'type': 'imp', 'min': 0 }];
    if (spotID) {
      query['id_list'] = [spotID];
      query['id_type'] = 'spot_id';
    }
    return query;
  }

  private prepareInventoryQuerySE(spotID) {
   const query = {
      'from': 0,
      'size': 1,
      'track_total_hits': true,
      'query': {
          'term': {
              'layouts.faces.spots.id': {
                  'value': spotID
               }
          }
      }
    };
    return query;
  }


  toggleSideBarState() {
    if (this.sidebarState) {
      this.sidebarState = false;
      this.exploreDataService.setMapViewPostionState('mapView');
    } else {
      this.sidebarState = true;
      this.exploreDataService.setMapViewPostionState('inventoryView');
    }
    this.mapHeight = this.dimensionsDetails.windowHeight - this.dimensionsDetails.headerHeight;
    // For mobile view mapheight
    if (this.mobileView) {
      this.onMobileMapHeight();
    }
    setTimeout(() => {
      this.map.resize({ mapResize: true });
    }, 100);
  }

  buildPopup(e, i = 0, map, popup, layer) {
    this.features = map.queryRenderedFeatures(e.point, { layers: [layer] });
    this.features = this.features.sort(function (left, right) {
      return left.properties.opp.localeCompare(right.properties.opp) || left.properties.pid.localeCompare(right.properties.pid);
    });
    let feature = this.features[i];
    const featureLayer = this.features[i]['layer'];
    this.current_page = i;
    this.current_e = e;
    this.current_layer = layer;
    if (popup.isOpen()) {
      popup.remove();
    }
    popup.setLngLat(this.features[0].geometry.coordinates.slice())
            .setHTML('<div class="loaderPop"><div class="loader"></div></div>').addTo(map);
            if (this.mapStyle !== 'light') {
              $('.mapboxgl-popup-content').addClass('hide-shadow');
            }
    const geopathData = true;
    if (geopathData) { 
      this.inventoryService.getInventories(this.prepareInventoryQuery(feature.properties.fid)).subscribe( inventoryItems => {
        const currentFeature = inventoryItems[0] || {};
        currentFeature['plant_frame_id'] = feature.properties.pid;
        currentFeature['layer'] = featureLayer;
        this.inventoryPopupBuild(currentFeature, this.features, popup, map);
      });
    } else {
      this.inventoryService.getInventoryFromElasticSearch( this.prepareInventoryQuerySE(feature.properties.fid))
      .subscribe( inventoryItems => {
       const sourceData = this.inventoryService.formatSpotElasticData(inventoryItems);
       const currentFeature = sourceData[0] || {};
       currentFeature['plant_frame_id'] = feature.properties.pid;
       currentFeature['layer'] = featureLayer;
       this.inventoryPopupBuild(currentFeature, this.features, popup, map);
      });      
    }
  }

  inventoryPopupBuild(currentFeature, features, popup, map) {
    if (this.mobileView) {
      this.openMobilePopup(currentFeature, 0, 'map');
    } else {
      const htmlContent = this.getPopupHTML(currentFeature);
      setTimeout(() => {
        popup.setLngLat(features[0].geometry.coordinates.slice())
          .setHTML(htmlContent.innerHTML).addTo(map);
          if (this.mapStyle !== 'light') {
            $('.mapboxgl-popup-content').addClass('hide-shadow');
          }
        this.loadFunction(popup, map, currentFeature);
        // add inventory detail if the inventory not in top 100 list
        if (this.allowInventoryAudience !== 'hidden') {
          this.getSingleInventory(currentFeature, 'desktop');
        }
      }, 100);
    }
  }


  getInventoryDetail(feature) {
    this.mobileLoader = true;
    if (this.allowInventoryAudience === 'hidden') {
      return false;
    }
    const zipdata = {};
    const dmadata = {};
    this.inventoryDetailApiZipData.next({});
    this.inventoryDetailApiDmaData.next({});
    zipdata['fid'] = feature['spot_references'][0]['spot_id'];
    zipdata['replevel'] = 'zip_code';
    zipdata['target_segment'] = this.selectedAudienceID;
    dmadata['fid'] = feature['spot_references'][0]['spot_id'];
    dmadata['replevel'] = 'dma';
    dmadata['target_segment'] = this.selectedAudienceID;
    if (this.selectedMarket && this.selectedMarket['id']) {
      zipdata['target_geography'] = this.selectedMarket['id'];
      dmadata['target_geography'] = this.selectedMarket['id'];
    }
    clearTimeout(this.recallInventoryApiTimer);
    if (this.inventoryDetailApiCall !== null) {
      this.inventoryDetailApiCall.unsubscribe();
    }
    this.apiZipCall = false;
    this.inventoryDetailApiZipCall = this.exploreService.getInventoryDetailZipDMA(zipdata, true).subscribe((zipresponse) => {
      this.inventoryDetailApiZipData.next(zipresponse);
      this.mobileLoader = false;
      this.apiZipCall = true;
    },
      error => {
        this.mobileLoader = false;
        /** For 410 HTTP response the status is coming as 0 so to handle it we have added the below condition */
        if (error.status === 410) {
          this.inventoryDetailApiZipData.next(null);
          this.apiZipCall = true;
        } else {
          this.recallInventoryApiTimer = setTimeout(function () {
            this.getInventoryDetail(feature);
          }, 30000);
        }
      });
    this.apiDmaCall = false;
    this.inventoryDetailApiDmaCall = this.exploreService.getInventoryDetailZipDMA(dmadata, true).subscribe((dmaresponse) => {
      this.inventoryDetailApiDmaData.next(dmaresponse);
      this.mobileLoader = false;
      this.apiDmaCall = true;
    },
      error => {
        this.mobileLoader = false;
        /** F or 410 HTTP response the status is coming as 0 so to handle it we have added the below condition */
        if (error.status === 410) {
          this.inventoryDetailApiDmaData.next(null);
          this.apiDmaCall = true;
        } else {
          this.recallInventoryApiTimer = setTimeout(function () {
            this.getInventoryDetail(feature);
          }, 30000);
        }
      });
  }

  getSingleInventory(feature, type) {
    const selectedPlace = this.places.filter(place => place.spot_id === feature['spot_references'][0]['spot_id'])[0];
    if (this.places.length > 0 && selectedPlace) {
      if (
        feature['spot_references'] &&
        feature['spot_references'][0] &&
        feature['spot_references'][0]['measures'] &&
        feature['spot_references'][0]['measures']['imp'] &&
        feature['spot_references'][0]['measures']['imp'] > 0
      ) {
        this.inventoryDetailTimer = setTimeout(() => {
          this.getInventoryDetail(feature);
        }, 500);
      }
    } else {
      if (this.places.length > 0) {
        if (this.places.filter(place => place.spot_id === feature['spot_references'][0]['spot_id']).length === 0) {
          this.places.push(feature);
        }
      }
      this.metricsCalc();
      if (
        feature['spot_references'] &&
        feature['spot_references'][0] &&
        feature['spot_references'][0]['measures'] &&
        feature['spot_references'][0]['measures']['imp'] &&
        feature['spot_references'][0]['measures']['imp'] > 0
      ) {
        this.inventoryDetailTimer = setTimeout(() => {
          this.getInventoryDetail(feature);
        }, 500);
      }

    }
  }

  updatePopupImpressionsContent(feature, type) {
    if (feature.properties.totwi !== undefined && feature.properties.totwi > 0) {
      setTimeout(() => {
        if (this.mobileView) {
          const mobilePopupElement = document.getElementById('mobile-popup-impressions');
          if (mobilePopupElement) {
            document.getElementById('mobile-popup-impressions').innerHTML = '<span>' +
              'Weekly Impressions: ' + this.abbrNum(feature.properties.totwi, 0) + '</span>';
          }
        } else {
          // checking whether the element is available or not
          const popupElement = document.getElementById('popup-impressions');
          if (popupElement) {
            const element = document.getElementById('popup-see-more');
            // checking whether the element is available or not
            if (element) {
              element.style.display = 'flex';
            }
            // document.getElementById('popup-see-more').style.display = 'flex';
            document.getElementById('popup-impressions').innerHTML = '<span>' +
              'Weekly Impressions: ' + this.abbrNum(feature.properties.totwi, 0) + '</span>';
            document.getElementsByClassName('oppTitle')[0].className += ' hideflag';
          }
        }
      }, 200);

      this.inventoryDetailTimer = setTimeout(() => {
        this.getInventoryDetail(feature);
      }, 500);
    } else {
      setTimeout(() => {
        if (this.mobileView) {
          const element = document.getElementById('mobile-popup-impressions');
          if (element) {
            element.innerHTML = '<span class="mobile-impressions-under-review">' + 'Weekly Impressions: Under review</span>';
          }
        } else {
          const heading = <HTMLElement>document.getElementById('inventoryShortOverview');
          // checking whether the element is available or not
          if (heading) {
            heading.classList.add('data-underreview');
            const headingTitle = <HTMLElement>
              document.getElementById('inventoryShortOverview').querySelector('.mapPopupRightPanel .panel_header');
            headingTitle.setAttribute('title', 'DATA UNDER REVIEW');
            const element = document.getElementById('popup-impressions');
            element.className += ' impression';
            element.innerHTML = '<span>' + 'Weekly Impressions: Under review</span>';
          }
        }
      }, 200);
    }
  }

  openDeatilsPopup(res, feature, type = 'map', portraitView = false) {
    const miniLogo = this.themeSettings['logo']['mini_logo'];
    if (feature['location'] && feature['location']['geometry'] !== 'undefined') {
      this.getStaticMapUrl(feature.location.geometry.coordinates, type);
    }

    // Selected audience info
    let target_audience = {
      name: this.defaultAudience.description,
      id: this.defaultAudience.audienceKey,
    };

    if (this.selectedAudienceID) {
      target_audience = {
        name: this.selectedTarget, id: this.selectedAudienceID
      };
    }
    const inventoryInformation = {
      inventoryDetail: res,
      feature: feature,
      targetAudience: target_audience,
      type: type,
      portraitView: portraitView,
      staticMapURL: this.staticMapURL,
      openedInventoryDetail: this.openedInventoryDetail,
      miniLogo: miniLogo,
      apiZipCall: this.apiZipCall,
      apiDmaCall: this.apiDmaCall,
      selectedMarket: this.selectedMarket,
      mapStyle: this.mapStyle,
      defaultAudience: this.defaultAudience,
      addNotesAccess: this.addNotesAccess
    };
    if (this.themeSettings.site === 'omg') {
      this.isLandscape = false;
      // tslint:disable-next-line:max-line-length
      const dialogRef = this.dialog.open(InventoryDetailViewLayoutComponent, {
        width: '1030px',
        data: inventoryInformation,
        backdropClass: 'hide-backdrop',
        panelClass: 'inventory-detail-dialog'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'openInventory') {
          if (this.popOpenedType === 'map') {
            this.buildPopup(this.current_e, this.current_page, this.openedMapObj, this.openedPopupObj, this.current_layer);
          } else {
            this.openPanelPopup(this.outSideOpenPlace);
          }
        }
      });

    }
  }

  getPopupDetailedHTML(res, feature, type = 'map', portraitView = false) {
    let popupContent: any;
    const miniLogo = this.themeSettings['logo']['mini_logo'];
    if (feature['location'] && feature['location']['geometry'] !== 'undefined') {
      this.getStaticMapUrl(feature.location.geometry.coordinates, type);
    }

    // Selected audience info
    let target_audience = {
      name: this.defaultAudience.description,
      id: this.defaultAudience.audienceKey,
    };

    if (this.selectedAudienceID) {
      target_audience = {
        name: this.selectedTarget, id: this.selectedAudienceID
      };
    }
    const inventoryInformation = {
      inventoryDetail: res,
      feature: feature,
      targetAudience: target_audience,
      type: type,
      portraitView: portraitView,
      staticMapURL: this.staticMapURL,
      openedInventoryDetail: this.openedInventoryDetail,
      miniLogo: miniLogo,
      apiZipCall: this.apiZipCall,
      apiDmaCall: this.apiDmaCall,
      selectedMarket: this.selectedMarket,
      mapStyle: this.mapStyle,
      defaultAudience: this.defaultAudience,
      addNotesAccess: this.addNotesAccess,
      isMeasureEnabled: this.isMeasureEnabled,
      audienceLicense: this.audienceLicense,
      pdfExportEnabled: (this.pdfExportEnabled === 'active'),
    };
    if (this.themeSettings.site === 'omg') {
      this.isLandscape = false;
      // tslint:disable-next-line:max-line-length
      popupContent = this.dynamicComponentService.injectComponent(InventoryDetailViewLayoutComponent, x => x.inventoryDetails = inventoryInformation);

    } else {
      // tslint:disable-next-line:max-line-length
      popupContent = this.dynamicComponentService.injectComponent(InventoryDetailViewComponent, x => x.inventoryDetails = inventoryInformation);
    }
    return popupContent;
  }

  getTopZipcodesHTML(res) {
    /* topzip details card start*/
    let feature;
    if (
      this.openedFeatureObj &&
      this.openedFeatureObj['layouts'] &&
      this.openedFeatureObj['layouts'][0]['faces'] &&
      this.openedFeatureObj['layouts'][0]['faces'][0]['spots'] &&
      this.openedFeatureObj['layouts'][0]['faces'][0]['spots'][0]['measures']) {
      feature = this.openedFeatureObj['layouts'][0]['faces'][0]['spots'][0]['measures'];
    }
    const comingSoon = `<div class="coming_soon_div"> <i class="material-icons">tag_faces</i> <h4>COMING SOON!</div>`;
    let description = `<div class="topzip-card top-zip-card">`;
    description += `
                <h5>Top Zip Codes</h5>`;
    if (res !== null && typeof res.zipcodes['topFour'] !== 'undefined' && res.zipcodes['topFour'].length > 0) {
      description += `
                    <div class="topzip">
                      <ul>`;
      if ((feature && feature['pop_inmkt'] && feature['pop_inmkt'] > 0) || !feature) {
        const j = (res.zipcodes['topFour'].length > 4) ? 4 : res.zipcodes['topFour'].length;
        for (let i = 0; i < j; i++) {
          const zip = res.zipcodes['topFour'][i];
          if (typeof zip['zip'] !== 'undefined') {
            description += '<li><span class="steps">' + (i + 1) +
              '</span><span>' + zip['zip'] + ' <i  class="percent top-percent-position">' + this.convertToPercentage(zip['pct']) + '%</i></span></li>';
          }

        }
        description += `
                  </ul>`;
        if (!this.mobileView) {
          description += '<button id="map-it-zip" type="button" mat-raised-button color="primary"><i class="material-icons">map</i> <span>Map It</span></button>';
        }
        description += `</div>`;
      } else {
        description += '<div class="under-review">Under Review</div>';
      }
      // here checking the unitdetails field because sometime unitdetails is getting undefined.
      /* if (res.hasOwnProperty('unitDetails')) {
        const prop = res.unitDetails.properties;
        if (prop.total_market_population > 0) {
          
        } else {
          
        }
      } else {
        description += '<div class="under-review">Under Review</div>';
      } */
    } else {
      description += comingSoon;
    }
    description += '</div>';
    description += '</div>';
    /* topzip details card end */
    return description;
  }

  getTopDmasHTML(res) {
    /* topzip details card start*/
    let feature;
    if (
      this.openedFeatureObj &&
      this.openedFeatureObj['layouts'] &&
      this.openedFeatureObj['layouts'][0]['faces'] &&
      this.openedFeatureObj['layouts'][0]['faces'][0]['spots'] &&
      this.openedFeatureObj['layouts'][0]['faces'][0]['spots'][0]['measures']) {
      feature = this.openedFeatureObj['layouts'][0]['faces'][0]['spots'][0]['measures'];
    }
    const comingSoon = `<div class="coming_soon_div"> <i class="material-icons">tag_faces</i> <h4>COMING SOON!</div>`;

    let description = '<div class="topmarket-card top-zip-card">';
    description += `<h5>Top Market Areas</h5><div></div>`;

    if (res !== null && typeof res.dmaresults['topFour'] !== 'undefined' && res.dmaresults['topFour'].length > 0) {
      if ((feature && feature['pop_inmkt'] && feature['pop_inmkt'] > 0) || !feature) {
        description += '<div class="topzip">';
        description += '<ul>';
        const j = (res.dmaresults['topFour'].length > 4) ? 4 : res.dmaresults['topFour'].length;
        for (let i = 0; i < j; i++) {
          const dma = res.dmaresults['topFour'][i];
          if (typeof dma['name'] !== 'undefined') {
            const name = dma['name'].toString();
            const topMarketClass = !this.isLandscape && 'landscape-view' || '';
            const start = this.isLandscape && 16 || 26;
            const end = this.isLandscape && 5 || 6;
            description += `<li><span class="steps"> ${(i + 1)}</span><span title='${name}'><span class="desc-topmarket ${topMarketClass}"> ${this.truncate.transform(name, 'middle', start, end)} </span><i class="percent top-percent-position" > ${this.convertToPercentage(dma['pct'])} %</i></span></li>`;

          }
        }
        description += '</ul>';
        if (!this.mobileView) {
          description += '<button type="button" id="map-it-dma" type="button" mat-raised-button color="primary" ><i class="material-icons">map</i> <span>Map It</span></button>';
        }
        description += '</div>';
      } else {
        description += '<div class="under-review">Under Review</div>';
      }
      // here checking the unitdetails field because sometime unitdetails is not getting undefined.
      /* if (res.hasOwnProperty('unitDetails')) {
        const prop = res.unitDetails.properties;
        if (prop.total_market_population > 0) {
          description += '<div class="topzip">';
          description += '<ul>';
          const j = (res.dmaresults['topFour'].length > 4) ? 4 : res.dmaresults['topFour'].length;
          for (let i = 0; i < j; i++) {
            const dma = res.dmaresults['topFour'][i];
            if (typeof dma['name'] !== 'undefined') {
              const name = dma['name'].toString();
              description += `<li><span class="steps"> ${(i + 1)}</span><span title='${name}'> ${this.common.truncateString(name, 4, true)} <i class="percent"> ${this.convertToPercentage(dma['pct'])} %</i></span></li>`;
            }
          }
          description += '</ul>';
          if (!this.mobileView) {
            description += '<button type="button" id="map-it-dma" type="button" mat-raised-button color="primary"><i class="material-icons">map</i> <span>Map It</span></button>';
          }
          description += '</div>';
        } else {
          description += '<div class="under-review">Under Review</div>';
        }
      } else {
        description += '<div class="under-review">Under Review</div>';
      } */
    } else {
      description += comingSoon;
    }
    description += '</div>';
    /* topmarket details card end */
    return description;
  }

  next(popup, map) {

    let i = this.current_page + 1;
    if (i >= this.features.length) {
      i = 0;
    }
    this.current_page = i;
    const feature = this.features[i];
    const featureLayer = this.features[i]['layer'];
    const geopathData = true;
    if (geopathData) {
      // popup.setHTML('<div class="loaderPop"><div id="loader"></div></div>');
      this.inventoryService.getInventories(this.prepareInventoryQuery(feature.properties.fid)).subscribe( inventoryItems => {
        const currentFeature = inventoryItems[0] || {};
        currentFeature['plant_frame_id'] = feature.properties.pid;
        currentFeature['layer'] = featureLayer;
        this.inventoryPopupNextPrev(currentFeature, popup, map);
      });
    } else {
      this.inventoryService.getInventoryFromElasticSearch(this.prepareInventoryQuerySE(feature.properties.fid))
      .subscribe( inventoryItems => {
        const sourceData = this.inventoryService.formatSpotElasticData(inventoryItems);
        const currentFeature = sourceData[0] || {};
        currentFeature['plant_frame_id'] = feature.properties.pid;
        currentFeature['layer'] = featureLayer;
        this.inventoryPopupNextPrev(currentFeature, popup, map);
      });
    }

    
    // this.inventoryService.getSingleInventory({
    //     frameId: feature.properties.fid,
    //     'target_segment': this.selectedAudienceID,
    //     'target_geography': this.selectedMarket['id'],
    //     'base_segment' : this.defaultAudience.audienceKey
    //   }, true)
    //     .subscribe(result => {
    //   const currentFeature = result || {};
    //   currentFeature['plant_frame_id'] = feature.properties.pid;
    //   currentFeature['layer'] = featureLayer;
    //   if (this.mobileView) {
    //     this.openMobilePopup(currentFeature, 0, 'map');
    //   } else {
    //     const description = this.getPopupHTML(currentFeature);
    //     setTimeout(() => {
    //       popup.setHTML(description.innerHTML);
    //       this.loadFunction(popup, map, currentFeature);
    //       // add inventory detail if the inventory not in top 100 list
    //       if (this.allowInventoryAudience !== 'hidden') {
    //         this.getSingleInventory(currentFeature, 'desktop');
    //       }
    //     }, 100);
    //   }
    // });
  }

  prev(popup, map) {
    let i = this.current_page - 1;
    const len = this.features.length;
    if (i < 0) {
      i = this.features.length - 1;
    }
    this.current_page = i;
    const feature = this.features[i];
    const featureLayer = this.features[i]['layer'];
    // popup.setHTML('<div class="loaderPop"><div id="loader"></div></div>');
    const geopathData = true;
    if (geopathData) {
      this.inventoryService.getInventories(this.prepareInventoryQuery(feature.properties.fid)).subscribe( inventoryItems => {
        const currentFeature = inventoryItems[0] || {};
        currentFeature['plant_frame_id'] = feature.properties.pid;
        currentFeature['layer'] = featureLayer;
        this.inventoryPopupNextPrev(currentFeature, popup, map);
      });
    } else {
      this.inventoryService.getInventoryFromElasticSearch( this.prepareInventoryQuerySE(feature.properties.fid))
      .subscribe( inventoryItems => {
        const sourceData = this.inventoryService.formatSpotElasticData(inventoryItems);
        const currentFeature = sourceData[0] || {};
        currentFeature['plant_frame_id'] = feature.properties.pid;
        currentFeature['layer'] = featureLayer;
        this.inventoryPopupNextPrev(currentFeature, popup, map);
      });
    }
  }

  inventoryPopupNextPrev(currentFeature, popup, map) {
    if (this.mobileView) {
      this.openMobilePopup(currentFeature, 0, 'map');
    } else {
      const description = this.getPopupHTML(currentFeature);
      setTimeout(() => {
        popup.setHTML(description.innerHTML);
        this.loadFunction(popup, map, currentFeature);
        // add inventory detail if the inventory not in top 100 list
        if (this.allowInventoryAudience !== 'hidden') {
          this.getSingleInventory(currentFeature, 'desktop');
        }
      }, 100);
    }
  }

  openInventoryDetailedPopup(popup, map, feature, portraitView) {
    this.isLandscape = portraitView;
    // const inventoryDetailApiData = JSON.parse(JSON.stringify(this.inventoryDetailApiData.getValue()));
    const inventoryDetailApiZipData = JSON.parse(JSON.stringify(this.inventoryDetailApiZipData.getValue()));
    const inventoryDetailApiDmaData = JSON.parse(JSON.stringify(this.inventoryDetailApiDmaData.getValue()));
    this.exploreService.cancelSlowMessage(this.exploreService);
    const inventoryDetail = {};
    inventoryDetail['zipcodes'] = inventoryDetailApiZipData;
    inventoryDetail['dmaresults'] = inventoryDetailApiDmaData;
    if (this.themeSettings.site === 'omg') {
      this.openedInventoryDetail = true;
      if (this.mapPopup.isOpen()) {
        this.mapPopup.remove();
      }
      this.openDeatilsPopup(inventoryDetail, feature, 'map', portraitView);
      this.loadFunction(popup, map, feature);
      this.openedInventoryDetail = true;
      this.openedPopupObj = popup;
      this.openedMapObj = map;
      this.openedFeatureObj = feature;
    } else {
      const description = this.getPopupDetailedHTML(inventoryDetail, feature, 'map', portraitView);
      setTimeout(() => {
        popup.setHTML(description.innerHTML);
        if (this.mapStyle !== 'light') {
          $('.mapboxgl-popup-content').addClass('hide-shadow');
        }
        this.loadFunction(popup, map, feature);
        this.openedInventoryDetail = true;
        this.openedPopupObj = popup;
        this.openedMapObj = map;
        this.openedFeatureObj = feature;
      }, 300);
    }


    /* if (typeof inventoryDetailApiData['unitDetails'] !== 'undefined') {
      this.exploreService.cancelSlowMessage(this.exploreService);
      const inventoryDetail = {};
      inventoryDetail['zipcodes'] = inventoryDetailApiZipData;
      inventoryDetail['dmaresults'] = inventoryDetailApiDmaData;
      const description = this.getPopupDetailedHTML(inventoryDetail, feature, 'map', portraitView);
      setTimeout(() => {
        popup.setHTML(description.innerHTML);
        this.loadFunction(popup, map, feature);
      }, 300);
    } else {
      this.exploreService.slowCalcMessage(this.exploreService, 'popup for ' + feature.id);
      this.openedInventoryDetail = true;
      this.openedPopupObj = popup;
      this.openedMapObj = map;
      this.openedFeatureObj = feature;
    } */

    /* if (Object.keys(inventoryDetailApiZipData).length === 0 || Object.keys(inventoryDetailApiDmaData).length === 0) {
      this.openedInventoryDetail = true;
      this.openedPopupObj = popup;
      this.openedMapObj = map;
      this.openedFeatureObj = feature;
    } */

  }

  openInventoryInfoPopup(popup, map, feature) {
    const description = this.getInventoryInfoPopupHtml('html');
    setTimeout(() => {
      popup.setHTML(description.innerHTML);
      this.loadFunction(popup, map, feature);
    }, 100);
  }

  getInventoryInfoPopupHtml(fileType) {

    const inventoryInformation = {
      fileType: fileType,
      isLandscape: this.isLandscape
    };
    const popupContent = this.dynamicComponentService
      .injectComponent(ExploreInventoryInformationComponent, x => x.inventoryInformation = inventoryInformation);

    return popupContent;
  }

  loadMapItFunction(type) {
    if (type === 'zip') {
      $('#map-it-zip').off().on('click',
        (e) => {
          this.openDetailMap('zip');
          return false;
        });
    } else if (type = 'dma') {
      $('#map-it-dma').off().on('click',
        (e) => {
          this.openDetailMap('dma');
          return false;
        });
    }
  }

  openDetailMap(type) {
    const inventoryDetail = this.inventoryDetailApiData.getValue();
    const feature = this.openedFeatureObj;
    // this.features[i];
    if (feature && feature.properties) {
      this.hoverOnCard(feature.properties);
    }
    const inventoryFeature = {};
    if (feature) {
      inventoryFeature['type'] = 'Feature';
      inventoryFeature['geometry'] = feature['location'] && feature['location']['geometry'] || {};
      inventoryFeature['properties'] = {};
      inventoryFeature['properties']['fid'] = feature['id'] || '';
      inventoryFeature['properties'] = Object.assign(inventoryFeature['properties'], feature);
    }
    const data = {};
    data['type'] = type;
    data['inventoryDetail'] = inventoryDetail;
    data['inventoryFeature'] = inventoryFeature;
    this.exploreDataService.setMapViewPostionState('topZipMarketView');
    setTimeout(() => {
      this.exploreDataService.setTopMapData(data);
    }, 1000);
    /*if(this.mapPopup)
    {
      this.mapPopup.remove();
    }*/
  }

  loadFunction(popup, map, feature) {
    var self = this;
    $('.next').off().on('click',
      function (e) {
        self.next(popup, map);
        return false;
      });
    $('.prev').off().on('click',
      function (e) {
        self.prev(popup, map);
        return false;
      });
    $('.fselectbtn').off().on('click',
      function (f) {
        const e = self.current_e;
        const i = self.current_page;
        const gid = feature.id;
        const selected = self.selectedFidsArray.filter(f => (f.fid + '' === feature.id + ''));
        const selectedPlace = self.places.filter(place => (place.spot_id + '' === feature.id + ''));
        if (selectedPlace.length <= 0 && selected.length > 0) {
          const gpFilter = {};
          gpFilter['audience'] = self.selectedAudienceID;
          gpFilter['base'] = self.selectedBaseID;
          // gpFilter['idType'] = 'geopathPanel';
          gpFilter['geopathPanelIdList'] = [gid];
          const value = !(selected[0].selected);
          self.places.map(place => {
            if (place.spot_id === selected[0].fid) {
              place.selected = value;
            }
          });
          self.selectedFidsArray.map(place => {
            if (place.fid === selected[0].fid) {
              place.selected = value;
            }
          });
          if (value) {
            $(this).addClass('selected');
            $(this).find('span').html('Selected');
          } else {
            $(this).removeClass('selected');
            $(this).find('span').html('Select');
          }
          self.metricsCalc();
        } else if (selected.length > 0) {
          const selectedFeature = selected[0];
          selectedFeature.selected = !selectedFeature.selected;
          self.places.map(place => {
            if (place.spot_id === selectedFeature.fid) {
              place.selected = selectedFeature.selected;
            }
          });
          self.selectedFidsArray.map(place => {
            if (place.fid === selectedFeature.fid) {
              place.selected = selectedFeature.selected;
            }
          });
          if (selected[0].selected) {
            $(this).addClass('selected');
            $(this).find('span').html('Selected');
          } else {
            $(this).removeClass('selected');
            $(this).find('span').html('Select');
          }
          self.metricsCalc();
        }
        // TODO: Commented while implement GPATH API integration need to implement
        self.updateBubblesCount(true);
        self.modifySearchResultMapFormat();
        return false;
      });
    self.map.on('selection', function (e) {
      if (self.selectedFrameId['fid'] === feature.id) {
        if (self.selectedFrameId['selected']) {
          $('.fselectbtn').addClass('selected').find('span').html('Selected');
        } else {
          $('.fselectbtn').removeClass('selected').find('span').html('Select');
        }
      }
    });

    $('.change_landscape').off().on('click', function () {
      $('.map-div').addClass('opened_detailed_popup');
      $('.mapboxgl-popup-content').addClass('open_inventory_popup');
      self.openInventoryDetailedPopup(popup, map, feature, false);
      return false;
    });
    $('.change_portrait').off().on('click', function () {
      $('.map-div').addClass('opened_detailed_popup');
      $('.mapboxgl-popup-content').addClass('open_inventory_popup');
      self.openInventoryDetailedPopup(popup, map, feature, true);
      return false;
    });
    $('.open_inventory_card').off().on('click', function () {
      $('.map-div').addClass('opened_detailed_popup');
      $('.mapboxgl-popup-content').addClass('open_inventory_popup');
      self.openInventoryDetailedPopup(popup, map, feature, self.isLandscape);
      return false;
    });
    $('.open_inventory_card_btn').off().on('click', function () {
      $('.mapboxgl-popup-content').addClass('open_inventory_popup');
      $('.map-div').addClass('opened_detailed_popup');
      self.openInventoryDetailedPopup(popup, map, feature, self.isLandscape);
      return false;
    });
    $('.close_detailed_popup').off().on('click', function () {
      $('.map-div').removeClass('opened_detailed_popup');
      self.exploreService.cancelSlowMessage(self.exploreService);
      const htmlContent = self.getPopupHTML(feature, self.popOpenedType);
      setTimeout(function () {
        popup.setHTML(htmlContent.innerHTML).addTo(map);
        self.loadFunction(popup, map, feature);
        // add inventory detail if the inventory not in top 100 list
        if (self.allowInventoryAudience !== 'hidden') {
          self.getSingleInventory(feature, 'desktop');
        }
      }, 100);
      return false;
    });

    $('.detailed_info_popup').off().on('click', function () {
      self.openInventoryInfoPopup(popup, map, feature);
      return false;
    });
    $('.download_us_pdf').off().on('click', function () {
      // const inventoryDetailApiData = self.inventoryDetailApiData.getValue();
      const pdfReqHeaders = {};
      pdfReqHeaders['panel_id'] = [`${feature.id}`];
      pdfReqHeaders['type'] = 'inventory_details';
      pdfReqHeaders['aud'] = self.selectedAudienceID;
      pdfReqHeaders['aud_name'] = self.selectedTarget;
      pdfReqHeaders['orientation'] = self.isLandscape ? 'portrait' : 'landscape';
      pdfReqHeaders['report_format'] = 'pdf'
      if (Object.keys(self.selectedMarket).length > 0) {
        pdfReqHeaders['target_geography'] = self.selectedMarket['id'];
        pdfReqHeaders['market_type'] = self.selectedMarket['type'];
        pdfReqHeaders['market_name'] = self.selectedMarket['name'];
      }
      pdfReqHeaders['target_segment'] = self.selectedAudienceID;
      self.exploreService.downloadPdf(pdfReqHeaders).subscribe((res: HttpResponse<any>) => {
        const contentDispose = res.headers.get('content-disposition');
        const matches = contentDispose.split(';')[1].trim().split('=')[1];
        const filename = matches && matches.length > 1 ? matches : feature.id + '.pdf';
        saveAs(res.body, filename);
        // const fileURL = URL.createObjectURL(res);
        // window.open(fileURL);
      });
      return false;
    });

    $('#map-it-zip').off().on('click',
      function (e) {
        self.openDetailMap('zip');
        return false;
      });
    $('#map-it-dma').off().on('click',
      function (e) {
        self.openDetailMap('dma');
        return false;
      });

  }

  loadingPDF(pdf_downloading) {
    const download_pdf = <HTMLElement>document.querySelector('.download_us_pdf');
    if (pdf_downloading) {
      download_pdf.innerHTML = '<div id="loader"></div>';
    } else {
      download_pdf.innerHTML = '<i class="material-icons">picture_as_pdf</i>';
    }
  }

  togglePlaceSelection(spot_id) {
    const selected = this.selectedFidsArray.filter(f => (f.fid === spot_id));
    // const selectedPlace = this.places.filter(place => (place.frame_id === p.frame_id));

    if (selected.length > 0) {
      const selectedFeature = selected[0];
      this.selectedFrameId = selectedFeature;
      selectedFeature.selected = !selectedFeature.selected;
      this.places.map(place => {
        if (place.spot_id === selectedFeature.fid) {
          place.selected = selectedFeature.selected;
        }
      });
      this.selectedFidsArray.map(place => {
        if (place.fid === selectedFeature.fid) {
          place.selected = selectedFeature.selected;
        }
      });
      if (this.mapViewPostionState === 'inventoryView') {
        this.filterService.updateFiltersData({ places: this.places });
        /*this.exploreDataService.savePlaces(this.places);
        this.exploreDataService.saveFids(this.selectedFidsArray);*/
      }
    }
    this.metricsCalc();
    // this.updateBubblesCount(true);
    this.toggleClicks.next();
    this.saveFidsInSession();
    this.map.fire('selection', spot_id);
    this.modifySearchResultMapFormat();
  }

  private saveFidsInSession() {
    const filtersData = {};
    filtersData['selectQuery'] = this.selectQuery;
    filtersData['selectedFids'] = this.selectedFidsArray;
    filtersData['selectQueryLimited'] = this.selectQueryLimited;
    this.filterService.updateFiltersData(filtersData);
  }

  metricsCalc() {
    this.selectedCount = this.selectedFidsArray.length;
    if (this.selectedFidsArray.length > 0) {
      const selected = this.selectedFidsArray.filter(item => item.selected);
      this.selectedCount = selected.length;
      const number = this.selectQueryLimited;
      switch (number) {
        case -2:
          this.selectQuery = 'Custom';
          break;
        case -1:
          if (selected.length >= this.selectedFidsArray.length) {
            this.selectQuery = 'All';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        case 0:
          if (this.selectedCount > number) {
            this.selectQuery = 'Custom';
          } else {
            this.selectQuery = 'None';
          }
          break;
        case 25:
          if (this.selectedCount >= number) {
            this.selectQuery = 'Top 25';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        case 50:
          if (this.selectedCount >= number) {
            this.selectQuery = 'Top 50';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        case 100:
          if (this.selectedCount >= number) {
            this.selectQuery = 'Top 100';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        default:
          this.selectQuery = 'All';
          break;
      }
      this.exploreDataService.saveSelectedOptions(this.selectQuery);
    }
    this.setSelectedInventoriesData();
  }

  formatUpNationalData(data) {
    data.features.sort(function (a, b) {
      return b.properties.panelCount - a.properties.panelCount;
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
  formatUpPlaceNationalData(data) {
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
  // updating map when drawing polygon is done
  updateFiltersFromPolygon(polygonFromSession = {}) {
    // generate bounding box from polygon the user drew
    if (((this.mapDrawEnable || this.circleDrawEnable) &&
      this.draw.getAll().features.length > 0) || polygonFromSession['region']) {
      this.customPolygon.coordinates = [];
      if (polygonFromSession['region']) {
        this.customPolygon.coordinates.push([].concat.apply([], polygonFromSession['region']['coordinates']));
        if (polygonFromSession['regularPolygon']) {
          this.mapDrawEnable = true;
        } else if (polygonFromSession['circularPolygon']) {
          this.circleDrawEnable = true;
        }
        this.customPolygonFeature.geometry = polygonFromSession['region'];
        this.polygonData.features.push(this.customPolygonFeature);
        const boundBox = bbox(this.customPolygon);
        // this.map.fitBounds(boundBox); // commented to fix map position on layer load.
      } else {
        if (this.circleDrawEnable) {
          this.customPolygon.coordinates = [];
          this.customPolygon.coordinates.push([RadiusMode.circleCoordinates]);
          this.customPolygonFeature.geometry.coordinates.push(RadiusMode.circleCoordinates);
          this.polygonData.features.push(this.customPolygonFeature);
          this.filterService.setFilter('location', { region: this.customPolygon, type: 'circularPolygon' });
        } else {
          this.customPolygon.coordinates.push(this.draw.getAll().features[0].geometry.coordinates);
          this.polygonData.features.push(this.draw.getAll().features[0]);
          this.filterService.setFilter('location', { region: this.customPolygon, type: 'regularPolygon' });
        }
      }
      // enabling polygon layer view
      this.togglePolygonLayerView(true);

      // Will implement later with fiterService
      // this.map_filter_state.next(true);
      if (!polygonFromSession['region']) {
        this.removePolygonFeature();
      }
      setTimeout(() => {
        this.enableMapInteraction();
      }, 200);
    }
  }

  // to remove custom polygon object
  removePolygonFeature() {
    this.draw.deleteAll();
  }

  // to remove custom polygon and draw controls
  removePolygon(updateMap = true) {
    if (this.mapViewSearch > 0) {
      this.removeMapViewPolygon(true, 'mapViewPolygon');
    } else if (this.geoPolygon) {
      this.removeMapViewPolygon(true, 'geoPolygon');
    } else if (this.placeSetsDisplay) {
      this.removePlaceSetsPolygon();
    } else {
      this.togglePolygonLayerView(false);
      if (this.mapDrawEnable || this.circleDrawEnable) {
        const sessionFilter = this.filterService.getExploreSession();
        if (!(sessionFilter && sessionFilter['location'] && sessionFilter['location']['region'])) {
          this.removePolygonFeature();
          this.map.removeControl(this.draw);
          this.map.getContainer().classList.remove('mouse-add');
        }
        this.enableMapInteraction();
        if (this.mapDrawEnable) {
          this.mapDrawEnable = false;
        } else {
          this.circleDrawEnable = false;
        }
        this.customPolygon.coordinates = [];
        this.customPolygonFeature.geometry = {
          type: 'Polygon',
          coordinates: []
        };
        this.polygonData.features = [];
        if (updateMap) {
          this.filterService.setFilter('location', {});
          // this.map_filter_state.next(true);
        }
        this.addingMapDraw = true;
      }
    }
  }

  // initializing the draw functionality of custom polygon
  drawPolygon() {
    this.addingMapDraw = true;
    if (this.circleDrawEnable) {
      this.removePolygon(true);
    }
    if (!this.map.getSource('mapbox-gl-draw-cold')) {
      this.map.addControl(this.draw);
    }
    this.mapDrawEnable = true;
    if (this.draw.getAll().features.length > 0) {
      this.draw.deleteAll();
    }
    if (this.mapViewSearch > 0) {
      this.removeMapViewPolygon(true, 'mapViewPolygon');
    }
    if (this.geoPolygon) {
      this.removeMapViewPolygon(true, 'geoPolygon');
    }
    if (this.placeSetsDisplay) {
      this.removePlaceSetsPolygon();
    }
    if (this.dynamicMapView > 0) {
      $('#location-search').click();
    }
    this.polygonData.features = [];
    // this.customPolygonFeature.geometry.coordinates = [];
    this.draw.changeMode('draw_polygon');
    this.map.on('draw.create', this.updateFiltersFromPolygon.bind(this));
    this.disableMapInteraction();
    this.togglePolygonLayerView(false);
  }

  drawCircle() {
    this.addingMapDraw = true;
    if (this.mapDrawEnable) {
      this.removePolygon(true);
    }
    if (!this.map.getSource('mapbox-gl-draw-cold')) {
      this.map.addControl(this.draw);
    }
    this.circleDrawEnable = true;
    if (this.draw.getAll().features.length > 0) {
      this.draw.deleteAll();
    }
    if (this.mapViewSearch > 0) {
      this.removeMapViewPolygon(true, 'mapViewPolygon');
    }
    if (this.geoPolygon) {
      this.removeMapViewPolygon(true, 'geoPolygon');
    }
    if (this.placeSetsDisplay) {
      this.removePlaceSetsPolygon();
    }
    if (this.dynamicMapView > 0) {
      $('#location-search').click();
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

  // to on or off polygon layers
  togglePolygonLayerView(enable = false) {
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
  // Commenting Geo polygon related code becuase of absence of co-ordinates in Geopath API
  onDrawGeopolygon(selectedGeoLocation) {
    this.filterService.setFilter('location', { type: 'geography', selectedGeoLocation: selectedGeoLocation });
    // this.geoFilter = {};
    // this.geoFilter = Geopolygon;
    // this.redraw = true;
    // this.drawMapViewPolygon({ multiPolygon: Geopolygon.geometry, polygonType: 'geoPolygon' });
  }

  // to load default map view polygon
  loadMapView() {
    if (this.dynamicMapView > 0) {
      $('#location-search').click();
    }
    this.drawMapViewPolygon({
      multiPolygon: this.mapService.getMapBoundingBox(this.map, false, this.mapBounds), polygonType: 'mapViewPolygon'
    });
  }

  // To draw default & geo map view polygons
  drawMapViewPolygon(polygonObject) {
    if (this.mapViewSearch > 0) {
      this.removeMapViewPolygon(false, 'mapViewPolygon');
    }
    if (this.mapDrawEnable || this.circleDrawEnable) {
      this.removePolygon(false);
    }
    if (this.geoPolygon) {
      this.removeMapViewPolygon(false, 'geoPolygon');
    }
    if (this.placeSetsDisplay) {
      this.removePlaceSetsPolygon();
    }
    this.customPolygon = polygonObject.multiPolygon;
    this.customPolygonFeature.geometry = {
      type: 'Polygon',
      coordinates: []
    };
    this.customPolygonFeature.geometry.coordinates = [].concat.apply([], polygonObject.multiPolygon.coordinates);
    this.polygonData.features = [];
    this.polygonData.features.push(this.customPolygonFeature);
    this.togglePolygonLayerView(true);
    switch (polygonObject.polygonType) {
      case 'mapViewPolygon':
        this.mapViewSearch = 1;
        this.filterService.setFilter('location', { region: this.customPolygon, type: 'mapViewPolygon' });
        break;
      case 'geoPolygon':
        this.geoPolygon = true;
        if (!this.geoFilter['searchParams']) {
          if (polygonObject['geoFilter'] && polygonObject['geoFilter']['searchParams']) {
            this.geoFilter = polygonObject['geoFilter'];
          }
        }
        const searchParams = {
          'id': this.geoFilter.searchParams.id,
          'type': this.geoFilter.searchParams.type,
        };
        this.filterService.setFilter('location', { region: searchParams, type: 'geoPolygon', geoFilter: this.geoFilter });
        break;
      default:
        break;
    }
    if (polygonObject['geoFilter']) {
      this.geoFilter = polygonObject['geoFilter'];
    }
    this.map.fitBounds(bbox(this.customPolygon), { duration: 100 }, { polygonData: this.customPolygon, eventType: 'drawMapView' });
  }

  // To remove default & geo map view polygons
  removeMapViewPolygon(updateMap = true, polygonType) {
    this.customPolygonFeature.geometry.coordinates = [];
    this.polygonData.features = [];
    this.customPolygon.coordinates = [];
    this.togglePolygonLayerView(false);
    switch (polygonType) {
      case 'mapViewPolygon':
        this.mapViewSearch = 0;
        break;
      case 'geoPolygon':
        this.geoPolygon = false;
        if (this.redraw === false) {
          this.exploreDataService.setSelectedMarketLocationValue([]);
          this.exploreDataService.setSelectedGeoLocationIdValue('');
          $('#search-locations').val('');
        }
        this.redraw = false;
        break;
      default:
        break;
    }
    if (updateMap) {
      this.filterService.setFilter('location', {});
      // this.map_filter_state.next(true);
    }
  }

  disableMapInteraction() {
    if (this.enableMapInteractionFlag) {
      this.enableMapInteractionFlag = false;
      this.map['boxZoom'].disable();
      this.map['doubleClickZoom'].disable();
      this.map['scrollZoom'].disable();
      this.map.off('click', this.popupDistributor);
      this.map.on('click', this.disablePopupDistributor);
    }
    /*this.map.off('click', 'frameCluster0', this.framCluster0ZoomIn);
    this.map.off('click', 'frameCluster5', this.framCluster5ZoomIn);
    this.map.off('click', 'grayed_frames_panel', this.greyedFrameZoomIn);
    this.map.off('click', 'color_frames_panel', this.colorFrameZoomIn);
    this.map.off('click', 'frames_panel', this.framesZoomIn);
    this.map.off('click', 'places', this.placesZoomIn);
    this.map.off('click', 'frameClusters', this.framClusterZoomIn);
    this.map.off('click', 'framesLayer', this.placeFramePopup);*/

  }

  enableMapInteraction() {
    if (!this.enableMapInteractionFlag) {
      this.enableMapInteractionFlag = true;
      this.map['boxZoom'].enable();
      this.map['doubleClickZoom'].enable();
      this.map['scrollZoom'].enable();
      this.map.off('click', this.disablePopupDistributor);
      this.map.on('click', this.popupDistributor);
    }
    /*this.map.on('click', 'frameCluster0', this.framCluster0ZoomIn);
    this.map.on('click', 'frameCluster5', this.framCluster5ZoomIn);
    this.map.on('click', 'grayed_frames_panel', this.greyedFrameZoomIn);
    this.map.on('click', 'color_frames_panel', this.colorFrameZoomIn);
    this.map.on('click', 'frames_panel', this.framesZoomIn);
    this.map.on('click', 'places', this.placesZoomIn);
    this.map.on('click', 'frameClusters', this.framClusterZoomIn);
    this.map.on('click', 'framesLayer', this.placeFramePopup);*/
  }

  loadData() {
    if (this.map.getZoom() >= 7) {
      const boundBox = this.mapService.getMapBoundingBox(this.map, false, this.mapBounds);
      this.filterService.setFilter('location', { region: boundBox, type: 'dynamicMapView' });
    }
  }

  setSelectedInventoriesData() {
    this.setSelectedEnable = true;
    let seletedPanels = [];
    this.selectedFidsArray.map(place => {
      if (place.selected && place.fid !== undefined && place.fid !== 'undefined') {
        seletedPanels.push(place.fid);
      }
    });

    let selectedPanelCnt = 0;
    if (seletedPanels.length > 0) {
      selectedPanelCnt = seletedPanels.length;
    } else {
      selectedPanelCnt = 0;
      seletedPanels = [0];
    }
    const filters = [];
    filters.unshift('all');
    seletedPanels.unshift('in', 'fid');
    filters.push(seletedPanels);

    /** Commented: June 20 219
     * It is affected the updating color_frames_panel and frames_panel
     * when user changed the Select dropdown to Top 25, 50 or 100
    **/
    /* let places = JSON.parse(JSON.stringify(this.places));
    if (places.length > 0) {
      places = places.slice(0, 100);
      const pids = places.map(p => p.frame_id);
      pids.unshift('!in', 'fid');
      filters.push(pids);
    } */
    // this.map.setFilter('color_frames_panel', filters);
    /* for seeing the color frame panel at 7 th zoom*/
    if (this.selectedFidsArray && this.selectedFidsArray.length <= 50000) {
      this.map.setFilter('color_frames_panel', filters);
      this.map.setLayoutProperty('color_frames_panel', 'visibility', 'visible');

      if (selectedPanelCnt <= 100) {
        this.map.setPaintProperty('color_frames_panel', 'circle-radius', 5);
      } else {
        this.map.setPaintProperty('color_frames_panel', 'circle-radius', 3);
      }
      this.map.setFilter('frames_panel', filters);
      if (this.map.getLayer('mapLabel')) {
        this.map.setFilter('mapLabel', filters);
      }
      // this.map.setFilter('grayed_frames_panel', filters);
    }
    // Commented on 18th oct 2019 by Jagadeesh
    // I think this else block is not needed as we can make selection only if count is less than 50k
    // else {
    //   this.map.setFilter('color_frames_panel', null);
    //   this.map.setFilter('frames_panel', null);
    //   this.map.setFilter('grayed_frames_panel', null);
    //   this.map.setPaintProperty('color_frames_panel', 'circle-radius', 3);
    //   this.map.setFilter('mapLabel', null);
    // }
  }

  private getInventoriesFromES(filters, paging = false) {
    if (this.inventoriesApiCall != null) {
      this.inventoriesApiCall.unsubscribe();
    }
    if (filters['location']) {
      delete filters['location'];
    }
    let zeroMeasure = true;
    if ((filters['measures_range_list']
    && filters['measures_range_list'].length > 1)) {
      filters['measures_range_list'].forEach((val) => {
        if (val['min'] > 0) {
          zeroMeasure = false;
          return false;
        }
      });
    }
    if ((this.filtersAttributes.some(key => filters[key])
      || (filters['measures_range_list']
        && filters['measures_range_list'].length > 1)) && zeroMeasure) {
      const filterData = JSON.parse(JSON.stringify(filters));
      filterData['page_size'] = 100;
      filterData['page'] = filterData['page'] - 1;
      const query = this.inventoryService.prepareInventoryQuery(filterData);
      // this.inventoriesApiCall =
      this.inventoryService.getInventoryFromElasticSearch(query)
        .pipe(map((responseData: any) => {
          const res = {};
          if (responseData['hits'] && responseData['hits']['hits']) {
            const inventories = responseData['hits']['hits'].map(hit => hit['_source']);
            res['inventoryItems'] = inventories;
          }
          return res;
        }))
        .subscribe(result => {
          const inventoryItems = result['inventoryItems'] || [];
          if (!paging) {
            // TODO: Invaild IDs have to implement for elasticsearch
            const invalidIds = {
              geoPanelIds: [],
              plantIds: []
            };
            this.exploreDataService.setInvalidIds(invalidIds);
            if (inventoryItems) {
              this.common.formatSpotIdsFoES(inventoryItems, this.client_id).then(spots => {
                const places = spots;
                if (this.sessionFilter) {
                  places.map((place) => {
                    place.selected = true;
                    const fid = this.selectedFidsArray.filter((id) => (place.spot_id === id.fid));
                    if (fid.length > 0) {
                      place.selected = fid[0].selected;
                    }
                  });
                  this.sessionFilter = false;
                  this.places = places;
                  // this.modifySearchResultMapFormat();
                } else {
                  this.exploreDataService.setPlaces(places);
                }
              });
            }
          } else {
            if (typeof inventoryItems !== 'undefined') {
              this.common.formatSpotIdsFoES(inventoryItems, this.client_id).then(spots => {
                $.each(spots, (i, val) => {
                  if (this.selectQuery === 'All') {
                    val.selected = true;
                  } else {
                    val.selected = false;
                  }
                  this.places.push(val);
                });
                // this.metricsCalc();
              });
            }
            this.loaderService.display(false);
          }
        }, error => {
          // this.exploreDataService.setPlaces([]);
          this.filterApiCallLoaded = false;
        });
    } else {
      // this.exploreDataService.setPlaces([]);
      this.filterApiCallLoaded = false;
    }
  }
  getInventoryIDsFromES(filtersData) {
    const gpFilter = JSON.parse(JSON.stringify(filtersData));
    this.filterApiCallLoaded = true;
    this.exploreDataService.setSearchCriteria(gpFilter);
    let query = this.inventoryService.prepareInventoryQuery(gpFilter);
    query = this.inventoryService.addTotalSpotQuery(query);
    query = this.inventoryService.addInventoryIdsQuery(query);
    query['size'] = 0;
    return this.inventoryService.getInventoryFromElasticSearch(query)
      .pipe(map(res => {
        const data = {};
        const inventoryIDs = res['aggregations']['ids']['buckets'].map(spot => {
          return spot.key;
        });
        data['inventoryIDs'] = inventoryIDs;
        data['total'] = res['aggregations']['spot_count']['value'];
        return data;
      }));
  }
  searchFromGPFilter(filtersData, initialCall = false, sort = false, paging = false) {
    if (this.clearGPFIltertimeout != null) {
      this.clearGPFIltertimeout.unsubscribe();
    }
    const gpFilter = JSON.parse(JSON.stringify(filtersData));
    if (paging && this.page > 1) {
      gpFilter['page'] = this.page;
    } else {
      this.page = 1;
    }
    // Commmented based on client comment to remove loader.
    /* if (!paging) {
      this.loaderService.display(true);
    } */
    if (gpFilter['location']) {
      delete gpFilter['location'];
    }
    this.filterApiCallLoaded = true;
    /* if (!initialCall) {
      this.exploreService.slowCalcMessage(this.exploreService, 'showing for filter calls');
    } */
    this.exploreDataService.setSearchCriteria(gpFilter);
    // to update filtered details in tabular view
    this.updateTabularView ++;
    if (!initialCall) {
      this.getNationalDataFromAPI(gpFilter);
      if (this.isStatus) {
        this.layersService.pushSearchResultLayer(true);
      }
    } else {
      if (this.isStatus) {
        this.layersService.pushSearchResultLayer(false);
      }
    }
    // Commmented based on client comment to remove loader.
    // this.loaderService.display(true);
    if (!sort) {
      if (initialCall) {
        this.map.setLayoutProperty('frameCluster0', 'visibility', 'visible');
        this.map.setLayoutProperty('frameCluster5', 'visibility', 'visible');
        this.map.setLayoutProperty('frameClusters', 'visibility', 'none');
        this.map.setLayoutProperty('frameCount', 'visibility', 'none');
      }
    }

    let zeroMeasure = true;
    if ((gpFilter['measures_range_list']
    && gpFilter['measures_range_list'].length > 1)) {
      gpFilter['measures_range_list'].forEach((val) => {
        if (val['min'] > 0) {
          zeroMeasure = false;
          return false;
        }
      });
    }
    const r1 = this.inventoryService.getInventorySpotIds(gpFilter).pipe(map(res => {
      const data = {};
      const frame_list = res['inventory_summary']['frame_list'] !== null && res['inventory_summary']['frame_list'] || [];
      data['inventoryIDs'] = frame_list.map(list => {
        return list['spot_id_list'];
      }).flat();
      // inventoryIDs['inventory_summary']['frame_list'].map(list => {
      //   return list['spot_id_list'];
      // })
      data['total'] = res['inventory_summary']['pagination']['number_of_spots'];
      return data;
    }), catchError(error => EMPTY));
    const countAPIs = [r1];
    if (this.customInventories === 'active' && zeroMeasure) {
      countAPIs.push(this.getInventoryIDsFromES(gpFilter).pipe(catchError(error => EMPTY)));
    }
    forkJoin(countAPIs).subscribe(results => {
      let t = 0;
      const inventoryIDs = [];
      results.map((result, index) => {
        t += result['total'];
        if (index === 0) {
          this.totalGPInventory = result['inventoryIDs'].length;
        }
        inventoryIDs.push(...result['inventoryIDs']);
      });
      this.totalInventory = t;
      this.exploreDataService.setFids(inventoryIDs);
      if (typeof inventoryIDs !== 'undefined' && inventoryIDs.length <= 50000) {
        this.getInventories(gpFilter);
        const total = inventoryIDs.length - 100;
        if (total > 0) {
          this.totalPage = Math.ceil(total / 100);
        } else {
          this.totalPage = 0;
        }
      } else {
        this.totalPage = 0;
        this.exploreDataService.setPlaces([]);
        this.filterApiCallLoaded = false;

        // if the inventory ids are more than 50000 or 0 valid ids
        const invalidIds = {
          geoPanelIds: [],
          plantIds: []
        };
        if (gpFilter['id_type'] === 'spot_id') {
          invalidIds.geoPanelIds = gpFilter['id_list'];
        }

        if (gpFilter['id_type'] === 'plant_frame_id') {
          invalidIds.plantIds = gpFilter['id_list'];
        }
        this.exploreDataService.setInvalidIds(invalidIds);
      }
      if (!sort) {
        this.layersChanging = true;
        if (!initialCall) {
          // if (this.map.isStyleLoaded()) {
          this.map.setLayoutProperty('frameCluster0', 'visibility', 'none');
          this.map.setLayoutProperty('frameCluster5', 'visibility', 'none');
          this.map.setLayoutProperty('frameClusters', 'visibility', 'visible');
          this.map.setLayoutProperty('frameCount', 'visibility', 'visible');
          // }
        }
        if (this.customPolygon.coordinates.length > 0) {
          // if (this.map.isStyleLoaded()) {
          this.map.setLayoutProperty('customPolygon', 'visibility', 'visible');
          this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'visible');
          // }
        } else {
          // if (this.map.isStyleLoaded()) {
          this.map.setLayoutProperty('customPolygon', 'visibility', 'none');
          this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'none');
          // }
        }
        // Commmented based on client comment to remove loader.
        // this.loaderService.display(true);
        if (this.locationFilterData && this.locationFilterData['placePackState']) {
          let pois = [];
          this.locationFilterData['placePackState']['selectedPlaceDetails'].map(pack => {
            pack['pois'].map(placePois => {
              pois.push(placePois);
            });
          });
          pois = [].concat.apply([], pois);
          const poi = {
            type: 'FeatureCollection',
            features: pois
          };
          setTimeout(() => {
            this.loaderService.display(false);
          }, 1000);
          setTimeout(() => {
            this.map.getSource('poiDataSet').setData(poi);
            this.map.setLayoutProperty('pointOfInterests', 'visibility', 'visible');
          }, 500);
        } else {
          if (this.map.getLayer('pointOfInterests')) {
            this.map.setLayoutProperty('pointOfInterests', 'visibility', 'none');
          }
          this.loaderService.display(false);
        }
      } else {
        this.loaderService.display(false);
      }
      if (this.filterService.isSessionFilter) {
        this.updateBubblesCount(true);
      }
      this.filterService.isSessionFilter = false;
    }, error => {
      this.filterApiCallLoaded = false;
      this.loaderService.display(false);
    });

    /* COMMENTED: When implementing custom DB PP-519 */
    /* this.clearGPFIltertimeout = this.inventoryService.getInventorySpotIds(gpFilter)
      .pipe(tap(res => {
        this.totalInventory = res['inventory_summary']['pagination']['number_of_spots'];
      }), map(inventoryIDs => inventoryIDs['inventory_summary']['frame_list'].map(list => {
        return list['spot_id_list'];
      }).flat()))
      .subscribe(inventoryIDs => {
        this.exploreDataService.setFids(inventoryIDs);
        if (typeof inventoryIDs !== 'undefined' && inventoryIDs.length <= 50000) {
          this.getInventories(gpFilter);
          const total = inventoryIDs.length - 100;
          if (total > 0) {
            this.totalPage = Math.ceil(total / 100);
          } else {
            this.totalPage = 0;
          }
        } else {
          this.totalPage = 0;
          this.exploreDataService.setPlaces([]);
          this.filterApiCallLoaded = false;

          // if the inventory ids are more than 50000 or 0 valid ids
          const invalidIds = {
            geoPanelIds: [],
            plantIds: []
          };

          if (gpFilter['id_type'] === 'spot_id') {
            invalidIds.geoPanelIds = gpFilter['id_list'];
          }

          if (gpFilter['id_type'] === 'plant_frame_id') {
            invalidIds.plantIds = gpFilter['id_list'];
          }
          this.exploreDataService.setInvalidIds(invalidIds);
        }
        if (!sort) {
          this.layersChanging = true;
          if (!initialCall) {
            // if (this.map.isStyleLoaded()) {
            this.map.setLayoutProperty('frameCluster0', 'visibility', 'none');
            this.map.setLayoutProperty('frameCluster5', 'visibility', 'none');
            this.map.setLayoutProperty('frameClusters', 'visibility', 'visible');
            this.map.setLayoutProperty('frameCount', 'visibility', 'visible');
            // }
          }
          if (this.customPolygon.coordinates.length > 0) {
            // if (this.map.isStyleLoaded()) {
            this.map.setLayoutProperty('customPolygon', 'visibility', 'visible');
            this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'visible');
            // }
          } else {
            // if (this.map.isStyleLoaded()) {
            this.map.setLayoutProperty('customPolygon', 'visibility', 'none');
            this.map.setLayoutProperty('customPolygonStroke', 'visibility', 'none');
            // }
          }
          // Commmented based on client comment to remove loader.
          // this.loaderService.display(true);
          if (this.locationFilterData && this.locationFilterData['placePackState']) {
            let pois = [];
            this.locationFilterData['placePackState']['selectedPlaceDetails'].map(pack => {
              pack['pois'].map(placePois => {
                pois.push(placePois);
              });
            });
            pois = [].concat.apply([], pois);
            const poi = {
              type: 'FeatureCollection',
              features: pois
            };
            setTimeout(() => {
              this.loaderService.display(false);
            }, 1000);
            setTimeout(() => {
              this.map.getSource('poiDataSet').setData(poi);
              this.map.setLayoutProperty('pointOfInterests', 'visibility', 'visible');
            }, 500);
          } else {
            if (this.map.getLayer('pointOfInterests')) {
              this.map.setLayoutProperty('pointOfInterests', 'visibility', 'none');
            }
            this.loaderService.display(false);
          }
        } else {
          this.loaderService.display(false);
        }
        if (this.filterService.isSessionFilter) {
          this.updateBubblesCount(true);
        }
        this.filterService.isSessionFilter = false;
      }, error => {
        this.filterApiCallLoaded = false;
        this.loaderService.display(false);
      }); */
  }

  hoverOnCard(fid) {
    if (this.clearFlagtimeout != null) {
      clearTimeout(this.clearFlagtimeout);
    }
    this.hoverOnInventoryCard = true;
    // Note: before delete this lines please check wheather this lines are causeing any issues in our sites.
    // if (this.zoomLevel < 7) {
    //     this.map.setLayoutProperty('frameClustersStar', 'visibility', 'visible');
    //     this.map.setFilter('frameClustersStar', ['==', 'name', properties.dam]);
    // }
    if (this.zoomLevel >= 7) {
      this.map.setLayoutProperty('showStarPanel', 'visibility', 'visible');
      this.map.setFilter('showStarPanel', ['==', 'fid', fid]);

    }
  }

  hoverOutOnCard() {
    const self = this;
    this.hoverOnInventoryCard = true;
    this.map.setLayoutProperty('showStarPanel', 'visibility', 'none');
    this.map.setLayoutProperty('frameClustersStar', 'visibility', 'none');
    this.map.setFilter('showStarPanel', ['!=', 'fid', 0]);
    this.map.setFilter('frameClustersStar', ['!=', 'name', '']);
    if (this.clearFlagtimeout != null) {
      clearTimeout(this.clearFlagtimeout);
    }
    this.clearFlagtimeout = setTimeout(function () {
      self.hoverOnInventoryCard = false;
    }, 1000);
  }

  zoomOutMap() {
    this.loadingPlaceData = true;
    if (this.map.getLayer('levelLayerData')) {
      this.map.getSource('levelLayerData').setData(this.emptyFeatures);
    }
    if (this.map.getLayer('frameLayerData')) {
      this.map.getSource('frameLayerData').setData(this.emptyFeatures);
    }
    if (this.map.getLayer('footPrintLayerData')) {
      this.map.getSource('footPrintLayerData').setData(this.emptyFeatures);
    }
    if (this.map.getLayer('areaLayerData')) {
      this.map.getSource('areaLayerData').setData(this.emptyFeatures);
    }
    this.levelLayerData = this.emptyFeatures;
    this.venuesClicked = false;
    this.map.fitBounds([[-128.94797746113613, 18.917477970597474], [-63.4, 50.0]]);
  }

  convertToDecimal(val, p) {
    return this.format.convertToDecimalFormat(val, p);
  }

  convertCurrency(x) {
    return this.format.convertCurrencyFormat(x);
  }

  loadVenuesData(feature) {
    const placeid = feature['properties']['id'];
    this.selectedPlaceData = feature;
    this.venuesClicked = true;
    this.exploreService.getVenuesData(placeid).subscribe(res => {
      this.loadingPlaceData = true;
      if (this.map.getSource('levelLayerData')) {
        if (typeof res.levels['features'] === 'undefined') {
          res.levels['features'] = [];
        }
        this.levelLayerData = this.sortLevels(res.levels);
        this.map.getSource('levelLayerData').setData(this.levelLayerData);
      }

      if (this.map.getSource('areaLayerData')) {
        const areas = res.areas;
        if (typeof areas['features'] === 'undefined') {
          areas['features'] = [];
        }
        const areaFeatures = areas['features'];
        areaFeatures.map(area => {
          if (area['properties']['categoryID'] == null) {
            area['properties']['categoryID'] = -1;
          }
        });
        areas['features'] = areaFeatures;
        this.map.getSource('areaLayerData').setData(areas);
      }

      if (this.map.getSource('footPrintLayerData')) {
        this.map.getSource('footPrintLayerData').setData(res.footprint);
      }
      if (this.map.getSource('frameLayerData')) {

        this.map.getSource('frameLayerData').setData(res.frames);
      }
      if (res.levels.features.length <= 0) {
        this.map.setFilter('framesLayer', null);
      }
      if (res.areas.features.length <= 0) {
        this.map.setLayerZoomRange('footPrintLayer', 10, 20);
      }
      this.showLevels = false;
    }, error => {

    });
  }

  changeFloorLevel(levelNumber) {
    this.levelNumber = levelNumber;
    this.loadingPlaceData = true;
    // if (this.map.isStyleLoaded()) {
    this.map.setFilter('areaLayer', ['==', 'levelNumber', levelNumber]);
    this.map.setFilter('levelLayer', ['==', 'levelNumber', levelNumber]);
    // this.map.setFilter("footPrintLayerData", ['==', "levelNumber", levelNumber]);
    this.map.setFilter('framesLayer', ['==', 'levelNumber', levelNumber]);
    // }
  }

  sortLevels(levels) {
    const vals = JSON.parse(JSON.stringify(levels));
    const features = vals['features'];
    features.sort((item1, item2): number => {
      if (item1['properties']['levelNumber'] > item2['properties']['levelNumber']) {
        return 1;
      }
      if (item1['properties']['levelNumber'] < item2['properties']['levelNumber']) {
        return -1;
      }
      return 0;
    });
    levels['features'] = features;
    return levels;
  }

  toggleLevels() {
    this.showLevels = !this.showLevels;
  }

  togglePlaceMoreInfo() {
    this.showPlaceMoreInfo = !this.showPlaceMoreInfo;
  }

  buildPlaceFramePopup(e, i = 0, map, popup, layer) {
    const self = this;
    this.features = map.queryRenderedFeatures(e.point, { layers: [layer] });
    const feature = this.features[i];
    this.current_page = i;
    this.current_e = e;
    this.hideplaceMapViewPopup = false;
    const htmlContent = this.getPlaceFramePopupHTML(feature);
    this.detailPlacePopupDescription = htmlContent;
    if (!this.mobileView) {
      if (popup.isOpen()) {
        popup.remove();
      }
      setTimeout(function () {
        popup.setLngLat(self.features[0].geometry.coordinates.slice())
          .setHTML(htmlContent).addTo(map);
        self.loadPlaceFrameFunction(popup, map, feature);
      }, 100);
    } else {
      setTimeout(function () {
        popup.setLngLat(self.features[0].geometry.coordinates.slice())
          .setHTML(htmlContent);
        self.loadPlaceFrameFunction(popup, map, feature);
      }, 100);
    }
  }

  getPlaceFramePopupHTML(feature, type = 'map') {
    const i = this.current_page + 1;
    this.popOpenedType = type;
    const prop = feature.properties;
    const orientation = prop.o;
    const cls = 'z-depth-2 mapPopUpBlk placeFrames';
    const description =
      `<div class='${cls}'>
        <div class='mapPopUpBlk2'>
          <div class='mapPopUpBlk2-content'>
            <div class='mapPopupLeftPanel'>
              <img src='../../assets/images/tiles_place_based.svg' style='width:180px;height:180px'>
            </div>
            <div class='mapPopupRightPanel'>
              <div class='panel_nav'>
                <div class=''>
                  <a href="javascript:void(0);" class="prevPlaceFrame"><i class="material-icons">navigate_before</i></a>
                </div>
                <div class='panel_nav_text'> ${i}/${this.features.length}</div>
                <div class=''>
                  <a href="javascript:void(0);" class="nextPlaceFrame"><i class="material-icons">navigate_next</i></a>
                </div>
              </div>
              <div class='panel_content'>
                <!-- Heading Start -->
                <div class='panel_header'>
                  <span class="oppTitle">${this.common.truncateString(this.format.checkAndPopulate(prop.operator, false, true), 10, true)}</span>
                </div>
                <!-- Heading End -->
                <ul>
                  <li><span title="${this.getBoardType(prop, true, 'frames')}">${this.getBoardType(prop, false, 'frames')}</span></li>
                  <li><span title="${prop.companyFrameID}">Operator Spot ID: ${prop.companyFrameID !== 'null' ? this.common.truncateString(prop.companyFrameID, 7, true) : 'undefined'}</span></li>
                  <li><span title="${prop.id}">Geopath Spot ID: ${feature.id}</span></li>
                  <li><span>H: ${this.format.getFeetInches(prop.frameHeight)} / W: ${this.format.getFeetInches(prop.frameWidth)}</span></li>
                  <li><span>Orientation: ${orientation.getOrientation(prop.orientation)}</span></li>
                </ul>
              </div>
          </div>
        </div>
      </div>`;

    return description;
  }

  loadPlaceFrameFunction(popup, map, feature) {
    var self = this;
    $('.nextPlaceFrame').off().on('click',
      function (e) {
        self.nextPlaceFrame(popup, map);
        return false;
      });
    $('.prevPlaceFrame').off().on('click',
      function (e) {
        self.prevPlaceFrame(popup, map);
        return false;
      });
  }

  nextPlaceFrame(popup, map) {
    var e = this.current_e;
    var i = this.current_page + 1;
    if (i >= this.features.length) {
      i = 0;
    }
    this.current_page = i;
    var feature = this.features[i];
    var description = this.getPlaceFramePopupHTML(feature);
    if (this.mobileView) {
      this.detailPlacePopupDescription = description;
      popup.setHTML(description);
      setTimeout(() => {
        this.loadPlaceFrameFunction(popup, map, feature);
      }, 100);
    } else {
      popup.setHTML(description);
      this.loadPlaceFrameFunction(popup, map, feature);
    }
  }

  prevPlaceFrame(popup, map) {
    var e = this.current_e;
    var i = this.current_page - 1;
    var len = this.features.length;
    if (i < 0) {
      i = this.features.length - 1;
    }
    this.current_page = i;
    var feature = this.features[i];
    var description = this.getPlaceFramePopupHTML(feature);
    if (this.mobileView) {
      this.detailPlacePopupDescription = description;
      popup.setHTML(description);
      setTimeout(() => {
        this.loadPlaceFrameFunction(popup, map, feature);
      }, 100);
    } else {
      popup.setHTML(description);
      this.loadPlaceFrameFunction(popup, map, feature);
    }
  }

  buildPointOfInterestPopup(e, i = 0, map, popup, layer) {
    const self = this;
    this.features = map.queryRenderedFeatures(e.point, { layers: [layer] });
    const feature = this.features[i];
    this.current_page = i;
    this.current_e = e;
    this.hideplaceMapViewPopup = false;
    const htmlContent = this.getPointsOfIntersetPopupHTML(feature);

    if (!this.mobileView) {
      if (popup.isOpen()) {
        popup.remove();
      }
      setTimeout(function () {
        this.detailPlacePopupDescription = htmlContent.innerHTML;
        popup.setLngLat(self.features[0].geometry.coordinates.slice())
          .setHTML(htmlContent.innerHTML).addTo(map);
        self.loadPoiPopupFunction(popup, map, feature);
      }, 100);
    } else {
      setTimeout(function () {
        this.detailPlacePopupDescription = htmlContent.innerHTML;
        popup.setLngLat(self.features[0].geometry.coordinates.slice())
          .setHTML(htmlContent.innerHTML);
        self.loadPoiPopupFunction(popup, map, feature);
      }, 100);
    }
  }

  getPointsOfIntersetPopupHTML(feature, type = 'map') {
    // Inject Component and Render Down to HTMLDivElement Object
    const inventoryInformation = {
      currentPage: this.current_page + 1,
      type: type,
      feature: feature,
      features: this.features
    };
    let popupContent = this.dynamicComponentService.injectComponent(ExploreInventoryIntersetComponent, x => x.interset = inventoryInformation);
    return popupContent;
  }

  loadPoiPopupFunction(popup, map, feature) {
    var self = this;
    $('.nextPoiFrame').off().on('click',
      function (e) {
        self.nextPoiFrame(popup, map);
        return false;
      });
    $('.prevPoiFrame').off().on('click',
      function (e) {
        self.prevPoiFrame(popup, map);
        return false;
      });
  }

  nextPoiFrame(popup, map) {
    var e = this.current_e;
    var i = this.current_page + 1;
    if (i >= this.features.length) {
      i = 0;
    }
    this.current_page = i;
    var feature = this.features[i];
    var description = this.getPointsOfIntersetPopupHTML(feature);
    if (this.mobileView) {

      setTimeout(() => {
        this.detailPlacePopupDescription = description.innerHTML;
        popup.setHTML(description.innerHTML);
        this.loadPoiPopupFunction(popup, map, feature);
      }, 100);
    } else {
      setTimeout(() => {
        popup.setHTML(description.innerHTML);
        this.loadPoiPopupFunction(popup, map, feature);
      }, 100)
    }
  }

  prevPoiFrame(popup, map) {
    var e = this.current_e;
    var i = this.current_page - 1;
    var len = this.features.length;
    if (i < 0) {
      i = this.features.length - 1;
    }
    this.current_page = i;
    var feature = this.features[i];
    var description = this.getPointsOfIntersetPopupHTML(feature);
    if (this.mobileView) {
      setTimeout(() => {
        this.detailPlacePopupDescription = description.innerHTML;
        popup.setHTML(description.innerHTML);
        this.loadPoiPopupFunction(popup, map, feature);
      }, 100);
    } else {
      setTimeout(() => {
        popup.setHTML(description.innerHTML);
        this.loadPoiPopupFunction(popup, map, feature);
      }, 100)
    }
  }


  backingScale() {
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
      return window.devicePixelRatio;
    }
    return 1;
  }

  changeTotalPage(total) {
    this.totalPage = total;
  }

  hideMobileMapViewPopup() {
    this.hideMapViewPopup = true;
    if (!this.sidebarState && this.checkPopupSource !== 'map') {
      this.toggleSideBarState();
    }
  }

  hidePlaceMobileMapViewPopup() {
    this.hideplaceMapViewPopup = true;
    this.detailPlacePopupDescription = '';
  }

  getImpressions(prop) {
    if (this.allowInventoryAudience !== 'hidden') {
      if (prop.totwi !== undefined && prop.totwi > 0) {
        return `Weekly Impressions: ${this.abbrNum(prop.totwi, 0)}`;
      } else {
        return 'Weekly Impressions: Under review';
      }
    } else {
      return false;
    }
  }

  getBoardType(prop, fullValue = false, type = 'panel') {
    let boardType = '';
    if (type == 'frames') {
      boardType = this.exploreDataService.getMediaGroup(prop.mediaTypeID) + ' :: ' + prop.mediaType;
    }
    else {
      boardType = this.exploreDataService.getMediaGroup(prop.mtid) + ' :: ' + prop.mt;
    }

    if (!fullValue) {
      boardType = this.common.truncateString(boardType, 15, true);
    }
    return boardType;
  }

  checkSelected(feature) {
    if (this.selectedFidsArray.length > 0) {
      const selected = this.selectedFidsArray.filter(place => (place.fid === feature.properties.fid));
      let selectedFeature;
      selectedFeature = selected[0];
      if (this.allowInventoryAudience !== 'hidden') {
        if (selected.length <= 0 || !selectedFeature['selected']) {
          return 'Select';
        } else {
          return 'Selected';
        }
      }
    }
  }

  getNoImage() {
    this.mobileImageSrc = '../../assets/images/no_photo.png';
  }

  openMobilePopup(place, zoom, type = 'map') {
    this.mapFeature = place;
    setTimeout(() => {
      const element = document.getElementById('mobile-popup-impressions');
      if (element) {
        element.innerHTML = '<span>' + 'Weekly Impressions:<div id="loader"></div>';
      }
    }, 100);
    this.checkPopupSource = type;
    this.mobileImageSrc = this.getImage(place.properties);
    this.detailPopupDescription = '';
    if (type !== 'map') {
      this.map.flyTo({ center: place.geometry.coordinates, zoom: zoom, animate: true });
      this.map.once('moveend', () => {
        this.hideMapViewPopup = false;
        this.getStaticMapUrl(place.geometry.coordinates, type);
        clearTimeout(this.inventoryDetailTimer);
        setTimeout(() => {
          this.loadFunction(this.mapPopup, this.map, place);
        }, 100);
      });
    } else {
      /*this.mapPopup
      .setLngLat(place.geometry.coordinates)
      .addTo(this.map);*/
      this.hideMapViewPopup = false;
      this.staticMapURL = '';
      clearTimeout(this.inventoryDetailTimer);
      setTimeout(() => {
        this.loadFunction(this.mapPopup, this.map, place);
      }, 100);
    }
    this.getSingleInventory(place, 'mobile');
  }


  getStaticMapUrl(coOrds, type) {
    switch (type) {
      case 'pdf':
        this.staticMapURL = this.exploreDataService.getStaticMapImage(coOrds, 330, 145);
        break;
      case 'mapView':
        this.staticMapURL = this.exploreDataService.getStaticMapImage(coOrds, 768, 125);
        break;
      case 'mobile':
        this.staticMapURL = this.exploreDataService.getStaticMapImage(coOrds, 768, 125);
        break;
      default:
        this.staticMapURL = this.exploreDataService.getStaticMapImage(coOrds, 243, 145);
        break;
    }
  }

  private updateBubblesCount(isLoader = false) {
    // if ( this.selectQuery === 'All') {
    //  * getting last value from the observable, This is possible with
    //  * BehaviourSubject Don't abuse this getValue with Subscribers,
    //  * Subscribers are declerative and getValue is imperative paradigm.
    //  *
    //  * If you need to use getValue in your code you're probably doing
    //  * something wrong. This one is a valid use case following a sound
    //  * research.

    // this.setNationalLevelData(this.exploreDataService.nationalFeatures.getValue());
    // return;
    // }
    if (this.selectQuery === 'None') {
      this.exploreDataService.setNationalFeatures({ 'type': 'FeatureCollection', 'features': [] });
      return;
    }
    const filters = this.exploreDataService.getSearchCriteria();
    const selectedIds = this.selectedFidsArray.filter(fid => fid.selected);
    let fids = selectedIds.map(id => id.fid);
    if (this.selectedFidsArray.length < 50001) {
      if (fids.length <= 0) {
        fids = [0];
      }
      filters['id_list'] = fids;
      filters['id_type'] = 'spot_id';
    } else {
      delete filters['id_list'];
      delete filters['id_type'];
    }
    this.getNationalDataFromAPI(filters, isLoader);
  }

  private getNationalDataFromAPI(filters, isLoader = false) {
    const requests = [];
    requests.push(this.inventoryService
      .getMarketTotals(filters, isLoader).pipe(catchError(error => EMPTY)));
    if (this.customInventories && this.customInventories === 'active' && !this.checkMeasuresPresence(filters)) {
      let query = this.inventoryService.prepareInventoryQuery(filters);
      query = this.inventoryService.nationalLevelElasticQuery(query);
      requests.push(this.inventoryService.getInventoryFromElasticSearch(query).pipe(catchError(error => EMPTY)));
    }
    forkJoin(requests).subscribe(results => {
      const marketTotals = results[0];
      if (results[1] && results[1]['aggregations']['states'] && results[1]['aggregations']['states']['buckets'].length) {
        results[1]['aggregations']['states']['buckets'].forEach((state) => {
          const index = marketTotals['features'].findIndex((feature) => {
            return feature.properties.id.split('DMA')[1] === state.key;
          });
          if (index >= 0) {
            marketTotals['features'][index]['properties']['panelCount'] += state.spot_count.value;
          } else {
            const temp = {};
            temp['type'] = 'Feature';
            temp['geometry'] = {
              coordinates: [state.center_lon.value, state.center_lat.value],
              type: 'Point'
            };
            temp['properties'] = {};
            temp['properties']['id'] = `DMA${state.key}`;
            temp['properties']['name'] = '';
            temp['properties']['panelCount'] = state.spot_count.value;
            marketTotals['features'].push(temp);
          }
        });
        this.exploreDataService.setNationalFeatures(marketTotals);
      } else {
        this.exploreDataService.setNationalFeatures(marketTotals);
      }
    });
  }

  editInventoryPackage(p) {
    this.openPackage('edit', p, true);
  }

  dragChange(event) {
    this.draggedHeight = event - 131;
    setTimeout(() => {
      this.map.resize({ mapResize: true });
    }, 200);
  }

  tabularPanelState(event) {
    this.isVisible = event;
  }

  updateFidsInfo(session) {
    this.selectedFidsArray = session['data']['selectedFids'];
    this.selectedCount = this.selectedFidsArray.filter(fid => fid.selected).length;
    if (session['data']['selectQuery'] === 'Custom') {
      this.places = session['data']['places'];
    }
  }

  calculateMapHeight(evet) {
    this.styleHeight = evet;
    if (evet && evet !== 'close') {
      this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + evet);
      this.styleHeightBack = this.mapHeight;
      /*  if (window.innerWidth >= 940) {
          this.styleHeight = {
            height: `${evet - 110}px`
          };
          this.styleHeightBack = this.styleHeight;
        }else {
          this.styleHeight = {
            height: `${evet - 160}px`
          };
          this.styleHeightBack = this.styleHeight;
        }*/
    } else {
      if (this.mapViewPostionState === 'tabularView') {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + 250);
        this.mapWidth = this.dimensionsDetails.windowWidth - 40;
      } else {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight);
      }

      /* this.styleHeight = {};
       this.styleHeightBack = { };*/
    }
    setTimeout(() => {
      this.map.resize({ mapResize: true });
    }, 200);
  }

  calculateMapWidth(event) {
    if (this.mapViewPostionState === 'topZipMarketView') {
      this.mapWidth = ((this.dimensionsDetails.windowWidth - 40) - event);
      /*  const mWidth = (this.mapWidth / this.dimensionsDetails.windowWidth) * 100;
        const css = '.top-zip-print .map-div  canvas, .map-div{ width:'+ mWidth +'vw !important; } .explore-top-zip-market-content  canvas, .explore-top-zip-market-content, .explore-top-zip-market-block { width:'+ (100-mWidth) +'vw !important;} '
        const printStyle = document.getElementById('printId');
        if (printStyle !== null) {
          printStyle.remove();
        }
        const body = document.getElementsByTagName('body')[0];
        const style = document.createElement('style');
        style.id = 'printId';
        style.type = 'text/css';
        style.media = 'print';
        style.appendChild(document.createTextNode(css));
        body.appendChild(style);*/
    } else if (this.sidebarState) {
      this.mapWidth = this.dimensionsDetails.windowWidth - 390;
    } else {
      this.mapWidth = this.dimensionsDetails.windowWidth - 40;
    }
    setTimeout(() => {
      this.map.resize({ mapResize: true });
    }, 200);

  }

  openPackage(type = 'add', p = null, saveFromFilter = false) {
    if (this.selectedCount <= 0) {
      swal('Warning', 'Please select atleast one inventory', 'warning');
      return true;
    }
    this.filterService.openPackage(type, p, saveFromFilter, this.selectedFidsArray, this.selectedPackage);
  }

  public filterByPlaceSets(polygonInfo) {
    this.removePolygon(false);
    this.placeSetsDisplay = true;
    this.polygonInfo = polygonInfo;
    if (polygonInfo.radiusValue > 0) {
      this.polygonData = polygonInfo.featureCollection;
      this.customPolygon.coordinates = polygonInfo.polygon.geometry.coordinates;
      this.togglePolygonLayerView(true);
    }
    this.exploreDataService.savePlaceSetInfo(polygonInfo);
    this.exploreDataService.setSelectedPlacesCtrlValue(polygonInfo.selectedPlaces);
    this.exploreDataService.setRadiusCtrlValue(polygonInfo.radiusValue);
    this.filterService.setFilter('location',
      { region: this.customPolygon, type: 'placeSetView', placePackState: polygonInfo });
  }

  private removePlaceSetsPolygon() {
    this.loaderService.display(true);
    this.placeSetsDisplay = false;
    this.polygonInfo = {};
    this.exploreDataService.setSelectedPlacesCtrlValue([]);
    this.exploreDataService.setRadiusCtrlValue('');
    this.exploreDataService.savePlaceSetInfo({});
    this.customPolygon.coordinates = [];
    this.polygonData.features = [];
    this.loaderService.display(false);
  }

  public loadDynamicMapView(region) {
    const boundBox = bbox(region);
    this.map.fitBounds(boundBox);
    this.dynamicMapView = 1;
  }

  public removeDynamicMapView() {
    this.dynamicMapView = 0;
  }

  onMobileMapHeight() {
    this.mapWidth = this.dimensionsDetails.windowWidth;
    if (this.sidebarState) {
      if (this.dimensionsDetails.orientation === 'portrait') {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + 365);
        this.inventoryPanelHeight = 167;
      } else {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + 250);
        this.inventoryPanelHeight = 100;
      }
    } else {
      if (this.dimensionsDetails.orientation === 'portrait') {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + 120);
      } else {
        this.mapHeight = this.dimensionsDetails.windowHeight - (this.dimensionsDetails.headerHeight + 80 + 40);
      }
    }
    setTimeout(() => {
      this.map.resize({ mapResize: true });
      if (this.isSaveMapPosition) {
        this.setMapPosition();
      }
    }, 200);
  }

  resizeLayout() {
    if (this.mobileView && this.dimensionsDetails.windowWidth < 768) {
      this.onMobileMapHeight();
    } else {
      if (this.mapViewPostionState === 'topZipMarketView') {
        this.mapWidth = ((this.dimensionsDetails.windowWidth - 40) / 2);
        /*   const mWidth = (this.mapWidth / this.dimensionsDetails.windowWidth) * 100;
          const css = '.top-zip-print .map-div  canvas, .map-div{ width:'+ mWidth +'vw !important; } .explore-top-zip-market-content  canvas, .explore-top-zip-market-content, .explore-top-zip-market-block { width:'+ (100-mWidth) +'vw !important;}'
          const printStyle = document.getElementById('printId');
          if (printStyle !== null) {
            printStyle.remove();
          }
          const body = document.getElementsByTagName('body')[0];
          const style = document.createElement('style');
          style.id = 'printId';
          style.type = 'text/css';
          style.media = 'print';
          style.appendChild(document.createTextNode(css));
          body.appendChild(style);*/
      } else if (this.sidebarState) {
        this.mapWidth = this.dimensionsDetails.windowWidth - 390;
      } else {
        this.mapWidth = this.dimensionsDetails.windowWidth - 40;
      }
      if (this.mapViewPostionState === 'tabularView') {
        if (this.styleHeight && this.styleHeight !== 'close') {
          this.mapHeight = this.dimensionsDetails.windowHeight - (this.styleHeight + this.dimensionsDetails.headerHeight);
        } else {
          if (this.styleHeightBack) {
            this.mapHeight = this.styleHeightBack;
          } else {
            this.mapHeight = this.dimensionsDetails.windowHeight - (250 + this.dimensionsDetails.headerHeight);
          }
        }
      } else {
        this.mapHeight = this.dimensionsDetails.windowHeight - this.dimensionsDetails.headerHeight;
      }
      setTimeout(() => {
        this.map.resize({ mapResize: true });
        if (this.viewLayerApplied) {
          this.adjustCustomLogoTextPosition();
        }
        if (this.isSaveMapPosition) {
          this.setMapPosition();
        }
      }, 200);
    }
  }
  private adjustCustomLogoTextPosition() {
    const element = document.getElementById('map-div-block');
    if (element) {
      const layersSession = this.layersService.getlayersSession();
      const containerHeight = element.clientHeight;
      const containerWidth = element.clientWidth;
      if (document.getElementById('map-div-block') && this.mapWidthHeight['width']) {
        if (layersSession && layersSession['display']) {
          if (layersSession['display']['text'] && layersSession['display']['text']['text']) {
            const p = this.getRadioPosition(
              this.mapWidthHeight,
              { height: containerHeight, width: containerWidth }, this.activeDraggableTextPosition, 'customTextElement');
            this.customTextStyle['top'] = p['top'] + 'px';
            this.customTextStyle['left'] = p['left'] + 'px';
            this.activeDraggableTextPosition = {
              x: p['left'],
              y: p['top']
            };
            this.layerDisplayOptions['text']['position'] = {
              'top': p['top'],
              'left': p['left']
            };
          }
        }
        let logoInformation = {};
        if (this.layersService.customLogo['logo'] && this.layersService.customLogo['logo']['url']) {
          if (this.layersService.customLogo['logo']['url']) {
            logoInformation = this.layersService.customLogo['logo'];
          }
        } else if (layersSession['display']) {
          if (layersSession['display']['logo'] && layersSession['display']['logo']['url']) {
            logoInformation = layersSession['display']['logo'];
          }
        }
        if (logoInformation['url']) {
          const p = this.getRadioPosition(
            this.mapWidthHeight,
            { height: containerHeight, width: containerWidth }, this.activeDraggablePosition, 'customLogoElement');
          this.logoStyle['top'] = p['top'] + 'px';
          this.logoStyle['left'] = p['left'] + 'px';
          this.activeDraggablePosition = {
            x: p['left'],
            y: p['top']
          };
          if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
            this.layerDisplayOptions['logo'] = {};
          }
          logoInformation['position'] = {
            'top': p['top'],
            'left': p['left']
          };
          this.layerDisplayOptions['logo']['position'] = {
            'top': p['top'],
            'left': p['left']
          };
        }

      }
      this.mapWidthHeight = { height: containerHeight, width: containerWidth };
      this.layerDisplayOptions['screen'] = this.mapWidthHeight;
      this.layersService.setDisplayOptions(this.layerDisplayOptions);
    }
  }
  getRadioPosition(screen, current, position, containerId) {
    const element = document.getElementById(containerId);
    let top = 0;
    let left = 0;
    if (element) {
      const containerHeight = element.clientHeight;
      const containerWidth = element.clientWidth;
      if (screen['width'] < current['width']) {
        const increasePercentage = (current['width'] - screen['width']) / current['width'] * 100;
        left = Math.round(position['x'] + ((position['x'] / 100) * increasePercentage));
      } else if (screen['width'] > current['width']) {
        const decreasePercentage = (screen['width'] - current['width']) / screen['width'] * 100;
        left = Math.round(position['x'] - ((position['x'] / 100) * decreasePercentage));
      } else {
        left = position['x'];
      }
      if ((left + containerWidth) > current['width']) {
        left = (current['width'] - containerWidth - 20);
      } else if (left < 0) {
        left = 10;
      }
      if (screen['height'] < current['height']) {
        const increasePercentage = (current['height'] - screen['height']) / current['height'] * 100;
        top = Math.round(position['y'] + ((position['y'] / 100) * increasePercentage));
      } else if (screen['height'] > current['height']) {
        const decreasePercentage = (screen['height'] - current['height']) / screen['height'] * 100;
        top = Math.round(position['y'] - ((position['y'] / 100) * decreasePercentage));
      } else {
        top = position['y'];
      }
      if ((top + containerHeight) > current['height']) {
        top = (current['height'] - containerHeight - 20);
      } else if (top < 0) {
        top = 10;
      }
    }
    return { top: top, left: left };
  }
  private setMapPosition() {
    const sessionFilter = this.filterService.getExploreSession();
    if (sessionFilter && sessionFilter['data'] && sessionFilter['data']['mapPosition']) {
      const boundBox = bbox(sessionFilter['data']['mapPosition']);
      this.map.fitBounds(boundBox, {}, { polygonData: sessionFilter['data']['mapPosition'], eventType: 'session' });
    } else {
      this.map.fitBounds(
        this.mapBounds, {}, { eventType: 'default' }
      );
    }
    this.isSaveMapPosition = true;
  }

  public toggleLocationFilterLayer(checked) {
    this.togglePolygonLayerView(checked);
  }

  getMarket(id) {
    const market = this.inventoryMarketData.find(m => m.id === id);
    return market;
  }

  private applyViewLayers() {
    this.loaderService.display(true);
    const layersSession = this.layersService.getlayersSession();
    this.layersService.setClearLogoStyle(true);
    if (layersSession && layersSession['display']) {
      const mapStyle = layersSession['display']['baseMap'];
      this.style = this.common.getMapStyle(this.baseMaps, mapStyle);
      layersSession['display']['baseMap'] = this.style['label'];
      if (layersSession['display']['baseMap'] && this.mapStyle !== layersSession['display']['baseMap']) {
        if (this.mapPopup.isOpen()) {
          this.mapPopup.remove();
        }
        this.mapStyle = layersSession['display']['baseMap'];
        this.style = this.common.getMapStyle(this.baseMaps, this.mapStyle);
        this.map.setStyle(this.style['uri']);
        this.map.once('style.load', () => {
          this.closeTopMapZipCode();
          this.map.fitBounds(this.mapBounds);
          this.map.setZoom(this.zoomLevel);
          // this.loadViewLayers();
        });
      } else {
        this.viewLayerApplied = true;
        if (typeof layersSession['display']['mapLegend'] !== 'undefined') {
          this.showMapLegend = layersSession['display']['mapLegend'];
        }
        if (typeof layersSession['display']['mapControls'] !== 'undefined') {
          this.showMapControls = layersSession['display']['mapControls'];
        }
        if (typeof layersSession['display']['isLogoEnabled'] !== 'undefined') {
          this.showCustomLogo = layersSession['display']['isLogoEnabled'];
        }
        if (typeof layersSession['display']['isTextEnabled'] !== 'undefined') {
          this.showCustomText = layersSession['display']['isTextEnabled'];
        }
        if (this.map.getLayer('grayed_frames_panel')) {
          if (!this.layerDisplayOptions.showUnselectedInventory) {
            this.map.setLayoutProperty('grayed_frames_panel', 'visibility', 'none');
          } else {
            this.map.setLayoutProperty('grayed_frames_panel', 'visibility', 'visible');
          }
        }
        if (this.map.getLayer('mapLabel')) {
          if (!this.layerDisplayOptions.mapLabel) {
            this.map.setLayoutProperty('mapLabel', 'visibility', 'none');
          } else {
            this.map.setLayoutProperty('mapLabel', 'visibility', 'visible');
            const text = [];
            if (this.layerDisplayOptions.mapLabels['geopath spot IDs']) {
              text.push('{fid}');
            }
            if (this.layerDisplayOptions.mapLabels['operator spot IDs']) {
              text.push('{pid}');
            }
            if (this.layerDisplayOptions.mapLabels['place name']) {
              text.push('{opp}');
            }
            if (this.layerDisplayOptions.mapLabels['place address']) {
              text.push('{st}');
            }
            if (text.length > 0) {
              const value = text.join('\n');
              this.map.setLayoutProperty('mapLabel', 'text-field', value);
            } else {
              this.map.setLayoutProperty('mapLabel', 'visibility', 'none');
            }
          }
        }
        if (layersSession['display']) {
          if (layersSession['display']['screen']) {
            this.mapWidthHeight = layersSession['display']['screen'];
          }
          if (layersSession['display']['text'] && layersSession['display']['text']['text']) {
            this.displayTextInfo = {
              text: layersSession['display']['text']['text'], backgroundWhite: layersSession['display']['text']['backgroundWhite']
            };
            if (layersSession['display']['text']['position']) {
              this.customTextStyle['top'] = layersSession['display']['text']['position']['top'] + 'px';
              this.customTextStyle['left'] = layersSession['display']['text']['position']['left'] + 'px';
              this.customTextStyle['width'] = layersSession['display']['text']['size']['width'] + 'px';
              this.customTextStyle['height'] = layersSession['display']['text']['size']['height'] + 'px';
              this.activeDraggableTextPosition = {
                x: layersSession['display']['text']['position']['left'],
                y: layersSession['display']['text']['position']['top']
              };
            } else {
              setTimeout(() => {
                this.customTextStyle['width'] = '200px';
                const element = document.getElementById('map-div-block');
                const textElement = document.getElementById('customTextElement');
                // TODO : Later will update the dummy variable
                let dummyTop = 0;
                let dummyLeft = 0;
                let dummyCustomStyle = {};
                if (element && textElement) {
                  const containerHeight = element.clientHeight;
                  const containerWidth = element.clientWidth;
                  const height = textElement.clientHeight > 350 ? 350 : textElement.clientHeight + 20;
                  this.customTextStyle['height'] = height + 'px';
                  const top = (containerHeight - height - 50);
                  const left = (containerWidth - 200 - 20);
                  this.customTextStyle['top'] = top + 'px';
                  this.customTextStyle['left'] = left + 'px';
                  //TODO : later will update the dummys
                  dummyCustomStyle['width'] = '200px';
                  dummyCustomStyle['top'] = top + 'px';
                  dummyCustomStyle['left'] = left + 'px';
                  dummyCustomStyle['height'] = height + 'px';
                  dummyTop = top;
                  dummyLeft = left;
                  this.activeDraggableTextPosition = {
                    x: left,
                    y: top
                  };
                  this.layerDisplayOptions['text']['position'] = {
                    'top': top,
                    'left': left
                  };
                  this.layerDisplayOptions['text']['size'] = {
                    'width': 200,
                    'height': height
                  };
                  this.layersService.setDisplayOptions(this.layerDisplayOptions);
                }
                //TODO : later will update the dummys
                this.activeDraggableTextPosition = {
                  x: dummyLeft,
                  y: dummyTop
                };
                this.customTextStyle = dummyCustomStyle;
              }, 200);
            }
          }
        }
        let logoInformation = {};
        if (this.layersService.customLogo['logo'] && this.layersService.customLogo['logo']['url']) {
          if (this.layersService.customLogo['logo']['url']) {
            logoInformation = this.layersService.customLogo['logo'];
          }
        } else if (layersSession['display']) {
          if (layersSession['display']['logo'] && layersSession['display']['logo']['url']) {
            logoInformation = layersSession['display']['logo'];
          } else if (layersSession['customLogoInfo'] &&
            layersSession['customLogoInfo']['logo'] && layersSession['customLogoInfo']['logo']['url']) {
            logoInformation = layersSession['customLogoInfo']['logo'];
          }
        }
        if (logoInformation['url']) {
          this.logoInfo = {
            url: logoInformation['url'],
            backgroundWhite: logoInformation['backgroundWhite']
          };
          if (logoInformation['position']) {
            this.logoStyle['top'] = logoInformation['position']['top'] + 'px';
            this.logoStyle['left'] = logoInformation['position']['left'] + 'px';
            this.logoStyle['width'] = logoInformation['size']['width'] + 'px';
            this.logoStyle['height'] = logoInformation['size']['height'] + 'px';
            this.activeDraggablePosition = {
              x: logoInformation['position']['left'],
              y: logoInformation['position']['top']
            };
          } else {
            this.logoStyle['width'] = '150px';
            setTimeout(() => {
              const element = document.getElementById('map-div-block');
              const logoElement = document.getElementById('customLogoElement');
              if (element && logoElement) {
                const containerHeight = element.clientHeight;
                const containerWidth = element.clientWidth;
                const top = 10;
                const left = 10;
                this.logoStyle['top'] = top + 'px';
                this.logoStyle['left'] = left + 'px';
                this.logoStyle['height'] = logoElement.clientHeight + 'px';
                const height = logoElement.clientHeight;
                this.activeDraggablePosition = {
                  x: top,
                  y: left
                };
                if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
                  this.layerDisplayOptions['logo'] = {};
                }
                this.layerDisplayOptions['logo']['position'] = {
                  'top': top,
                  'left': left
                };
                logoInformation['position'] = {
                  'top': top,
                  'left': left
                };
                logoInformation['size'] = {
                  'width': 150,
                  'height': height
                };
                this.layerDisplayOptions['logo']['size'] = {
                  'width': 150,
                  'height': height
                };
                if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
                  this.layersService.customLogo['logo']['size'] = {
                    'width': 150,
                    'height': height
                  };
                  this.layersService.customLogo['logo']['position'] = {
                    'top': top,
                    'left': left
                  };
                }
                if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
                  layersSession['customLogoInfo']['logo']['size'] = {
                    'width': 150,
                    'height': height
                  };
                  layersSession['customLogoInfo']['logo']['position'] = {
                    'top': top,
                    'left': left
                  };
                }
                layersSession['display'] = this.layerDisplayOptions;
                this.layersService.saveLayersSession(layersSession);
                this.layersService.setDisplayOptions(this.layerDisplayOptions);
                this.showDragLogo = false;
                setTimeout(() => {
                  this.showDragLogo = true;
                  this.addResizeIcon();
                }, 20);
              }
            }, 1000);
          }
        } else {
          this.logoInfo = {};
          this.logoStyle = {};
        }
        this.loadViewLayers();
      }
    }
    this.addResizeIcon();
    // this.loaderService.display(false);
  }
  loadViewLayers() {
    if (this.layerInventorySetLayers.length > 0) {
      this.layerInventorySetLayers.map(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.off('mouseenter', layerId);
          this.map.off('mouseleave', layerId);
          this.map.removeLayer(layerId);
        }
      });
    }
    if (this.layerInventorySetDataSets.length > 0) {
      this.layerInventorySetDataSets.map(layerId => {
        if (this.map.getSource(layerId)) {
          this.map.removeSource(layerId);
        }
      });
    }
    this.layerInventorySetLayers = [];
    this.layerInventorySetDataSets = [];
    const layersSession = this.layersService.getlayersSession();

    if (layersSession && layersSession['selectedLayers'] && layersSession['selectedLayers'].length > 0) {
      const apiCalls = [];
      for (let i = layersSession['selectedLayers'].length - 1; i >= 0; i--) {
        const layerData = layersSession['selectedLayers'][i];
        switch (layerData.type) {
          case 'inventory collection':

            if (layerData.data['_id'] !== 'default') {
              const mapLayerId = 'layerInventoryLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
              const mapLayerDataId = 'layerViewData' + Date.now().toString(36) + Math.random().toString(36).substr(2);
              // (new Date()).getTime().toString();
              // this.layerInventorySetDataSets.push(mapLayerDataId);
              this.map.addSource(mapLayerDataId, {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: []
                }
              });
              this.layerInventorySetLayers.push(mapLayerId);
              this.map.addLayer({
                id: mapLayerId,
                type: 'symbol',
                source: mapLayerDataId,
                minzoom: 0,
                maxzoom: (layerData['icon'] && layerData['icon'] === 'icon-wink-pb-dig' ? 7 : 17),
                layout: {
                  'text-line-height': 1,
                  'text-padding': 0,
                  'text-anchor': 'bottom',
                  'text-allow-overlap': true,
                  'text-field': layerData['icon'] && layerData['icon'] !== 'icon-wink-pb-dig' && this.markerIcon[layerData['icon']] || this.markerIcon['icon-circle'],
                  'icon-optional': true,
                  'text-font': ['imx-map-font-33 Regular'],
                  'text-size': layerData['icon'] === 'icon-wink-pb-dig' ? 10 : 18,
                  'text-offset': [0, 0.6]
                },
                paint: {
                  'text-translate-anchor': 'viewport',
                  'text-color': layerData['color']
                }
              });
              this.map.on('mouseenter', mapLayerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
              });
              this.map.on('mouseleave', mapLayerId, () => {
                this.map.getCanvas().style.cursor = '';
              });
              const inventroyIds = layerData['data']['inventory']
                .map(inventory => inventory.id);
              const filters: Partial<SummaryRequest> = {
                id_type: 'spot_id',
                id_list: inventroyIds
              };
              apiCalls[i] = this.inventoryService
                .getInventoriesWithAllData(filters)
                .pipe(
                  filter(response => {
                    return (
                      response['inventory_summary']['inventory_items'] &&
                      response['inventory_summary']['inventory_items'].length > 0
                    );
                  }),
                  map(response => {
                    const data = response['inventory_summary']['inventory_items']
                      .map(inventory => {
                        return {
                          type: 'Feature',
                          geometry: inventory['location']['geometry'],
                          properties: {
                            fid: inventory.frame_id || '', // frame_id & spot_id both are equal 
                            opp: this.getOperatorName(inventory.representations),
                            pid: inventory.plant_frame_id || ''
                          }
                        };
                      });
                    return {
                      type: 'FeatureCollection',
                      features: data
                    };
                  }),
                  // Todo : Need to handle unsubscribe differently here, not global component level as these should be short lived observables
                  // takeUntil(this.unSubscribe)
                ).subscribe(result => {
                  this.map.getSource(mapLayerDataId).setData(result);
                  if (layerData['icon'] && layerData['icon'] === 'icon-wink-pb-dig' ? 7 : 17) {
                    const seletedPanels = result.features.map(e => e.properties.fid);
                    const filterData = [];
                    filterData.unshift('all');
                    seletedPanels.unshift('in', 'fid');
                    filterData.push(seletedPanels);
                    const colorFrameLayer = 'layerInventoryColorLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                    this.layerInventorySetLayers.push(colorFrameLayer);
                    this.map.addLayer({
                      id: colorFrameLayer,
                      type: 'circle',
                      source: 'allPanels',
                      'source-layer': this.mapLayers['allPanels']['source-layer'],
                      minzoom: 7,
                      maxzoom: 11,
                      filter: filterData,
                      paint: {
                        'circle-opacity': 0.8,
                        'circle-radius': 3,
                        'circle-color': [
                          'match',
                          ['get', 'mtid'],
                          this.inventoryGroups[0].mtidPrint.concat(this.inventoryGroups[0].mtidDigital),
                          this.inventoryGroups[0].colors[this.mapStyle],
                          this.inventoryGroups[1].mtidPrint.concat(this.inventoryGroups[1].mtidDigital),
                          this.inventoryGroups[1].colors[this.mapStyle],
                          this.inventoryGroups[2].mtidPrint.concat(this.inventoryGroups[2].mtidDigital),
                          this.inventoryGroups[2].colors[this.mapStyle],
                          this.inventoryGroups[3].mtidPrint.concat(this.inventoryGroups[3].mtidDigital),
                          this.inventoryGroups[3].colors[this.mapStyle],
                          this.inventoryGroups[3].colors[this.mapStyle]
                        ]
                      }
                    });
                    this.map.on('mouseenter', colorFrameLayer, () => {
                      this.map.getCanvas().style.cursor = 'pointer';
                    });
                    this.map.on('mouseleave', colorFrameLayer, () => {
                      this.map.getCanvas().style.cursor = '';
                    });
                    const winksFrameLayer = 'layerInventoryWinksLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                    this.layerInventorySetLayers.push(winksFrameLayer);
                    this.map.addLayer({
                      id: winksFrameLayer,
                      type: 'symbol',
                      source: 'allPanels',
                      'source-layer': this.mapLayers['allPanels']['source-layer'],
                      minzoom: 11,
                      filter: filterData,
                      layout: {
                        'text-line-height': 1,
                        'text-padding': 0,
                        'text-anchor': 'bottom',
                        'text-allow-overlap': true,
                        'text-field': [
                          'match',
                          ['get', 'mtid'],
                          this.inventoryGroups[3].mtidPrint, this.inventoryGroups[3].print['symbol'],
                          this.inventoryGroups[2].mtidPrint, this.inventoryGroups[2].print['symbol'],
                          this.inventoryGroups[1].mtidPrint, this.inventoryGroups[1].print['symbol'],
                          this.inventoryGroups[0].mtidPrint, this.inventoryGroups[0].print['symbol'],
                          this.inventoryGroups[3].mtidDigital, this.inventoryGroups[3].digital['symbol'],
                          this.inventoryGroups[2].mtidDigital, this.inventoryGroups[2].digital['symbol'],
                          this.inventoryGroups[1].mtidDigital, this.inventoryGroups[1].digital['symbol'],
                          this.inventoryGroups[0].mtidDigital, this.inventoryGroups[0].digital['symbol'],
                          this.inventoryGroups[2].print['symbol']
                        ],
                        'text-offset': [0, 0.7],
                        'text-optional': true,
                        'text-font': ['imx-map-font-31 map-font-31'],
                        'text-size': 17,
                        'text-rotation-alignment': 'map',
                        'text-rotate': ['get', 'o']
                      },
                      paint: {
                        'text-translate-anchor': 'viewport',
                        'text-color': [
                          'match',
                          ['get', 'mtid'],
                          this.inventoryGroups[3].mtidPrint, this.inventoryGroups[3].colors[this.mapStyle],
                          this.inventoryGroups[2].mtidPrint, this.inventoryGroups[2].colors[this.mapStyle],
                          this.inventoryGroups[1].mtidPrint, this.inventoryGroups[1].colors[this.mapStyle],
                          this.inventoryGroups[0].mtidPrint, this.inventoryGroups[0].colors[this.mapStyle],
                          this.inventoryGroups[3].mtidDigital, this.inventoryGroups[3].colors[this.mapStyle],
                          this.inventoryGroups[2].mtidDigital, this.inventoryGroups[2].colors[this.mapStyle],
                          this.inventoryGroups[1].mtidDigital, this.inventoryGroups[1].colors[this.mapStyle],
                          this.inventoryGroups[0].mtidDigital, this.inventoryGroups[0].colors[this.mapStyle],
                          this.inventoryGroups[2].colors[this.mapStyle]
                        ],
                      }
                    });
                    this.map.on('mouseenter', winksFrameLayer, () => {
                      this.map.getCanvas().style.cursor = 'pointer';
                    });
                    this.map.on('mouseleave', winksFrameLayer, () => {
                      this.map.getCanvas().style.cursor = '';
                    });
                  }
                });
            } else if (layerData.data['_id'] === 'default') {
              this.modifySearchResultMapFormat();
            }
            break;
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
                // minzoom: 0,
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
              this.placesFiltersService.getPlaceSetsSummary(params, true).subscribe(layer => {
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
            this.placesFiltersService.getPlaceSetsSummary(params, false).subscribe(layer => {
              const data = layer['data'][0];
              const layerInfo = {
                type: 'FeatureCollection',
                features: data['pois']
              };
              this.map.getSource(placeSetLayerSource).setData(layerInfo);
            });
            break;
          case 'place':
            const placeLayerId = 'placeLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            const placeLayerDataId = 'placeLayerData' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.layerInventorySetLayers.push(placeLayerId);

            this.addNewPlaceLayer(placeLayerId, placeLayerDataId, layerData, true);
            break;
          case 'geopathId':
            if (typeof layerData['data'] !== 'string') {
              layerData['data'] = layerData['id'];
            }
            const topData = {
              'fid': layerData['data'],
              'replevel': (layerData['heatMapType'] === 'top_markets') ? 'dma' : 'zip_code',
            };
            forkJoin(
              this.inventoryService
                .getSingleInventory({
                    frameId: layerData['data'],
                    'target_segment': this.selectedAudienceID,
                    'target_geography': this.selectedMarket['id'],
                    'base_segment' : this.defaultAudience.audienceKey
                  })
                .pipe(catchError(error => EMPTY)),
              this.exploreService.getInventoryDetailZipDMA(topData).pipe(catchError(error => EMPTY))
            ).subscribe(response => {
              this.layersService.cleanUpMap(this.map);
              if (layerData['heatMapType'] === 'top_markets' && response[1]['data'] && Object.keys(response[1]['data']).length !== 0) {
                this.isKeylegend = true;
                this.layersService.loadTopMarket(response[1], this.map, layerData.color, 'top_markets');
                this.keyLegendColors = this.exploreService.colorGenerater(layerData.color);
                this.currentSingleInventory = topData;
              } else if (layerData['heatMapType'] === 'top_zips' && response[1]['data'] && Object.keys(response[1]['data']).length !== 0) {
                this.layersService.loadTopZipCode(response[1], this.map, layerData.color, 'top_zips');
                this.isKeylegend = true;
                this.keyLegendColors = this.exploreService.colorGenerater(layerData.color);
                this.currentSingleInventory = topData;
              } else {
                this.isKeylegend = false;
                this.keyLegendColors = [];
                this.currentSingleInventory = {};
              }
              if (response[0]['frame']
                && response[0]['frame']['location']) {
                const unitData = {
                  type: 'Feature',
                  geometry: response[0]['frame']['location']['geometry'],
                };
                this.layersService.markInventory(unitData, this.map, layerData.color);
              }
              this.loaderService.display(false);
            });
            // this.addNewViewLayer(geopanel);
            break;
        }
      }
      const selectedGeography = layersSession['selectedLayers'].filter(layer => (layer.type === 'geography'));
      this.removeGeographyLayers();
      if (selectedGeography.length > 0) {
        let geoLayerData = [];
        let geoMarkerIconData = [];

        selectedGeography.forEach(layer => {
          layer['data']['properties']['icon'] = layer['icon'];
          layer['data']['properties']['color'] = layer['color'];
          layer['data']['properties']['id'] = layer['id'];

          const name = layer['data']['properties']['name'];
          let pointGeo = turfCenter(layer['data']);
          pointGeo['properties']['icon'] = layer['icon'];
          pointGeo['properties']['color'] = layer['color'];
          pointGeo['properties']['id'] = layer['id'];
          pointGeo['properties']['name'] = name;

          delete layer['data']['id'];
          delete layer['data']['name'];
          geoLayerData.push(layer['data']);
          geoMarkerIconData.push(pointGeo);
        });
        // to draw the polygon line
        this.map.addSource('geoDataline', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geoLayerData
          }
        });
        // to fill the color inside the polygon area
        this.map.addSource('geoDataFill', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geoLayerData
          }
        });
        // Add the icon in center places of polygon area
        this.map.addSource('geoDataPoint', {
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
            'text-offset': [0, 0.6]
          },
          paint: {
            'text-translate-anchor': 'viewport',
            'text-color': ['get', 'color']
          }
        });
      } else {
        this.removeGeographyLayers();
      }
      if (!layersSession['selectedLayers'].find(layer => layer.type === 'geopathId')) {
        this.isKeylegend = false;
        this.loaderService.display(false);
      }
    } else {
      this.isKeylegend = false;
      this.loaderService.display(false);
      this.removeGeographyLayers();
      this.removeLayers();
    }
  }

  removeGeographyLayers() {
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

  addResizeIcon() {
    setTimeout(() => {
      const elements = document.getElementsByClassName('ng-resizable-se');
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          elements[i].innerHTML = '<svg style="width:24px;height:24px" viewBox="0 0 24 24" class="extand-img"> <path fill="#000000" d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" /></svg>';
        }
      }
    }, 200);
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
    if (this.layerInventorySetDataSets.length > 0) {
      this.layerInventorySetDataSets.map(layerId => {
        if (this.map.getSource(layerId)) {
          this.map.removeSource(layerId);
        }
      });
    }
    this.layerInventorySetDataSets = [];
    this.layerInventorySetLayers = [];
    /* if (this.map.getLayer('color_frames_panel') || this.map.getLayer('frames_panel')) {
      let seletedPanels = [];
      this.selectedFidsArray.map(place => {
        if (place.selected && place.fid !== undefined && place.fid !== undefined && place.fid !== 'undefined') {
          seletedPanels.push(place.fid);
        }
      });

      if (seletedPanels.length <= 0) {
        seletedPanels = [0];
      }
      seletedPanels.unshift('in', 'fid');
      this.map.setLayoutProperty('frames_panel', 'visibility', 'visible');
      this.map.setLayoutProperty('color_frames_panel', 'visibility', 'visible');
        const filters = [];
        filters.unshift('all');
        filters.push(seletedPanels);
        if (this.selectedFidsArray && this.selectedFidsArray.length <= 50000) {
          this.map.setFilter('color_frames_panel', filters);
          this.map.setFilter('frames_panel', filters);
        }
      } */
  }
  private clearLayerView(clearAll = true) {
    this.showMapLegend = true;
    this.showMapControls = true;
    this.logoInfo = {};
    this.displayTextInfo = {};
    this.logoStyle = {};
    this.customTextStyle = {};
    this.activeDraggablePosition = { x: 0, y: 0 };
    this.activeDraggableTextPosition = { x: 0, y: 0 };
    this.mapWidthHeight = {};
    this.showDragLogo = false;
    this.showDragTextLogo = false;
    setTimeout(() => {
      this.showDragLogo = true;
      this.showDragTextLogo = true;
      this.addResizeIcon();
    }, 20);
    this.viewLayerApplied = false;
    this.removeLayers();
    this.removeGeographyLayers();
    this.isKeylegend = false;
    if (clearAll && this.mapStyle !== 'light') {
      if (this.mapPopup.isOpen()) {
        this.mapPopup.remove();
      }
      this.mapStyle = this.getDefaultMapStyle();
      this.style = this.common.getMapStyle(this.baseMaps, this.mapStyle);
      this.map.setStyle(this.style['uri']);
      this.map.once('style.load', () => {
        this.closeTopMapZipCode();
        this.map.fitBounds(this.mapBounds);
        this.map.setZoom(this.zoomLevel);
      });
    }
  }

  getDefaultMapStyle() {
    this.baseMaps.filter(maps => {
      if (maps.default) {
        this.defaultMapStyle = maps.label;
      }
    });
    return this.defaultMapStyle;
  }

  closeTopMapZipCode() {
    if (this.mapViewPostionState === 'topZipMarketView') {
      this.exploreDataService.setMapViewPostionState('inventoryView');
      this.hoverOutOnCard();
    }
  }

  closeTopMap(e) {
    this.hoverOutOnCard();
  }
  public removeLogo() {
    this.layersService.setRemoveLogoAndText('logo');
    this.logoInfo = {};
    this.logoStyle = {};
    this.enableDraggable = true;
    this.activeDraggablePosition = { x: 0, y: 0 };
  }

  public removeText() {
    this.layersService.setRemoveLogoAndText('text');
    this.displayTextInfo = {};
    this.customTextStyle = {};
    this.enableDraggable = true;
    this.activeDraggableTextPosition = { x: 0, y: 0 };
  }
  public editLogoAndText() {
    this.filterService.setFilterSidenav({ open: true, tab: 'layer' });
  }
  onDragging(event, type) {
    this.resizingInProcess = type;
  }
  onDragStop(event, type) {
    if (!this.enableDraggable) {
      return true;
    }
    const layersSession = this.layersService.getlayersSession();
    this.resizingInProcess = '';
    switch (type) {
      case 'text':
        const activeDraggableTextPosition = JSON.parse(JSON.stringify(this.activeDraggableTextPosition));
        activeDraggableTextPosition['x'] += event['x'];
        activeDraggableTextPosition['y'] += event['y'];
        this.customTextStyle['top'] = activeDraggableTextPosition['y'] + 'px';
        this.customTextStyle['left'] = activeDraggableTextPosition['x'] + 'px';
        this.activeDraggableTextPosition = activeDraggableTextPosition;
        this.layerDisplayOptions['text']['position'] = {
          'top': this.activeDraggableTextPosition['y'],
          'left': this.activeDraggableTextPosition['x']
        };
        this.layerDisplayOptions['screen'] = this.mapWidthHeight;
        this.layersService.setDisplayOptions(this.layerDisplayOptions);
        layersSession['display'] = this.layerDisplayOptions;
        this.layersService.saveLayersSession(layersSession);
        this.showDragTextLogo = false;
        setTimeout(() => {
          this.showDragTextLogo = true;
          this.addResizeIcon();
        }, 20);
        break;
      default:
        const activeDraggablePosition = JSON.parse(JSON.stringify(this.activeDraggablePosition));
        activeDraggablePosition['x'] += event['x'];
        activeDraggablePosition['y'] += event['y'];
        this.logoStyle['top'] = activeDraggablePosition['y'] + 'px';
        this.logoStyle['left'] = activeDraggablePosition['x'] + 'px';
        this.activeDraggablePosition = activeDraggablePosition;
        if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
          this.layerDisplayOptions['logo'] = {};
        }
        this.layerDisplayOptions['logo']['position'] = {
          'top': this.activeDraggablePosition['y'],
          'left': this.activeDraggablePosition['x']
        };
        if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
          this.layersService.customLogo['logo']['position'] = {
            'top': this.activeDraggablePosition['y'],
            'left': this.activeDraggablePosition['x']
          };
        }
        this.layerDisplayOptions['screen'] = this.mapWidthHeight;
        this.layersService.setDisplayOptions(this.layerDisplayOptions);
        layersSession['display'] = this.layerDisplayOptions;
        if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
          layersSession['customLogoInfo']['logo']['position'] = {
            'top': this.activeDraggablePosition['y'],
            'left': this.activeDraggablePosition['x']
          };
        }
        this.layersService.saveLayersSession(layersSession);
        this.layersService.setDisplayOptions(this.layerDisplayOptions);
        this.showDragLogo = false;
        setTimeout(() => {
          this.showDragLogo = true;
          this.addResizeIcon();
        }, 20);
        break;
    }
  }
  onResizing(event, type) {
    this.resizingInProcess = type;
  }
  onResizeStop(event, type) {
    this.resizingInProcess = '';
    const layersSession = this.layersService.getlayersSession();
    switch (type) {
      case 'text':
        this.customTextStyle['width'] = `${event.size.width}px`;
        this.customTextStyle['height'] = `${event.size.height}px`;
        if (typeof this.layerDisplayOptions['text'] === 'undefined') {
          this.layerDisplayOptions['text'] = {};
        }
        this.layerDisplayOptions['text']['size'] = {
          width: event.size.width,
          height: event.size.height
        };
        this.layersService.setDisplayOptions(this.layerDisplayOptions);
        layersSession['display'] = this.layerDisplayOptions;
        this.layersService.saveLayersSession(layersSession);
        break;
      default:
        this.logoStyle['width'] = `${event.size.width}px`;
        this.logoStyle['height'] = `${event.size.height}px`;
        if (typeof this.layerDisplayOptions['logo'] === 'undefined') {
          this.layerDisplayOptions['logo'] = {};
        }
        this.layerDisplayOptions['logo']['size'] = {
          width: event.size.width,
          height: event.size.height
        };
        this.layersService.setDisplayOptions(this.layerDisplayOptions);
        layersSession['display'] = this.layerDisplayOptions;
        if (this.layersService.customLogo && this.layersService.customLogo['logo']) {
          this.layersService.customLogo['logo']['size'] = {
            width: event.size.width,
            height: event.size.height
          };
        }
        if (layersSession['customLogoInfo'] && layersSession['customLogoInfo']['logo']) {
          layersSession['customLogoInfo']['logo']['size'] = {
            width: event.size.width,
            height: event.size.height
          };
        }
        this.layersService.saveLayersSession(layersSession);
        break;
    }
  }
  timeZoneName() {
    const d = new Date();
    const usertime = d.toLocaleString();

    // Some browsers / OSs provide the timezone name in their local string:
    let tzsregex = /\b(ACDT|ACST|ACT|ADT|AEDT|AEST|AFT|AKDT|AKST|AMST|AMT|ART|AST|AWDT|AWST|AZOST|AZT|BDT|BIOT|BIT|BOT|BRT|BST|BTT|CAT|CCT|CDT|CEDT|CEST|CET|CHADT|CHAST|CIST|CKT|CLST|CLT|COST|COT|CST|CT|CVT|CXT|CHST|DFT|EAST|EAT|ECT|EDT|EEDT|EEST|EET|EST|FJT|FKST|FKT|GALT|GET|GFT|GILT|GIT|GMT|GST|GYT|HADT|HAEC|HAST|HKT|HMT|HST|ICT|IDT|IRKT|IRST|IST|JST|KRAT|KST|LHST|LINT|MART|MAGT|MDT|MET|MEST|MIT|MSD|MSK|MST|MUT|MYT|NDT|NFT|NPT|NST|NT|NZDT|NZST|OMST|PDT|PETT|PHOT|PKT|PST|RET|SAMT|SAST|SBT|SCT|SGT|SLT|SST|TAHT|THA|UYST|UYT|VET|VLAT|WAT|WEDT|WEST|WET|WST|YAKT|YEKT)\b/gi;

    // In other browsers the timezone needs to be estimated based on the offset:
    const timezonenames = {
      "UTC+0": "GMT",
      "UTC+1": "CET",
      "UTC+2": "EET",
      "UTC+3": "EEDT",
      "UTC+3.5": "IRST",
      "UTC+4": "MSD",
      "UTC+4.5": "AFT",
      "UTC+5": "PKT",
      "UTC+5.5": "IST",
      "UTC+6": "BST",
      "UTC+6.5": "MST",
      "UTC+7": "THA",
      "UTC+8": "AWST",
      "UTC+9": "AWDT",
      "UTC+9.5": "ACST",
      "UTC+10": "AEST",
      "UTC+10.5": "ACDT",
      "UTC+11": "AEDT",
      "UTC+11.5": "NFT",
      "UTC+12": "NZST",
      "UTC-1": "AZOST",
      "UTC-2": "GST",
      "UTC-3": "BRT",
      "UTC-3.5": "NST",
      "UTC-4": "CLT",
      "UTC-4.5": "VET",
      "UTC-5": "EST",
      "UTC-6": "CST",
      "UTC-7": "MST",
      "UTC-8": "PST",
      "UTC-9": "AKST",
      "UTC-9.5": "MIT",
      "UTC-10": "HST",
      "UTC-11": "SST",
      "UTC-12": "BIT"
    };
    let timezone = usertime.match(tzsregex);
    let offset;
    if (timezone) {
      // timezone = timezone[timezone.length - 1];
    } else {
      offset = (-1 * d.getTimezoneOffset()) / 60;
      offset = 'UTC' + (offset >= 0 ? '+' + offset : offset);
      timezone = timezonenames[offset];
    }
    return {
      usertime: usertime,
      offset: offset,
      timezone: timezone
    };
  }
  private manageFilterPills(filterData) {
    this.filterService.removeFilterPill('audience');
    this.filterService.removeFilterPill('market');
    this.filterService.removeFilterPill('filters');
    // assume default audience first
    let audience = 'Audience: ' + this.defaultAudience['description'];
    if (filterData['audience']
      && filterData['audience']['details']
      && filterData['audience']['details']['targetAudience']) {
      // If audience is applied override the default one
      audience = 'Audience: ' + filterData['audience']['details']['targetAudience']['name'];
    }
    this.filterService.setFilterPill('audience', audience);

    // If market is applied
    if (filterData['market'] && filterData['market']['name']) {
      this.filterService
        .setFilterPill('market', 'Market: ' + filterData['market']['name']);
    }
    // If media types are applied
    if (filterData['mediaTypeList'] && filterData['mediaTypeList']['pills']) {
      const pills = `Media Types: ${filterData['mediaTypeList']['pills']}`;
      this.filterService.setFilterPill('filters', pills, 'mediaTypeList');
    }
    if (filterData['mediaAttributes']) {
      // TODO : Need to change filter pill code here
      const mediaAttributes = filterData['mediaAttributes'];
      if (mediaAttributes['orientationList']) {
        const orientation = new Orientation();
        const pill = `Orientation: ${orientation.degreeToDirection(mediaAttributes['orientationList'])}`;
        this.filterService.setFilterPill('filters', pill, 'orientationList');
      }
      /**
       *Hidden because illumination filters are unavailable as of now, remove after 20th-May-2019 if unused

      if (mediaAttributes['illuminationHrsRange']) {
        let illumination = 'Illumination (Hours): ';
        if (mediaAttributes['illuminationHrsRange'][1]) {
          illumination += mediaAttributes['illuminationHrsRange'][0] + ' to ' + mediaAttributes['illuminationHrsRange'][1] + ' hours';
        } else {
          illumination += mediaAttributes['illuminationHrsRange'][0] + '+ hours';
        }
        this.filterService.setFilterPill('filters', illumination, 'illuminationHrsRange');
      }*/

      if (mediaAttributes['panelSizeWidthRange']) {
        let panelSizeWidthRange = 'Panel Width: ';
        if (mediaAttributes['panelSizeWidthRange'][1]) {
          panelSizeWidthRange += mediaAttributes['panelSizeWidthRange'][0] + ' to ' + mediaAttributes['panelSizeWidthRange'][1] + ' feet';
        } else {
          panelSizeWidthRange += mediaAttributes['panelSizeWidthRange'][0] + '+ feet';
        }
        this.filterService.setFilterPill('filters', panelSizeWidthRange, 'panelSizeWidthRange');
      }
      if (mediaAttributes['panelSizeHeightRange']) {
        let panelSizeHeigh = 'Panel Height: ';
        if (mediaAttributes['panelSizeHeightRange'][1]) {
          panelSizeHeigh += mediaAttributes['panelSizeHeightRange'][0] + ' to ' + mediaAttributes['panelSizeHeightRange'][1] + ' feet';
        } else {
          panelSizeHeigh += mediaAttributes['panelSizeHeightRange'][0] + '+ feet';
        }
        this.filterService.setFilterPill('filters', panelSizeHeigh, 'panelSizeHeightRange');
      }
    }
    // If operators applied
    if (filterData['operatorList']) {
      const operatorPill = 'Operators: ' + filterData['operatorList'].join(', ');
      this.filterService.setFilterPill('filters', operatorPill, 'operatorList');
    }
    if (filterData['location']) {
      const location = filterData['location'];
      if (location['placePackState'] &&
        location['placePackState']['selectedPlaces'] &&
        location['placePackState']['selectedPlaces'].length > 0) {
        const placeSetPill = 'Place Sets: ' + location['placePackState']['selectedPlaces']
          .map(p => p.name)
          .join(', ');
        this.filterService
          .setFilterPill('filters', placeSetPill, 'placeSets');
      }
      if (location['placePackState'] &&
        location['placePackState']['radiusValue']) {
        const pillData = 'Place Sets Radius: ' + location['placePackState']['radiusValue'];
        this.filterService
          .setFilterPill('filters', pillData, 'placeRadius');
      }
      if (location['geoFilter'] &&
        location['geoFilter']['properties']) {
        const pillData = 'Geography: ' + location['geoFilter']['properties']['name'];
        this.filterService
          .setFilterPill('filters', pillData, 'PlaceGeography');
      }
    }
    if (filterData['scenario']) {
      this.filterService
        .setFilterPill('filters', filterData['scenario']['displayName'], 'scenario');
    }
    if (filterData['inventorySet'] &&
      filterData['inventorySet']['inventoryIds'] &&
      filterData['inventorySet']['inventoryIds'].length > 0) {
      this.prepareInventoryPill(filterData['inventorySet']['inventoryIds']);
    }
  }
  private prepareInventoryPill(inventorySetIds) {
    this.workSpace
      .getExplorePackages()
      .pipe(debounceTime(200))
      .subscribe(response => {
        if (typeof response['packages'] !== 'undefined' && response['packages'].length > 0) {
          const packages = response['packages'];
          const pillData = 'Inventory Sets: ' + packages
            .filter(pack => inventorySetIds.indexOf(pack['_id']) !== -1)
            .map(pack => pack.name)
            .join(', ');
          this.filterService.setFilterPill('filters', pillData, 'InventorySet');
        }
      });
  }
  private getInventories(filters, paging = false) {
    const cloneFilters = JSON.parse(JSON.stringify(filters));
    if (this.inventoriesApiCall != null) {
      this.inventoriesApiCall.unsubscribe();
    }
    if (filters['location']) {
      delete filters['location'];
    }
    if (this.filtersAttributes.some(key => filters[key])
      || (filters['measures_range_list']
        && filters['measures_range_list'].length > 1)) {
      const filterData = JSON.parse(JSON.stringify(filters));
      filterData['page_size'] = 100;
      // adding default measures range list if it is not, to get invalid ids
      /* if (filterData.hasOwnProperty('measures_range_list')
      && filterData['measures_range_list'].findIndex(x => x.type === 'imp') === -1) {
        filterData['measures_range_list'].push({'type': 'imp', 'min': 0});
      }

      if (!filterData.hasOwnProperty('measures_range_list')) {
        filterData['measures_range_list'] = [{'type': 'imp', 'min': 0}];
      } */
      this.inventoriesApiCall = this.inventoryService.getInventoriesWithAllData(filterData)
        .subscribe(result => {
          const inventoryItems = result['inventory_summary']['inventory_items'];
          if (!paging) {
            const invalid_Ids = result['inventory_summary']['invalid_ids'];
            const invalidIds = {
              geoPanelIds: [],
              plantIds: []
            };

            if (invalid_Ids && invalid_Ids['id_type'] === 'spot_id') {
              invalidIds.geoPanelIds = invalid_Ids['id_list'];
            }

            if (invalid_Ids && invalid_Ids['id_type'] === 'operator_frame_id') {
              invalidIds.plantIds = invalid_Ids['id_list'];
            }
            this.exploreDataService.setInvalidIds(invalidIds);
            if (inventoryItems) {
              this.common.formatSpotIds(inventoryItems).then(spots => {
                const places = spots;
                if (this.sessionFilter) {
                  places.map((place) => {
                    place.selected = true;
                    const fid = this.selectedFidsArray.filter((id) => (place.spot_id === id.fid));
                    if (fid.length > 0) {
                      place.selected = fid[0].selected;
                    }
                  });
                  this.sessionFilter = false;
                  this.places = places;
                  this.modifySearchResultMapFormat();
                } else {
                  this.exploreDataService.setPlaces(places);
                }
                if (this.customInventories === 'active'
                && this.totalGPInventory < 100
                && this.totalInventory > this.totalGPInventory) {
                  this.getInventoriesFromES(filters, true);
                }
              });
            }
          } else {
            if (typeof inventoryItems !== 'undefined') {
              this.common.formatSpotIds(inventoryItems).then(spots => {
                $.each(spots, (i, val) => {
                  if (this.selectQuery === 'All') {
                    val.selected = true;
                  } else {
                    val.selected = false;
                  }
                  this.places.push(val);
                });
                // this.metricsCalc();
              });
            }
            this.loaderService.display(false);
          }
          this.filterApiCallLoaded = false;
        }, error => {
          this.exploreDataService.setPlaces([]);
          this.filterApiCallLoaded = false;
        });
    } else {
      this.exploreDataService.setPlaces([]);
      this.filterApiCallLoaded = false;
    }
  }
  onCloseFilterTab() {
    const sidenavOptions = { open: false, tab: '' };
    this.filterService.setFilterSidenav(sidenavOptions);
  }

  onOpenFilterTab() {
    const sidenavOptions = { open: true, tab: this.tempTab };
    this.filterService.setFilterSidenav(sidenavOptions);
  }

  getOperatorName(representations: Representation[]): string {
    let opp = '';
    if (representations) {
      const representation = representations.filter(rep => rep['representation_type']['name'] === 'Own')[0];
      if (representation) {
        opp = representation['account']['parent_account_name'];
        // opp = representation['division']['plant']['name'];
      }
    }
    return opp;
  }
  modifySearchResultMapFormat() {
    if (!this.isStatus) {
      return false;
    }
    let places = JSON.parse(JSON.stringify(this.places));
    const layersSession = this.layersService.getlayersSession();

    let layerData;
    let numberCircleColor;
    if (layersSession && layersSession['selectedLayers']) {
      const searchResult = layersSession['selectedLayers'].find((layer) => layer.data['_id'] === 'default');
      if (searchResult && searchResult['icon'] !== 'icon-numbered') {
        layerData = searchResult;
        this.defaultIcon = { name: searchResult['icon'], color: searchResult['color'] };
      }

      if (searchResult && searchResult['icon'] === 'icon-numbered') {
        numberCircleColor = searchResult['color'];
        this.defaultIcon = { name: searchResult['icon'], color: searchResult['color'] };
      }

    }
    if (this.map && this.defaultIcon) {
      this.removeSearchResultLayers();

      if (places.length > 0) {

        // if (!layerData) {
        const limit = this.selectQueryLimited < 0 ? 100 : this.selectQueryLimited;
        places = places.slice(0, limit);
        // }
        const pids = places.map(p => p.selected ? p.spot_id : '');
        const data = places.map((inventory, index) => {
          if (!inventory.selected) {
            return {};
          }
          return {
            type: 'Feature',
            geometry: inventory['location']['geometry'],
            properties: {
              fid: inventory.spot_id || '',
              opp: this.getOperatorName(inventory.representations),
              pid: inventory.plant_frame_id || '',
              index: (index + 1),
              radius: 10
            }
          };
        });
        const numberLabelData = {
          type: 'FeatureCollection',
          features: data
        };
        this.map.addSource('numberLabelSource', {
          type: 'geojson',
          data: numberLabelData
        });

        let seletedPanels = [];
        this.selectedFidsArray.map(place => {
          if (place.selected && place.fid !== undefined && place.fid !== undefined && place.fid !== 'undefined') {
            seletedPanels.push(place.fid);
          }
        });

        if (seletedPanels.length <= 0) {
          seletedPanels = [0];
        }
        seletedPanels.unshift('in', 'fid');
        if (!layerData) {
          /*national layer*/
          this.map.addLayer({
            id: 'numberedLabelCircle',
            type: 'circle',
            source: 'numberLabelSource',
            minzoom: 7,
            layer: {
              'visibility': 'visible',
            },
            paint: {
              'circle-opacity': 1,
              'circle-color': numberCircleColor ? numberCircleColor : '#008da4',
              'circle-radius': ['get', 'radius']
            }
          });

          // Click to zoom in to the panel detail level
          // this.map.on('click', 'frameClusters', this.framClusterZoomIn);
          // add the cluster count label
          // this.layerInventorySetLayers.push('numberedLabelValue');
          this.map.addLayer({
            id: 'numberedLabelValue',
            type: 'symbol',
            source: 'numberLabelSource',
            minzoom: 7,
            layout: {
              'visibility': 'visible',
              'text-field': '{index}',
              'text-font': ['Product Sans Regular', 'Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 13
            },
            paint: {
              'text-color': '#fefefe'
            }
          });
        }

        if (layerData
          && layerData['icon']
          && layerData['icon'] !== 'icon-wink-pb-dig') {
          const mapLayerId = 'layerInventoryLayer' + Date.now().toString(36) + Math.random().toString(36).substr(2);
          this.layerInventorySetLayers.push(mapLayerId);
          this.searchlayer.push(mapLayerId);
          this.map.addLayer({
            id: mapLayerId,
            type: 'symbol',
            source: 'numberLabelSource',
            // 'source-layer': this.mapLayers['allPanels']['source-layer'],
            minzoom: 7,
            // maxzoom: (layerData['icon'] && layerData['icon'] === 'icon-wink-pb-dig' ? 7 : 17),
            // filter: ['all', seletedPanels],
            layout: {
              'text-line-height': 1,
              'text-padding': 0,
              'text-anchor': 'bottom',
              'text-allow-overlap': true,
              'text-field': layerData['icon']
                && layerData['icon'] !== 'icon-wink-pb-dig'
                && this.markerIcon[layerData['icon']]
                || this.markerIcon['icon-circle'],
              'icon-optional': true,
              'text-font': ['imx-map-font-33 Regular'],
              'text-size': layerData['icon'] === 'icon-wink-pb-dig' ? 10 : 18,
              'text-offset': [0, 0.6]
            },
            paint: {
              'text-translate-anchor': 'viewport',
              'text-color': layerData['color']
            }
          });
          this.map.on('mouseenter', mapLayerId, () => {
            this.map.getCanvas().style.cursor = 'pointer';
          });
          this.map.on('mouseleave', mapLayerId, () => {
            this.map.getCanvas().style.cursor = '';
          });
        }
        this.map.setLayoutProperty('frames_panel', 'visibility', 'visible');
        this.map.setLayoutProperty('color_frames_panel', 'visibility', 'visible');

        if (this.map.getLayer('color_frames_panel') || this.map.getLayer('frames_panel')) {
          const filters = [];
          filters.unshift('all');

          if (layerData
            && layerData['icon'] === 'icon-wink-pb-dig') {
            filters.push(seletedPanels.concat(pids));
          } else {
            filters.push(seletedPanels);
            pids.unshift('!in', 'fid');
            filters.push(pids);
          }

          // this.map.setFilter('color_frames_panel', filters);
          /* for seeing the color frame panel at 7 th zoom*/
          if (this.selectedFidsArray && this.selectedFidsArray.length <= 50000) {
            this.map.setFilter('color_frames_panel', filters);
            this.map.setFilter('frames_panel', filters);
          }
        }
      }
    }
  }

  removeSearchResultLayers(flag = false) {
    /** Remove becuase this condition not need and it is affecting zooming layer. */
    /* if (flag) {
      if (this.map.getLayer('frames_panel')) {
        this.map.setLayoutProperty('frames_panel', 'visibility', 'none');
      }
      // if (this.map.getLayer('color_frames_panel')) {
      //   this.map.setLayoutProperty('color_frames_panel', 'visibility', 'none');
      // }
    } */
    if (this.map.getLayer('numberedLabelCircle')) {
      this.map.removeLayer('numberedLabelCircle');
    }
    if (this.map.getLayer('numberedLabelValue')) {
      this.map.removeLayer('numberedLabelValue');
    }
    this.searchlayer.forEach((layer) => {
      if (this.map.getLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    if (this.map.getSource('numberLabelSource')) {
      this.map.removeSource('numberLabelSource');
    }

  }
  openSaveScenario() {
    const data = {};
    const width = '500px';
    const height = 'auto';
    data['inventories'] = this.selectedFidsArray;
    this.dialog.open(ExploreSaveScenariosComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'save-scenario-container'
    }).afterClosed().subscribe(res => {
      if (res && res['type'] === 'createNewProject') {
        this.createProject('popup', res['parentId'], res['name'], res['level']);
      } else if (res) {
        this.newWorkSpaceService.clearProjectsForScenario();
        this.workSpace.getProjects(true).subscribe(response => {
          if (response['projects'] && response['projects'].length > 0) {
            this.projects = response['projects'];
          }
        });
      }
    });
  }

  public createProject(source = 'direct', parentId = '', name = '', level = 0) {
    const newProjectDialog: NewProjectDialog = {
      isProject: true,
      namePlaceHolder: `* ${this.workFlowLabels['project'][0]} Name`,
      descPlaceHolder: `${this.workFlowLabels['project'][0]} Description (Optional)`,
      dialogTitle: `Create ${this.workFlowLabels['project'][0]}`
    };
    if (parentId !== '') {
      newProjectDialog['isProject'] = false;
      newProjectDialog['parentId'] = parentId;
      newProjectDialog['namePlaceHolder'] = `* ${name} Name`;
      newProjectDialog['descPlaceHolder'] = `${name} Description (Optional)`;
      newProjectDialog['dialogTitle'] = `Create ${name}`;
      newProjectDialog['subProjectLabel'] = name;
    }
    this.dialog.open(NewProjectDialogComponent, {
      data: newProjectDialog,
    }).afterClosed()
      .subscribe(data => {
        if (data) {
          if (data && data['type']) {
            this.newWorkSpaceService.getProject(data['response']['data']['id']).subscribe(project => {
              switch (data['type']) {
                case 'saved':
                  this.projectStore.addOrUpdateProject(project, data['parentId']);
                  if (source === 'popup') {
                    this.newWorkSpaceService.setProjectsForScenario(data['response']['data']['id'], level);
                    this.newWorkSpaceService.setSubprojectLevel(-1);
                    this.openSaveScenario();
                  } else {
                    this.newWorkSpaceService.clearProjectsForScenario();
                    // this.router.navigate(['/v2/projects/', data['response']['data']['id']]);
                  }
                  break;
                default:
                  break;
              }
            });
          }
        }
      });
  }


  private checkMeasuresPresence(filters) {
    let measures = false;
    if ((filters['measures_range_list']
    && filters['measures_range_list'].length > 1)) {
      filters['measures_range_list'].forEach((val) => {
        if (val['min'] > 0) {
          measures = true;
        }
      });
    }
    return measures;
  }
}
