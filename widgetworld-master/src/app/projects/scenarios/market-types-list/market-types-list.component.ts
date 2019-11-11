import {
  Component, OnInit, ChangeDetectionStrategy,
  AfterViewChecked, ChangeDetectorRef, OnChanges, Input, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import swal from 'sweetalert2';
import { MarketPlanService } from '../market-plan.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@shared/services';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { MarketPlanTargets } from '@interTypes/workspaceV2';
import { debounceTime } from 'rxjs/operators';
import { CustomizeColumnComponent } from '@shared/components/customize-column/customize-column.component';

@Component({
  selector: 'app-market-types-list',
  templateUrl: './market-types-list.component.html',
  styleUrls: ['./market-types-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})


export class MarketTypesListComponent implements OnInit, AfterViewChecked, OnChanges {
  displayedColumns: string[] = ['MediaType', 'Required/Total In Market', 'Trp', 'Reach', 'Frequency', 'actions'];
  dataSource = new MatTableDataSource([]);
  isExpantedId: string;
  @Input() goalFormData: any;
  @Input() planData: any;
  @Input() isLoader: boolean;
  @Output() updateParentPlanTotal: EventEmitter<any> = new EventEmitter();
  public goalFormFieldValue: any;
  expandedElement: any | null;
  public selectedMediaType = 0;
  public rowEditId = '';
  private operatorData = [];
  private mediaTypeData = [];
  public selectedMediaTypes: any;
  private chnagesGoalFormData: any;
  public source = 'markettype';
  public isNoDataFound = false;
  private scenarioId: any;
  public operatorModulePermission = false;
  private projectPermission: any;
  public customInventoryAllowed = false;
  public isExpandTabs = false;
  public isOperatorEmptyorAll = false;
  public locks = [];
  public updatedMediaTypes: any;
  public mediaTypeLable = [];
  public isSaveingPlan: any = null;
  public savingPlanInput = null;
  public updatedPlanId: any;
  public sortable = [];
  public duplicateDisplayedColumns: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private marketPlanService: MarketPlanService,
    private activeRoute: ActivatedRoute,
    private auth: AuthenticationService,
    private workSpaceService: NewWorkspaceService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    /** Getting Project module permission */
    this.projectPermission = this.auth.getModuleAccess('projects');
    const explorePermissions = this.auth.getModuleAccess('explore');
    if (explorePermissions['features'] &&
        explorePermissions['features']['customInventories'] &&
        explorePermissions['features']['customInventories']['status'] &&
        explorePermissions['features']['customInventories']['status'] === 'active') {
      this.customInventoryAllowed = true;
    }
    this.duplicateDisplayedColumns = [...this.displayedColumns];
    if (this.projectPermission['scenarios']['operators']['status'] === 'active') {
      this.operatorModulePermission = true;
    } else {
      this.operatorModulePermission = false;
    }
    this.goalFormFieldValue = this.goalFormData;
    const mediaTypeData = {};
    const operatorData = {};
    // TODO : Need to check why media types are empty array in plan query
    if (this.planData['query'] && this.planData['query']['mediaTypeFilters']) {
      this.selectedMediaTypes = [...this.planData['query']['mediaTypeFilters']];
    } else {
      this.selectedMediaTypes = [...this.planData['mediaTypes']];
    }
    this.activeRoute.params.subscribe(params => {
      this.scenarioId = params['scenarioId'];
    });

    this.marketPlanService.getTargetData()
      .subscribe((targetData: MarketPlanTargets) => {
        // Check to if operator is selected all or empty
        if (targetData.operators && (targetData.operators.length < 1 || targetData.operators[0] === 'Select All')) {
          this.isOperatorEmptyorAll = true;
        } else {
          this.isOperatorEmptyorAll = false;
        }
      });
    if (this.planData['planData'] && this.planData['planData']['allocation_list']) {
      let effectiveReach = {};
      if (this.planData['query']) {
        effectiveReach = this.planData['query']['goals']['effectiveReach']
          && Number(this.planData['query']['goals']['effectiveReach']) || 0;
      }
      this.planData['planData']['allocation_list'].map((plan, allocationIndex) => {
        if (
          (typeof plan['measures']['spots'] !== 'undefined' && plan['measures']['spots'] !== null)
          || (typeof plan['measures']['trp'] !== 'undefined' && plan['measures']['trp'] !== null)) {
          const mediaType = plan['media_type_group']['frame_media_name_list'].join(',');
          let mediaTypename = '';
          let currentMediaType = '';
          for (const element of this.selectedMediaTypes) {
            let isMediaTypeMatched = false;
            if (!plan['media_type_group']['frame_media_name_list'] ||
              plan['media_type_group']['frame_media_name_list'].sort().join(',') === element['ids']['medias'].sort().join(',')) {
              isMediaTypeMatched = true;
            }
            let isClassificationTypeMatched = false;
            if (!plan['media_type_group']['classification_type_list'] ||
              plan['media_type_group']['classification_type_list'].sort().join(',') === element['ids']['environments'].sort().join(',')) {
              isClassificationTypeMatched = true;
            }
            if (isMediaTypeMatched && isClassificationTypeMatched) {
              mediaTypename = element['data'];
              currentMediaType = element;
              break;
            }
          }
          let isOnlyClassificationTypePresent = false;
          if (!mediaType) {
            isOnlyClassificationTypePresent = true;
          }
          let operator = '';
          if (plan['media_type_group']['operator_name_list']) {
            operator = plan['media_type_group']['operator_name_list'][0];
          }
          const totalInMarketCount = this.getTotalMarketCount(
            plan['media_type_group'],
            operator, this.planData['planData']['totalMarketInventoryInfo'], isOnlyClassificationTypePresent);
            let currentMediaTypeData;
            let currentMediaIndex;
            /* if (!this.operatorModulePermission || this.isOperatorEmptyorAll) {
            } */
          for (let i = 0 ; i < this.planData['planData']['summaries']['by_media_type_group'].length; i++) {
            const element = this.planData['planData']['summaries']['by_media_type_group'][i];
              let isMediaTypeMatched = false;
              const mediasGroupJoins = currentMediaType && currentMediaType['ids']['medias'].sort().join(',') || '';
              if (!element['media_type_group']['frame_media_name_list'] ||
              element['media_type_group']['frame_media_name_list'].sort().join(',') === mediasGroupJoins) {
                isMediaTypeMatched = true;
              }
              const classificationGroupJoins = currentMediaType && currentMediaType['ids']['environments'].sort().join(',') || '';
              let isClassificationTypeMatched = false;
              if (!element['media_type_group']['classification_type_list'] ||
              element['media_type_group']['classification_type_list'].sort().join(',') === classificationGroupJoins) {
                isClassificationTypeMatched = true;
              }
              if (isMediaTypeMatched && isClassificationTypeMatched) {
                currentMediaTypeData = element;
                currentMediaIndex = i;
                break;
              }
            }

          if ((totalInMarketCount > 0 || typeof this.planData['query']['operators'] === 'undefined')) {
            if (!mediaTypeData[mediaType]) {
              mediaTypeData[mediaType] = {
                mediaType: mediaType,
                mediaTypeLable: mediaTypename,
                parent: mediaType,
                trp: 0,
                totalInMarket: 0,
                spots: 0,
                reach: 0,
                frequency: 0,
                data: [],
                editable: true,
                collapsed: true
              };
            }
            /* mediaTypeData[mediaType]['trp'] += plan['measures']['trp'];
            mediaTypeData[mediaType]['totalInMarket'] += totalInMarketCount;
            mediaTypeData[mediaType]['spots'] += plan['measures']['spots'];
            if (effectiveReach === 3) {
              mediaTypeData[mediaType]['reach'] += plan['measures']['eff_reach_pct'] && plan['measures']['eff_reach_pct'] || 0;
              mediaTypeData[mediaType]['frequency'] += plan['measures']['eff_freq_avg'] && plan['measures']['eff_freq_avg'] || 0;
            } else {
              mediaTypeData[mediaType]['reach'] += plan['measures']['reach_pct'] && plan['measures']['reach_pct'] || 0;
              mediaTypeData[mediaType]['frequency'] += plan['measures']['freq_avg'] && plan['measures']['freq_avg'] || 0;
            } */
            if (!currentMediaTypeData) {
              mediaTypeData[mediaType]['trp'] = '';
              mediaTypeData[mediaType]['totalInMarket'] += totalInMarketCount;
              mediaTypeData[mediaType]['spots'] = '';
              mediaTypeData[mediaType]['reach'] =  '';
              mediaTypeData[mediaType]['frequency'] = '';
            } else {
              mediaTypeData[mediaType]['totalInMarket'] += totalInMarketCount;
              mediaTypeData[mediaType]['trp'] = currentMediaTypeData['measures']['trp'];
              mediaTypeData[mediaType]['spots'] = currentMediaTypeData['measures']['spots'];
              if (effectiveReach === 3) {
                // tslint:disable-next-line:max-line-length
                mediaTypeData[mediaType]['reach'] = currentMediaTypeData['measures']['eff_reach_pct'] && currentMediaTypeData['measures']['eff_reach_pct'] || 0;
                // tslint:disable-next-line:max-line-length
                mediaTypeData[mediaType]['frequency'] = currentMediaTypeData['measures']['eff_freq_avg'] && currentMediaTypeData['measures']['eff_freq_avg'] || 0;
              } else {
                // tslint:disable-next-line:max-line-length
                mediaTypeData[mediaType]['reach'] = currentMediaTypeData['measures']['reach_pct'] && currentMediaTypeData['measures']['reach_pct'] || 0;
                // tslint:disable-next-line:max-line-length
                mediaTypeData[mediaType]['frequency'] = currentMediaTypeData['measures']['freq_avg'] && currentMediaTypeData['measures']['freq_avg'] || 0;
              }
            }

            mediaTypeData[mediaType]['id'] = this.planData['id'];
            mediaTypeData[mediaType]['allocationIndex'] = allocationIndex;
            if ((!this.operatorModulePermission || this.isOperatorEmptyorAll ) && currentMediaTypeData ) {
              /* mediaTypeData[mediaType]['trp'] = currentMediaTypeData['measures']['trp'];
              mediaTypeData[mediaType]['spots'] = currentMediaTypeData['measures']['spots']; */
              mediaTypeData[mediaType]['mediaTypeIndex'] = currentMediaIndex;
              /** If spots value zero , add null to reach & frequency */
              if (currentMediaTypeData['measures']['spots'] === 0 ) {
                mediaTypeData[mediaType]['reach'] = null;
                mediaTypeData[mediaType]['frequency'] = null;
              }
            }
            if (typeof this.planData['query']['operators'] === 'undefined') {
              this.planData.planData.totalMarketInventoryInfo.map(pl => {
                if ((plan['media_type_group']['frame_media_name_list'].indexOf(pl['media']) > -1)) {
                  const oppIndex = mediaTypeData[mediaType]['data'].findIndex(opp => opp.mediaType === pl['operator']);
                  if (oppIndex > -1) {
                    mediaTypeData[mediaType]['data'][oppIndex]['totalInMarket'] += pl['spots'];
                  } else {
                    mediaTypeData[mediaType]['data'].push({
                      mediaType: pl['operator'],
                      mediaTypeLable: pl['operator'],
                      parent: mediaType,
                      totalInMarket: pl['spots'],
                      spots: null,
                      trp: null,
                      reach: null,
                      frequency: null,
                      id: this.planData['id'],
                      allocationIndex: allocationIndex,
                      editable: false,
                      collapsed: false
                    });
                  }
                  // mediaTypeData[mediaType]['totalInMarket'] += pl['spots'];
                 }
              });
            } else {
              mediaTypeData[mediaType]['data'].push({
                mediaType: operator,
                mediaTypeLable: operator,
                parent: mediaType,
                totalInMarket: totalInMarketCount,
                spots: this.operatorModulePermission && plan['measures']['spots'] || null,
                trp: this.operatorModulePermission && plan['measures']['trp'] || null,
                // tslint:disable-next-line:max-line-length
                reach: effectiveReach === 3 ? this.operatorModulePermission &&plan['measures']['eff_reach_pct'] || null : this.operatorModulePermission && plan['measures']['reach_pct'] || null,
                // tslint:disable-next-line:max-line-length
                frequency: effectiveReach === 3 ? this.operatorModulePermission && plan['measures']['eff_freq_avg'] || null : this.operatorModulePermission && plan['measures']['freq_avg'] || null,
                id: this.planData['id'],
                allocationIndex: allocationIndex,
                editable: this.operatorModulePermission && true || false,
                collapsed: false
              });

              /** If operator available media type is editable false */
              mediaTypeData[mediaType]['editable'] = false;

              if ((!this.operatorModulePermission || this.isOperatorEmptyorAll ) && currentMediaTypeData ) {
                mediaTypeData[mediaType]['editable'] = true;
              }

            }
            if (typeof this.planData['query']['operators'] === 'undefined') {
              this.planData.planData.totalMarketInventoryInfo.map(pl => {
                if (!operatorData[pl['operator']]) {
                  operatorData[pl['operator']] = {
                    mediaType: pl['operator'],
                    mediaTypeLable: pl['operator'],
                    parent: pl['operator'],
                    totalInMarket: 0,
                    trp: 0,
                    spots: 0,
                    reach: 0,
                    frequency: 0,
                    data: [],
                    editable: false,
                    collapsed: false
                  };
                }
                if ((plan['media_type_group']['frame_media_name_list'].indexOf(pl['media']) > -1)) {
                  operatorData[pl['operator']]['totalInMarket'] += pl['spots'];
                    const oppIndex = operatorData[pl['operator']]['data'].findIndex(mTypeData => mTypeData.mediaType === mediaType);
                    if (oppIndex > -1) {
                      operatorData[pl['operator']]['data'][oppIndex]['totalInMarket'] += pl['spots'];
                    } else {
                      operatorData[pl['operator']]['data'].push({
                        mediaType: mediaType,
                        mediaTypeLable: mediaTypename,
                        parent: pl['operator'],
                        totalInMarket: pl['spots'],
                        spots: null,
                        trp: null,
                        reach: null,
                        frequency: null,
                        id: this.planData['id'],
                        allocationIndex: allocationIndex,
                        editable: false,
                        collapsed: false
                      });
                    }
                }
              });
            } else {
              const  by_operator = JSON.parse(JSON.stringify(this.planData['planData']['summaries']['by_operator']));
              if (!operatorData[operator]) {
                operatorData[operator] = {
                  mediaType: operator,
                  mediaTypeLable: operator,
                  parent: operator,
                  totalInMarket: 0,
                  trp: 0,
                  spots: 0,
                  reach: 0,
                  frequency: 0,
                  data: [],
                  editable: true,
                  collapsed: false
                };
              }
              let currentOperatorData;
              /* if (!this.operatorModulePermission || this.isOperatorEmptyorAll) {
              } */
              for (let i = 0 ; i < by_operator.length; i++) {
                const element = by_operator[i];
                let isOperatorTypeMatched = false;
                if (!element['media_type_group']['operator_name_list'] ||
                element['media_type_group']['operator_name_list'].sort().join(',') === operator) {
                  isOperatorTypeMatched = true;
                }
                if (isOperatorTypeMatched) {
                  currentOperatorData = element;
                  break;
                }
              }
              if (!currentOperatorData) {
                operatorData[operator]['trp'] = 0;
                operatorData[operator]['totalInMarket'] += totalInMarketCount;
                operatorData[operator]['spots'] = 0;
                operatorData[operator]['reach'] =  0;
                operatorData[operator]['frequency'] = 0;
              } else {
                operatorData[operator]['trp'] = currentOperatorData['measures'] && currentOperatorData['measures']['trp'];
                operatorData[operator]['totalInMarket'] += totalInMarketCount;
                operatorData[operator]['spots'] = currentOperatorData['measures']['spots'];
                if (effectiveReach === 3) {
                  operatorData[operator]['reach'] = currentOperatorData['measures']['eff_reach_pct'] && currentOperatorData['measures']['eff_reach_pct'] || 0;
                  operatorData[operator]['frequency'] = currentOperatorData['measures']['eff_freq_avg'] && currentOperatorData['measures']['eff_freq_avg'] || 0;
                } else {
                  operatorData[operator]['reach'] = currentOperatorData['measures']['reach_pct'] && currentOperatorData['measures']['reach_pct'] || 0;
                  operatorData[operator]['frequency'] = currentOperatorData['measures']['freq_avg'] && currentOperatorData['measures']['freq_avg'] || 0;
                }
              }

              /* operatorData[operator]['trp'] += plan['measures']['trp'];
              operatorData[operator]['totalInMarket'] += totalInMarketCount;
              operatorData[operator]['spots'] += plan['measures']['spots'];
              if (effectiveReach === 3) {
                operatorData[operator]['reach'] += plan['measures']['eff_reach_pct'] && plan['measures']['eff_reach_pct'] || 0;
                operatorData[operator]['frequency'] += plan['measures']['eff_freq_avg'] && plan['measures']['eff_freq_avg'] || 0;
              } else {
                operatorData[operator]['reach'] += plan['measures']['reach_pct'] && plan['measures']['reach_pct'] || 0;
                operatorData[operator]['frequency'] += plan['measures']['freq_avg'] && plan['measures']['freq_avg'] || 0;
              } */
              operatorData[operator]['id'] = this.planData['id'];
              operatorData[operator]['allocationIndex'] = allocationIndex;
              if (this.isOperatorEmptyorAll) {
                mediaTypeData[mediaType]['collapsed'] = true;
                operatorData[operator]['collapsed'] = true;
              }
              operatorData[operator]['data'].push({
                mediaType: mediaType,
                mediaTypeLable: mediaTypename,
                parent: operator,
                totalInMarket: totalInMarketCount,
                spots: plan['measures']['spots'],
                trp: plan['measures']['trp'],
                reach: effectiveReach === 3 ? plan['measures']['eff_reach_pct'] : plan['measures']['reach_pct'],
                frequency: effectiveReach === 3 ? plan['measures']['eff_freq_avg'] : plan['measures']['freq_avg'],
                id: this.planData['id'],
                allocationIndex: allocationIndex,
                editable: true,
              });
              /** If operator available media type is editable false */
              operatorData[operator]['editable'] = false;
            }
          }
        } // If spots is null or 0 close condition
      });
    }
    Object.keys(mediaTypeData).forEach((media) => {
      mediaTypeData[media]['data'].sort((a, b) => {
        if (a.totalInMarket > b.totalInMarket) {
          return -1;
        }
        if (a.totalInMarket < b.totalInMarket) {
          return 1;
        }
        return 0;
      });
    });
    Object.keys(operatorData).forEach((op) => {
      operatorData[op]['data'].sort((a, b) => {
        if (a.totalInMarket > b.totalInMarket) {
          return -1;
        }
        if (a.totalInMarket < b.totalInMarket) {
          return 1;
        }
        return 0;
      });
    });

    this.mediaTypeData = Object.keys(mediaTypeData)
      .map((key) => {
        return mediaTypeData[key];
      });
    this.operatorData = Object.keys(operatorData)
      .map((key) => {
        return operatorData[key];
      });
    const mediaTypeDataDummy = [];
    this.mediaTypeData.map((medias, i) => {
      if (medias['totalInMarket'] > 0) {
        mediaTypeDataDummy.push(medias);
      }
    });
    this.mediaTypeData = mediaTypeDataDummy;
    this.dataSource.data = [...this.mediaTypeData];
    this.updatedMediaTypes = this.marketPlanService.getUpdatedMediaType();
    this.dataSource.data.forEach((data) => {
      if (this.updatedMediaTypes.id === data.id) {
        this.updatedMediaTypes.mediaTypeLable.forEach((data1) => {
          if (data1 === data.mediaTypeLable) {
            data.collapsed = false;
          }
        });
      }
    });
    if (this.dataSource.data.length < 1) {
      this.isNoDataFound = true;
    } else {
      this.isNoDataFound = false;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.goalFormData && changes.goalFormData.currentValue) {
      this.goalFormFieldValue = changes.goalFormData.currentValue['goals'];
    }
  }

  /**
   * This method is to get total inventory count based on selected market, operator and mediatype
   * @param mediaTypes
   * @param operator
   * @param totalMarketInventoryInfo This is data regarding the totalmarkets counts which we gettting from Geopath Summary API
   */
  private getTotalMarketCount(mediaTypes, operator, totalMarketInventoryInfo, isOnlyClassificationTypePresent = false) {
    if (!totalMarketInventoryInfo) {
      return 0;
    }
    let count = 0;
    if (isOnlyClassificationTypePresent) {
      count = totalMarketInventoryInfo.reduce(
        (totalCount, info) => {
          if (mediaTypes['classification_type_list'].indexOf(info.classificationType) > -1 &&
            (!mediaTypes['operator_name_list'] || info.operator === operator)) {
            return totalCount + info.spots;
          }
          return totalCount;
        },
        0
      );
    } else {
      count = totalMarketInventoryInfo.reduce(
        (totalCount, info) => {
          if (mediaTypes['frame_media_name_list'].indexOf(info.media) > -1 &&
            (!mediaTypes['operator_name_list'] || info.operator === operator)) {
            return totalCount + info.spots;
          }
          return totalCount;
        },
        0
      );
    }
    return count;
    // return 0;
  }
  updateSelectedMediaType(mediaType) {
    this.selectedMediaTypes = mediaType;
    let selectMediaTypes = [];
    selectMediaTypes = mediaType;
    const setData = {
      id: this.dataSource.data[0].id,
      matchedMediaTypes: this.mediaTypesComparsion(selectMediaTypes, this.dataSource.data)
    };
    // this.marketPlanService.setUpdatedMediaType(setData);
  }

  mediaTypesComparsion(arr1, arr2) {
    const finalArray = [];
    arr1.forEach((e1) => arr2.forEach((e2) => {
      if (e1.data === e2.mediaTypeLable) {
        finalArray.push(e1.data);
      }
    }));
    return finalArray;
  }

  onViewBY(selectedMediaType) {
    this.selectedMediaType = selectedMediaType.value;
    if (Number(this.selectedMediaType) === 0) {
      this.dataSource.data = [];
      this.dataSource.data = [...this.mediaTypeData];
    } else {
      this.dataSource.data = [];
      this.dataSource.data = [...this.operatorData];
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  updateGoal($event) {
    this.chnagesGoalFormData = $event;
  }
  onUpdateMediaType() {
    if (this.selectedMediaTypes.length < 1) {
      swal('Warning', 'Please select atleast one media type in this plan', 'warning');
      return true;
    }
    let locks = [];
    if (this.locks && this.locks.length > 0) {
      locks = this.locks;
    } else if (this.planData['query'] && this.planData['query']['locks']) {
      locks = this.planData['query']['locks'];
    }
    this.isLoader = true;
    const updatePlan = {
      query: {
        audience: this.planData['query']['audience'],
        market: this.planData['query']['market'],
        goals: this.chnagesGoalFormData,
        mediaTypeFilters: this.selectedMediaTypes,
        operators: this.planData['query']['operators'],
        locks: locks
      }
    };
    if (this.planData['query']['operators'] !== undefined && (!this.operatorModulePermission)) { // || this.isOperatorEmptyorAll
      delete updatePlan['query']['operators'];
    }
    this.marketPlanService.updatePlansFromGP(updatePlan, this.scenarioId, this.planData['id']);
  }

  onEditFieldValue(value, element, field) {
    let lockFlag = true;
    let locks = [];
    const lock = { 'allocationIndex': element.allocationIndex, 'field': field, 'value': value, 'mediaTypeIndex': element.mediaTypeIndex };
    if (element.id === this.planData['id'] && this.scenarioId && element.mediaTypeIndex >= 0) {
      this.isSaveingPlan = element;
      this.savingPlanInput = field;
      const allocation = this.planData['planData']['summaries']['by_media_type_group'][element.mediaTypeIndex];
      allocation['measures']['spots'] = null;
      allocation['measures']['trp'] = null;
      allocation['measures']['reach_pct'] = null;
      allocation['measures']['freq_avg'] = null;
      allocation['measures']['eff_reach_pct'] = null;
      allocation['measures']['eff_freq_avg'] = null;
      allocation['measures'][field] = Number(value);
      this.planData['planData']['summaries']['by_media_type_group'][element.mediaTypeIndex] = allocation;
      if (allocation['media_type_group']) {
        lock['frame_media_name_list'] = allocation['media_type_group']['frame_media_name_list'];
        lock['operator_name_list'] = allocation['media_type_group']['operator_name_list'];
        lock['classification_type_list'] = allocation['media_type_group']['classification_type_list'];
      }
      if (typeof this.planData['query']['locks'] !== 'undefined') {
        locks = this.planData['query']['locks'];
      }

      // Update my plan list TRP Frequency and reach

      const summary = this.planData['planData']['summaries'];
      summary['total']['measures']['trp'] = null;
      summary['total']['measures']['reach_pct'] = null;
      summary['total']['measures']['reach_net'] = null;
      summary['total']['measures']['freq_avg'] = null;
      summary['total']['measures']['eff_reach_pct'] = null;
      summary['total']['measures']['eff_freq_avg'] = null;
      this.planData['planData']['summaries'] = summary;

      locks.map(lck => {
        if (this.compare(lock['frame_media_name_list'], lck['frame_media_name_list'])) {
          lck['field'] = lock['field'];
          lck['value'] = lock['value'];
          lck['mediaTypeIndex'] = element.mediaTypeIndex;
          lockFlag = false;
        }
      });
      if (lockFlag) {
        locks.push(lock);
      }
      this.planData['query']['locks'] = locks;

      this.planData['query']['mediaTypeFilters'].map((m, i) => {
        if (m['data'] === element['mediaType']) {
          m['locks'] = { 'field': field, 'value': value };
        }
      });

      const updatePlan = {
        query: this.planData['query'],
        plan: this.planData['planData']
      };
      this.marketPlanService.updateSinglePlan(this.scenarioId, element.id, updatePlan).pipe(
        debounceTime(2000)
      ).subscribe(response => {
        this.updateParentPlanTotal.emit(element);
        this.isSaveingPlan = null;
        this.savingPlanInput = null;
        if (this.selectedMediaType === 0) {
          this.mediaTypeData.map(plan => {
            if (plan['mediaTypeIndex'] === element.mediaTypeIndex) {
              plan['reach'] = '';
              plan['spots'] = '';
              plan['frequency'] = '';
              plan['trp'] = '';
              plan[field] = Number(value);
            }
          });
        } else {
          this.operatorData.map(plan => {
            if (plan['mediaTypeIndex'] === element.mediaTypeIndex) {
              plan['reach'] = '';
              plan['spots'] = '';
              plan['frequency'] = '';
              plan['trp'] = '';
              plan[field] = Number(value);
            }
          });
        }
      });
    }
  }

removeMedia(el) {
    if (this.selectedMediaType > 0) {
      if (this.planData['query']['operators']) {
        this.planData['query']['operators'] = this.planData['query']['operators'].filter((operator) => operator != el.mediaTypeLable);
      }
    } else {
      if (this.selectedMediaTypes.length === 1) {
        swal('Warning', 'You can not remove all media types, atleast one media type present in this plan', 'warning');
        return true;
      }
      this.selectedMediaTypes = this.selectedMediaTypes.filter((media) => media.data !== el.mediaTypeLable);
    }
    this.onUpdateMediaType();
  }
  updatePlanTotal(currentPlan) {
    const plan = currentPlan['plan'];
    this.dataSource.data.map(d => {
      if (d['id'] === plan['id'] && d['parent'] === plan['parent']) {
        // d['trp'] = null;
        d['spots'] = null;
        d['frequency'] = null;
        d['reach'] = null;
        d.data.map(ele => {
          /* if (ele['trp'] !== '') {
            d['trp'] += Number(ele['trp']);
          } */
          if (ele['spots'] !== '') {
            d['spots'] += Number(ele['spots']);
          }
          /* if (ele['frequency'] !== '') {
            d['frequency'] += Number(ele['frequency']);
          }
          if (ele['reach'] !== '') {
            d['reach'] += Number(ele['reach']);
          } */
        });
      }
    });
    this.locks = currentPlan['locks'];
    this.updateParentPlanTotal.emit(currentPlan);
  }

  expandMarketPlanData(data) {
    data.collapsed = !data.collapsed;
    const updateData: any = this.marketPlanService.getUpdatedMediaType();
    if (updateData) {
      if (updateData.id === data.id) {
        this.mediaTypeLable = updateData.mediaTypeLable;
        if (data.collapsed) {
          const index = this.mediaTypeLable.indexOf(data.mediaTypeLable);
          this.mediaTypeLable.splice(index, 1);
        } else {
          this.mediaTypeLable.push(data.mediaTypeLable);
        }
        this.marketPlanService.setUpdatedMediaType({ id: data.id, mediaTypeLable: this.mediaTypeLable });
      } else {
        this.mediaTypeLable = [];
        this.mediaTypeLable.push(data.mediaTypeLable);
        this.marketPlanService.setUpdatedMediaType({ id: data.id, mediaTypeLable: this.mediaTypeLable });
      }
    }
  }
  compare(arr1, arr2) {
    if (arr1 && arr2) {
      return arr1.sort().toString() === arr2.sort().toString();
    } else if (arr1 === null && arr2 === null) {
      return;
    }
  }

  public customizeColumn() {
    const currentSortables = this.displayedColumns.map((name) => {
      const obj = { 'displayname': name, 'field_name': name };
      return obj;
    });
    currentSortables.splice(currentSortables.length - 1, 1);
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
        sortableColumn.push('actions');
        this.displayedColumns = sortableColumn;
      }
    });
  }


}
