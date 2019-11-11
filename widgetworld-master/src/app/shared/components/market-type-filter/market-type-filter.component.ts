import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { InventoryService } from '@shared/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionType, ModuleName, MarketType } from '@interTypes/marketType';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-market-type-filter',
  templateUrl: './market-type-filter.component.html',
  styleUrls: ['./market-type-filter.component.less']
})
export class MarketTypeFilterComponent implements OnDestroy {
  @Input() selectionType: SelectionType;
  @Input() module: ModuleName;
  private unSubscribe: Subject<void> = new Subject<void>();
  public dmaList: any = [];
  public dummyDmaList: any = [];
  public dummyCbsaList: any = [];
  public cbsaList: any = [];
  public inventoryMarketData;
  public totalPages = 0;
  searchQuery: any;
  constructor(private inventoryService: InventoryService, private acitivatedRoute: ActivatedRoute) {
    this.dummyDmaList = acitivatedRoute.snapshot.data['dummyMarkets'] || [];
    this.dmaList = acitivatedRoute.snapshot.data['dummyMarkets'] || [];
    this.inventoryService.getMarketsCBSAFromFile().pipe(takeUntil(this.unSubscribe)).subscribe(
      response => {
        this.dummyCbsaList = response || [];
        this.totalPages = Math.ceil(this.dummyCbsaList.length / 100);
        this.cbsaList = this.dummyCbsaList.slice(0, 100);
      }
    );
  }

  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  /**
   * Search in local from cbsa json
   * limited if search data more than 100 first 100 will be displayed
   * @param {*} { search } to be searched
   * @param params It is an object containing search text and market type values
   */
  public searchMarkets({search}): void {
    this.searchQuery = search.toUpperCase();
    const filteredData = this.dummyCbsaList.filter(data => {
      return data.name.toUpperCase().match(this.searchQuery);
    });
    if (filteredData.length > 100) {
      this.cbsaList = filteredData.slice(0, 100);
    } else {
      this.cbsaList = filteredData;
    }
  }

  /**
   * This function is for markets pagination
   * @param page It is an object containing search index of the array
   */
  public loadMoreMarkets({page}) {
    this.cbsaList = [...this.cbsaList, ...this.dummyCbsaList.filter( (data) => {
      return data.name.toUpperCase().match(this.searchQuery);
    }).slice((page - 1) * 100, page * 100)];
  }

  /**
   * This function is to reset the markets data
   * @param type
   */
  public resetMarkets(type: MarketType) {
    switch ( type) {
      case 'DMA':
        this.dmaList = this.dummyDmaList;
        break;
      case 'CBSA':
        this.cbsaList = [...this.cbsaList, ...this.dummyCbsaList.filter( (data) => {
          return data.name.toUpperCase().match(this.searchQuery);
        }).slice(0, 100)];
        break;
    }
  }

}
