import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { SummaryRequest } from '@interTypes/summary';
import {
  AuthenticationService,
  CommonService,
  ExploreDataService,
  ExploreService,
  FormatService,
  InventoryService,
  ThemeService
} from '@shared/services';
import {map, takeWhile, tap, delay, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FiltersService} from '../filters/filters.service';
import { of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-explore-metrics',
  templateUrl: './explore-metrics.component.html',
  styleUrls: ['./explore-metrics.component.less']
})
export class ExploreMetricsComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private dataService: ExploreDataService,
    private commonService: CommonService,
    private formatService: FormatService,
    private exploreService: ExploreService,
    private filterService: FiltersService,
    private auth: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private theme: ThemeService) { }
  public totalPage: any = 0;
  mobileView: boolean;
  public inventorySummary: any;
  public inventorySummaryOriginal: any;
  private alive = true;
  public allowInventory;
  public targetName = 'Total Pop 0+ yrs';
  public marketName = 'Market';
  public audienceLicense = {};
  public measuresLicense: any;
  customInventories: any;
  @Input() permission: any;
  @Input() places: any = [];
  @Input() selectedCount: any;
  @Input() selectQuery: any;
  @Input() sortQuery: any;
  @Input() filters: any;
  @Input() selectedFidsArray: any;
  @Input() filterApiCallLoaded: any;
  @Input() totalInventory: number;
  @Output() changeTotalPage: EventEmitter<any> = new EventEmitter();
  public isSmallScreen = false;
  metricProcessValue = 40;
  private inventorySummaryTimeout: any = null;
  private defaultAudience: any;
  debounceTimer = null;
  public selected = 0;
  public site = 'geopath';
  ngOnInit() {
    this.commonService.getMobileBreakPoint()
    .subscribe(isMobile => { this.isSmallScreen = isMobile; });
    this.mobileView = this.commonService.isMobile();
    this.allowInventory = this.permission['features']['gpInventory']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.measuresLicense = this.permission['features']['gpMeasures']['status'];
    this.customInventories = this.permission['features']['customInventories']['status'];
    this.defaultAudience = this.activatedRoute.snapshot.data.defaultAudience;
    const themeSettings = this.theme.getThemeSettings();
    this.site = themeSettings.site;
    this.dataService.getSummary()
      .pipe(takeWhile(() => this.alive))
      .subscribe(summary => {
        this.inventorySummary = summary;
        if (!summary.reset) {
          this.inventorySummaryOriginal = JSON.parse(JSON.stringify(summary));
        }
      delete this.inventorySummary.reset;
    });
    this.dataService.getSelectedTargetName()
      .pipe(takeWhile(() => this.alive))
      .subscribe(target => {
        if (target !== '') {
          this.targetName = target;
        }
    });
    this.dataService.getSelectedMarket()
      .pipe(takeWhile(() => this.alive))
      .subscribe(market => {
        if (market && typeof market !== 'undefined' && market.name) {
          this.marketName = market.name;
        } else {
          this.marketName = '';
        }
    });
    this.filterService.getFilters()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeWhile(() => this.alive),
        // tap(data => this.filterService.normalizeFilterDataNew(data)),
        map(data => {
          /**
           * To change the filter format and modify scenario and inventory
           * set into geoPanelID array we're using the below function
           */
          return this.filterService.normalizeFilterDataNew(data);
        }))
      .subscribe((filters: Partial<SummaryRequest>) => {
        this.dataService.setSummary({reset: true});
        this.loadSummaryFromAPI(filters);
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.places && changes.places.currentValue) {
      this.places =  changes.places.currentValue;
    }
    if (changes.selectQuery && changes.selectQuery.currentValue) {
      if (this.places && this.places.length > 0 && this.inventorySummary && typeof this.inventorySummary['imp'] !== 'undefined') {
        this.loadSummaryFromAPI(this.filters);
      } else if (changes.selectQuery.previousValue === 'None') {
        this.loadSummaryFromAPI(this.filters);
      }
    }
    if (changes.selectedFidsArray && changes.selectedFidsArray.currentValue) {
      if (this.places && this.places.length > 0 && this.inventorySummary && typeof this.inventorySummary['imp'] !== 'undefined') {
        this.loadSummaryFromAPI(this.filters);
      }
    }
  }

  loadSummaryFromAPI (filterData) {
    if (this.inventorySummaryTimeout !== null) {
      this.inventorySummaryTimeout.unsubscribe();
    }
    if (this.selectQuery === 'None' ) {
      this.dataService.setSummary({});
      return;
    }
    const filters = JSON.parse(JSON.stringify(filterData));

    if (this.selectQuery !== 'All') {
      const selected = this.selectedFidsArray.filter(f => f.selected);
      const fids = selected.map(s => s.fid);
      if (fids && fids.length > 0) {
        filters['id_type'] = 'frame_id';
        filters['id_list'] = fids;
      }
    }

    if (!filterData['audience'] && !filterData['target_segment']) {
      filters['target_segment'] = this.defaultAudience['audienceKey'];
      this.dataService.setSelectedTarget(this.defaultAudience['audienceKey']);
    } else if (filterData['target_segment']) {
      filters['target_segment'] = filterData['target_segment'];
    } else {
      filters['target_segment'] = filterData['audience']['key'];
    }
    delete filters['audience'];
    delete filters['page'];

    const r1 = this.inventoryService
    .getSummary(filters, true);
    const summaryAPIs = [r1];
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
    if (this.customInventories === 'active' && zeroMeasure) {
      summaryAPIs.push(this.getInventoryIDsFromES(filters));
    }
    this.inventorySummaryTimeout =  forkJoin(summaryAPIs).subscribe(results => {
      const summary = results[0];
      if (results[1]) {
        summary['spots'] = Number(summary['spots']) + Number(results[1]);
      }
      if (summary) {
        this.dataService.setSummary(summary);
      }
    });
    /* this.inventorySummaryTimeout = this.inventoryService
    .getSummary(filters, true)
    .subscribe(summary => {
      if (summary) {
        this.dataService.setSummary(summary);
      }
    }); */
  }

  getInventoryIDsFromES(filtersData) {
    let query = this.inventoryService.prepareInventoryQuery(filtersData);
    // query = this.inventoryService.addTotalQuery(query);
    query = this.inventoryService.addTotalSpotQuery(query);
    query['size'] = 0;
    return this.inventoryService.getInventoryFromElasticSearch(query)
      .pipe(map(res => {
        return res['aggregations']['spot_count']['value'];
      }));
  }

  convertCurrency(x) {
    return this.formatService.convertCurrencyFormat(x);
  }
  abbreviateNumber(number, decPlaces) {
    return this.formatService.abbreviateNumber(number, decPlaces);
  }
  convertToPercentage(key, decimal = 0) {
    return this.formatService.convertToPercentageFormat(key,  decimal);
  }

  ngOnDestroy() {
    this.alive = false;
  }
  getTargetComposition() {
    if (
      this.inventorySummary.frames > 0 &&
      this.inventorySummary.imp_target > 0 &&
      this.inventorySummary.imp > 0
    ) {
      const composition = this.inventorySummary.imp_target / this.inventorySummary.imp;
      return this.convertToPercentage(composition) + '%';
    } else if (Object.keys(this.inventorySummary).length <= 0) {
      return '-';
    }
    return '0%';
  }
  calculateProgressBarPercentage() {
    if (this.inventorySummary && this.inventorySummary.target_inMarket_impressions && this.inventorySummary.total_impressions) {
      const differentance = this.inventorySummary.total_impressions - this.inventorySummary.target_inMarket_impressions;
      const differentancePercantage = differentance / this.inventorySummary.total_impressions * 100;
      this.metricProcessValue = (100 - differentancePercantage);
    } else {
      this.metricProcessValue = 0;
    }
  }
  changePageTotal(value) {
    this.changeTotalPage.emit(value);
  }

  expandTable() {
    this.dataService.setMapViewPostionState('tabularView');
  }
}
