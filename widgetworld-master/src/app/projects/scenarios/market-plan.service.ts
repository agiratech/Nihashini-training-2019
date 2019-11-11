import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Filter} from '@interTypes/filter';
import {
  GeopathInventoryPlan,
  Goals,
  MarketPlan,
  MarketPlanTargets,
  Plan,
  Query,
  GeopathSummaryQuery,
  MarketTotalInventory } from '@interTypes/workspaceV2';
import {BehaviorSubject, concat, Observable} from 'rxjs';
import {filter, map, retry} from 'rxjs/operators';
import {AppConfig} from '../../app-config.service';
import PlanQuery = GeopathInventoryPlan.PlanQuery;
import PlanGoals = GeopathInventoryPlan.Goal;

@Injectable()
export class MarketPlanService {
  constructor(private http: HttpClient,
              private config: AppConfig) {}

  private marketPlan: BehaviorSubject<MarketPlan> = new BehaviorSubject<MarketPlan>(null);
  private plans: BehaviorSubject<Plan[]> = new BehaviorSubject<Plan[]>(null);
  private reqHeaders: HttpHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
  private updatedMediaType = [];
  public getMarketPlanData(): Observable<MarketPlan> {
    return this.marketPlan.asObservable();
  }
  public setMarketPlanData(data: MarketPlan): void {
    if (data) {
      this.marketPlan.next(data);
    }
  }
  public setPlanData(planData: Plan[]): void {
    if (planData) {
      this.plans.next(planData);
    }
  }
  public getPlans(): Observable<Plan[]> {
    return this.plans.asObservable();
  }
  public getTargetData(): Observable<MarketPlanTargets> {
    return this.getMarketPlanData()
      .pipe(
        // Checking if data is coming and emitting only when the data is there
        filter((marketPlan: MarketPlan) => {
          if (!marketPlan) {
            return false;
          }
          if (!marketPlan.targets) {
            return false;
          }
          const target = marketPlan.targets;
          return (
            target.mediaTypeFilters.length > 0 ||
            target.markets.length > 0 ||
            target.audiences.length > 0);
        }),
        map((marketPlan: MarketPlan) => {
          marketPlan.targets.operatorsArray = this.formatOperatorsArray(marketPlan);
          return marketPlan.targets;
        }));
  }

  private formatOperatorsArray(marketPlan: MarketPlan): Filter[] {
    let operators: Filter[];
    if (marketPlan.targets.operators && marketPlan.targets.operators.length > 0) {
      operators = marketPlan.targets.operators.map(item => {
        return {
          id: item, name: item
        };
      });
    }
    return operators;
  }

  public cleanMediaTypeData(mediaTypes) {
    return mediaTypes.map(item => {
      return {
        data: item.data,
        ids: item.ids,
        isDigital: item.isDigital,
        isNonDigital: item.isNonDigital,
        mediaParent: item.mediaParent && item.mediaParent || []
      };
    });
  }
  public prepareMediaType(operators, mediaTypes, locks = []) {
    const mediaGroups = [];
    if (!operators || operators && operators.length === 0) {
      mediaTypes.filter(mediaType => {
        let lockFlag = true;
        const groupList =  {
          'frame_media_name_list': mediaType.ids.medias
        };
        if (mediaType.ids.environments.length > 0) {
          groupList['classification_type_list'] = mediaType.ids.environments;
        }
        if (locks.length > 0) {
          locks.map(lock => {
            if (this.compare(groupList['frame_media_name_list'], lock['frame_media_name_list'])) {
              if (lock['value'] !== '') {
                groupList['lock'] = {
                  'measure' : lock['field'],
                  'value'   : Number(lock['value'])
                };
                // if (lock['value'] === '' || Number(lock['value']) <= 0) 
                // Based on Matthew feedback the when user set lock to empty we should reset that media type values. 
                if (Number(lock['value']) <= 0) {
                  lockFlag = false;
                }
              }
            }
          });
        }
        if (lockFlag) {
          mediaGroups.push(groupList);
        }
      });
    } else {
      operators.filter(operator => {
        mediaTypes.filter(mediaType => {
          let lockFlag = true;
          const groupList = {
            'operator_name_list': [operator],
            'frame_media_name_list': mediaType.ids.medias
          };
          if (mediaType.ids.environments.length > 0) {
            groupList['classification_type_list'] = mediaType.ids.environments;
          }
          if (locks.length > 0) {
            locks.map(lock => {
              if (this.compare(groupList['frame_media_name_list'], lock['frame_media_name_list'])
              && this.compare(groupList['operator_name_list'], lock['operator_name_list'])) {
                if (lock['value'] !== '') {
                  groupList['lock'] = {
                    'measure' : lock['field'],
                    'value'   : Number(lock['value'])
                  };
                  // if (lock['value'] === '' || Number(lock['value']) <= 0) 
                  // Based on Matthew feedback the when user set lock to empty we should reset that media type values. 
                  if (lock['value'] !== '' && Number(lock['value']) <= 0) {
                    lockFlag = false;
                  }
                }
              }
            });
          }
          if (lockFlag) {
            mediaGroups.push(groupList);
          }
        });
      });
    }
    return mediaGroups;
  }
  public prepareGoals(goalFormData): Goals {
    return {
      trp: Number(goalFormData.trp),
      reach: Number(goalFormData.reach),
      frequency: Number(goalFormData.frequency),
      duration: Number(goalFormData.duration),
      effectiveReach: Number(goalFormData.effectiveReach),
      allocationMethod: goalFormData.allocationMethod,
    };
  }
  
  compare(arr1, arr2) {
    return arr1.sort().toString() === arr2.sort().toString();
  }
  public generatePlans(scenarioId: string, planData: MarketPlan, update: boolean = false): Observable<any> {
    const url = `${this.config.envSettings['API_ENDPOINT']}workflows/scenarios/${scenarioId}/marketPlans`;
    if (update) {
      return this.http.put(url, planData, {headers: this.reqHeaders});
    } else {
      return this.http.post(url, planData, {headers: this.reqHeaders});
    }
  }
  public autoSavePlanTargets(scenarioId: string, planData: MarketPlan): Observable<any> {
    /**
     * fixed empty array validation for mediaTypeFilters from the below API call
     *  */ 
    const updatePlanData = {...planData};
    if (updatePlanData['targets']['mediaTypeFilters'] && updatePlanData['targets']['mediaTypeFilters'].length === 0 ) {
      delete updatePlanData['targets']['mediaTypeFilters'];
    }
    const url = `${this.config.envSettings['API_ENDPOINT']}workflows/scenarios/${scenarioId}/marketPlans`;
    return this.http.post(url, planData, {headers: this.reqHeaders});
  }
  public getMarketPlans(scenarioId: string): Observable<MarketPlan> {
    const url = `${this.config.envSettings['API_ENDPOINT']}workflows/scenarios/${scenarioId}`;
    return this.http.get(url, {headers: this.reqHeaders})
      .pipe(
        filter(data => data['scenario'] && data['scenario']['marketPlans']),
        map(res => res['scenario']['marketPlans']));
  }
  public generatePlansFromGP(plans: Plan[], scenarioId: string): void {
    // Creating array of observables using the data selected by the user
    const queries: Observable<any>[] = plans
      .filter((plan: Plan) => Object.keys(plan.plan).length <= 0 || !plan.plan.totalMarketInventoryInfo)
      .map((plan: Plan) => {
      const query = {...plan.query};
      query['plan_id'] = plan._id;
      return this.getPlanMarketCount(this.prepareMarketCountQuery(query));
    });
    // Using concat to wait for one request to complete before another one fires up
    concat(...queries).subscribe(marketInventoryInfo => {
      // Getting current marketPlan Value
      const plan = plans.find(marketPlan => marketPlan._id === marketInventoryInfo['plan_id']);
      // This is to get plans info from Geopath Plans API
      this.getInventoryPlans(plan.query, marketInventoryInfo).subscribe(responseData => {
        const data = this.plans.getValue();
        const index = data.findIndex(marketPlan => marketPlan._id === marketInventoryInfo['plan_id']);
        if (data[index] && data[index]['plan']) {
          data[index].plan = responseData;
          if (data[index].query.operators && data[index].query.operators.length > 0) {
            data[index].query.operators = this.getOperators(marketInventoryInfo);
          }
          data[index]['plan'].totalMarketInventoryInfo = marketInventoryInfo['marketData'];
        }
        // ReAssigning the marketPlan value again to be fired for the listeners
        this.setPlanData(data);
        this.updateSinglePlan(scenarioId, data[index]['_id'], data[index])
          .subscribe();
      });
    });
  }

  public updatePlansFromGP(plan: Plan, scenarioId: string, planId: string): void {
    this.getPlanMarketCount(this.prepareMarketCountQuery(plan.query)).subscribe(marketInventoryInfo => {
      const allPlans = this.plans.getValue();
      const index = allPlans.findIndex(marketPlan => marketPlan['_id'] === planId);
      this.getInventoryPlans(plan.query, marketInventoryInfo).subscribe(responseData => {
        if (index >= 0) {
          allPlans[index].query = plan.query;
          // Get the locks index if value is zero
            plan.query.locks.map(lock => {
              if (lock.value !== '' && Number(lock.value) === 0) {
                if (lock['mediaTypeIndex'] >= 0) {
                /** Finding  mediaTypeIndex based on mediType*/
                 let mediaTypeIndex = '';
                 allPlans[index].plan['allocation_list'].map((aList, aIndex) => {
                    if (aList.media_type_group['frame_media_name_list'].sort().join(',') === lock.frame_media_name_list.sort().join(',')) {
                      if(lock.classification_type_list && lock.classification_type_list !== null && aList.media_type_group['classification_type_list'].sort().join(',') === lock.classification_type_list.sort().join(',')){
                        mediaTypeIndex = aIndex;
                      } else {
                        mediaTypeIndex = aIndex;
                      }
                    }
                 });

                  if (allPlans[index].plan['allocation_list'][mediaTypeIndex]) {
                    responseData['allocation_list'].splice(mediaTypeIndex, 0, allPlans[index].plan['allocation_list'][mediaTypeIndex]);
                  }

                 /** find summary index and added to summary list */
                  let summaryIndex = '';
                 allPlans[index].plan['summaries']['by_media_type_group'].map((sList, sIndex) => {
                    if (sList.media_type_group['frame_media_name_list'].sort().join(',') === lock.frame_media_name_list.sort().join(',')) {
                      if(lock.classification_type_list && lock.classification_type_list !== null && sList.media_type_group['classification_type_list'].sort().join(',') === lock.classification_type_list.sort().join(',')){
                        summaryIndex = sIndex;
                      } else {
                        summaryIndex = sIndex;
                      }
                    }
                 });
                /** updaing  summary based on mediType*/

                  if (allPlans[index].plan['summaries']['by_media_type_group'][summaryIndex]) {
                    responseData['summaries']['by_media_type_group'].splice(mediaTypeIndex, 0, allPlans[index].plan['summaries']['by_media_type_group'][summaryIndex]);
                  }
                } else {
                  if (allPlans[index].plan['allocation_list'][lock.allocationIndex]) {
                    responseData['allocation_list'].splice(lock.allocationIndex, 0, allPlans[index].plan['allocation_list'][lock.allocationIndex]);
                  }
                }
              }
            });
            allPlans[index].plan = responseData;
            if (allPlans[index].query.operators && allPlans[index].query.operators.length > 0) {
              allPlans[index].query.operators = this.getOperators(marketInventoryInfo);
            }
            // allPlans[index].query.operators = this.getOperators(marketInventoryInfo);
            allPlans[index].plan.totalMarketInventoryInfo = marketInventoryInfo['marketData'];
        }

        // ReAssigning the marketPlan value again to be fired for the listeners
        this.setPlanData(allPlans);
        this.updateSinglePlan(scenarioId, planId, allPlans[index])
          .subscribe();
      }, error => {
        this.setPlanData(this.plans.getValue());
      });
    });
  }
  public updateSinglePlan(scenarioId: string, planId: string, plan: Plan): Observable<any> {
    /**
     * fixed empty array validation for operators and locks from the below API call
     *  */ 
    const updatePlan = {...plan};

    if (updatePlan['query']['operators'] && updatePlan['query']['operators'].length === 0 ) {
      delete updatePlan['query']['operators'];
    }
    if (updatePlan['query']['locks'] && updatePlan['query']['locks'].length === 0 ) {
      delete updatePlan['query']['locks'];
    }

    const url = `${this.config.envSettings['API_ENDPOINT']}workflows/scenarios/${scenarioId}/marketPlans/${planId}`;
    return this.http.patch(url, updatePlan, {headers: this.reqHeaders})
      .pipe(retry(3));
  }
  public resetData(): void {
    this.marketPlan.next(null);
    this.plans.next(null);
  }

  /**
   * This function is to get inventory plan info from Geopath API
   * @param filterQuery
   * @param marketInventoryData
   */
  private getInventoryPlans(filterQuery, marketInventoryData: MarketTotalInventory[] = []) {
    const query: Query = {... filterQuery};
    if (filterQuery.operators && filterQuery.operators.length > 0) {
      query.operators = this.getOperators(marketInventoryData);
    } else {
      delete query.operators;
    }
    const planGoal: PlanGoals = {
      // because geopath API expects in no of days
      period_days: query.goals.duration * 7,
      measure: 'trp',
      value: query.goals.trp
    };
    const planQuery: PlanQuery = {
      target_geography: query.market.id,
      target_segment: query.audience.id,
      media_type_group_list: this.prepareMediaType(query.operators, query.mediaTypeFilters, query.locks),
      allocation_method: query.goals.allocationMethod,
      goal: planGoal
    };
    if (planQuery['media_type_group_list'].length <= 0) {
      delete planQuery['media_type_group_list'];
    }
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/plans', planQuery, {headers: this.reqHeaders})
      .pipe(retry(3));
  }


  private getOperators(marketInventoryData) {
    return marketInventoryData['marketData'].map(info => info.operator).filter(this.getUniqueValues);
  }
  /**
   * This method is to get inventory Info from Geopath for a given plan.
   * @param filterData
   */
  private getPlanMarketCount(filterData: GeopathSummaryQuery): Observable<any> {
    const filters = {...filterData};
    delete filters['plan_id'];
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search', filters, {headers: this.reqHeaders})
      .pipe(
        map(response => {
          return response['summaries'].filter(summary => summary.spots > 0);
        }),
        map(summaries => {
          const data = {};
          data['plan_id'] = filterData['plan_id'];
          data['marketData'] = summaries.map((summary) => {
            return {
              spots: summary['spots'],
              media: summary['summarizes']['summarizes_id_list'][0]['name'],
              operator: summary['summarizes']['summarizes_id_list'][1]['name'],
              classificationType: summary['summarizes']['summarizes_id_list'][2]['name']};
          });
          return data;
        })
      );
  }

  /**
   * This function is to prepare the query which will send to Geopath summary API to get inventory counts.
   * @param query
   */
  private prepareMarketCountQuery(query) {
    const summaryQuery: GeopathSummaryQuery = {
      plan_id: query.plan_id,
      target_geography: query.market.id,
      summary_level_list: ['Frame Media', 'Plant', 'Classification Type']
    };
    if (query.operators && query.operators.length > 0) {
      summaryQuery.operator_name_list = query.operators;
    }
    if (query.mediaTypeFilters && query.mediaTypeFilters.length > 0) {
      const mediaIds = [];
      const constructionTypeIds = [];
      query.mediaTypeFilters.map((mediaType) => {
        if (mediaType.ids) {
          if (mediaType.ids.medias && mediaType.ids.medias.length > 0) {
            mediaIds.push(...mediaType.ids.medias);
          }
          if (mediaType.ids.environments && mediaType.ids.environments.length > 0 ) {
            constructionTypeIds.push(...mediaType.ids.environments);
          }
        }
      });
      if (mediaIds.length > 0) {
        summaryQuery.frame_media_name_list = mediaIds.filter(this.getUniqueValues);
      }
      if (constructionTypeIds.length > 0) {
        summaryQuery.classification_type_list = constructionTypeIds.filter(this.getUniqueValues);
      }
    }
    return summaryQuery;
  }

  /**
   * This function is to filter the unique vales in a given array
   */
  private getUniqueValues = (value, index, self) => {
    return self.indexOf(value) === index;
  }
  /* set and get the updatePlanId */
  setUpdatedMediaType(mediaData) {
    this.updatedMediaType = mediaData;
  }
  getUpdatedMediaType() {
    return this.updatedMediaType;
  }

}
