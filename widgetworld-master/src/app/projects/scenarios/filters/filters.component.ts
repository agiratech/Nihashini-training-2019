import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Filter } from '@interTypes/filter';
import { MatDialog } from '@angular/material/dialog';
import {
  LoaderService,
  TargetAudienceService,
  InventoryService
} from '@shared/services';
import { takeWhile, map, filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FilterOptionsComponent } from '../filter-options/filter-options.component';
import { AudienceBrowserDialogComponent } from '@shared/components/audience-browser-dialog/audience-browser-dialog.component';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent implements OnInit, OnChanges {
  @Input() selectedOptionsArray: Filter[];
  @Input() optionsArray: Filter[];
  @Input() filterName: string;
  @Output() removeFilterOption = new EventEmitter();
  @Output() applySelected = new EventEmitter();

  measureData = [];
  optionData = [];
  private unSubscribe = true;
  public operators: any = [];
  public savedAudience;
  public currentAudience: any;
  public currentAudienceTitle: any;
  public idArray = [];
  public markets: any = [];
  public defaultAudiene: any = {};
  constructor(
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private loaderService: LoaderService,
    private inventoryService: InventoryService,
    private targetAudience: TargetAudienceService
  ) { }

  ngOnInit() {
    this.loadOperators();
    this.markets = this.activeRoute.snapshot.data['dummyMarkets'] || [];
    /*this.markets.sort(function(obj1, obj2) {
      // Decending order based on count
      return  obj2.count - obj1.count;
    }).map((selected, index) => {
      selected['slno'] = index + 1;
      return selected;
    });*/
    if (this.filterName === 'DMA Market') {
      this.optionsArray = this.markets;
      this.optionsArray.map(selected => {
        this.optionData.push(selected);
      });
    }
  }

  loadOperators() {
    this.operators = this.activeRoute.snapshot.data.operators;
    if (this.filterName === 'Operator') {
      const selectAll = {
        'id': 'all',
        'name': 'Select All',
        'count': 0,
        'slno': 1
      };
      this.optionData.push(selectAll);
      this.optionsArray = this.operators;
      this.optionsArray.map(selected => {
        selected.id = selected.name;
        this.optionData.push(selected);
      });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedOptionsArray && changes.selectedOptionsArray.currentValue) {
      this.selectedOptionsArray = changes.selectedOptionsArray.currentValue;
      if (this.filterName === 'Audience') {
        this.measureData.filter(selected => {
          this.idArray.push(selected.id);
        });

        this.selectedOptionsArray.filter(options => {
          const isExist = this.idArray.includes(options.id);
          if (!isExist) {
            this.measureData.push(options);
          }
        });
        this.applySelected.emit({ 'filter': this.filterName, 'result': this.measureData });
        this.idArray = [];
      } else {
        this.measureData = [];
        this.measureData.push(...this.selectedOptionsArray);
      }
    }
  }

  /* function to remove selected measures
  /* param value
  */
  unSelectMeasure(value) {
    const index = this.measureData.findIndex(x => x.id === value.id);
    if (index !== -1) {
      this.measureData.splice(index, 1);
      this.removeFilterOption.emit({ 'filter': this.filterName, 'result': this.measureData });
    }
  }

  /* Function to open dialog popup for filters
  */
  openFilterOptions() {
    if (this.filterName === 'Audience') {
      const browser = this.dialog.open(AudienceBrowserDialogComponent, {
        height: '550px',
        data: { isScenario: true },
        width: '700px',
        closeOnNavigation: true,
        panelClass: 'audience-browser-container'
      }).afterClosed().subscribe(result => {
        if (result) {
          // this.loaderService.display(true);
          if (result.targetAudience) {
            const resultAudience = [];
            result.targetAudience.map((aud) => {
              resultAudience.push({ name: aud.name, id: aud.audience });
            });
            this.applySelected.emit({ 'filter': this.filterName, 'result': resultAudience });
          }
        }
      });
    } else {
      const data = {
        title: 'Add ' + this.filterName,
        buttonText: 'Add Selected',
        optionsData: this.optionData,
        selectedData: this.measureData,
        type: this.filterName
      };
      this.dialog.open(FilterOptionsComponent, {
        width: '460px',
        data: data
      }).afterClosed().subscribe(result => {
        if (result) {
          let options;
          if (result.selectedOptions.length
            && result.selectedOptions[0]['id'] === 'all') {
              options = [...result.optionsData];
              options.shift();
          }
          this.applySelected.emit({ 'filter': this.filterName, 'result': result.selectedOptions, 'optionsData': options });
        }
      });
    }
  }
}

