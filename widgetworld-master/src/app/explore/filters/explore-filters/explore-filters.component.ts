import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Filters} from '@interTypes/filters';
import {WorkflowLables} from '@interTypes/workspaceV2';
import {
  AuthenticationService,
  CommonService,
  ExploreDataService,
  ExploreService,
  FormatService,
  ThemeService,
  WorkSpaceService,
  WorkSpaceDataService,
  InventoryService
} from '@shared/services';
import turfCircle from '@turf/circle';
import * as turfHelper from '@turf/helpers';
import turfUnion from '@turf/union';
import { takeWhile, catchError, mergeMap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import swal from 'sweetalert2';
import {FiltersService} from '../filters.service';
import { PlacesFiltersService } from 'app/places/filters/places-filters.service';

@Component({
  selector: 'app-explore-filters',
  templateUrl: './explore-filters.component.html',
  styleUrls: ['./explore-filters.component.less']
})
export class ExploreFiltersComponent implements OnInit, OnDestroy {

  @Input() mapLayers: any;
  @Input() inventoryGroupIds: any;
  @Input() placeLayerVisibility: boolean;
  @Output() exploreLoadMapView: EventEmitter<any> = new EventEmitter();
  @Output() exploreDrawPolygon: EventEmitter<any> = new EventEmitter();
  @Output() exploreDrawCircle: EventEmitter<any> = new EventEmitter();
  @Output() exploreRemovePolygon: EventEmitter<boolean> = new EventEmitter();
  @Output() exploreDrawGeopolygon: EventEmitter<boolean> = new EventEmitter();
  @Output() editInventoryPackage: EventEmitter<boolean> = new EventEmitter();
  @Output() drawPolygons: EventEmitter<any> = new EventEmitter();
  @Output() drawCustomPolygon: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() setSessionMapPosition: EventEmitter<any> = new EventEmitter();
  @Output() filterByPlaceSets: EventEmitter<any> = new EventEmitter();
  @Output() toggleLocationFilterLayer: EventEmitter<any> = new EventEmitter();
  @Output() loadDynamicMapView: EventEmitter<any> = new EventEmitter();
  @Output() removeDynamicMapView: EventEmitter<any> = new EventEmitter();

  showFilter = false;
  open = false;
  selectedTab = 0;
  tabHeaderHeight = '64px';
  public placeSetSearch = '';
  public filters: Partial<Filters> = {};
  public filtersSelection: Partial<Filters> = {};
  public placePacks: any = [];
  public selectedMarket: any = {};
  public selectedMarketLocation: any = [];
  public mobileView: boolean;
  public selectedGeoLocation: any = '';
  public loadertrue = false;
  public isMarketlocationAvailable = false;
  public filteredPlacePacks: any = [];
  public selectedFilter;
  public selectedAudienceList: any = {};
  public isScenario = false;
  public selectedPlacesCtrl: FormControl = new FormControl();
  public radiusCtrl: FormControl = new FormControl(1, [Validators.required, Validators.min(0.00000001)]);
  public geographySearchCtrl: FormControl = new FormControl();
  public mouseIsInsideFilter = false;
  private unSubscribe = true;
  private defaultAudience = {};
  public allowInventory = '';
  public allowInventoryAudience  = '';
  public audienceLicense = {};
  public mod_permission: any;
  public scenario_mod_permission: any;
  public places_mod_permission: any;
  public allowScenarios = '';
  public isThresholdsPanel = false;
  public openAudience = false;
  public headerHeight: any;
  public isChecked: any;
  public workflowLabels: WorkflowLables;
  private states = [];
  public inventorySetModulePermission: any;
  isMediaAttributesSearchEnabled: any;
  constructor(
    private commonService: CommonService,
    private filterService: FiltersService,
    private exploreService: ExploreService,
    private exploreDataService: ExploreDataService,
    private formatService: FormatService,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private theme: ThemeService,
    private placeFilterService: PlacesFiltersService,
    private workSpaceService: WorkSpaceService,
    private workSpaceDataService: WorkSpaceDataService,
    private inventoryService: InventoryService
  ) {
    this.workflowLabels = this.commonService.getWorkFlowLabels();
  }

  ngOnInit() {
    this.theme.getDimensions().pipe(takeWhile(() => this.unSubscribe)).subscribe(data => {
      this.headerHeight = data.headerHeight;
    });
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.scenario_mod_permission = this.auth.getModuleAccess('projects');
    this.places_mod_permission = this.auth.getModuleAccess('places');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.allowScenarios = this.scenario_mod_permission['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.inventorySetModulePermission = this.mod_permission['features']['inventorySet'];
    this.isMediaAttributesSearchEnabled = this.mod_permission['features']['mediaAttributesSearch'];

    const routeData = this.route.snapshot.data;
    /* if (routeData.places && routeData.places['data']) {
      this.placePacks = routeData.places['data'];
      this.filteredPlacePacks = routeData.places['data'];
      this.filteredPlacePacks.sort(this.formatService.sortAlphabetic);
    } */
    if (routeData.defaultAudience) {
      this.defaultAudience = routeData.defaultAudience;
    }
    if (routeData.states) {
      this.states = routeData.states;
    }
    this.mobileView = this.commonService.isMobile();
    if (this.mobileView) {
      this.tabHeaderHeight = '40px';
    }

    this.filterService.getFilterSidenav().pipe(takeWhile(() => this.unSubscribe)).subscribe(data => {
      this.showFilter = true;
      this.open = data['open'];
      if (data['tab'] === 'inventory') {
        this.selectedTab = 1;
      } else if (data['tab'] === 'layer') {
        this.selectedTab = 2;
      } else if (data['tab'] === 'actions') {
        this.selectedTab = 3;
      } else {
        this.selectedTab = 0;
      }
      if (!this.open) {
        this.showFilter = false;
      }
    });

    this.filterService.getFilters()
      .pipe(
      debounceTime(200),
      distinctUntilChanged())
      .subscribe(filters => {
        this.filters = filters.data;
        this.filtersSelection = filters.selection || {};
      });
    this.filterService.getFilterSidenavOut().pipe(takeWhile(() => this.unSubscribe)).subscribe(state => {
      if (state) {
        this.mouseIsInsideFilter = true;
      } else {
        this.mouseIsInsideFilter = false;
      }
    });
    this.filterService.onReset()
      .subscribe(type => {
      this.removePolygon();
    });
    this.exploreDataService.onMapLoad().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(event => {
        if (event) {
          this.loadFilterSession();
        }
    });
    this.exploreDataService.getSelectedPlacesCtrlValue().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(value => {
        this.selectedPlacesCtrl.setValue(value);
      });
    this.exploreDataService.getRadiusCtrlValue().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(value => {
        if (value > 0) {
          this.radiusCtrl.setValue(value);
        } else {
          this.radiusCtrl.setValue(1);
        }
      });
    this.exploreDataService.getSelectedMarketLocationValue().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(value => {
        this.selectedMarketLocation = value;
      });
    this.exploreDataService.getSelectedGeoLocationIdValue().pipe( takeWhile(() => this.unSubscribe), distinctUntilChanged())
      .subscribe(value => {
        if (!value) {
          this.selectedGeoLocation = '';
          this.selectedMarketLocation = [];
          this.geographySearchCtrl.setValue('');
        } else {
          this.geographySearchCtrl.patchValue(value['name']);
          this.selectedGeoLocation = value;
        }
      });
    this.filterService.checkSessionDataPushed()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(val => {
        if (val) {
          this.loadFilterSession();
        }
      });
    this.workSpaceDataService
      .getPackages()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeWhile(() => this.unSubscribe)
      )
      .subscribe(packages => {
        this.placePacks = packages;
        this.filteredPlacePacks = packages;
        this.filteredPlacePacks.sort(this.formatService.sortAlphabetic);
      });
    this.geographySearchCtrl.valueChanges
    .pipe(takeWhile(() => this.unSubscribe),
    debounceTime(500))
      .subscribe((value) => {
        this.searchGeographies(value);
    });
  }
  mouseHover(event) {
    this.mouseIsInsideFilter = true;
  }
  mouseLeave(event) {
    this.mouseIsInsideFilter = false;
  }
  ngOnDestroy() {
    this.unSubscribe = false;
  }

  onOpenOrClose(flag) {
    if (flag) {
      this.showFilter = flag;
    } else {
      setTimeout(() => {
        this.showFilter = flag;
      }, 1000);
    }

  }

  // to load default map view polygon
  loadMapView() {
    this.exploreLoadMapView.emit();
    this.onCloseFilterTab();
  }

  // to draw custom polygon
  drawPolygon() {
    this.exploreDrawPolygon.emit();
    this.onCloseFilterTab();
  }

  drawCircle() {
    this.exploreDrawCircle.emit();
    this.onCloseFilterTab();
  }

  // clear polygons
  removePolygon() {
    this.onCloseFilterTab();
    this.selectedMarketLocation = [];
    this.selectedGeoLocation = '';
    this.geographySearchCtrl.setValue('');
    this.selectedPlacesCtrl.setValue([]);
    this.radiusCtrl.setValue(1);
    this.placeSetSearch = '';
    this.exploreRemovePolygon.emit(true);
    this.removeDynamicMapView.emit();
    this.filterService.toggleFilter('location', false);
  }

  applyForm() {
    if (this.selectedGeoLocation) {
      // this.getMarketGeometry();
      this.exploreDrawGeopolygon.emit(this.selectedGeoLocation);
    }
    if (this.selectedPlacesCtrl.value && this.selectedPlacesCtrl.value.length > 0) {
      if (this.radiusCtrl.value <= 0 || this.radiusCtrl.value === '') {
        swal('Warning', 'Please enter a distance greater than zero.', 'warning');
        return false;
      }
      this.searchByPlaceSets();
    }
    // this.onCloseFilterTab();
    return true;
  }

  private searchGeographies(value: string) {
    if (value.length >= 3) {
      this.loadertrue = true;
      const states = [];
      this.states.map(state => {
        if (state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
          states.push(state);
        }
      });
      this.inventoryService.getGeographies(value, true).pipe(takeWhile(() => this.unSubscribe)).subscribe(
        response => {
          this.loadertrue = false;
          if (states.length > 0) {
            response['States'] = states;
          } else {
            delete response['States'];
          }
          this.selectedMarketLocation = response;
          if (Object.keys(this.selectedMarketLocation).length > 0) {
            this.isMarketlocationAvailable = true;
          } else {
            this.isMarketlocationAvailable = false;
          }
          setTimeout(() => {
            if (this.isMarketlocationAvailable) {
              const element: HTMLElement = document.querySelector('.group-keys mat-list mat-list-item') as HTMLElement;
              if (element) {
                element.click();
              }
            }
          }, 100);
        },
        error => {
          this.loadertrue = false;
          this.selectedMarketLocation = [];
        }
      );
    }
  }

  filterPlacePacks(data) {
    if (data.emptySearch) {
      this.filteredPlacePacks = this.placePacks;
    } else {
      this.filteredPlacePacks = data.value;
    }
  }

  onGeoLocalion(geolocaion, type) {
    this.selectedGeoLocation = geolocaion;
    this.selectedGeoLocation['type'] = type;
  }

  // getMarketGeometry() {
  //   this.exploreService.getmarketGeometry(this.selectedGeoLocationId)
  //     .subscribe(
  //       response => {
  //         response['searchParams'] = this.selectedGeoLocationId;
  //         this.exploreDrawGeopolygon.emit(response);
  //       },
  //       error => {
  //       }
  //     );
  // }

  private searchByPlaceSets() {
    let featuresCollection: any;
    featuresCollection = turfHelper.featureCollection([]);
    let radius = 0;
    let combinedFeature: any;
    const selectedPlaceDetails = [];
    const selectedPanels = [];
    if (this.radiusCtrl.value > 0) {
      radius = this.radiusCtrl.value;
      const placesId = [];
      this.selectedPlacesCtrl.value.forEach(place => {
        placesId.push(place._id);
      });
      const params = {'ids': placesId};
      this.placeFilterService.getPlaceSetsSummary(params).subscribe( response => {
        if (response['data'].length > 0) {
          response['data'].forEach(place => {
            selectedPlaceDetails.push(place);
            place['pois'].map(poi => {
              selectedPanels.push(poi.properties.safegraph_place_id);
              const circleFeature = turfCircle(poi.geometry.coordinates, radius, {steps: 64, units: 'miles', properties: poi.properties});
              featuresCollection.features.push(circleFeature);
            });
          });
          combinedFeature = turfUnion(...featuresCollection.features);

          combinedFeature.geometry.coordinates.map((coordinate, index) => {
            if (coordinate.length > 1) {
              combinedFeature.geometry.coordinates[index] = [coordinate];
            }
          });
          this.filterByPlaceSets.emit({
            featureCollection: featuresCollection,
            polygon: combinedFeature,
            selectedPanels: selectedPanels,
            selectedPlaces: this.selectedPlacesCtrl.value,
            radiusValue: radius,
            selectedPlaceDetails: selectedPlaceDetails
          });
        }
      });
    } else {
      this.selectedPlacesCtrl.value.map(place => {
        place.pois.map(poi => {
          selectedPanels.push(poi);
        });
      });
      this.filterByPlaceSets.emit({
        featureCollection: featuresCollection,
        polygon: combinedFeature,
        selectedPanels: selectedPanels,
        selectedPlaces: this.selectedPlacesCtrl.value,
        radiusValue: radius,
        selectedPlaceDetails: selectedPlaceDetails
      });
    }
  }

  onCloseFilterTab() {
    const sidenavOptions = {open: false, tab: ''};
    this.filterService.setFilterSidenav(sidenavOptions);
  }

  onCompletedBrowsing(e) {
    if (e.clearFilter) {
      // this.filterService.setFilter('audience', this.defaultAudience['audienceKey']);
      this.exploreDataService.setSelectedTarget(this.defaultAudience['audienceKey']);
      this.exploreDataService.setSelectedTargetName(this.defaultAudience['description']);
    } else if (typeof e['targetAudience'] !== 'undefined') {
      const target = {};
      target['details'] = e;
      target['key'] = e['targetAudience'].audience;
      this.exploreDataService.setSelectedTarget(e['targetAudience'].audience);
      this.exploreDataService.setSelectedTargetName(e['targetAudience'].name);
      this.filterService.setFilter('audience', target);  // ['targetAudience'].audience
    }
  }

  resetAllFilter() {
    this.filterService.resetAll();
  }

  toggleFilter($event, filterType: keyof Filters) {
    this.filterService.toggleFilter(filterType, $event.checked);
  }

  toggleUnitsFilter($event) {
    this.filterService.toggleCombinedFilters($event.checked);
  }

  toggleLocationFilter($event) {
    this.onCloseFilterTab();
    this.toggleLocationFilterLayer.emit($event.checked);
    this.filterService.toggleFilter('location', $event.checked);
  }
  public compare(c1, c2) {
    return c1 && c2 && c1['_id'] === c2['_id'];
  }

  private loadFilterSession() {
    const sessionFilter = this.filterService.getExploreSession();
    if (sessionFilter && sessionFilter['data']) {
      this.filtersSelection = sessionFilter.selection || {};
      const filtersData = sessionFilter.data;
      if (filtersData['location'] && filtersData['location']['region']) {
        switch (filtersData['location']['type']) {
          case  'circularPolygon':
          this.drawCustomPolygon.emit({
            region: filtersData['location']['region'], drawCircle: true, drawPolygon: false });
          break;
          case 'regularPolygon':
          this.drawCustomPolygon.emit({
            region: filtersData['location']['region'], drawCircle: false, drawPolygon: true });
          break;
          case 'mapViewPolygon':
          this.drawPolygons.emit({multiPolygon: filtersData['location']['region'], polygonType: 'mapViewPolygon'});
          break;
          case 'geoPolygon':
          this.drawPolygons.emit({
            multiPolygon: filtersData['location']['geoFilter']['geometry'],
            polygonType: 'geoPolygon', geoFilter: filtersData['location']['geoFilter']
          });
          this.searchGeographies(filtersData['location']['geoFilter']['searchParams']['name']);
          this.selectedGeoLocation = filtersData['location']['geoFilter']['searchParams'];
          break;
          case 'placeSetView':
          this.selectedPlacesCtrl.setValue(filtersData['location']['placePackState']['selectedPlaces']);
          this.filterByPlaceSets.emit(filtersData['location']['placePackState']);
          break;
          case 'dynamicMapView':
          this.loadDynamicMapView.emit(filtersData['location']['region']);
          break;
        }
      }
      if (filtersData['location'] && filtersData['location']['selectedGeoLocation']) {
        this.selectedGeoLocation = filtersData['location']['selectedGeoLocation'];
        this.searchGeographies(this.selectedGeoLocation['name']);
      }
    }
  }
  openThresholdFilter() {
    if (!this.isThresholdsPanel) {
      this.isThresholdsPanel = true;
    }
    this.exploreService.setThresholdsPanel(this.isThresholdsPanel);
  }
  onOpenAudience(val) {
    this.openAudience = val;
  }
}

