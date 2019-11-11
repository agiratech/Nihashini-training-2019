import { Component, OnInit, QueryList, ViewChildren, AfterViewInit, Input,
   Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ListKeyManager } from '@angular/cdk/a11y';
import {ArrowNavigationComponent} from '@shared/components/arrow-navigation/arrow-navigation.component';
import { FiltersService } from '../filters.service';
import { AuthenticationService } from '@shared/services/authentication.service';
import { ExploreDataService } from '@shared/services/explore-data.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Market, MarketType } from '@interTypes/marketType';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-market-filter',
  templateUrl: './market-filter.component.html',
  styleUrls: ['./market-filter.component.less']
})
export class MarketFilterComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() dmaList: any = [];
  @Input() cbsaList: Market[] = [];
  @Input() totalPages = 0;
  @Output() searchMarkets: EventEmitter<any> = new EventEmitter();
  @Output() loadMoreMarkets: EventEmitter<any> = new EventEmitter();
  @Output() resetMarkets: EventEmitter<any> = new EventEmitter();
  public searchCtrl: FormControl = new FormControl();
  public marketSelectionCtrl: FormControl = new FormControl();
  public markets: any = [];
  public filteredMarkets: Market[] = [];
  public selectedMarket = {};
  public appliedMarket = {};
  public keyboardEventsManager: ListKeyManager<any>;
  @ViewChildren(ArrowNavigationComponent) listItems: QueryList<ArrowNavigationComponent>;
  private mod_permission: any;
  public allowInventory = '';
  public audienceLicense = {};
  private unSubscribe: Subject<void> = new Subject<void>();
  private currentPage = 0;
  constructor(
    private filtersService: FiltersService,
    private auth: AuthenticationService,
    private exploreDataService: ExploreDataService,
    ) { }

  ngOnInit() {
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.filtersService.getFilters()
    .pipe(debounceTime(200),
    distinctUntilChanged(),
    takeUntil(this.unSubscribe))
    .subscribe((filters) => {
      this.setSelectedMarket();
      const filterSession = this.filtersService.getExploreSession();
      if (filterSession && filterSession['data'] && filterSession['data']['market']) {
        this.selectedMarket = filterSession['data']['market'];
        this.appliedMarket = filterSession['data']['market'];
        this.setData(filterSession['data']['market']);
        this.marketSelectionCtrl.patchValue(this.selectedMarket['type']);
      } else {
        this.selectedMarket = {};
        this.appliedMarket = {};
        this.marketSelectionCtrl.patchValue('DMA');
      }
    });
    this.filtersService.onReset().pipe(takeUntil(this.unSubscribe)).subscribe(type => {
      this.resetFilter();
    });

    this.marketSelectionCtrl.valueChanges.pipe(takeUntil(this.unSubscribe)).subscribe(value => {
      if (this.searchCtrl.value && this.searchCtrl.value.length > 0) {
        if (value === 'DMA') {
          this.resetMarkets.emit('CBSA');
        } else {
          this.resetMarkets.emit('DMA');
        }
      }
      this.currentPage = 1;
      this.setMarkets(value);
    });
    this.searchCtrl.valueChanges.pipe(
      takeUntil(this.unSubscribe)).subscribe(value => {
      if (this.marketSelectionCtrl.value === 'CBSA') {
        this.currentPage = 1;
        this.searchMarkets.emit({ search: value});
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.setMarkets(this.marketSelectionCtrl.value);
    if (changes.cbsaList && changes.cbsaList && this.searchCtrl.value && this.searchCtrl.value.length > 0) {
      setTimeout(() => {
        this.selectedMarket = this.cbsaList[0];
      }, 300);
    }
  }

  public ngAfterViewInit() {
    if (this.listItems['_results']) {
      this.keyboardEventsManager = new ListKeyManager<any>(this.listItems).withWrap().withTypeAhead();
      const filterSession = this.filtersService.getExploreSession();
      if (filterSession && filterSession['data'] && filterSession['data']['audienceMarket']) {
        const market = this.findMarket(filterSession['data']['audienceMarket']);
        if (market) {
          this.selectedMarket = market;
          this.appliedMarket = market;
        }
      }
    }
  }
  public filterMarkets(data) {
    if (data.emptySearch) {
      this.filteredMarkets = this.dmaList;
    } else {
      this.filteredMarkets = data.value;
    }
  }

  public resetFilter() {
    this.selectedMarket = {};
    this.appliedMarket = {};
    this.keyboardEventsManager.setActiveItem(null);
    if (this.marketSelectionCtrl.value === 'CBSA') {
      this.resetMarkets.emit('CBSA');
    }
    this.marketSelectionCtrl.patchValue('DMA');
    this.resetMarkets.emit('DMA');
    this.setData();
  }
  public clearFilter() {
    this.resetFilter();
    this.setGeographyData({});
    this.filtersService.clearFilter('market', true);
  }
  public setSelectedMarket(selectedMarket = {}) {
    if (typeof selectedMarket['id'] !== 'undefined') {
      this.selectedMarket = selectedMarket;
    } else {
      if (this.appliedMarket['id']) {
        this.selectedMarket = this.appliedMarket;
      } else {
        this.selectedMarket = {};
      }
    }
  }

  public submitMarket() {
    this.appliedMarket = this.selectedMarket;
    this.filtersService.setFilter('market', this.selectedMarket);
    this.setGeographyData(this.selectedMarket);
    this.setData(this.selectedMarket);
  }

  private setGeographyData(market) {
    if (market['id']) {
      const geographyData = market;
      geographyData['type'] = this.marketSelectionCtrl.value;
      this.filtersService.setFilter('location', { type: 'geography', selectedGeoLocation: geographyData});
      this.exploreDataService.setSelectedGeoLocationIdValue(geographyData);
    } else {
      this.filtersService.clearFilter('location', true);
      this.exploreDataService.setSelectedGeoLocationIdValue('');
    }
  }
  private setData(market = {}) {
    if (market['id']) {
      this.exploreDataService.setSelectedMarket(market);
    } else {
      this.exploreDataService.setSelectedMarket({});
    }
  }
  public findMarket(id) {
    return this.markets.find(market => market.id === id);
  }

  private setMarkets(type: MarketType) {
    switch (type) {
      case 'DMA':
        this.filteredMarkets = this.dmaList;
        this.markets = this.dmaList;
        break;
      case 'CBSA':
        this.filteredMarkets = this.cbsaList;
        this.markets = this.cbsaList;
        break;
    }
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }


  public loadMore() {
    this.currentPage += 1;
    if (this.currentPage <= this.totalPages) {
      this.loadMoreMarkets.emit({page: this.currentPage});
    }
  }
}
