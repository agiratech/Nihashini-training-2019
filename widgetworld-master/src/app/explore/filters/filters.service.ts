import {Injectable} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {FilterPillTypes} from '@interTypes/displayOptions';
import {Filters} from '@interTypes/filters';
import {SummaryRequest} from '@interTypes/summary';
import {ExploreSavePackageComponent} from '@shared/components/explore-save-package/explore-save-package.component';
import { WorkSpaceDataService } from '@shared/services/work-space-data.service';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class FiltersService {
  private filterData: Partial<Filters> = {};
  private filterSelection: Partial<Filters> = {};
  private filterState = new Subject();
  private filterReset = new Subject<keyof Filters | 'All'>();
  private filterSidenav = new Subject();
  private filterSidenavOut = new Subject();
  private sessionDataPushed = new Subject();
  private selectedBaseID = 'pf_pop_a18p';
  private filterPills = new Subject();
  private filterPillData = {
    filters: {}
  };
  public isSessionFilter = false;
  public defaultAudience: any = {};
  public counties: any = [];
  constructor(
    private workSpaceDataService: WorkSpaceDataService,
    public dialog: MatDialog
  ) {
  }

  private emitData() {
    const selectedFilters: Partial<Filters> = {};
    Object.keys(this.filterSelection)
      .filter(item => (this.filterSelection[item]))
      .map(item => {
        selectedFilters[item] = this.filterData[item];
      });
    this.filterState.next({
      'data': selectedFilters,
      'selection': this.filterSelection
    });
  }

  /**
   * Use this function to set your filter data to service
   * @param filterType: String any one of filer type
   * @param data: the processed data from your filter which is ready
   * to be sent to gpFilter API directly, do not send unprocessed
   * data into this service
   */
  public setFilter(filterType: keyof Filters, data: any): void {
    if (filterType === 'plantUnitId') {
      this.filterData['geoPanelId'] = [];
    } else if (filterType === 'geoPanelId') {
      this.filterData['plantUnitId'] = [];
    }
    this.filterData[filterType] = data;
    this.toggleFilter(filterType, true);
    // this.setFilterSidenav({open: false, tab: ''});
  }

  /**
   * Use this function in explore to get all the filters and get updates
   * every time a new filter is set or changed.
   */
  public getFilters(): Observable<any> {
    return this.filterState.asObservable();
  }

  /**
   * use this function to clear the filter
   * @param filterType: String any one of filer type
   * @param clearData: Boolean field and it will be true for reset the  data for that filter
   */
  public clearFilter(filterType: keyof Filters, clearData: boolean = false) {
    delete this.filterData[filterType];
    if (clearData) {
      this.toggleFilter(filterType, false, clearData);
      // this.emitData();
    }
  }
  public onReset(): Observable<any> {
    return this.filterReset.asObservable();
  }
  public resetAll(): void {
    this.filterSelection = {};
    // this.emitData();
    this.filterReset.next('All');
  }

  /**
   * Use this function to toggle individual filters on and off without
   * losing the filter data
   * @param type type of the filter any one from Filters Interface
   * @param enabled
   */
  public toggleFilter(type: keyof Filters, enabled: boolean, clear: boolean = false): void {
    if (clear) {
      delete this.filterSelection[type];
    } else {
      this.filterSelection[type] = enabled;
    }
    this.emitData();
  }

  /**
   * This function used to toggle the filter inventories by id
   *
   * @param enabled
   */
  public toggleCombinedFilters(enabled: boolean): void {
    this.filterSelection['geoPanelId'] = enabled;
    this.filterSelection['plantUnitId'] = enabled;
    this.emitData();
  }
  /**
   * Use this function to assign the inventory set and scenario
   * data into geopanel ID for submitting into the gpFilter API.
   *
   * @param filters: filter data need to format.
   * @formatThreshold flag to define it need to format Threshold or not
   * @deprecated : Use NormalizeFilterDataNew function for any new changes
   */
  public normalizeFilterData(filters: object, formatThreshold: boolean = true): Partial<Filters> {
    const data = Object.assign({}, filters['data']);
    if (data['plantUnitId']) {
      // data['idType'] = 'operatorPanel';
      data['operatorPanelIdList'] = data['plantUnitId'];
      delete data['plantUnitId'];
    }
    if (
      data['inventorySet'] ||
      data['scenario'] ||
      data['geoPanelId']) {
      // data['idType'] = 'geopathPanel';
      data['geopathPanelIdList'] = [
        ...(data['geoPanelId'] || []),
        ...(typeof data['inventorySet'] !== 'undefined' ? data['inventorySet']['ids'] || [] : []),
        ...(typeof  data['scenario'] !== 'undefined' ? data['scenario']['ids'] || [] : [])
      ];
      // const conventData = [];
      // data['geopathPanelIdList'].map(v => {
      //   console.log('adv', v);
      //   conventData.push(parseInt(v));
      // });
      // data['geopathPanelIdList'] = conventData;
      delete data['inventorySet'];
      delete data['scenario'];
      delete data['geoPanelId'];
    }
    if (data['mediaTypeList']) {
      data['mediaTypeList'] = data['mediaTypeList']['ids'];
    }
    if (data['mediaAttributes']) {
      data['media_attributes'] = data['mediaAttributes'];
      delete data['mediaAttributes'];
    }
    if (data['market'] && data['market']['id']) {
      data['audienceMarket'] = data['market']['id'];
      delete data['market'];
    }
    if (typeof data['operatorList'] !== 'undefined' && data['operatorList'].length <= 0) {
      delete data['operatorList'];
    }
    if (typeof data['geopathPanelIdList'] !== 'undefined' && data['geopathPanelIdList'].length <= 0) {
      delete data['geopathPanelIdList'];
    }
    if (typeof data['operatorPanelIdList'] !== 'undefined' && data['operatorPanelIdList'].length <= 0) {
      delete data['operatorPanelIdList'];
    }
    if (typeof data['media_attributes'] !== 'undefined' && data['media_attributes'].length <= 0) {
      delete data['media_attributes'];
    }
    if (typeof data['selectedFids'] !== 'undefined' && data['selectedFids'].length <= 0) {
      delete data['selectedFids'];
    }
    if (typeof data['mapPosition'] !== 'undefined') {
      delete data['mapPosition'];
    }
    data['sort'] = 'cwi';
    delete data['sortQuery'];
    /* if (typeof data['sortQuery'] !== 'undefined') {
      if (typeof data['sortQuery']['value'] !== 'undefined') {
        data['sort'] = data['sortQuery']['value'];
      }
      delete data['sortQuery'];
    } */
    if (formatThreshold && data['thresholds']) {
      const threshold = {};
      /** As API team requested we have conventing the percentage value in to float here (value / 100) eg: 1%/100 = 0.01 **/
      if (typeof data['thresholds']['targetCompPer'] !== 'undefined') {
        threshold['targetCompPer'] = [data['thresholds']['targetCompPer'][0] / 100 , data['thresholds']['targetCompPer'][1] / 100];
      }
      if (typeof data['thresholds']['targetImp'] !== 'undefined') {
        threshold['targetImp'] = [data['thresholds']['targetImp'][0] , data['thresholds']['targetImp'][1]];
      }
      if (typeof data['audienceMarket'] !== 'undefined') {
        if (typeof data['thresholds']['inMarketCompPer'] !== 'undefined') {
          threshold['inMarketCompPer'] = [data['thresholds']['inMarketCompPer'][0] / 100,
            data['thresholds']['inMarketCompPer'][1] / 100];
        }
        /** Here converting logarithmic scale value to original value
         * 0 - 74: 15 stops
         * 75 - 149: 75 stops
         * 150 - 499: 70 stops
         * 500 - 1000: 50 stops
         **/
        if (typeof data['thresholds']['inMarketCompIndex'] !== 'undefined') {
          threshold['inMarketCompIndex'] = [this.targetAudienceMinMax(data['thresholds']['inMarketCompIndex'][0]),
            this.targetAudienceMinMax(data['thresholds']['inMarketCompIndex'][1])];
        }
      }
      if (threshold) {
        data['threshold'] = threshold;
      }
    }
    delete data['thresholds'];
    data['base'] = this.selectedBaseID;
    if (data['location'] && data['location']['region']) {
      data['region'] = data['location']['region'];
      delete data['location'];
    }
    if (data['selectedFids']) {
      delete data['selectedFids'];
    }
    if (data['places']) {
      delete data['places'];
    }
    return data;
  }

  /**
   * Use this function to assign the inventory set and scenario
   * data into geopanel ID for submitting into the gpFilter API.
   *
   * @param filters: filter data need to format.
   * @formatThreshold flag to define it need to format Threshold or not
   */
  public normalizeFilterDataNew(filters: Object, formatThreshold: boolean = true): Partial<SummaryRequest> {
    const data: Partial<SummaryRequest> = {};
    // If no data, just return an empty array
    if (!filters['data']) {
      return {};
    }
    // If plant unit ID is there rest of the IDs and scenarios will be ignored
    if (filters['data']['plantUnitId'] &&
    filters['data']['plantUnitId'].length) {
      data.id_type = 'plant_frame_id';
      data.id_list = filters['data']['plantUnitId'];
    } else if (
      filters['data']['inventorySet'] ||
      filters['data']['scenario'] ||
      filters['data']['geoPanelId'] &&
      filters['data']['geoPanelId'].length) {
      data.id_type = 'spot_id';
      data.id_list = [
        ...(filters['data']['geoPanelId'] || []),
        ...(typeof filters['data']['inventorySet'] !== 'undefined' ? filters['data']['inventorySet']['ids'] || [] : []),
        ...(typeof  filters['data']['scenario'] !== 'undefined' ? filters['data']['scenario']['ids'] || [] : [])
      ];
    }
    /* if (filters['data']['geoPanelId']) {
      data.id_type = 'frame_id';
      data.id_list = filters['data']['geoPanelId'] || [];
      if (filters['data']['inventorySet']) {
        data.id_list.push(...filters['data']['inventorySet']);
        if (filters['data']['scenario']) {
          data.id_list.push(...filters['data']['scenario']['ids']);
        }
      }
    } */
    if (filters['data']['mediaTypeList']) {
      data['frame_media_name_list'] = filters['data']['mediaTypeList']['ids']['medias'];
      data['classification_type_list'] = filters['data']['mediaTypeList']['ids']['environments'];
      // selected media type count update & avoid duplicate
      if (filters['data']['mediaTypeList']['mediaParent'].length > 0) {
        data['construction_type_list'] = filters['data']['mediaTypeList']['mediaParent'];
      }
      // have commented lines because no need to send digital true or false in filter get API request
      // if (filters['data']['mediaTypeList']['isDigital']
      // && !filters['data']['mediaTypeList']['isNonDigital']) {
      //   data['digital'] = true;
      // }
      // if (filters['data']['mediaTypeList']['isNonDigital']
      // && !filters['data']['mediaTypeList']['isDigital']) {
      //   data['digital'] = false;
      // }
    }
    /* if (filters['data']['mediaTypeList']) {
      const mediaTypes = JSON.parse(JSON.stringify(filters['data']['mediaTypeList']));
      if (mediaTypes.indexOf('Digital Only') > -1) {
        data['digital'] = true;
        mediaTypes.splice(0, 1);
      }
      const construction = [];
      const furniture = mediaTypes.indexOf('Furniture');
      const freeStanding = mediaTypes.indexOf('Freestanding');
      const exteriorWall = mediaTypes.indexOf('Exterior Wall');
      if (furniture > -1) {
        construction.push(mediaTypes[furniture]);
        mediaTypes.splice(furniture, 1);
      }
      if (freeStanding > -1) {
        construction.push(mediaTypes[freeStanding]);
        mediaTypes.splice(freeStanding, 1);
      }
      if (exteriorWall > -1) {
        construction.push(mediaTypes[exteriorWall]);
        mediaTypes.splice(exteriorWall, 1);
      }
      if (construction.length > 0) {
        data['construction_type_list'] = construction;
      }
      if (mediaTypes.length > 0) {
        data['media_type_list'] = mediaTypes;
      }
    } */
    if (filters['data']['mediaAttributes']) {
      const media = filters['data']['mediaAttributes'];
      if (media['orientationList']) {
        data['orientation'] = media['orientationList'];
      }
      if (media['panelSizeWidthRange']) {
        data['frame_width'] = {
          min: media['panelSizeWidthRange'][0],
          max: media['panelSizeWidthRange'][1],
        };
      }
      if (media['panelSizeHeightRange']) {
        data['frame_height'] = {
          min: media['panelSizeHeightRange'][0],
          max: media['panelSizeHeightRange'][1],
        };
      }
    }
    if (filters['data']['market'] && filters['data']['market']['id']) {
      data['target_geography'] = filters['data']['market']['id'];
    }
    if (this.defaultAudience && this.defaultAudience['audienceKey']) {
      data['base_segment'] = this.defaultAudience['audienceKey'];
    }
    if (filters['data']['audience']) {
      data['target_segment'] = filters['data']['audience']['key'];
    } else {
      data['target_segment'] = this.defaultAudience['audienceKey'];
    }

    if (typeof filters['data']['operatorList'] !== 'undefined' &&
    filters['data']['operatorList'].length > 0) {
      data['operator_name_list'] = filters['data']['operatorList'];
    }
    // default call as descending order
    const sort = {'measure': 'pct_comp_imp_target', 'type': 'desc'};
    if (filters && filters['data']['sortQuery'] && filters['data']['sortQuery']['value']) {
      sort['measure'] = filters['data']['sortQuery']['value'];
      sort['type'] = 'desc';
    }
    data['sort'] = sort;
    
    if (formatThreshold && filters['data']['thresholds']) {
      const measures_range_list = [];
      /** As API team requested we have conventing the percentage value in to float here (value / 100) eg: 1%/100 = 0.01 **/
      if (typeof filters['data']['thresholds']['targetCompPer'] !== 'undefined') {
        const targetCompPer = {
          type: 'pct_comp_imp_target',
          min: filters['data']['thresholds']['targetCompPer'][0] / 100,
          max: filters['data']['thresholds']['targetCompPer'][1] / 100
        };
       
        measures_range_list.push(targetCompPer);
      }
      if (typeof filters['data']['thresholds']['targetImp'] !== 'undefined') {
        const targetImp = {
          type: 'imp_target',
          min: filters['data']['thresholds']['targetImp'][0],
          max: filters['data']['thresholds']['targetImp'][1]
        };
        if (targetImp['max'] >= 150000) {
          delete targetImp['max'];
        }
        measures_range_list.push(targetImp);
      }
      if (typeof filters['data']['market'] !== 'undefined') {
        if (typeof filters['data']['thresholds']['inMarketCompPer'] !== 'undefined') {
          const inMarketCompPer = {
            type: 'pct_comp_imp_target_inmkt',
            min: filters['data']['thresholds']['inMarketCompPer'][0] / 100,
            max: filters['data']['thresholds']['inMarketCompPer'][1] / 100
          };
          measures_range_list.push(inMarketCompPer);
        }
        /** Here converting logarithmic scale value to original value
         * 0 - 74: 15 stops
         * 75 - 149: 75 stops
         * 150 - 499: 70 stops
         * 500 - 1000: 50 stops
        **/
        if (typeof filters['data']['thresholds']['inMarketCompIndex'] !== 'undefined') {
          const inMarketCompIndex = {
            type: 'index_comp_target',
            min: this.targetAudienceMinMax(filters['data']['thresholds']['inMarketCompIndex'][0]),
            max: this.targetAudienceMinMax(filters['data']['thresholds']['inMarketCompIndex'][1])
          };
          measures_range_list.push(inMarketCompIndex);
        }
      }
      if (measures_range_list) {
        data['measures_range_list'] = measures_range_list;
      }
    } else {
      const measures_range_list = [];
      const targetImp = {
        type: 'imp',
        min: 0
      };
      measures_range_list.push(targetImp);
      data['measures_range_list'] = measures_range_list;
    }
    // data['base'] = this.selectedBaseID;
    if (filters['data']['location'] && filters['data']['location']['region']) {
      data['region'] = filters['data']['location']['region'];
    }
    if (filters['data']['location'] && filters['data']['location']['selectedGeoLocation']) {
      data['inventory_market_list'] = [filters['data']['location']['selectedGeoLocation']['id']];
      // Commented by Jagadeesh on 24th Oct 2019
      // As we have state name in elastic search no need to use counties for states.
      // if (filters['data']['location']['selectedGeoLocation']['type'] !== 'States' ) {
      //   data['inventory_market_list'] = [filters['data']['location']['selectedGeoLocation']['id']];
      // } else {
      //   const counties = [];
      //   this.counties.map(county => {
      //     if (county.state === filters['data']['location']['selectedGeoLocation']['id']) {
      //       counties.push(county.id);
      //     }
      //   });
      //   if (counties.length > 0) {
      //     data['inventory_market_list'] = counties;
      //   }
      // }
    }
    return data;
  }
  targetAudienceMinMax (value) {
    let original = value;
    if (value <= 15) {
      original = value * 5;
    } else if (value <= 90) {
      original = (value - 15) + 75;
    } else if (value <= 160) {
      original = (value - 90) * (350 / 70) + 150;
    } else if (value <= 210) {
      original = (value - 160) * (500 / 50) + 500;
    }
    return original;
  }
  /**
   * Use this function to set sidenav object
   * @param sidenav: MatSidenav object which will use to control filter sidenav.
   **/
  public setFilterSidenav(filterSidenav): void {
    this.filterSidenav.next(filterSidenav);
  }
  public getFilterSidenav(): Observable<any>  {
    return this.filterSidenav.asObservable();
  }
  public setFilterSidenavOut(state): void {
    this.filterSidenavOut.next(state);
  }
  public getFilterSidenavOut(): Observable<any>  {
    return this.filterSidenavOut.asObservable();
  }

  public saveExploreSession(filters) {
    localStorage.setItem('savedExploreSession', JSON.stringify(filters));
  }
  public getExploreSession() {
    return JSON.parse(localStorage.getItem('savedExploreSession'));
  }
  public setFilterFromSession(filters) {
    const filterData = filters;
    this.filterData =  filters['data'] || {};
    filterData['data'] = filters['data'] || {};
    this.filterSelection = filters['selection'] || {};
    filterData['selection'] = filters['selection'] || {};

    if (Object.keys(filters['selection']).length !== 0
    && filters['selection'].constructor === Object) {
      this.isSessionFilter = true;
    }
    this.filterState.next(filterData);
  }
  public setFilterFromView(filters) {
    const filterData = filters;
    this.filterData =  filters['data'] || {};
    filterData['data'] = filters['data'] || {};
    this.filterSelection = filters['selection'] || {};
    filterData['selection'] = filters['selection'] || {};
    this.sessionDataPushed.next(true);
  }
  /**
   * Use this function act as trigger to set filter data while filters pushed in session.
   * it will call every time a filter data pushed in session.
   */
  public checkSessionDataPushed(): Observable<any> {
    return this.sessionDataPushed.asObservable();
  }

  public getFilterData() {
    return this.filterData;
  }

  public updateFiltersData(data = {}) {
    const filters = this.getExploreSession();
    if (data && filters && filters['data']) {
      Object.keys(data)
      .map(key => {
        filters['data'][key] = data[key];
      });
      this.saveExploreSession(filters);
    }
  }
  public saveMapPosition(polygon) {
    let filters = this.getExploreSession();
    if (filters && filters['data']) {
      filters['data']['mapPosition'] = polygon;
      this.saveExploreSession(filters);
    } else {
      filters = {};
      filters['data'] = {};
      filters['data']['mapPosition'] = polygon;
      this.saveExploreSession(filters);
    }
  }

  public saveSelectedFids(fids) {
    let filters = this.getExploreSession();
    if (filters && filters['data']) {
      filters['data']['selectedFids'] = fids;
      this.saveExploreSession(filters);
    } else {
      filters = {};
      filters['data'] = {};
      filters['data']['selectedFids'] = fids;
    }
  }

  openPackage(type = 'add', p = null, saveFromFilter = false, selectedFidsArray = [], selectedPackage = {}) {
    const data = {};
    let width = '500px';
    const height = 'auto';
    data['inventories'] = selectedFidsArray;
    data['from'] = 'explore';
    data['type'] = type;
    data['saveFromFilter'] = saveFromFilter;
    if (type !== 'add') {
      if (p != null) {
        data['package'] =  p;
      } else {
        data['package'] = selectedPackage;
      }
    }
    if (type === 'exist') {

      width = '586px';
    }
    const browser = this.dialog.open(ExploreSavePackageComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'save-package-container'
    }).afterClosed().subscribe(res => {
      this.workSpaceDataService.getPackages();
    });
  }

  public getFilterPills(): Observable<any> {
    return this.filterPills.asObservable();
  }

  public setFilterPill(
    pillKey: keyof FilterPillTypes,
    pill: string,
    subKey = null
  ): void {
    if (pillKey === 'filters' && subKey) {
      if (!this.filterPillData[pillKey]) {
        this.filterPillData[pillKey] = {};
      }
      this.filterPillData[pillKey][subKey] = pill;
    } else {
      this.filterPillData[pillKey] = pill;
    }
    this.filterPills.next(this.filterPillData);
  }

  public removeFilterPill(pillKey: keyof FilterPillTypes) {
    delete this.filterPillData[pillKey];
    this.filterPills.next(this.filterPillData);
  }

  public clearFilterPills(): void {
    this.filterPillData = {
      filters: {}
    };
    this.filterPills.next(this.filterPillData);
  }
  setCounties(counties) {
    this.counties = counties;
  }
}
