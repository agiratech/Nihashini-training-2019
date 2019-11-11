import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import {CustomizedSpot} from '@interTypes/inventory';
import {Measure, SpotReference} from '@interTypes/inventorySearch';
import {
  WorkSpaceService,
  FormatService,
  WorkSpaceDataService,
  LoaderService,
  InventoryService, CommonService,
  AuthenticationService
} from '../../../shared/services/index';
import swal from 'sweetalert2';
import {ExploreSavePackageComponent} from '../../../shared/components/explore-save-package/explore-save-package.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WorkflowLables } from '../../../Interfaces/workspaceV2';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { Subject, forkJoin, EMPTY} from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-scenarios-inventories',
  templateUrl: './scenarios-inventories.component.html',
  styleUrls: ['./scenarios-inventories.component.less']
})
export class ScenariosInventoriesComponent implements OnInit, OnChanges, OnDestroy {
  showFiller = false;
  inventoryData;
  addInventoryToogle = false;
  summary = {};
  inventoryTotalSummary: any = {};
  features = [];
  nextFeatures = [];
  sids = [];
  selectedFids = [];
  selectedPanels = [];
  @Input() scenario: any;
  @Input() audienceId: any;
  selectedFiltersCalled: any = false;
  @Input() mapQueryParams: any;
  @Input() marketId: any = '';
  selectedFilterData = {};
  selectedInventorySets = [];
  searchInventorySets = [];
  filterData = {};

  inventoryItems = [];
  sortingElement = '';
  public tempInventoryItems = [];
  public gpFilter = {};
  totalUnits = 0;
  page = 0;
  totalPages = 0;
  public scenarioId: any = '';
  private defaultAudience: any = {};
  @Output() updateInventerySet: EventEmitter<any> = new EventEmitter();
  @Output() updateSummary = new EventEmitter();
  calculateReachFrqsummary = {};
  filterSubscriber = null;
  inventoryUnitsSubscriber = null;
  loopedAgain = false;
  inventoryCount = 0;
  @Input() updateScenatio: any;
  @Output() getInventoryDetails = new EventEmitter();
  private csvSelectedInventory: any;
  public labels: WorkflowLables;
  private unSubscribe: Subject<void> = new Subject<void>();
  public loadingInventories = false;
  public loadingMoreInventories = false;
  totalRequestPage = 0;
  totalRequestPageForGP = 0;
  totalSpotForGP = 0;
  public customInventories: any = false;
  constructor(
    private workSpaceService: WorkSpaceService,
    private formatService: FormatService,
    public dialog: MatDialog,
    private workspaceDataService: WorkSpaceDataService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private inventoryService: InventoryService,
    private workspaceService: NewWorkspaceService,
    private commonService: CommonService,
    private auth: AuthenticationService
  ) {}
  ngOnInit() {
    this.defaultAudience =  this.activatedRoute.snapshot.data.defaultAudience;
    if (!this.audienceId && this.defaultAudience) {
      this.audienceId = this.defaultAudience.audienceKey;
    }
    this.labels = this.workspaceService.getLabels();
    const mod_permission = this.auth.getModuleAccess('explore');
    if (mod_permission
      && mod_permission.features
      && mod_permission.features.customInventories
      && mod_permission.features.customInventories.status
      && mod_permission.features.customInventories.status === 'active') {
      this.customInventories = true;
    }
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.scenario && changes.scenario.currentValue) {
      this.scenario =  changes.scenario.currentValue;
      this.scenarioId = this.scenario['_id'];
      this.selectedInventorySets = [];
      if (typeof this.scenario.package !== 'undefined' && this.scenario.package.length > 0) {
        this.selectedInventorySets = this.scenario.package;
      }
    }
    if (changes.audienceId && (changes.audienceId.currentValue || changes.audienceId.previousValue)) {
      const audience = changes.audienceId.currentValue;
      if (typeof audience !== 'undefined' && audience  !==  '') {
        this.audienceId = audience;
      } else {
        this.audienceId = this.defaultAudience.audienceKey;
      }
      // this.getAndAssignSummary();
      if (!(this.scenario && this.scenario['package'] && this.scenario['package'].length > 0 && !this.selectedFiltersCalled)) {
        this.page = 0;
        this.getInventoryItems(true , true);
      }
      /*if (changes.audienceId.previousValue) {
        this.page = 0;
        this.getInventoryItems(true , true);
      }*/
      /*if(typeof changes.audienceId.previousValue != 'undefined')
      {
        this.page = 0;
        this.getInventoryItems(true , true);
      }*/
    }
    if (changes.marketId && (changes.marketId.currentValue || changes.marketId.previousValue)) {
      const marketId = changes.marketId.currentValue;
      if (typeof marketId !== 'undefined' && marketId !== 'us') {
        this.marketId = marketId;
      } else {
        this.marketId = '';
      }
      // this.getAndAssignSummary();
      if (!(this.scenario && this.scenario['package'] && this.scenario['package'].length > 0 && !this.selectedFiltersCalled)) {
        this.page = 0;
        this.getInventoryItems(true , true);
      }
      /*if (changes.marketId.previousValue) {
        this.page = 0;
        this.getInventoryItems(true , true);
      }*/
      /*if(typeof changes.marketId.previousValue != 'undefined')
      {
        this.page = 0;
        this.getInventoryItems(true , true);
      }*/
    }
    if (changes.updateScenatio && !changes.updateScenatio['firstChange']) {
      this.page = 0;
      this.updateInventorySummary(this.filterData, true);
     // this.getInventoryItems(true , true);
    }
  }
  getTargetComposition() {
    if (
      this.summary['spots'] > 0 &&
      this.summary['imp_target'] > 0 &&
      this.summary['imp'] > 0
    ) {
      const composition = this.summary['imp_target'] / this.summary['imp'];
      return this.convertToPercentage(composition) + '%';
    }
    return '0%';
  }
  convertToPercentage(key, decimal = 0) {
    return this.formatService.convertToPercentageFormat(key,  decimal);
  }
  getInventoryItems(paging = false , initialCall = false, sortOption = null) {
    this.loadingInventories = true;
    if (this.filterSubscriber != null) {
      this.filterSubscriber.unsubscribe();
      this.filterSubscriber = null;
    }
    if (paging && this.page > 0) {
      this.filterData['page'] = this.page;
    } else {
      this.page = 0;
      this.filterData['page'] = 0;
    }
    if (this.audienceId === '' || this.audienceId === null) {
      this.audienceId = this.defaultAudience.audienceKey;
    }
    this.filterData['audience'] =  this.audienceId;
    this.filterData['base'] = 'pf_pop_a18p';
    if (this.marketId) {
      this.filterData['audienceMarket'] =  this.marketId;
      this.filterData['location'] =  {'type': 'geography', 'selectedGeoLocation' : {
        'id' : this.marketId
      }};
    } else {
      delete this.filterData['audienceMarket'];
      delete this.filterData['location'];
    }
    if (sortOption) {
      this.filterData['sort'] = sortOption['sortBy'];
      this.filterData['sort_type'] = sortOption['order'];
    }
    this.filterData['package_calc'] =  true;
    const formattedFilters = this.inventoryService.normalizeFilterDataNew(this.filterData);
    formattedFilters.measures_range_list = [{type: 'imp', min: 0}];
    // Converted the single gpFilter inventory call to two API calls to implemented API decompose.

    const gpInventories = this.inventoryService.getInventorySpotIds(formattedFilters)
                              .pipe(takeUntil(this.unSubscribe), catchError(error => EMPTY));
    const countAPIs = [gpInventories];
    if (this.customInventories) {
      countAPIs.push(this.getInventoryIDsFromES(formattedFilters).pipe(catchError(error => EMPTY)));
    }
    this.filterSubscriber = forkJoin(countAPIs).subscribe(results => {
      const sfids = [];
      if (results[0]['inventory_summary']
          && results[0]['inventory_summary']['frame_list']
          && results[0]['inventory_summary']['frame_list'].length > 0) {
         sfids.push(...results[0]['inventory_summary']['frame_list'].map(list => list.spot_id_list).flat());
      }
      if (results[1]) {
        sfids.push(...results[1]);
      }
      this.totalRequestPage = 0;
      this.totalRequestPageForGP = 0;
      this.totalSpotForGP = 0;
      if (initialCall) {
        this.features = [];
      }
      if (!(this.page > 0)) {
        if (sfids.length > 0)  {
          this.sids = sfids;
          this.selectedFids = [];
          this.selectedPanels = [];
          this.addInventories(this.sids);
          this.getInventories(true, true);
          this.inventoryCount = this.sids.length;
        } else {
          if (this.filterData && this.filterData['geopathPanelIdList'] && this.filterData['geopathPanelIdList'].length > 0) {
            this.selectedFids = [];
            this.selectedPanels = [];
            this.sids = this.filterData['geopathPanelIdList'];
            this.addInventories(this.sids);
            this.getInventories(true, true);
            this.inventoryCount = this.sids.length;
          } else {
            this.loadingInventories = false;
            this.inventoryCount = 0;
          }
        }
      } else {
        this.loadingInventories = false;
        this.inventoryCount = 0;
      }
    },
    e => {
      this.loadingInventories = false;
      let message = '';
      if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
        message = 'An error has occurred. Please try again later.';
      }
      swal('Error', message, 'error');
    });

    /* this.filterSubscriber = this.inventoryService.getInventorySpotIds(formattedFilters).pipe(takeUntil(this.unSubscribe)).subscribe(
      result => {
        console.log('result', result);
        this.totalRequestPage = 0;
        this.totalRequestPageForGP = 0;
        this.totalSpotForGP = 0;
        if (initialCall) {
          this.features = [];
        }
        if (!(this.page > 0)) {
          if (result['inventory_summary']
          && result['inventory_summary']['frame_list']
          && result['inventory_summary']['frame_list'].length > 0)  {
            this.sids = result['inventory_summary']['frame_list'].map(list => list.spot_id_list).flat(); // flat function will change later
            console.log('this.sids', this.sids);
            this.selectedFids = [];
            this.selectedPanels = [];
            this.addInventories(this.sids);
            this.getInventories(true, true);
            // this.getInventoriesFromES();
            this.inventoryCount = this.sids.length;
          } else {
            if (this.filterData && this.filterData['geopathPanelIdList'] && this.filterData['geopathPanelIdList'].length > 0) {
              this.selectedFids = [];
              this.selectedPanels = [];
              this.sids = this.filterData['geopathPanelIdList'];
              this.addInventories(this.sids);
              this.getInventories(true, true);
              this.inventoryCount = this.sids.length;
            } else {
              this.loadingInventories = false;
              this.inventoryCount = 0;
            }
          }
        } else {
          this.loadingInventories = false;
          this.inventoryCount = 0;
        }
      },
      e => {
        this.loadingInventories = false;
        let message = '';
        if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
          message = 'An error has occurred. Please try again later.';
        }
        swal('Error', message, 'error');
      }
    ); */
  }
  updateInventoryItems(features, totalUnits) {
    this.totalUnits = totalUnits;
    const total = totalUnits - 100;
    if (total > 0) {
      this.totalPages = Math.ceil(total / 100);
    } else {
      this.totalPages = 0;
    }
    this.tempInventoryItems = this.tempInventoryItems.concat(features);
    this.loadNextBatchPanels(100);
  }
  loadMorePanels() {
    if (!this.loadingMoreInventories) {
      this.loadingMoreInventories = true;
      if (this.tempInventoryItems.length > 0) {
        this.loadNextBatchPanels(100);
      } else if (this.totalRequestPage >= (this.page + 1)) {
        this.page = this.page + 1;
        this.filterData['page'] = this.page;
        if (this.totalRequestPageForGP > this.totalRequestPage) {
          this.getInventories(false, false);
        } else if (this.customInventories){
          this.getInventoriesFromES(false, false);
        }
      }
    }
  }
  loadNextBatchPanels(count = 100) {
    if (this.tempInventoryItems.length > 0) {
      const self = this;
      const batch = this.tempInventoryItems.splice(0, count);
      if (this.page > 0) {
        this.nextFeatures = batch;
      } else {
        this.features = this.features.concat(batch);
      }
    }
    setTimeout(() => {
      this.loadingMoreInventories = false;
    }, 200);
  }
  onClose(flag) {
    this.showFiller = flag;
  }

  public selectedFilters(filtersInfo) {
  /**
   * filterInfo contains two values
   * filterType will be either Inventory/Place
   * selectedFilters will contain selected filters data
  */
    if (filtersInfo.selectedFilters.data.length > 0) {
      if (typeof filtersInfo.selectedFilters !== 'undefined') {
        this.searchInventorySets = [];
        if (filtersInfo.selectedFilters['selected'] === 'packagePanel') {
          this.searchInventorySets = filtersInfo.selectedFilters.additionalData;
          const additionalData = filtersInfo.selectedFilters.additionalData.map(inventory => {
            if (inventory) {
              return inventory['_id'];
            }
          });
          if (additionalData.length > 0) {
            this.updateInventerySet.emit(additionalData);
          }
          // csv exportData
        const selectInvSet =  filtersInfo.selectedFilters.additionalData.map(inventory => inventory.name);
        this.csvSelectedInventory = {
          title: 'Saved Inventory Sets',
          data: selectInvSet
        };
        }
        this.inventoryItems = [];
        this.tempInventoryItems = [];
        this.totalPages = 0;
        this.page = 0;
        this.filterData['page'] = 0;
        if (filtersInfo.selectedFilters['selected'] === 'operatorPanel') {
          this.filterData['operatorPanelIdList'] = filtersInfo.selectedFilters.data;
          this.csvSelectedInventory = {
            title: 'Plant Unit IDs',
            data:  this.filterData['operatorPanelIdList']
          };
        } else {
          this.filterData['geopathPanelIdList'] = filtersInfo.selectedFilters.data;
          if (filtersInfo.selectedFilters['selected'] === 'geopathPanel') {
            this.csvSelectedInventory = {
              title: 'Geopath Panel IDs',
              data:  filtersInfo.selectedFilters.data
            };
          }
        }
        this.features = [];
        this.selectedFiltersCalled = true;
        this.getInventoryItems(true, filtersInfo.initial);
      }
    } else {
      this.csvSelectedInventory = {
        title: '',
        data:  ''
      };
      this.features = [];
      this.summary = {};
      if (this.filterData['operatorPanelIdList']) {
        delete this.filterData['operatorPanelIdList'];
      }
      if (this.filterData['geopathPanelIdList']) {
        delete this.filterData['geopathPanelIdList'];
      }
      this.summary['clearSummary'] = true;
      this.updateSummary.emit(this.summary);
      if (filtersInfo.filterType === 'Inventory') {
        this.updateInventerySet.emit([]);
      }
    }
  }
  saveNewInventorySets(type = 'add', p = null, saveFromFilter = false) {
    const data = {};
    let width = '500px';
    const height = 'auto';
    data['inventories'] = this.selectedFids;
    data['from'] = 'scenarios';
    data['type'] = type;
    if (type !== 'add') {
      data['package'] = this.searchInventorySets[0];
    }
    if (type === 'exist') {
      width = '586px';
    }
    data['saveFromFilter'] = false;
    const browser = this.dialog.open(ExploreSavePackageComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'save-package-container'
    }).afterClosed().subscribe(res => {
      if (res) {
        if (typeof res.addedPackage !== 'undefined' && res.addedPackage ) {
          this.updateInventerySet.emit([res.addedPackage]);
          this.selectedInventorySets = [res.addedPackage];
        }
      }
    });
  }
  onPanelSelectionChange(selectedFids, initialCall) {
    this.selectedPanels = selectedFids;
    this.getAndAssignSummary(initialCall);
    // this.calculateMetrics(selectedInfo.selectedInventory);
  }
  getAndAssignSummary(initialCall = false) {
    const filterData = {};
    filterData['audience'] =  this.audienceId;
    filterData['base'] = 'pf_pop_a18p';
    filterData['page'] = 0;
    let inventoryIds = [];
    // filterData['idType'] = 'geopathPanel';
    if (this.selectedPanels && this.selectedPanels.length > 0) {
      inventoryIds = this.selectedPanels.map(panel => panel.sid);
      filterData['geopathPanelIdList'] = inventoryIds;
    } else {
      filterData['geopathPanelIdList'] = [0];
    }
    if (this.marketId) {
      filterData['audienceMarket'] =  this.marketId;
    } else {
      delete this.filterData['audienceMarket'];
    }
    filterData['package_calc'] =  true;
    this.updateInventorySummary(filterData, initialCall);
  }
  customizeColumn() {
    localStorage.setItem('isDialogOpen', 'true');
    this.workspaceDataService.setCustomizedColumnEmitter('open');
  }

  public sortInventory(sortItem) {
    this.getInventoryItems(true, true, sortItem);
  }
  public calculateMetrics(inventory) {
    const selectedInventory = inventory['inventory'];
    if (selectedInventory) {
      // if (selectedInventory.length <= 0 || selectedInventory.length > 100) {

      // To fetch and update the inventory details using csv export
      const csvData = {
        selectedOption: this.csvSelectedInventory,
        selectedInventory: selectedInventory,
        customizedColumn: inventory['customizedColumn']
      };
      this.getInventoryDetails.emit(csvData);

      if (selectedInventory.length <= 0) {
        this.inventoryTotalSummary = {};
        return;
      }
      this.loaderService.display(true);
      const inventoryTotalSummary = {};
      inventoryTotalSummary['totwi'] = 0;
      inventoryTotalSummary['tgtwi'] = 0;
      inventoryTotalSummary['tgtinmi'] = 0;
      inventoryTotalSummary['trp'] = 0;
      inventoryTotalSummary['tgtmp'] = 0;
      inventoryTotalSummary['totmp'] = 0;
      inventoryTotalSummary['totinmi'] = 0;
      inventoryTotalSummary['totinmp'] = 0;
      inventoryTotalSummary['cwi'] = 0;
      inventoryTotalSummary['tgtinmp'] = 0;
      inventoryTotalSummary['compinmi'] = 0;
      inventoryTotalSummary['freq'] = 0;
      inventoryTotalSummary['compi'] = 0;
      selectedInventory.map((inventory) => {
        inventoryTotalSummary['tgtmp'] += inventory.tgtmp;
        inventoryTotalSummary['totmp'] += inventory.totmp;
        inventoryTotalSummary['totwi'] += inventory.totwi;
        inventoryTotalSummary['tgtwi'] += inventory.tgtwi;
        inventoryTotalSummary['tgtinmi'] += inventory.tgtinmi;
        inventoryTotalSummary['trp'] += inventory.trp;
        inventoryTotalSummary['totinmi'] += inventory.totinmi;
        inventoryTotalSummary['totinmp'] += inventory.totinmp;
        inventoryTotalSummary['cwi'] += inventory.cwi;
        inventoryTotalSummary['tgtinmp'] += inventory.tgtinmp;
        inventoryTotalSummary['compinmi'] += inventory.compinmi;
        inventoryTotalSummary['freq'] += inventory.freq;
      });
      setTimeout(() => {
        const totUnits = selectedInventory.length;
        inventoryTotalSummary['cwi'] = inventoryTotalSummary['cwi'] / totUnits;
        inventoryTotalSummary['compinmi'] = inventoryTotalSummary['compinmi'] / totUnits;
        inventoryTotalSummary['tgtinmp'] = inventoryTotalSummary['tgtinmp'] / totUnits;
        inventoryTotalSummary['totinmp'] = inventoryTotalSummary['totinmp'] / totUnits;
        inventoryTotalSummary['compi'] = 100 * (
          (inventoryTotalSummary['tgtinmi'] / inventoryTotalSummary['totwi']) /
          (inventoryTotalSummary['tgtmp'] / inventoryTotalSummary['totmp'])
        );
        this.inventoryTotalSummary = inventoryTotalSummary;
        this.loaderService.display(false);
      }, 100);
    } else {
      this.inventoryTotalSummary = {};
      return;
    }
  }
  getReachFrequence() {
    const filterData = {};
    filterData['audience'] =  this.audienceId;
    filterData['base'] = 'pf_pop_a18p';
    filterData['page'] = 0;
    let inventoryIds = [];
    // filterData['idType'] = 'geopathPanel';
    if (this.selectedPanels && this.selectedPanels.length > 0) {
      inventoryIds = this.selectedPanels.map(panel => panel.sid);
      filterData['geopathPanelIdList'] = inventoryIds;
    } else {
      filterData['geopathPanelIdList'] = [0];
    }
    if (this.marketId) {
      filterData['audienceMarket'] =  this.marketId;
    } else {
      delete this.filterData['audienceMarket'];
    }
    // filterData['package_calc'] =  true;
    const formattedFilters = this.inventoryService.normalizeFilterDataNew(filterData);
    this.inventoryService.getSummary(formattedFilters).subscribe(res => {
      this.calculateReachFrqsummary = res;
    });
  }

  updateInventorySummary(filterData, initialCall) {
    const formattedFilters = this.inventoryService.normalizeFilterDataNew(this.filterData);
    formattedFilters.measures_range_list = [{type: 'imp', min: 0}];
    const summary = this.inventoryService.getSummary(formattedFilters).pipe(takeUntil(this.unSubscribe), catchError(error => EMPTY));
    const summaryAPIs = [summary];
    if (this.customInventories) {
      const customDBData = this.getCustomDBSpotsCount(formattedFilters).pipe(catchError(error => EMPTY));
      summaryAPIs.push(customDBData);
    }
    forkJoin(summaryAPIs).subscribe(results => {
      this.summary = results[0];
      if (results[1]) {
        this.summary['spots'] += results[1];
      }
      this.summary['assignSummary'] = initialCall;
      this.updateSummary.emit(this.summary);
    });
    /* this.inventoryService.getSummary(formattedFilters).pipe(takeUntil(this.unSubscribe)).subscribe(res => {
      if (res) {
        console.log('res', res);
        this.summary = res;
        this.summary['assignSummary'] = initialCall;
        this.updateSummary.emit(this.summary);
      }
    }); */
  }
  /* 
    This function used to get Spot count from the Custom ElasticSearch index
    This to display the total count of the spots in summary
   */
  getCustomDBSpotsCount(filtersData) {
    const gpFilter = JSON.parse(JSON.stringify(filtersData));
    let query = this.inventoryService.prepareInventoryQuery(filtersData);
    query = this.inventoryService.addTotalSpotQuery(query);
    query['size'] = 0;
    return this.inventoryService.getInventoryFromElasticSearch(query)
      .pipe(map(res => {
        return res['aggregations']['spot_count']['value'];
      }));
  }
  /**
    This function used to get Frame count from the Custom ElasticSearch index 
    This to handle the pagination for the Custom ElasticSearch index
  */
  getCustomDBFramesCount(filtersData) {
    const gpFilter = JSON.parse(JSON.stringify(filtersData));
    let query = this.inventoryService.prepareInventoryQuery(filtersData);
    query = this.inventoryService.addTotalFramesQuery(query);
    query['size'] = 0;
    return this.inventoryService.getInventoryFromElasticSearch(query)
      .pipe(map(res => {
        return res['aggregations']['frames_count']['value'];
      }));
  }

  private getInventories(initialCall = false, summaryCall = false) {
    // if (this.inventoryUnitsSubscriber != null) {
    //   this.inventoryUnitsSubscriber.unsubscribe();
    // }
    if ( Number(this.totalRequestPage) !== 0 && (Number(this.page) > Number(this.totalRequestPage))) {
      this.loadingInventories = false;
      return;
    }
    const formattedFilters = this.inventoryService.normalizeFilterDataNew(this.filterData);
    if ((this.scenario['package'] && this.scenario['package'].length > 0)
      || (this.filterData['geopathPanelIdList'] && this.filterData['geopathPanelIdList'].length > 0)
      || (this.filterData['operatorPanelIdList'] && this.filterData['operatorPanelIdList'].length > 0)) {
        // Setting default value for threshold filters as it is mandatory to get correct results
        formattedFilters.measures_range_list = [{type: 'imp', min: 0}];
        formattedFilters['page'] = this.page + 1;
        // this.page = this.page + 1;
        this.inventoryService.getInventories(formattedFilters)
        .pipe(takeUntil(this.unSubscribe)).subscribe(results => {
          // const spots = [];
          this.commonService.formatSpotsMeasures(results).then(spots => {
            if (spots.length > 0) {
              this.updateInventoryItems(spots, this.inventoryCount);
            }
            this.loadingInventories = false;
          });

          if (this.totalRequestPage === 0 || initialCall) {
            const summary = this.inventoryService.getInventoriesPagesCount(formattedFilters)
            .pipe(takeUntil(this.unSubscribe), catchError(error => EMPTY));
            const summaryAPIs = [summary];
            if (this.customInventories) {
              /* This to handle the pagination for the Custom ElasticSearch index */
              const customDBData = this.getCustomDBFramesCount(formattedFilters).pipe(catchError(error => EMPTY));
              summaryAPIs.push(customDBData);
            }
            forkJoin(summaryAPIs).subscribe(resultPages => {
              this.totalRequestPage = resultPages[0]['number_of_pages'];
              this.totalRequestPageForGP = resultPages[0]['number_of_pages'];
              this.totalSpotForGP = resultPages[0]['number_of_spots'];
              if (resultPages[1]) {
                const total = Number(resultPages[1]);
                if (total > 0) {
                  this.totalRequestPage += Math.ceil(total / 100);
                }
                if (this.totalSpotForGP < 100 && this.totalRequestPageForGP < this.totalRequestPage) {
                  this.getInventoriesFromES(false, false);
                }
              }
            });
          }
           /* results.forEach(frame => {
            const spotsInFrame = frame.spot_references.map((spot: SpotReference) => {
              const measures: Measure = spot.measures;
              let status = 'disabled';
              if (this.commonService.checkValid('pop_inmkt', measures) &&
                this.commonService.checkValid('reach_pct', measures)) {
                status = 'open';
              }
              const location = frame['location'] || [];
              const formattedSpot: CustomizedSpot = {
                checked: false,
                opp: frame.representations[0]['account']['parent_account_name'],
                fid: spot.spot_id,
                mt: frame.media_type['name'],
                pid: frame.plant_frame_id,
                totwi: measures.imp,
                tgtwi: measures.imp_target,
                tgtinmi: measures.pct_imp_target_inmkt,
                compi: measures.index_comp_target,
                reach: measures.reach_pct,
                cwi: measures.pct_comp_imp_target,
                tgtinmp: measures.pct_imp_target_inmkt,
                compinmi: measures.pct_comp_imp_target_inmkt,
                totinmp: measures.pct_imp_inmkt,
                freq: measures.freq_avg,
                trp: measures.trp,
                totinmi: measures.imp_inmkt,
                tgtmp: measures.pop_target_inmkt,
                totmp: measures.pop_inmkt,
                tgt_aud_impr: measures.imp_target,
                status: status,
                classification_type: frame['classification_type'] ? frame['classification_type']['name'] : '',
                construction_type: frame['construction_type'] ? frame['construction_type']['name'] : '',
                digital: frame['digital'] ? frame['digital'] : '',
                max_height: frame['max_height'] && this.formatService
                  .sanitizeString(this.formatService
                    .getFeetInches(frame['max_height'])) || '',
                max_width: frame['max_width'] && this.formatService
                  .sanitizeString(this.formatService
                    .getFeetInches(frame['max_width'])) || '',
                primary_artery: location['primary_artery'] || '',
                zip_code: location['zip_code'] || '',
                longitude: location['longitude'] || '',
                latitude: location['latitude'] || '',
                orientation: location['orientation'] || '',
                illumination_type: (frame['illumination_type'] && frame['illumination_type']['name'])
                  ? frame['illumination_type']['name'] : '',
              };
              return formattedSpot;
            });
            spots.push(...spotsInFrame);
          });*/
        });
        if (summaryCall) {
          this.updateInventorySummary(this.filterData, initialCall);
        }
    } else {
      this.loadingInventories = false;
    }
  }

  private getInventoriesFromES(initialCall = false, summaryCall = false) {
    const formattedFilters = this.inventoryService.normalizeFilterDataNew(this.filterData);
    if ((this.scenario['package'] && this.scenario['package'].length > 0)
      || (this.filterData['geopathPanelIdList'] && this.filterData['geopathPanelIdList'].length > 0)
      || (this.filterData['operatorPanelIdList'] && this.filterData['operatorPanelIdList'].length > 0)) {
      // Setting default value for threshold filters as it is mandatory to get correct results
      formattedFilters.measures_range_list = [{ type: 'imp', min: 0 }];
      formattedFilters['page'] = this.page && this.page - 1;
      const query = this.inventoryService.prepareInventoryQuery(formattedFilters);
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
          this.commonService.formatSpotsMeasuresFromES(result['inventoryItems']).then(spots => {
            if (spots.length > 0) {
              this.updateInventoryItems(spots, this.inventoryCount);
            }
            this.loadingInventories = false;
          });
        });
    } else {
      this.loadingInventories = false;
    }
  }

  getInventoryIDsFromES(filtersData) {
    const gpFilter = JSON.parse(JSON.stringify(filtersData));
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
        return inventoryIDs;
      }));
  }

  private addInventories(inventories) {
    inventories.map((sid) => {
      this.selectedFids.push({'sid': sid, 'selected': true, 'status': 'open'});
        this.selectedPanels.push({'sid': sid, 'selected': true, 'status': 'open'});
    });
  }
}
