import {
  Component, OnInit, Input, Output,
  EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked, OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SubProject, MarketPlanTargets, WorkflowLables } from '@interTypes/workspaceV2';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { MarketPlanService } from '../market-plan.service';
import { Subject } from 'rxjs';
import { CustomizeColumnComponent } from '@shared/components/customize-column/customize-column.component';
import { LoaderService, ThemeService } from '@shared/services';

@Component({
  selector: 'app-my-plan',
  templateUrl: './my-plan.component.html',
  styleUrls: ['./my-plan.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPlanComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  // @Input() planData: any;
  // @Input() mediaTypes: any;
  @Output() changeAudience = new EventEmitter();
  displayedColumns: string[] = ['accordion', 'Plan', 'Audience', 'Market', 'Trp', 'Reach', 'Frequency', 'isLoader'];
  dataSource = new MatTableDataSource([]);
  isExpantedId: string;
  selectedAudience: any = null;
  fDatas = [];
  expandedElement: SubProject | null;
  isSearchHide = true;
  public labels: WorkflowLables;
  public audiences: any;
  public isLoader = false;
  private planMarkets: any = [];
  private mediaTypeGroup: any;
  public goalFormData: any;
  private operators: any;
  private nameParts = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private unSubscribe: Subject<void> = new Subject<void>();
  public sortable = [];
  public duplicateDisplayedColumns: any;
  public isOMG: boolean;
  constructor(public dialog: MatDialog,
    private workSpace: NewWorkspaceService,
    private cdRef: ChangeDetectorRef,
    private marketPlanService: MarketPlanService,
    public loaderService: LoaderService,
    public themeService: ThemeService) {
    this.labels = this.workSpace.getLabels();
  }

  ngOnInit() {
    this.dataSource.data = this.fDatas;
    const themeSettings = this.themeService.getThemeSettings();
    if (themeSettings && themeSettings.siteName === 'OMG') {
      this.isOMG = true;
      this.displayedColumns[1] = 'Package';
    }
    this.duplicateDisplayedColumns = [...this.displayedColumns];
    this.marketPlanService.getTargetData()
      .subscribe((targetData: MarketPlanTargets) => {
        // TODO : Need to refactor this and move the formatting to service
        // this.selectedMediaTypesGroup = this.formatMediaTypes()
        this.audiences = targetData.audiences;
        this.planMarkets = targetData.markets;
        this.goalFormData = targetData.goals;
        this.operators = targetData.operators;
        this.mediaTypeGroup = Object.assign([], targetData.mediaTypeFilters);
      });
    this.marketPlanService.getPlans().subscribe((plans) => {
      if (plans) {
        this.isLoader = false;
        let existedAudience = this.audiences && this.audiences[0];
        if (this.expandedElement) {
          const element = JSON.parse(JSON.stringify(this.expandedElement));
          existedAudience = { id: element.audienceId, name: element.audience };
          if (this.selectedAudience === 'all') {
            existedAudience = 'all';
          }
        }
        this.fDatas = [];
        this.formatPlanList(Object.assign([], plans), this.audiences,
          this.planMarkets, existedAudience, this.mediaTypeGroup);
        this.selectedAudience = existedAudience;
      }
    });
  }

  onChangeAudience(audience) {
    this.selectedAudience = audience.value;
    this.loadMyPlanList(this.fDatas, this.selectedAudience);
  }
  ngOnChanges(changes: SimpleChanges) {
    // if (changes.planData && changes.planData.currentValue) {
    //   const planData = changes.planData.currentValue;
    //    this.audiences = planData.audiences;
    //   this.planMarkets = planData.markets;
    //   this.goalFormData = planData.goalForm;
    //   this.operators = planData.operators;
    //   this.mediaTypeGroup = Object.assign([], planData.mediaTypes);
    //   this.fDatas = [];
    // this.formatPlanList(Object.assign([], planData.data), planData.audiences,
    // planData.markets, planData.audiences[0], planData.enableOperator, this.mediaTypeGroup);
    // this.selectedAudience = planData.audiences[0];
    // }
  }

  formatPlanList(planList, audiences, markets, selectedAudience, mediaTypes) {
    planList.map((plan, index) => {
      // const market = markets.filter(data => data.id === plan.allocation_list[0].measures.target_geo);
      // const audience = audiences.filter(data => data.id === Number(plan.allocation_list[0].measures.target_segment));
      const list = {};
      list['isLoader'] = true;
      // common values
      list['plan'] = (plan.query.market['name'] || '') + ', ' + plan.query['audience']['name'] || '';
      list['audience'] = plan.query['audience']['name'] || '';
      list['id'] = index;
      list['market'] = plan.query.market['name'] || '';
      list['audienceId'] = plan.query['audience']['id'];
      list['marketId'] = plan.query['market']['id'];
      list['query'] = plan.query;
      list['totalMarketInventoryInfo'] = plan['totalMarketInventoryInfo'];
      // if (this.planData['queries'][index]) {
      //   list['query'] = this.planData['queries'][index];
      // } else {
      //   list['query'] = this.goalFormData;
      // }
      list['spots'] = null;
      list['reach'] = null;
      list['frequency'] = null;
      list['trp'] = null;
      /*if (plan.plan.allocation_list) {
        plan.plan.allocation_list.map(allocate => {
          const measuresData = allocate['measures'];
          if (this.goalFormData['effectiveReach'] && Number(this.goalFormData['effectiveReach']) === 3) {
            if (measuresData.eff_reach_pct !== null) {
              list['reach'] += measuresData.eff_reach_pct;
            }
            if (measuresData.eff_freq_avg !== null) {
              list['frequency'] += measuresData.eff_freq_avg;
            }
          } else {
            if (measuresData.reach_pct !== null) {
              list['reach'] += measuresData.reach_pct;
            }
            if (measuresData.freq_avg !== null) {
              list['frequency'] += measuresData.freq_avg;
            }
          }
          if (measuresData.trp !== null) {
            list['trp'] += measuresData.trp;
          }
          list['isLoader'] = false;
        });
      }*/
      // checking if total summaries data
      if (plan.plan.summaries && plan.plan.summaries.total) {
        const measures = plan.plan.summaries.total['measures'];
        if (this.goalFormData['effectiveReach'] && Number(this.goalFormData['effectiveReach']) === 3) {
          list['reach'] = measures.eff_reach_pct;
          list['frequency'] = measures.eff_freq_avg;
        } else {
          list['reach'] = measures.reach_pct;
          list['frequency'] = measures.freq_avg;
        }
        list['trp'] = measures.trp;
        list['isLoader'] = false;
      } else {
        list['reach'] = '';
        list['frequency'] = '';
        list['trp'] = '';
      }
      list['planData'] = plan.plan;
      list['mediaTypes'] = mediaTypes;
      list['id'] = plan._id;
    /* if (list['reach'] || list['frequency'] || list['trp']) {
        list['isLoader'] = false;
     }*/
      // list['isOperator'] = enableOperator;
      this.fDatas.push(list);
    });
    this.loadMyPlanList(this.fDatas, selectedAudience);
    this.changeAudience.emit(this.fDatas);
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  loadMyPlanList(fdata, selectedAudience) {
    if (selectedAudience && selectedAudience !== 'all') {
      const planList = fdata.filter(list => {
        if (this.expandedElement) {
          const element = JSON.parse(JSON.stringify(this.expandedElement));
          if (element.id === list.id) {
            this.expandedElement = list;
          }
        }
        return list.audienceId === selectedAudience.id;
      });
      let selectedindex = this.audiences.findIndex(audience => audience.id === selectedAudience.id);
      selectedindex = Math.min(Math.max(selectedindex, 0), 25);
      const label = this.nameParts.charAt(selectedindex);
      planList.map((list, index) => {
        list['planId'] = (index + 1) + label;
      });
      this.dataSource.data = planList;
    } else {
      const allData = [];
      if (typeof this.audiences !== 'undefined') {
        this.audiences.map((audience, audienceIndex) => {
          const planList = fdata.filter(list => {
            if (this.expandedElement) {
              const element = JSON.parse(JSON.stringify(this.expandedElement));
              if (element.id === list.id) {
                this.expandedElement = list;
              }
            }
            return list.audienceId === audience.id;
          });
          const selectedChar = Math.min(Math.max(audienceIndex, 0), 25);
          const label = this.nameParts.charAt(selectedChar);
          planList.map((list, index) => {
            list['planId'] = (index + 1) + label;
            allData.push(list);
          });
        });
        this.dataSource.data = allData;
      }
    }
  }
  updateParentPlanTotal(currentPlan, planData) {
    const plan = currentPlan['plan'];
    const changes = currentPlan['changes'];
    planData['reach'] = '';
    planData['frequency'] = '';
    planData['trp'] = '';
    /*if (plan['reach'] !== '') {
      planData['reach'] = planData['reach'] - Number(plan['reach']);
    }
    if (plan['frequency'] !== '') {
      planData['frequency'] = planData['frequency'] - Number(plan['frequency']);
    }
    if (plan['spots'] !== '') {
      planData['spots'] = planData['spots'] - Number(plan['spots']);
    }
    if (plan['trp'] !== '') {
      planData['trp'] = planData['trp'] - Number(plan['trp']);
    }
    if (typeof planData[changes['field']] !== 'undefined') {
      planData[changes['field']] += Number(changes['value']);
    }*/
  }
  ngOnDestroy() {
    localStorage.removeItem('marketPlanData');
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o1 && o2) {
      return o1.id === o2.id && o1.name === o2.name;
    }
  }

  public customizeColumn() {
    const currentSortables = this.displayedColumns.map((name) => {
      const obj = { 'displayname': name, 'field_name': name };
      return obj;
    });
    currentSortables.splice(currentSortables.length - 1, 1);
    currentSortables.splice(0, 1);
    const ref = this.dialog.open(CustomizeColumnComponent, {
      data: {
        'sortables': Object.assign([], this.sortable),
        'currentSortables': Object.assign([], currentSortables), 'origin': 'workspace'
      },
      width: '700px',
      closeOnNavigation: true,
      panelClass: 'audience-browser-container',
    });
    ref.afterClosed().subscribe(res => {
      if (res && res.action !== 'cancel') {
        const sortableColumn = [];
        const displayedColumns = [...this.duplicateDisplayedColumns];
        displayedColumns.splice(displayedColumns.length - 1, 1);
        displayedColumns.splice(0, 1);
        res.currentSortables.forEach((data) => {
          sortableColumn.push(data.displayname);
          displayedColumns.forEach((data1, index) => {
            if (data1 === data.displayname) {
              displayedColumns.splice(index, 1);
            }
          });
        });
        const sortable = displayedColumns.map((data) => {
          return { 'displayname': data, 'field_name': data };
        });
        this.sortable = sortable;
        sortableColumn.unshift('accordion');
        sortableColumn.push('isLoader');
        this.displayedColumns = sortableColumn;
        this.cdRef.detectChanges();
      }
    });
  }

}
