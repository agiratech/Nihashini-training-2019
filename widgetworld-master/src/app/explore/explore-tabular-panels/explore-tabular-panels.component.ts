import {Component, EventEmitter, Input, OnInit, Output, OnDestroy, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { WorkflowLables, ConfirmationDialog } from '@interTypes/workspaceV2';
import {
  ExploreDataService,
  ExploreService,
  LoaderService,
  CommonService,
  FormatService,
  AuthenticationService,
  InventoryService,
  ThemeService
} from '@shared/services';
import { takeWhile, map, switchMap } from 'rxjs/operators';
import swal from 'sweetalert2';
import {forkJoin, zip} from 'rxjs';
import { ResizeEvent } from 'angular-resizable-element';
import { MatDialog } from '@angular/material/dialog';
import {ExploreSavePackageComponent} from '@shared/components/explore-save-package/explore-save-package.component';
import {ExploreSaveScenariosComponent} from '../explore-save-scenarios/explore-save-scenarios.component';
import {CustomizeColumnComponent} from '@shared/components/customize-column/customize-column.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {FiltersService} from '../filters/filters.service';
import { Representation } from '@interTypes/inventorySearch';
import { BulkExportRequest } from './../../Interfaces/bulkExport';
import { saveAs } from 'file-saver';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'explore-tabular-panels',
  templateUrl: './explore-tabular-panels.component.html',
  styleUrls: ['./explore-tabular-panels.component.less']
})
export class ExploreTabularPanelsComponent implements OnInit, OnDestroy, OnChanges {
  constructor(private exploreDataService: ExploreDataService,
              private commonService: CommonService,
              public formatService: FormatService,
              public loaderService: LoaderService,
              public dialog: MatDialog,
              private filtersService: FiltersService,
              private auth: AuthenticationService,
              private inventoryService: InventoryService,
              private theme: ThemeService,
              private exploreService: ExploreService) {
    this.workFlowLabels = this.commonService.getWorkFlowLabels();
  }
  dataSource = new MatTableDataSource([]);
  public workFlowLabels: WorkflowLables;
  public tabularView = 0;
  // public tableHeight = null;
  private unSubscribe = true;
  public mapViewPostionState = 'inventoryView';
  public places;
  public formattedPlaces = [];
  public selectOptions;

  public sortables = [
    {name: 'PLANT OPERATOR', displayname: 'Plant Operator', value: 'plant_operator'},
    {name: 'GEOPATH FRAME ID', displayname: 'Geopath Frame ID', value: 'frame_id'},
    {name: 'GEOPATH SPOT ID', displayname: 'Geopath Spot ID', value: 'spot_id'},
    {name: 'PLANT UNIT ID', displayname: 'Operator Spot ID', value: 'plant_frame_id'},
    {name: 'MEDIA TYPE', displayname: 'Media Type', value: 'media_type'},
    {name: 'Total Imp', displayname: 'Total Impressions', value: 'imp'},
    {name: 'Target Imp', displayname: 'Target Impressions', value: 'imp_target'},
    {name: 'In-Mkt Target Imp', displayname: 'Target In Market Impressions', value: 'imp_target_inmkt'},
    {name: 'In-Mkt Target Comp Index', displayname: 'Target Audience Index', value: 'index_comp_target'},
    {name: 'Reach', displayname: 'Target In-Market Reach', value: 'reach_pct'}
  ];
  public currentSortables = [];
  private displaySortables = [];
  public sortQuery = 'index_comp_target';
  public sortColumnQuery = 'index_comp_target';
  public conditionalFormatting = 1;
  public selectAllInventoriesCheckbox = false;
  public cntrlKey = false;
  public selectQuery = 'Select';
  public selectQueryLimited = -1;
  public selectedCount = 0;
  public userData = {};
  public selectedColumns = [];
  public headerValueTotAudienceIm = 0;
  public headerValueTgtAudienceIm = 0;
  public headerValueTgtAudienceImComp = 0;
  // public headerValueTotAudienceImPercent = 0;
  public headerValueImTgtImp = 0;
  public selectMarket;
  public selectMarketName = '';
  public selectTarget = 'Total Pop 0+ yrs';
  public discoveringPanel = false;
  public sortByAsc = true;
  public isDropped = false;
  public clearColumn = false;
  @Output() placeClick = new EventEmitter();
  @Output() select = new EventEmitter();
  @Output() placeSelect = new EventEmitter();
  @Input() defaultSelectQuery: any;
  @Input() defaultSelectQueryLimited: any;
  @Input() selectedFidsArray: any;
  @Input() defaultSortQuery: any;
  @Input() selectedPackage: any;
  @Input() packages: any;
  @Input() updateTabularView: any;
  clickedRowIndex = 0;
  @Output() tablurMapHeight = new EventEmitter();
  @Output() pdfExport = new EventEmitter();

  tableHeight: any;
  tableHeightEnd: any;
  mapHeight: any;
  style: any;
  isResizingElement = false;
  public keyCodes = {
    CONTROL: 17,
    COMMAND: 91
  };

  @ViewChild('dragFocus', {static: false}) dragFocusElement: ElementRef;
  mobileView: boolean;
  @ViewChild('tabularHeight', {static: false}) elementView: ElementRef;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  private mod_permission: any;
  public allowInventory = '';
  public audienceLicense = {};
  public isLoader: Boolean = false;
  public isTableLoading: Boolean = false;
  themeSettings: any;
  public selectTargetId;
  public selectedMarket;
  public measuresLicense: any;
  csvExportLicense: string;
  pdfExportLicense: string;
  inventorySetLicense: string;
  isScenarioLicense: string;
  publicSiteColumn: any  = [];
  ngOnInit() {
    this.themeSettings = this.theme.getThemeSettings();
    const sessionFilter = this.filtersService.getExploreSession();
    if (sessionFilter && sessionFilter['data'] &&
     sessionFilter['data']['mapViewPostionState'] &&
      sessionFilter['data']['mapViewPostionState'] === 'tabularView'
       && sessionFilter['data']['customColumns'] && sessionFilter['data']['customColumns'].length > 0) {
      this.currentSortables = sessionFilter['data']['customColumns'];
      this.setLocalStorage(this.currentSortables);
      this.filtersService.updateFiltersData({customColumns: this.currentSortables});
    }
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.measuresLicense = this.mod_permission['features']['gpMeasures']['status'];
    this.csvExportLicense = this.mod_permission['features']['csvExport']['status'];
    this.pdfExportLicense = this.mod_permission['features']['pdfExport']['status'];
    this.inventorySetLicense = this.mod_permission['features']['inventorySet']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    const projectMod = this.auth.getModuleAccess('projects');

    if (this.measuresLicense !== 'active') {
      this.publicSiteColumn = [
        {
          'name': 'PLANT OPERATOR','displayname': 'Plant Operator', 'value': 'plant_operator'
        },
        {
          'name': 'GEOPATH FRAME ID','displayname': 'Geopath Frame ID', 'value': 'frame_id'
        },
        {
          'name': 'GEOPATH SPOT ID','displayname': 'Geopath Spot ID','value': 'spot_id'
        },
        {
          'name': 'PLANT UNIT ID','displayname': 'Operator Spot ID','value': 'plant_frame_id'
        },
        {
          'name': 'MEDIA TYPE','displayname': 'Media Type','value': 'media_type'
        },
        {
          'name': 'media_name','displayname': 'Media Name','value': 'media_name'
        },
        {
          'name': 'classification_type','displayname': 'Classification','value': 'classification_type'
        },
        {
          'name': 'construction_type','displayname': 'Construction', 'value': 'construction_type'
        },
        {
          'name': 'digital','displayname': 'Digital','value': 'digital'
        },
        {
          'name': 'height','displayname': 'Height (ft & in)','value': 'max_height'
        },
        {
          'name': 'width','displayname': 'Width (ft & in)','value': 'max_width'
        },
        {
          'name': 'zip_code', 'displayname': 'ZIP Code', 'value': 'zip_code'
        },
        {
          'name': 'longitude', 'displayname': 'Longitude', 'value': 'longitude'
        },
        {
          'name': 'latitude', 'displayname': 'Latitude', 'value': 'latitude'
        },
        {
          'name': 'illumination_type', 'displayname': 'Illumination Type','value': 'illumination_type'
        },
        {
          'name': 'orientation', 'displayname': 'Orientation', 'value': 'orientation'
        },
        {
          'name': 'primary_artery', 'displayname': 'Primary Artery','value': 'primary_artery'
        }
      ];
      this.displaySortables = this.publicSiteColumn;
      this.sortables =  this.publicSiteColumn;
    }

    this.isScenarioLicense = projectMod['status'];
    this.exploreDataService
      .onMapLoad()
      .pipe(map(isLoaded => isLoaded),
      switchMap(isLoaded => {
        if (isLoaded) {
          return this.exploreDataService.getMapViewPostionState();
        }
      }),
      takeWhile(() => this.unSubscribe))
      .subscribe(state => {
        this.mapViewPostionState = state;
        this.filtersService.updateFiltersData({mapViewPostionState: state});
        if (state === 'tabularView') {
          this.tabularView = 1;
          const sessionFilterData = this.filtersService.getExploreSession();
          if (sessionFilterData && sessionFilterData['data'] && sessionFilterData['data']['mapViewPostionState'] &&
           sessionFilterData['data']['mapViewPostionState'] === 'tabularView' ) {
              // The below variable is used to restrict two times calling of loadTabularData method while loading
              // One time in init and another time in ngOnChanges
              if (this.checkAnyFilterApplied()) {
                this.isTableLoading = true;
                this.loadTabularData();
              } else {
                this.formattedPlaces = [];
              }

          }
        } else {
          this.tabularView = 0;
          this.formattedPlaces = [];
        }
      });
    this.exploreDataService.getSearchStarted().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(value => {
        if (value) {
          if (this.tabularView > 0) {
            this.loadTabularData();
          }
        }
    });
    this.exploreDataService.getSelectedTargetName().pipe(takeWhile(() => this.unSubscribe))
        .subscribe(tgt => {
          this.selectTarget = tgt;
        });
    this.exploreDataService.getSelectedTarget().pipe(takeWhile(() => this.unSubscribe))
    .subscribe(target => {
      this.selectTargetId = target;
    });

    this.exploreDataService
    .getSelectedMarket()
    .pipe((takeWhile(() => this.unSubscribe)))
    .subscribe(market => {
      if (market && market.name) {
        this.selectedMarket = market;
      } else {
        this.selectedMarket = {};
      }
    });

    this.selectOptions = ['All', 'Top 25', 'Top 50', 'Top 100', 'None', 'Custom'];
    this.userData = JSON.parse(localStorage.getItem('user_data'));

    this.exploreDataService.getTabularViewPlaces().pipe(takeWhile(() => this.unSubscribe))
      .subscribe(places => {
        if (places && places.length > 0) {
          const sessionData = this.filtersService.getExploreSession();
          if (sessionData['data']['mapViewPostionState'] === 'tabularView'
           && sessionData['data']['selectQuery'] === 'Custom' && places && places.length > 0) {
            this.selectQuery = sessionData['data']['selectQuery'];
            /*this.formattedPlaces = places;
            this.dataSource.data = places;*/
            // const selected = places.filter(item => item.selected);
            // this.selectedCount = selected.length;
          }
        }

      // this.exploreDataService.saveCustomizedColumns(this.currentSortables);
    });

    this.mobileView = this.commonService.isMobile();
   // this.sort.sort(<MatSortable>({id: 'compi', start: 'asc', disableClear: false}));
   setTimeout(() => {
    this.dataSource.sort = this.sort;
   }, 500);

  }

  ngOnChanges(changes: SimpleChanges) {
    //  to update tabular view details on operation of each filters if tabular view open
    if (changes.updateTabularView && this.tabularView > 0) {
      if (!this.isTableLoading) {
        if (this.checkAnyFilterApplied()) {
          this.loadTabularData();
        } else {
          this.formattedPlaces = [];
        }
      }
    }
  }

  ngOnDestroy() {
    this.unSubscribe = false;
    this.exploreDataService.setTabularViewPlaces([]);
  }

  loadTabularData() {
    this.formattedPlaces = [];
    this.discoveringPanel = true;
    let filters = JSON.parse(JSON.stringify(this.exploreDataService.getSearchCriteria()));
    if (filters && Object.keys(filters).length === 0) {
      const sessionData = this.filtersService.getExploreSession();
      const requestBody = this.filtersService.normalizeFilterDataNew(sessionData);
      if (requestBody['sort']) {
        delete requestBody['sort'];
      }
      filters = requestBody;
    }
    const f1 =  JSON.parse(JSON.stringify(filters));
     if (f1.target_geography) {
      this.selectMarket = f1.target_geography;
      const filterSession = this.filtersService.getExploreSession();
      if (filterSession && filterSession['data'] && filterSession['data']['market']) {
        this.selectMarketName = filterSession['data']['market']['name'];
      }
    } else {
      this.selectMarket = '';
      this.selectMarketName = '';
    }
    this.conditionalFormatting = 1;
    f1['sort'] = { 'measure': 'index_comp_target', 'type': 'asc' };
    const f2 = JSON.parse(JSON.stringify(filters));
    f2['sort'] = { 'measure': 'imp', 'type': 'asc' };
    const f3 =  JSON.parse(JSON.stringify(filters));
    f3['sort'] = this.selectMarket
    ?
    { 'measure': 'imp_target_inmkt', 'type': 'asc' }
    :
    { 'measure': 'imp_target', 'type': 'asc' };
    const r1 = this.inventoryService.getInventories(f1);
    const r2 = this.inventoryService.getInventories(f2);
    const r3 = this.inventoryService.getInventories(f3);
    forkJoin([r1, r2, r3]).subscribe(results => {
      this.formatSpotsInFrameId(results).then(formatData => {
        this.loadTabularFormatData(formatData);
      });
    });
  }

  async formatSpotsInFrameId(frameData) {
    let mergedFeatures = [];
    for (let i = 0; i < frameData.length; i++) {
      await this.commonService.formatSpotsMeasures(frameData[i], true).then(spots => {
        let features = spots;
        switch (i) {
          case 0:
            features = this.sortFeaturesArray(features, 'index_comp_target');
            break;
          case 1:
            features = this.sortFeaturesArray(features, 'imp');
            break;
          case 2:
            features = this.sortFeaturesArray(features, this.selectMarket ? 'imp_target_inmkt' : 'imp_target');
            break;
          default:
            break;
        }
        mergedFeatures = mergedFeatures.concat(features);
      });
      return mergedFeatures;
     /* for (const prop of results[i]) {
        let ref;
        if (prop['spot_references'].length) {
          ref = prop['spot_references'][0]['measures'];
        }

        if (ref) {
          ref['frame_id'] = prop['frame_id'];
          ref['plant_frame_id'] = prop['plant_frame_id'];
          ref['plant_operator'] = this.getOperatorName(prop['representations']);
          ref['media_type'] = prop['media_type']['name'];
          propertieFeature.push({
            geometry: prop['location'],
            properties: ref,
            classification_type: prop['classification_type'] && prop['classification_type'] || [],
            construction_type: prop['construction_type'] && prop['construction_type'] || [] ,
            illumination_type: prop['illumination_type'] && prop['illumination_type'] || [],
            max_height: prop['max_height'] &&
             this.formatService.sanitizeString(this.formatService.getFeetInches(prop['max_height'])) || '',
            max_width: prop['max_width'] && this.formatService.sanitizeString(this.formatService.getFeetInches(prop['max_width'])) || '',
            digital: prop['digital'] && prop['digital'] || '',
          });
        }
      }*/
    }
  }

  async loadTabularFormatData(mergedFeatures) {
    let isTargetKey = false;
    let isMarketKey = false;
    let uniqueFeatures = [];
    let indexes = [];
    await mergedFeatures.map((feature) => {
      // feature.selected = true;
      if (uniqueFeatures.length > 0) {
        indexes = uniqueFeatures.map(function (uniqueFeature, index) {
          if (uniqueFeature.properties.spot_id === feature['properties']['spot_id']) {
            return index;
          }
        }).filter(isFinite);
      } else {
        indexes = [];
      }
      if (indexes.length > 0) {
        const index = indexes[0];
        const s1 = uniqueFeatures[index].sortedColumns;
        const s2 = feature.sortedColumns;

        const si1 = uniqueFeatures[index].sortedIndexes;
        const si2 = feature.sortedIndexes;

        uniqueFeatures[index].sortedColumns = this.extend(s1, s2);
        uniqueFeatures[index].sortedIndexes = this.extend(si1, si2);
      } else {
        uniqueFeatures.push(feature);
      }

    });
    let defaultSortQuery = this.getColumnKey(this.defaultSortQuery['name']);
    if (typeof defaultSortQuery === 'undefined' || defaultSortQuery === '') {
      defaultSortQuery = 'index_comp_target';
    }
    // this.formattedPlaces = this.sortFeaturesArray(uniqueFeatures,'tgtwi',true);

    if (this.defaultSelectQuery !== 'Custom') {
      this.formattedPlaces = this.sortFeaturesArray(uniqueFeatures, defaultSortQuery, true);
      this.selectTopList(this.defaultSelectQuery, this.isTableLoading);
      // this.currentSortables = this.sortables.map(x => Object.assign({}, x));
      this.dataSource.data = this.formattedPlaces;
    } else {
      const seletedPanels = [];
      this.selectedFidsArray.map(place => {
        if (place.selected) {
          seletedPanels.push(place.frame_id);
        }
      });
      uniqueFeatures = uniqueFeatures.map(place => {
        if (seletedPanels.indexOf(place.properties.frame_id) !== -1) {
          place.selected = true;
        } else {
          place.selected = false;
        }
        return place;
      });
      this.formattedPlaces = this.sortFeaturesArray(uniqueFeatures, defaultSortQuery, true);
      this.selectTopList(this.defaultSelectQuery, this.isTableLoading);
      this.dataSource.data = this.formattedPlaces;
    }
    // this.afterSelectionOption();
    this.discoveringPanel = false;

    this.displaySortables = this.sortables.map(x => Object.assign({}, x));

    const localCustomColum = JSON.parse(localStorage.getItem('exploreCustomColumn'));
    if (localCustomColum === null || localCustomColum.length === 0) {
        this.currentSortables = this.displaySortables;
        this.displaySortables = [];
    }
    if (this.currentSortables.length === 0 && localCustomColum.length > 0) {
      this.currentSortables = localCustomColum;
    }
    if (this.currentSortables && this.currentSortables.length > 0) {
      this.displaySortables = this.currentSortables;
    }
    if (this.selectMarket) {

      if (this.currentSortables && this.currentSortables.length > 0) {
        const sortableKey = this.isExist('imp_target', this.currentSortables);
        const isMarketExist = this.isExist('imp_target_inmkt', this.currentSortables);
        const isSortableExist = this.isExist('imp_target', this.sortables);
        if (typeof sortableKey !== 'undefined') {
          isMarketKey = true;
          this.currentSortables.splice(sortableKey, 1);
        }
        if (typeof isSortableExist !== 'undefined') {
          this.sortables.splice(sortableKey, 1);
        }
        if (typeof isMarketExist === 'undefined' && isMarketKey) {
          const obj = {name: 'In-Mkt Target Imp', displayname: 'Target In Market Impressions', value: 'imp_target_inmkt'};
          this.currentSortables.splice(sortableKey, 0, obj);
        }
      }
    } else {

      if (this.currentSortables && this.currentSortables.length > 0) {
        const sortableKey = this.isExist('imp_target_inmkt', this.currentSortables);
        const isSortableExist = this.isExist('imp_target_inmkt', this.sortables);
        const isTargetExist = this.isExist('imp_target', this.currentSortables);
        if (typeof sortableKey !== 'undefined') {
          isTargetKey = true;
          this.currentSortables.splice(sortableKey, 1);
        }
        if (typeof isSortableExist !== 'undefined') {
          this.sortables.splice(sortableKey, 1);
        }
        if (typeof isTargetExist === 'undefined' && isTargetKey) {
          const obj = {name: 'Target Imp', displayname: 'Target Weekly Impressions', value: 'imp_target'};
          this.currentSortables.splice(sortableKey, 0, obj);
        }
      }
    }


    if (this.measuresLicense !== 'active') {
      this.currentSortables = this.publicSiteColumn;
    }

    this.setLocalStorage(this.currentSortables);
    this.filtersService.updateFiltersData({customColumns: this.currentSortables});

    this.displaySortables = this.displaySortables.map(c => c['value']);

    if (this.displaySortables.indexOf('checked') === -1) {
      this.displaySortables.splice(0, 0, 'checked');
      const obj = {
        'name': 'CHECKBOX',
        'displayname': '',
        'value': 'checked'
      };
      this.currentSortables.splice(0, 0, obj);
    }
    if (this.displaySortables.indexOf('position') === -1) {
      this.displaySortables.splice(1, 0, 'position');
      const obj = {
        'name': 'SLNO',
        'displayname': '#',
        'value': 'position'
      };
      this.currentSortables.splice(1, 0, obj);
    }
    this.isTableLoading = false;
  }

  getOperatorName(representations: Representation[]): string {
    let opp = '';
    if (representations) {
      const representation = representations.find(rep => rep['representation_type']['name'] === 'Own');
      if (representation) {
        opp = representation['account']['parent_account_name'];
        // opp = representation['division']['plant']['name'];
      }
    }
    return opp;
  }

  setLocalStorage(customColumns) {
    localStorage.setItem('exploreCustomColumn', JSON.stringify(customColumns));
  }
  enlargeTable() {
    if (this.tabularView < 2) {
      this.tabularView++;
      this.managePositions();
      this.tablurMapHeight.emit(this.mapHeight);
    }
  }
  shrinkTable() {
    if (this.tabularView > 0) {
      this.tabularView--;
      this.managePositions();
    }
    this.tablurMapHeight.emit('close');
    // this.tableHeight = '';
    // this.style = {};
  }
  hideTable() {
    this.tabularView = 0;
    this.managePositions();
    this.formattedPlaces = [];
  }
  managePositions() {
    if (this.mapViewPostionState === 'tabularView') {
      this.formattedPlaces = [];
      this.exploreDataService.setMapViewPostionState('mapView');
      this.mapViewPostionState = 'mapView';
      this.tabularView = 0;
    } else {
      this.tablurMapHeight.emit(this.mapHeight);
      this.exploreDataService.setMapViewPostionState('tabularView');
      this.mapViewPostionState = 'tabularView';
      this.tabularView = 1;
      // commented on avoid duplicate calling
     /* if (this.formattedPlaces.length <= 0) {
        this.loadTabularData();
      }*/
    }
    // this.exploreDataService.saveTabularViewPosition(this.tabularView);
  }
  sortColumn(col = 'index_comp_target', sortCol = 'index_comp_target') {
    const filters = this.exploreDataService.getSearchCriteria();
    // filters['sort'] = col;
    // let sortColumn = this.getColumnKey(col);
    this.sortColumnQuery = sortCol;
    if (this.sort['_direction'] === 'asc') {
      this.sortByAsc = true;
      filters['sort'] = { 'measure': sortCol, 'type': 'asc'};
    } else {
      this.sortByAsc = false;
      filters['sort'] = { 'measure': sortCol, 'type': 'desc'};
    }
    // this.sortByAsc = !this.sortByAsc;
    this.formattedPlaces = this.sortFeaturesArray(this.formattedPlaces, sortCol, true, this.sortByAsc);
    this.selectTopList(this.selectQuery);
    this.dataSource.data = this.formattedPlaces;
  }

  sortFeaturesArray(features, sortColumn, sortOnly = false, sortByAsc = false) {
    this.sortColumnQuery = sortColumn;
    const numberAttributes = ['pct_imp_inmkt', 'trp', 'imp_inmkt', 'pop_target_inmkt', 'imp_target', 'imp'];
    const formattedAttributes = ['index_comp_target', 'imp', 'imp_target_inmkt', 'imp_target'];
    let sortedFeatures = JSON.parse(JSON.stringify(features));
    if (!sortOnly) {
      if (sortColumn === 'frame_id') {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
          (a.properties[sortColumn] > b.properties[sortColumn]) : (a.properties[sortColumn] < b.properties[sortColumn])) ? -1 : 1;
        });
      } else if (formattedAttributes.indexOf(sortColumn) !== -1) {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
          b.properties[sortColumn] - a.properties[sortColumn] : a.properties[sortColumn] - b.properties[sortColumn]);
        });
      } else if (numberAttributes.indexOf(sortColumn) !== -1) {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
          (b.properties[sortColumn] - a.properties[sortColumn]) : (a.properties[sortColumn] - b.properties[sortColumn]));
        });
      } else if (sortColumn === 'plant_frame_id') {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
            (a.properties[sortColumn] > b.properties[sortColumn])
           : (a.properties[sortColumn] < b.properties[sortColumn]))
           ? -1 : 1;
        });
      } else {
        sortedFeatures = sortedFeatures.sort(function (left, right) {
          // return left.properties[sortColumn].localeCompare(right.properties[sortColumn]);
          return (!sortByAsc ?
          (left.properties[sortColumn] > right.properties[sortColumn]) :
          (left.properties[sortColumn] < right.properties[sortColumn])) ? -1 : 1;
        });
      }
      const perStep = Math.ceil(sortedFeatures.length / 5);
      let step = 1;
      let increment = 0;
      let index = 0;

      sortedFeatures.map((place) => {
        if (increment >= perStep) {
          step++;
          increment = 0;
        }
        increment++;
        index++;
        if (typeof place.sortedColumns === 'undefined') {
          place.sortedColumns = {};
        }
        if (typeof place.sortedIndexes === 'undefined') {
          place.sortedIndexes = {};
        }
        place.sortedIndexes[sortColumn] = index;
        place.sortedColumns[sortColumn] = 'conditional-step-' + step;
      });
    } else {
      if ( sortColumn === 'frame_id') {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
          (a.properties[sortColumn] < b.properties[sortColumn]) :
          (a.properties[sortColumn] > b.properties[sortColumn])) ? -1 : 1;
        });
      } else if (formattedAttributes.indexOf(sortColumn) !== -1) {
        let increment = 0;
        sortedFeatures = sortedFeatures.sort(function (a) {
          if (typeof a.sortedIndexes[sortColumn] === 'undefined' || a.sortedIndexes[sortColumn] === 1000) {
            a.sortedIndexes[sortColumn] = 1000;
            increment++;
          }
        });
        const s1 = sortedFeatures.sort(function (a, b) {
          if (typeof a.sortedIndexes[sortColumn] === 'undefined') {
            a.sortedIndexes[sortColumn] = 1000;
          }
          if (typeof b.sortedIndexes[sortColumn] === 'undefined') {
            b.sortedIndexes[sortColumn] = 1000;
          }
          return a.sortedIndexes[sortColumn] - b.sortedIndexes[sortColumn];
           /*return (sortByAsc ?
            (b.sortedIndexes[sortColumn] - a.sortedIndexes[sortColumn]) :
            (a.sortedIndexes[sortColumn] - b.sortedIndexes[sortColumn])
           );*/
        });
        const perstep = s1.length - increment;
        let sort1 = s1.slice(0, perstep);
        const sort2 = s1.slice(perstep);
        sort1 = sort1.sort(function (a, b) {
          return (sortByAsc ?
            (b.sortedIndexes[sortColumn] - a.sortedIndexes[sortColumn]) :
            (a.sortedIndexes[sortColumn] - b.sortedIndexes[sortColumn])
           );
        });
        sortedFeatures = sort1.concat(sort2);
      } else if (numberAttributes.indexOf(sortColumn) !== -1) {
        sortedFeatures = sortedFeatures.sort(function (a, b) {
          if (typeof a.sortedIndexes[sortColumn] === 'undefined') {
            a.sortedIndexes[sortColumn] = 1000;
          }
          /*if (typeof b.sortedIndexes[sortColumn] === 'undefined') {
            b.sortedIndexes[sortColumn] = 1000;
          }*/

          /*return (!sortByAsc ?
            (a.properties[sortColumn] < b.properties[sortColumn]) :
            (a.sortedIndexes[sortColumn] < b.sortedIndexes[sortColumn])
           ) ? -1 : 1;*/

           return (!sortByAsc ?
            (a.properties[sortColumn] - b.properties[sortColumn]) :
            (b.properties[sortColumn] - a.properties[sortColumn])
           );

        });

      } else if (sortColumn === 'plant_frame_id') {
          sortedFeatures = sortedFeatures.sort(function (a, b) {
          return (!sortByAsc ?
            (a.properties[sortColumn] < b.properties[sortColumn])
           : (a.properties[sortColumn] > b.properties[sortColumn]))
           ? -1 : 1;
        });
      } else {
        sortedFeatures = sortedFeatures.sort(function (left, right) {
          // return left.properties[sortColumn].localeCompare(right.properties[sortColumn]);
          return (!sortByAsc ?
            (left.properties[sortColumn] < right.properties[sortColumn]) :
            (left.properties[sortColumn] > right.properties[sortColumn])) ? -1 : 1;
        });
      }
    }
    return sortedFeatures;
  }

  extend(obj, src) {
    for (const key in src) {
      if (src.hasOwnProperty(key)) {
        obj[key] = src[key];
      }
    }
    return obj;
  }

  getColumnKey(sortkey) {
    const options = this.sortables;
    let obj = '';
    for (let i = 0; i < options.length; i++) {
      if (options[i].name === sortkey) {
        obj = options[i].value;
      }
    }
    return obj;
  }

  toggleConditionalFormatting() {
    this.conditionalFormatting = (this.conditionalFormatting > 0 ? 0 : 1);
  }

  selectCheckboxToggle(place) {
    const index = this.formattedPlaces.map((option) => option.properties.fid).indexOf(place.properties.fid);
    // let p = JSON.parse(JSON.stringify(this.formattedPlaces[index]));
    // if (index > -1) {
    //   if (this.formattedPlaces[index].selected) {
    //     console.log('checkbox if running');
    //     this.formattedPlaces[index].selected = false;
    //   } else {
    //     console.log('checkbox else running');
    //     this.formattedPlaces[index].selected = true;
    //   }
    // }

    /*if (this.mapViewPostionState === 'tabularView' || this.mapViewPostionState === 'tabularViewExtended') {
      this.filtersService.updateFiltersData({places:this.formattedPlaces});
    }*/
    this.placeSelect.emit(this.formattedPlaces[index]);
    this.afterSelectionOption();
  }

  selectAllCheckbox() {
    this.loaderService.display(true);
    this.selectAllInventoriesCheckbox = !this.selectAllInventoriesCheckbox;
    if (this.selectAllInventoriesCheckbox) {
      this.selectTopList('All');
    } else {
      this.selectTopList('None');
    }
    setTimeout(() => {
      this.loaderService.display(false);
    }, 500);
  }

  selectTopList(type, skipEmit: Boolean = false) {
    this.selectQuery = type;
    switch (this.selectQuery) {
      case 'All':
        this.selectQueryLimited = -1;
        this.formattedPlaces.map((place) => {
          place.selected = true;
        });
        if (!skipEmit) {
          this.select.emit(type);
        }
        break;
      case 'None':
        this.selectQueryLimited = 0;
        this.formattedPlaces.map((place) => {
          place.selected = false;
        });
        if (!skipEmit) {
          this.select.emit(type);
        }
        break;
      case 'Custom':
        this.selectQueryLimited = -2;
        break;
      case 'Top 25':
        this.selectQueryLimited = 25;
        this.selectLimited(25);
        if (!skipEmit) {
          this.select.emit(type);
        }
        break;
      case 'Top 50':
        this.selectQueryLimited = 50;
        this.selectLimited(50);
        if (!skipEmit) {
          this.select.emit(type);
        }
        break;
      case 'Top 100':
        this.selectQueryLimited = 100;
        this.selectLimited(100);
        if (!skipEmit) {
          this.select.emit(type);
        }
        break;
      default:
        this.formattedPlaces.map((place) => {
          place.selected = false;
        });
        break;
    }
    this.afterSelectionOption();
  }

  selectLimited(count: number) {
    this.formattedPlaces.map(item => item.selected = false);
    this.formattedPlaces.slice(0, count).map(item => item.selected = true);
  }

  afterSelectionOption() {
    const selected = this.formattedPlaces.filter(item => item.selected);
    this.selectedCount = selected.length;
    if (selected.length < this.formattedPlaces.length) {
      this.selectAllInventoriesCheckbox = false;
    } else {
      this.selectAllInventoriesCheckbox = true;
    }
    this.headerValueTotAudienceIm = 0;
    this.headerValueTgtAudienceIm = 0;
    this.headerValueTgtAudienceImComp = 0;
    // this.headerValueTotAudienceImPercent = 0;
    this.headerValueImTgtImp = 0;
    this.formattedPlaces.map((item) => {
      if (item.selected) {
        this.headerValueTotAudienceIm += item.properties.imp;
        if (this.selectMarket) {
          this.headerValueImTgtImp += item.properties.imp_target_inmkt;
        }
        this.headerValueTgtAudienceIm += item.properties.imp_target;
        this.headerValueTgtAudienceImComp += item.properties.index_comp_target;
        // this.headerValueTotAudienceImPercent += item.properties.totinmp;
      }
    });
    if (this.formattedPlaces.length > 0) {
      const number = this.selectQueryLimited;
      switch (number) {
        case -2:
          this.selectQuery = 'Custom';
          break;
        case -1:
          if (selected.length >= this.formattedPlaces.length) {
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
        if (this.selectedCount  === number) {
            this.selectQuery = 'Top 25';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        case 50:
         if (this.selectedCount  === number) {
            this.selectQuery = 'Top 50';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        case 100:
           if (this.selectedCount === number) {
            this.selectQuery = 'Top 100';
          } else {
            this.selectQuery = 'Custom';
          }
          break;
        default:
          this.selectQuery = 'All';
          break;
      }
    }
  }
  exportPDF() {
    const selected = this.formattedPlaces
      .filter(place => place.selected)
      .map(place => place.properties.spot_id.toString());
    this.pdfExport.emit(selected);
  }
/**
 * Export csv for tabular view function
 */
  exportCSV() {
    if (this.formattedPlaces.length <= 0) {
      swal('Sorry', 'There is no data available for exporting');
      return;
    }
    const selectedIDs = this.formattedPlaces.map(place => place.selected = place.properties.spot_id );
    const headerData = this.exploreDataService.getCSVHeaders(true, this.currentSortables);

    const exportParmas: BulkExportRequest = {
      panel_id: selectedIDs,
      aud: this.selectTargetId ,
      aud_name: this.selectTarget,
      type: 'inventory_details',
      site: this.themeSettings.site,
      report_format: 'csv',
      columns: headerData,
      target_segment: this.selectTargetId
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

    this.exploreService.inventoriesBulkExport(exportParmas, true).pipe(takeWhile(() => this.unSubscribe))
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

  clickOnRow(prop, i) {
    this.clickedRowIndex = i + 1;
    this.placeClick.emit(prop['spot_id']);
  }
  onResize(event) {
    if (this.mapViewPostionState === 'tabularView') {
      const mapHeight = this.elementView.nativeElement.offsetHeight;
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
    }
  }

  onResizeEnd(event: ResizeEvent): void {
    this.isResizingElement = false;
    this.tablurMapHeight.emit(this.mapHeight);
    this.tableHeight = this.tableHeightEnd;
  }
  onResizing(event) {
    this.isResizingElement = true;
    if (event.rectangle.top >= 333 && event.rectangle.height >= 250 ) {
      this.style = {
        position: 'fixed',
        // left: `${event.rectangle.left}px`,
        top: `${event.rectangle.top }px`,
        // width: `${event.rectangle.width}px`,
        height: `${event.rectangle.height}px`
      };
      this.mapHeight = event.rectangle.height;
      this.tableHeightEnd = (window.innerHeight - event.rectangle.top) - 110;
      // this.tablurMapHeight.emit(this.mapHeight);
    }
  }
  customizeColumn() {
    this.loaderService.display(true);
    if (this.currentSortables && this.currentSortables.length > 0 ) {
      this.removeDuplicates(this.currentSortables, this.sortables);
    } else {
      this.currentSortables = this.sortables.map(x => Object.assign({}, x));
      this.sortables = [];
    }

    const isFrequency = this.isExist('freq_avg', this.currentSortables);
    const isSortableFrequency = this.isExist('freq_avg', this.sortables);
    if (isFrequency === undefined) {
      const defaultAvailableColumn = {'name': 'Frequency', 'displayname': 'Target In-Market Frequency', 'value': 'freq_avg'};
      if (isSortableFrequency === undefined) {
        this.sortables.push(defaultAvailableColumn);
      }
    }
    const isTotinmi = this.isExist('imp_inmkt', this.currentSortables);
    const isSortableTotinmi = this.isExist('imp_inmkt', this.sortables);
    if (isTotinmi === undefined) {
      const defaultAvailableColumn_1 = {'name': 'Tot In-Market Imp', 'displayname': 'Total In-Market Impressions', 'value': 'imp_inmkt'};
      if (isSortableTotinmi === undefined) {
        this.sortables.push(defaultAvailableColumn_1);
      }
    }

    const isCwi = this.isExist('pct_comp_imp_target', this.currentSortables);
    const isSortableCwi = this.isExist('pct_comp_imp_target', this.sortables);
    if (isCwi === undefined) {
      const defaultAvailableColumn_2 = {
        'name': 'Target Imp Comp Percentage',
        'displayname': 'Target % Impression Comp',
        'value': 'pct_comp_imp_target'
      };
      if (isSortableCwi === undefined) {
        this.sortables.push(defaultAvailableColumn_2);
      }
    }

    const isTgtinmp = this.isExist('pct_imp_target_inmkt', this.currentSortables);
    const isSortableTgtinmp = this.isExist('pct_imp_target_inmkt', this.sortables);
    if (isTgtinmp === undefined) {
      const defaultAvailableColumn_3 = {
        'name': 'Target % In-Market Imp',
        'displayname': 'Target % In-Market Impressions',
        'value': 'pct_imp_target_inmkt'
      };
      if (isSortableTgtinmp === undefined) {
        this.sortables.push(defaultAvailableColumn_3);
      }
    }
    const isCompinmi = this.isExist('pct_comp_imp_target_inmkt', this.currentSortables);
    const isSortableCompinmi = this.isExist('pct_comp_imp_target_inmkt', this.sortables);
    if (isCompinmi === undefined) {
      const defaultAvailableColumn_4 = {
        'name': 'Target % In-Market Impr.. Comp.',
        'displayname': 'Target % In-Market Impr. Comp.',
        'value': 'pct_comp_imp_target_inmkt'
      };
      if (isSortableCompinmi === undefined) {
        this.sortables.push(defaultAvailableColumn_4);
      }
    }

    const isTrp = this.isExist('trp', this.currentSortables);
    const isSortableTrp = this.isExist('trp', this.sortables);
    if (isTrp === undefined) {
      const defaultAvailableColumn_5 = {
        'name': 'Target In-Market Rating Points',
        'displayname': 'Target In-Market Rating Points',
        'value': 'trp'
      };
      if (isSortableTrp === undefined) {
        this.sortables.push(defaultAvailableColumn_5);
      }
    }

    const isTotinmp = this.isExist('pct_imp_inmkt', this.currentSortables);
    const isSortableTotinmp = this.isExist('pct_imp_inmkt', this.sortables);
    if (isTotinmp === undefined) {
      const defaultAvailableColumn_6 = {'name': 'Total % In-Mkt Impr.', 'displayname': 'Total % In-Mkt Impr.', 'value': 'pct_imp_inmkt'};
      if (isSortableTotinmp === undefined) {
        this.sortables.push(defaultAvailableColumn_6);
      }
    }

    const isClassification = this.isExist('classification_type', this.currentSortables);
    const isSortableClassification = this.isExist('classification_type', this.sortables);
    if (isClassification === undefined) {
      const defaultAvailableColumn_7 = {'name': 'classification_type', 'displayname': 'Classification', 'value': 'classification_type'};
      if (isSortableClassification === undefined) {
        this.sortables.push(defaultAvailableColumn_7);
      }
    }

    const isConstruction = this.isExist('construction_type', this.currentSortables);
    const isSortableConstruction = this.isExist('construction_type', this.sortables);
    if (isConstruction === undefined) {
      const defaultAvailableColumn_8 = {'name': 'construction_type', 'displayname': 'Construction', 'value': 'construction_type'};
      if (isSortableConstruction === undefined) {
        this.sortables.push(defaultAvailableColumn_8);
      }
    }

    const isDigital = this.isExist('digital', this.currentSortables);
    const isSortableDigital = this.isExist('digital', this.sortables);
    if (isDigital === undefined) {
      const defaultAvailableColumn_9 = {'name': 'digital', 'displayname': 'Digital', 'value': 'digital'};
      if (isSortableDigital === undefined) {
        this.sortables.push(defaultAvailableColumn_9);
      }
    }

    const isheight = this.isExist('max_height', this.currentSortables);
    const isSortableheight = this.isExist('max_height', this.sortables);
    if (isheight === undefined) {
      const defaultAvailableColumn_10 = {'name': 'height', 'displayname': 'Height (ft & in)', 'value': 'max_height'};
      if (isSortableheight === undefined) {
        this.sortables.push(defaultAvailableColumn_10);
      }
    }

    const isWidth = this.isExist('max_width', this.currentSortables);
    const isSortableWidth = this.isExist('max_width', this.sortables);
    if (isWidth === undefined) {
      const defaultAvailableColumn_11 = {'name': 'width', 'displayname': 'Width (ft & in)', 'value': 'max_width'};
      if (isSortableWidth === undefined) {
        this.sortables.push(defaultAvailableColumn_11);
      }
    }

    const isPrimaryArtery = this.isExist('primary_artery', this.currentSortables);
    const isSortablePrimaryArtery = this.isExist('primary_artery', this.sortables);
    if (isPrimaryArtery === undefined) {
      const defaultAvailableColumn_12 = {'name': 'primary_artery', 'displayname': 'Primary Artery', 'value': 'primary_artery'};
      if (isSortablePrimaryArtery === undefined) {
        this.sortables.push(defaultAvailableColumn_12);
      }
    }

    const isZipCode = this.isExist('zip_code', this.currentSortables);
    const isSortableZipCode = this.isExist('zip_code', this.sortables);
    if (isZipCode === undefined) {
      const defaultAvailableColumn_13 = {'name': 'zip_code', 'displayname': 'ZIP Code', 'value': 'zip_code'};
      if (isSortableZipCode === undefined) {
        this.sortables.push(defaultAvailableColumn_13);
      }
    }

    const isLongitude = this.isExist('longitude', this.currentSortables);
    const isSortableLongitude = this.isExist('longitude', this.sortables);
    if (isLongitude === undefined) {
      const defaultAvailableColumn_14 = {'name': 'longitude', 'displayname': 'Longitude', 'value': 'longitude'};
      if (isSortableLongitude === undefined) {
        this.sortables.push(defaultAvailableColumn_14);
      }
    }

    const isLatitude = this.isExist('latitude', this.currentSortables);
    const isSortableLatitude = this.isExist('latitude', this.sortables);
    if (isLatitude === undefined) {
      const defaultAvailableColumn_15 = {'name': 'latitude', 'displayname': 'Latitude', 'value': 'latitude'};
      if (isSortableLatitude === undefined) {
        this.sortables.push(defaultAvailableColumn_15);
      }
    }

    const isIlluminationType = this.isExist('illumination_type', this.currentSortables);
    const isSortableIlluminationType = this.isExist('illumination_type', this.sortables);
    if (isIlluminationType === undefined) {
      const defaultAvailableColumn_16 = {'name': 'illumination_type', 'displayname': 'Illumination Type', 'value': 'illumination_type'};
      if (isSortableIlluminationType === undefined) {
        this.sortables.push(defaultAvailableColumn_16);
      }
    }

    const isTgtAudImpr = this.isExist('tgt_aud_impr', this.currentSortables);
    const isSortableTgtAudImp = this.isExist('tgt_aud_impr', this.sortables);
    if (isTgtAudImpr === undefined) {
      const defaultAvailableColumn_17 = {'name': 'tgt_aud_impr', 'displayname': 'Target Audience Impressions', 'value': 'tgt_aud_impr'};
      if (isSortableTgtAudImp === undefined) {
        this.sortables.push(defaultAvailableColumn_17);
      }
    }

    const isMediaName= this.isExist('media_name', this.currentSortables);
    const isSortableMediaName = this.isExist('media_name', this.sortables);
    if (isMediaName === undefined) {
      const defaultAvailableColumn_18 = {'name': 'media_name', 'displayname': 'Media Name', 'value': 'media_name'};
      if (isSortableMediaName === undefined) {
        this.sortables.push(defaultAvailableColumn_18);
      }
    }

    const isOrientation = this.isExist('orientation', this.currentSortables);
    const isSortableOrientation = this.isExist('orientation', this.sortables);
    if (isOrientation === undefined) {
      const defaultAvailableColumn_19 = {
        'name': 'orientation', 'displayname': 'Orientation', 'value': 'orientation'
      };
      if (isSortableOrientation === undefined) {
        this.sortables.push(defaultAvailableColumn_19);
      }
    }

    this.sortables = this.sortables.filter(column => column['value'] !== 'checked');
    this.sortables = this.sortables.filter(column => column['value'] !== 'position');
    this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'checked');
    this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'position');

    const ref = this.dialog.open(CustomizeColumnComponent, {
      data: {'sortables': this.sortables, 'currentSortables' : this.currentSortables, origin: 'explore'},
      width: '700px',
      closeOnNavigation: true,
      panelClass: 'audience-browser-container'
    });
    this.loaderService.display(false);

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.clearColumn = res.clear;
        if (!this.clearColumn) {
          this.currentSortables = res.currentSortables;
          this.loadTabularData();
        }
      }
    });
  }

  isExist(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].value === nameKey) {
        return i;
      }
    }
  }

  removeDuplicates(a, b) {
    for (let i = 0, len = a.length; i < len; i++) {
      for (let j = 0, len2 = b.length; j < len2; j++) {
        if (a[i].name === b[j].name) {
            b.splice(j, 1);
            len2 = b.length;
          }
      }
    }
  }

  /* removeFilter(idx, name) {
    const sortableValue = this.searchArray(name, this.currentSortables);
    this.sortables.push(sortableValue);
    this.currentSortables.splice(idx, 1);
    this.exploreDataService.saveCustomizedColumns(this.currentSortables);
 } */
 openPackage(type = 'add') {
    const data = {};
    let width = '500px';
    const height = 'auto';
    data['inventories'] = this.formattedPlaces;
    data['from'] = 'tabular';
    data['type'] = type;
    if (type !== 'add') {
      data['package'] = this.selectedPackage;
    }
    if (type === 'exist') {
      width = '586px';
    }
    const browser = this.dialog.open(ExploreSavePackageComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'save-package-container'
    });
  }
  openSaveScenario() {
    const data = {};
    const width = '500px';
    const height = 'auto';
    data['inventories'] = this.formattedPlaces;
    data['from'] = 'tabular';
    const browser = this.dialog.open(ExploreSaveScenariosComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'save-scenario-container'
    });
  }

  // This method will check whether any filter is applied or not
  private checkAnyFilterApplied() {
    const sessionData = this.filtersService.getExploreSession();
    if (!sessionData) {
      return false;
    }
    const filters = this.filtersService.normalizeFilterDataNew(sessionData);
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
    || (filters['measures_range_list'] && filters['measures_range_list'].length > 1)) && this.selectedFidsArray.length < 50000 ) {
      return true;
    } else {
      return false;
    }
  }
}
