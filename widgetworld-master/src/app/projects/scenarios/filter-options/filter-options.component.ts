import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InventoryService } from '@shared/services';
import { MarketType } from '@interTypes/marketType';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.less'],
})
export class FilterOptionsComponent implements OnInit, OnDestroy {

  optionsData = [];
  options: any[] = [];
  searchQuery: any;
  public selectedFilterOptions = [];
  public singleSelectOption = {};
  private selectedDummyFilterOptions = [];
  public selectAllStatus: Boolean = false;
  public method = 'multiple';
  public marketSelectionCtrl: FormControl = new FormControl();
  private unSubscribe: Subject<void> = new Subject<void>();
  cbsaList: any;
  dummyCbsaList: any;
  totalPages: any;
  dmaList: any;
  dummyDmaList: any;
  private currentPage = 1;
  public searchCtrl: FormControl = new FormControl();
  public enableCBSA = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private dialogRef: MatDialogRef<FilterOptionsComponent>,
    private inventoryService: InventoryService
  ) { }

  ngOnInit() {
    this.optionsData = this.dialogData.optionsData;
    if (this.dialogData.enableCBSA) {
      this.enableCBSA = this.dialogData.enableCBSA;
    }
    this.method = this.dialogData.method;
    if (this.method === 'single') {
      this.singleSelectOption = this.dialogData.selectedData;
    } else {
      this.selectedFilterOptions = [...this.dialogData.selectedData];
      this.selectedDummyFilterOptions = [...this.dialogData.selectedData];
      if (this.selectedFilterOptions.length > 0 && this.selectedFilterOptions[0].id === 'all') {
        this.selectedFilterOptions = this.optionsData;
        // this.selectedDummyFilterOptions = this.optionsData;
        this.selectAllStatus = true;
      } else {
        this.selectAllStatus = false;
      }
    }
    this.options = this.optionsData.map(x => Object.assign({}, x));
    this.inventoryService.getMarketsFromFile().pipe(takeUntil(this.unSubscribe)).subscribe(response => {
      this.dmaList = response;
      this.dummyDmaList = response;
      this.setMarkets(this.marketSelectionCtrl.value);
    });
    if (this.dialogData.type === 'Market' && this.enableCBSA) {

      // removed api call and made local json  for cbsa
      this.inventoryService.getMarketsCBSAFromFile().pipe(takeUntil(this.unSubscribe)).subscribe(
        response => {
          this.dummyCbsaList = response || [];
          this.totalPages = Math.ceil(this.dummyCbsaList.length / 100);
          this.cbsaList = this.dummyCbsaList.slice(0, 100);
          this.setMarkets(this.marketSelectionCtrl.value);
        }
      );
      this.marketSelectionCtrl.valueChanges.pipe(takeUntil(this.unSubscribe)).subscribe(value => {
        this.optionsData = [];
        this.searchQuery = '';
        this.searchCtrl.reset('', { emitEvent: false });
        this.currentPage = 1;
        this.setMarkets(value);
      });
      this.marketSelectionCtrl.patchValue(this.singleSelectOption['type'] || 'DMA');
      this.searchCtrl.valueChanges.pipe(takeUntil(this.unSubscribe)).subscribe(search => {
        this.currentPage = 1;
        this.searchMarkets({ search: search });
        this.searchQuery = search;
      });
    }
  }

  /* Function to add selected options
  */
  onAdd() {
    if (this.dialogData.type && this.dialogData.type === 'Operator' && this.selectedDummyFilterOptions.length > 1) {
      const allIndex = this.selectedDummyFilterOptions.findIndex(opt => opt.id === 'all');
      if (allIndex !== -1) {
        this.selectedDummyFilterOptions.splice(allIndex, 1);
      }
    }
    if (this.method === 'single') {
      this.dialogRef.close({
        selectedOption: this.singleSelectOption,
        optionsData: this.dialogData.optionsData,
        marketType: this.marketSelectionCtrl.value
      });
    } else {
      this.dialogRef.close({
        selectedOptions: this.selectedDummyFilterOptions, optionsData: this.dialogData.optionsData
      });
    }
  }

  /**
   * Search in local from cbsa json
   * limited if search data more than 100 first 100 will be displayed
   * @param {*} { search } to be searched
   * @memberof FilterOptionsComponent
   */
  public searchMarkets({ search }): void {
    search = search.toUpperCase();
    const filteredData = this.dummyCbsaList.filter(function (data) { return data.name.toUpperCase().match(search); });
    if (filteredData.length > 100) {
      this.cbsaList = filteredData.slice(0, 100);
    } else {
      this.cbsaList = filteredData;
    }
    this.setMarkets(this.marketSelectionCtrl.value);
  }

  public searchFilters(data) {
    if (data.emptySearch) {
      this.optionsData = this.options;
    } else {
      // Finding existing selected value and keep at top
      this.optionsData = data.value;
    }
    if (this.selectedDummyFilterOptions.length && this.selectedDummyFilterOptions[0].id === 'all') {
      this.selectedFilterOptions = this.optionsData;
    } else {
      this.selectedFilterOptions = Object.assign([], this.selectedDummyFilterOptions);
    }
  }

  public compare(c1, c2) {
    return c1 && c2 && c1['id'] === c2['id'];
  }
  public onChangeOptions(selectedOption) {
    if (selectedOption.id === 'all') {
      if (this.selectAllStatus) {
        this.selectedFilterOptions = [];
        this.selectAllStatus = false;
      } else {
        this.selectedFilterOptions = this.optionsData;
        this.selectAllStatus = true;
      }
    }
    // checking selected options form the list
    const selecctedId = this.selectedDummyFilterOptions.findIndex(opt => opt.id === selectedOption.id);
    if (selecctedId !== -1) {
      this.selectedDummyFilterOptions.splice(selecctedId, 1);
    } else {
      this.selectedDummyFilterOptions.push(selectedOption);
    }

    if (this.dialogData.type && this.dialogData.type === 'Operator' && this.selectedFilterOptions.length >= 1) {
      const isSelectedALL = this.selectedFilterOptions.filter(opt => opt['id'] === 'all');
      if (selectedOption.id === 'all' && isSelectedALL.length !== 1) {
        this.selectedFilterOptions = [{ id: 'all', name: 'Select All', count: 0 }];
        this.selectedDummyFilterOptions = [{ id: 'all', name: 'Select All', count: 0 }];

      } else if (selectedOption.id !== 'all') {
        const index = this.selectedFilterOptions.findIndex(opt => opt.id === 'all');
        if (index !== -1) {
          const dummySelectedOption = Object.assign([], this.selectedFilterOptions);
          dummySelectedOption.splice(index, 1);
          this.selectedFilterOptions = dummySelectedOption;
          const allIndex = this.selectedDummyFilterOptions.findIndex(opt => opt.id === 'all');
          if (allIndex !== -1) {
            this.selectedDummyFilterOptions.splice(allIndex, 1);
          }
          this.selectedDummyFilterOptions = this.selectedFilterOptions;
        }
      } else {
        // this.selectedFilterOptions = [{ id: 'all', name: 'Select All', count: 0 }];
        this.selectedDummyFilterOptions = [{ id: 'all', name: 'Select All', count: 0 }];
      }
      if (this.selectedDummyFilterOptions.length === this.dialogData.optionsData.length - 1) {
        this.selectedFilterOptions = this.optionsData;
        this.selectAllStatus = true;
        this.selectedDummyFilterOptions = [{ id: 'all', name: 'Select All', count: 0 }];
      }
    }

  }
  addTopOption(count = 10) {
    let index = 0;
    if (this.dialogData.type === 'Operator') {
      index = 1;
      count = count + 1;
    }
    const selected = this.optionsData.slice(index, count);
    this.selectedFilterOptions = selected;
    this.selectedDummyFilterOptions = selected;
  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  private setMarkets(type: MarketType) {
    switch (type) {
      case 'DMA':
        this.optionsData = this.dmaList;
        // this.markets = this.dmaList;
        break;
      case 'CBSA':
        this.optionsData = this.cbsaList;
        // this.markets = this.cbsaList;
        break;
    }
    if (this.optionsData) {
      this.options = this.optionsData.map(x => Object.assign({}, x));
    }
  }

  /**
   * Filter data for infinite scroll
   *
   * @private
   * @memberof FilterOptionsComponent
   */
  private loadMore() {
    this.currentPage += 1;
    if (this.currentPage <= this.totalPages) {
      this.cbsaList = [...this.cbsaList, ...this.dummyCbsaList.filter( (data) =>{
        return data.name.toUpperCase().match(this.searchQuery);
      }).slice((this.currentPage - 1) * 100, this.currentPage * 100)];
      this.setMarkets(this.marketSelectionCtrl.value);
    }
  }
}
