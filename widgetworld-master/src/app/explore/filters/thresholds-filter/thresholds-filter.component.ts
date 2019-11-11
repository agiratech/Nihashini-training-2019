import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {ThresholdFilter} from '@interTypes/threshold';
import {ConvertPipe} from '@shared/pipes/convert.pipe';
import {AuthenticationService, ExploreDataService, ExploreService, FormatService} from '@shared/services';
import {LabelType, Options} from 'ng5-slider';
import {Subject} from 'rxjs';
import {pluck, takeUntil, takeWhile, map, filter, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FiltersService} from '../filters.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-thresholds-filter',
  templateUrl: './thresholds-filter.component.html',
  styleUrls: ['./thresholds-filter.component.less'],
  providers: [ConvertPipe]
})
export class ThresholdsFilterComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();
  public manualRefresh: EventEmitter<void> = new EventEmitter<void>();
  public market: string | null = null;
  public thresholds: ThresholdFilter = {
    inMarketCompPer: [0, 100],
    targetCompPer: [0, 100],
    inMarketCompIndex: [0, 210],
    targetImp: [0, 150000]
  };
  targetImpChartData = [];
  inMarketCompPerChartData = [];
  targetCompPerChartData = [];
  inMarketCompIndexChartData = [];
  barChartConfig = {
    width: 260,
    height: 30,
    tooltip: '<div><b>Average Impressions</b></br>##NAME##<br>##VALUE##</div>',
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  };
  public graphRefresh: EventEmitter<void> = new EventEmitter<void>();
  public inMarketCompIndexMin = 0;
  public inMarketCompIndexMax = 1000;
  public targetAudienceImpressions: Options = {
    floor: 0,
    ceil: 150000,
    minLimit: 0,
    step: 1,
    noSwitching: true,
    translate: (value: number, l: LabelType): string => {
      let label = value.toFixed(2);
      if (value > 1) {
        label = this.convertPipe.transform(value.toFixed(2), 'ABBREVIATE');
      }
      switch (l) {
        case LabelType.Ceil:
          if (value >= 150000) {
            label = label + '+';
          }
          break;
        case LabelType.Floor:
          label = '0';
          break;
        default:
          label = label;
          break;
      }
      return '<span class="label-value">' + label + '</span>';
    }
  };
  public targetAudienceImpressionCom: Options = {
    floor: 0,
    ceil: 100,
    minLimit: 0,
    step: 1,
    noSwitching: true,
    translate: (value: number): string => {
      if (value > 0) {
        let label = value.toFixed(2);
        if (value > 1) {
          label = this.convertPipe.transform(value.toFixed(2), 'ABBREVIATE');
        }
        return '<span class="label-value">' + label + '%</span>';
      } else {
        return '<span class="label-value">0</span>';
      }
    }
  };
  public inMarketTargetAudience: Options = {
    floor: 0,
    ceil: 210,
    minLimit: 0,
    step: 1,
    noSwitching: true,
    disabled: true,
    ticksArray: [15, 90, 160],
    // ticksArray: [75, 150, 500],
    getLegend: (value: number): string => {
      switch (value) {
        case 0:
          return '0';
        case 15:
          return '75';
        case 90:
          return '150';
        case 160:
          return '500';
        case 210:
          return '1000';
        default:
          return value.toString();
      }
    },
    translate: (value: number, l: LabelType): string => {
      let label = '';
      switch (l) {
        case LabelType.Ceil:
          label = '1000';
          return '<span class="label-value">' + label + '</span>';
          break;
        case LabelType.Floor:
          label = '0';
          return '<span class="label-value">' + label + '</span>';
          break;
        case LabelType.Low:
          label = value.toString();
          /** Here converting logarithmic scale value to original value.
           * 0 - 74: 15 stops
           * 75 - 149: 75 stops
           * 150 - 499: 70 stops
           * 500 - 1000: 50 stops
          **/
          this.inMarketCompIndexMin = this.filters.targetAudienceMinMax(value);
          return '<span class="label-value">' + label + '</span>';
          break;
        case LabelType.High:
          /** Here converting logarithmic scale value to original value.
           * 0 - 74: 15 stops
           * 75 - 149: 75 stops
           * 150 - 499: 70 stops
           * 500 - 1000: 50 stops
          **/
          this.inMarketCompIndexMax = this.filters.targetAudienceMinMax(value);
          label = value.toString();
          return '<span class="label-value">' + label + '</span>';
          break;
        default:
          return value.toString();
          break;
      }
    }
  };
  public inMarketTargetAudImprComp: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    minLimit: 0,
    disabled: true,
    noSwitching: true,
    translate: (value: number): string => {
      if (value > 0) {
        let label = value.toFixed(2);
        if (value > 1) {
          label = this.convertPipe.transform(value.toFixed(2), 'ABBREVIATE');
        }
        return '<span class="label-value">' + label + '%</span>';
      } else {
        return '<span class="label-value">0</span>';
      }
    }
  };
  public mod_permission: any;
  public mod_project_permission: any;
  public allowInventory = '';
  public allowScenarios = '';
  histogramTimeout = null;
  private defaultAudience: any;
  constructor(private filters: FiltersService,
    private exploreData: ExploreDataService,
    private convertPipe: ConvertPipe,
    private auth: AuthenticationService,
    private exploreService: ExploreService,
    private activatedRoute: ActivatedRoute,
    private formatService: FormatService) {
  }
  ngOnInit() {
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.mod_project_permission = this.auth.getModuleAccess('projects');
    this.allowScenarios = this.mod_project_permission['status'];
    this.defaultAudience = this.activatedRoute.snapshot.data.defaultAudience;
    // to check whether market is enabled
    this.filters.getFilters()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe),
        map(data => {
          return this.filters.normalizeFilterData(data, false);
        }))
      .subscribe(filters => {
        if (filters['audienceMarket']) {
          this.inMarketTargetAudImprComp = Object.assign({}, this.inMarketTargetAudImprComp, { disabled: false });
          this.inMarketTargetAudience = Object.assign({}, this.inMarketTargetAudience, { disabled: false });
          this.market = filters['audienceMarket'];
        } else {
          this.thresholds['inMarketCompPer'] = [0, 100];
          this.thresholds['inMarketCompIndex'] = [0, 210];
          this.inMarketTargetAudImprComp = Object.assign({}, this.inMarketTargetAudImprComp, { disabled: true });
          this.inMarketTargetAudience = Object.assign({}, this.inMarketTargetAudience, { disabled: true });
          this.market = '';
        }
        //TODO: Apr 6 2019: Commented bcz geopath api not supported.
        // this.loadHistogramFromAPI(filters);
      });

      /* this.exploreData.getFilters()
      .pipe(
        takeUntil(this.unsubscribe),
        pluck('threshold')
      ).subscribe((threshold: Threshold) => {
        console.log('threshold', threshold);
        if (threshold) {
          this.targetAudienceImpressions = Object.assign(
            {},
            this.targetAudienceImpressions,
            {
              ceil: threshold.targetImp.max,
              floor: threshold.targetImp.min,
              step: (threshold.targetImp.max <= 1) ? 0.1 : 1,
            });
            this.manualRefresh.emit();
        }
      }); */
    /*  this.exploreData.getFilters()
      .pipe(
        takeUntil(this.unsubscribe),
        pluck('threshold')
      ).subscribe((threshold: Threshold) => {
      if (threshold) {
        this.targetAudienceImpressions = Object.assign(
          {},
          this.targetAudienceImpressions,
          {
            ceil: threshold.targetImp.max,
            floor: threshold.targetImp.min,
            step: (threshold.targetImp.max <= 1) ? 0.1 : 1,
          });
        this.targetAudienceImpressionCom = Object.assign(
          {},
          this.targetAudienceImpressionCom,
          {
            ceil: (threshold.targetCompPer.max * 100),
            floor: (threshold.targetCompPer.min * 100),
            step: ((threshold.targetCompPer.max * 100) <= 1) ? 0.1 : 1,
          });
        this.inMarketTargetAudience = Object.assign(
          {},
          this.inMarketTargetAudience,
          {
            ceil: threshold.inMarketCompIndex.max,
            floor: threshold.inMarketCompIndex.min,
            step: (threshold.inMarketCompIndex.max <= 1) ? 0.1 : 1,
          });
        this.inMarketTargetAudImprComp = Object.assign(
          {},
          this.inMarketTargetAudImprComp,
          {
            ceil: (threshold.inMarketCompPer.max * 100),
            floor: (threshold.inMarketCompPer.min * 100),
            step: ((threshold.inMarketCompPer.max * 100)) ? 0.1 : 1,
          });
      }
    }); */
    this.filters.onReset()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(type => {
        this.thresholds = {
          inMarketCompPer: [0, 100],
          targetCompPer: [0, 100],
          inMarketCompIndex: [0, 210],
          targetImp: [0, 150000]
        };
      });
    this.filters.checkSessionDataPushed()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(val => {
        if (val) {
          this.loadFilterSession();
        }
      });
    this.loadFilterSession();
    this.exploreService.getThresholdsPanel()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(val => {
        this.manualRefresh.emit();
        this.graphRefresh.emit();
      });
  }
  private loadFilterSession() {
    try {
      const filters = this.filters.getExploreSession()['data'];
      if (filters && filters['thresholds']) {
        this.thresholds = Object.assign({}, this.thresholds, ...filters['thresholds']);
        setTimeout(() => {
          this.manualRefresh.emit();
        }, 100);
      }
    } catch (e) {
      // console.log(e);
    }
  }
  public reset() {
    this.thresholds = {
      inMarketCompPer: [0, 100],
      targetCompPer: [0, 100],
      inMarketCompIndex: [0, 210],
      targetImp: [0, 150000]
    };
    this.filters.clearFilter('thresholds', true);
  }
  public apply() {
    const filterValue = Object.keys(this.thresholds)
      .reduce((prev, curr) => {
        if (this.thresholds[curr][0] > 0 || this.thresholds[curr][1] > 0) {
          prev[curr] = this.thresholds[curr];
        }
        return prev;
      }, {});
    this.filters.setFilter('thresholds', filterValue);
  }
  /**
   * Use this function to get the histogram chart data from /histogram for thresholds chart
   * and formatting data for d3 chart.
   * @param filterData: filter array of data what to pass to API.
   * to be sent to histogram API directly, do not send unprocessed
   */
  loadHistogramFromAPI (filterData: object) {
    if (this.histogramTimeout !== null) {
      this.histogramTimeout.unsubscribe();
    }
    const filters = JSON.parse(JSON.stringify(filterData));
    if (!filterData['audience']) {
      filters['audience'] = this.defaultAudience['audienceKey'];
      this.exploreData.setSelectedTarget(this.defaultAudience['audienceKey']);
    } else {
      filters['audience'] = filterData['audience']['key'];
    }
    if (typeof filters['sort'] === 'undefined') {
      filters['sort'] = 'cwi';
    }
    this.histogramTimeout = this.exploreService
    .getThresholdHistogram(filters)
    .pipe(
      takeUntil(this.unsubscribe),
      filter(res => res.histogram),
      map(res => res.histogram)
    )
    .subscribe(histogram => {
      if (histogram.targetImp) {
        this.targetImpChartData =  this.formatChartData(histogram.targetImp);
      }
      if (histogram.targetCompPer) {
        this.targetCompPerChartData =  this.formatChartData(histogram.targetCompPer, 100, 'percent');
      }
      if (histogram.inMarketCompPer) {
        this.inMarketCompPerChartData =  this.formatChartData(histogram.inMarketCompPer, 100, 'percent');
      }
      if (histogram.inMarketCompIndex) {
        const dataIndex = histogram.inMarketCompIndex['step1'].concat(histogram.inMarketCompIndex['step2'],
        histogram.inMarketCompIndex['step3'],
        histogram.inMarketCompIndex['step4']);
        this.inMarketCompIndexChartData =  this.formatChartData(dataIndex, 210, 'compintex');
      }
      this.manualRefresh.emit();
      this.graphRefresh.emit();
    });
  }
  /**
   * Use this function to format the D3 chart data for each thresholds filter.
   * and formatting data for d3 chart.
   * @param data: data array we are getting from API.
   * @param max: maximum value of silder.
   * @param format: which for format we need to convert. It will accept abbreviate, percent and compintex.
   * to be sent to histogram API directly, do not send unprocessed
   */
  formatChartData (data: any, max: number = 150000, format: string = 'abbreviate') {
    const dataLength = data.length;
    const eachBar = max / dataLength;
    const formatted = [];
    let i = 0;
    data.map( d => {
      let name = '';
      switch (format) {
        case 'percent':
          name = (eachBar * i) + '-' + (eachBar * (i + 1)) + '%';
          break;
        case 'compintex':
          name = this.filters.targetAudienceMinMax(eachBar * i) + '-' + this.filters.targetAudienceMinMax(eachBar * (i + 1));
          break;
        default:
          name = this.formatService.abbreviateNumber((eachBar * i), 0) + '-' + this.formatService.abbreviateNumber((eachBar * (i + 1)), 0);
          break;
      }
      formatted.push({
        name: name,
        value: d
      });
      i ++;
    });
    return formatted;
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
