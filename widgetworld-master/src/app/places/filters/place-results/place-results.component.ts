import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {
  Place,
  PlacesSortables,
  PlaceDetailsRequest,
  PlaceDetails,
  PlacesSummary,
  PlaceSortParams,
  PlaceFilterParams,
  PlaceProperties
} from '@interTypes/placeFilters';
import { Subject } from 'rxjs';
import { PlacesFiltersService } from '../places-filters.service';
import {map, take, takeUntil, tap} from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SavePlaceSetsDialogComponent } from '@shared/components/save-place-sets-dialog/save-place-sets-dialog.component';
import { PlacesDataService } from '@shared/services/places-data.service';
import swal from 'sweetalert2';
import { PlaceSetsDialogComponent } from '@shared/components/place-sets-dialog/place-sets-dialog.component';
import { PlacesElasticsearchService } from '../places-elasticsearch.service';

@Component({
  selector: 'app-place-results',
  templateUrl: './place-results.component.html',
  styleUrls: ['./place-results.component.less']
})
export class PlaceResultsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public filterData;
  @Input() public searchResults: Place[];
  @Input() public selectedTab: number;
  @Input() private poiData: any;
  @Input() private placeDataDetails;
  // @Output() sortingChanges: EventEmitter<any> = new EventEmitter();
  @Output() pagination: EventEmitter<any> = new EventEmitter();
  @Output() onHoverOnCard: EventEmitter<any> = new EventEmitter();
  @Output() onLeaveOnCard: EventEmitter<boolean> = new EventEmitter();
  @Output() onClickOnCard: EventEmitter<any> = new EventEmitter();
  @Output() updateNationalLevel: EventEmitter<any> = new EventEmitter();
  @Output() selectedFids = new EventEmitter();
  selectedStatus = {};
  private unSubscribe: Subject<void> = new Subject<void>();
  public reqParams: PlaceDetailsRequest = {
    page: 0,
    placeNameList: [],
    place: '',
  };
  private placeDetails: PlaceDetails[] = [];
  public sidebarTitle = 'Your Place Results';
  public selectedCount = 0;
  public places: PlaceProperties[] = [];
  public summary: PlacesSummary;
  public sortables: PlacesSortables[] = [];
  public placeResults: Place[] = [];
  public detailsSortables: PlacesSortables[] = [];
  public activeRoute = 'none';
  public paging = {};
  public placeListPage = 0;
  public sfids = [];
  public readonly routes = {
    'placeResultsGrid': 'placeResultsGrid',
    'placeResultsList': 'placeResultsList',
    'placeDetailsGrid': 'placeDetailsGrid',
    'placeDetailsList': 'placeDetailsList',
  };
  private backRoute = '';
  private selectLazyloadedPlaces = true;
  public currentSort: PlaceSortParams;
  public selectedStage = 'unselected';
  constructor(
    private placeFilterService: PlacesFiltersService,
    private placesDataService: PlacesDataService,
    public dialog: MatDialog,
    private elasticSearch: PlacesElasticsearchService
  ) {}
  ngOnInit() {
    if (this.filterData && this.filterData['place']) {
      this.reqParams.place = this.filterData['place'];
    }
  }

  public setActiveView(viewName: string) {
    this.activeRoute = viewName;
    if (viewName === 'placeResultsGrid' || viewName === 'placeDetailsGrid') {
      this.placeFilterService.setFilterLevel({'placeResultExpand': false});
    } else if (viewName === 'placeResultsList' || viewName === 'placeDetailsList') {
      this.placeFilterService.setFilterLevel({'placeResultExpand': true});
    }
    const filters = this.placeFilterService.getPlacesSession();
    if (filters && filters['placeDetail'] && Object.keys(filters['placeDetail']).length > 0) {
      this.setViewDetail(viewName);
    }
  }

  public setViewDetail(viewName: string) {
    const filters = this.placeFilterService.getPlacesSession();
    if (viewName === 'placeDetailsGrid') {
      filters['placeDetail']['route'] = this.routes.placeDetailsGrid;
    } else if (viewName === 'placeDetailsList') {
      filters['placeDetail']['route'] = this.routes.placeDetailsList;
    }
    this.placeFilterService.savePlacesSession('placeDetail', filters['placeDetail']);
  }

  public openDetails($event) {
    const filtersData = this.placeFilterService.getPlacesSession();
    filtersData['filters']['placeNameList'] = [$event];
    this.reqParams.placeNameList = [$event];
    this.backRoute = this.activeRoute;
    this.getPlaceDetails(filtersData['filters'])
      .pipe(take(1))
      .subscribe((res: PlaceProperties[]) => {
        this.places = res;
        // const sfids = this.sfids.map(p => p['safegraph_place_id']);
        // this.placeFilterService.setPoiData(sfids);
        const filters = this.placeFilterService.getPlacesSession();
        this.sidebarTitle = $event;
        const route = filters['placeDetail']['route'] !== '' ? filters['placeDetail']['route'] : this.routes.placeDetailsList;
        filters['placeDetail']['placeName'] = $event;
        filters['placeDetail']['route'] = route;
        this.placeFilterService.savePlacesSession('placeDetail', filters['placeDetail']);
        this.setActiveView(route);
      },
      error => {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      });
  }
  private getPlaceDetails(reqParams) {
    let query = this.elasticSearch.prepareElasticQuery(reqParams);
    query = this.elasticSearch.addSGIDsAgg(query);
    return this.elasticSearch.getDataFromElasticSearch(query)
      .pipe(
        tap((res) => {
          if (res['aggregations'] && res['aggregations']['safegraphIds'] && res['aggregations']['safegraphIds']['buckets']) {
            const sfids = [];
            res['aggregations'].safegraphIds.buckets.map(id => {
              sfids.push({'id': id.key, 'selected': true});
            });
            this.sfids = sfids;
            this.selectedFids.emit(this.sfids);
          }
        }),
        map((res) => {
          const placeDetails = this.elasticSearch.formatPlaceDetails(res);
          this.detailsSortables = placeDetails['sortKey'];
          this.placeDetails = placeDetails['places'];
          this.summary = placeDetails['summary'];
          this.selectedStage = 'selected';
          this.updateNationalLevel.emit({query: this.filterData, placeNames: this.sfids, selectedStage: 'selected', resultType: 'single'});
          return placeDetails['places'].map((item) => {
            item.selected = true;
            return item;
          });
        }),
        takeUntil(this.unSubscribe)
      );

    /*return this.placeFilterService.getPlaceDetails(reqParams)
      .pipe(
        tap((res: PlaceDetailsModel) => {
          this.detailsSortables = res.sortKey;
          this.placeDetails = res.places;
          this.summary = res.summary;
          const sfids = [];
          res.ids.map((fid) => {
            sfids.push({'id': fid, 'selected': true});
          });
          this.sfids = sfids;
        }),
        map((res: PlaceDetailsModel) => {
          return res.places.map((item: PlaceDetails) => {
            item.properties.selected = true;
            return item.properties;
          });
        }),
        takeUntil(this.unSubscribe));*/
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.filterData && this.filterData['place']) {
      this.reqParams.place = this.filterData['place'];
    }
    if (changes.searchResults && changes.searchResults.currentValue) {
      const searchResults = changes.searchResults.currentValue;
      if (searchResults && Object.keys(searchResults).length > 0) {
        this.summary = searchResults['summary'];
        this.sortables = searchResults['sortKey'];
        const places = searchResults['places'];
        this.paging = {page: 0, total: Math.floor(searchResults['summary']['number_of_places'] / 50), size: 50};
        places.map(p => p['selected'] = true);
        this.placeResults = places;
        this.setActiveView(this.routes.placeResultsList);
        this.sidebarTitle = 'Your Place Results';
        if (this.placeDataDetails &&  Object.keys(this.placeDataDetails).length > 0) {
          const placeName = this.placeDataDetails['placeName'];
          this.openDetails(placeName);
        }
      }
    }
    if (changes.poiData && changes.poiData.currentValue) {
      const poiData = changes.poiData.currentValue;
      this.summary = poiData['summary'];
      this.detailsSortables  = poiData['sortKey'];
      this.places = poiData['places'];
      this.paging = {page: 0, total: 0};
      this.sidebarTitle = poiData['name'];
      const sfids = [];
      if (poiData['sfids']) {
        poiData['sfids'].map((id) => {
          sfids.push({'id': id, 'selected': true});
        });
      }
      this.sfids = sfids;
      this.selectedFids.emit(this.sfids);
      const route = this.activeRoute === 'none' ? this.routes.placeDetailsList : this.activeRoute;
      this.setActiveView(route);
    }
  }
  onSorting(value) {
    this.currentSort = value;
    // this.sortingChanges.emit(value);
    const filterData = JSON.parse(JSON.stringify(this.filterData));
    this.currentSort = value;
    this.getPlacesDataFromAPI({...filterData, ...this.currentSort});
  }
  onPagination(pageDetails) {
    this.placeListPage = pageDetails['page'];
    // this.paging['page'] = value;
    if (typeof pageDetails['selectAll'] !== 'undefined') {
      if (pageDetails['selectAll']) {
        this.selectLazyloadedPlaces = true;
      } else if (!pageDetails['selectAll'] && pageDetails['selectedCount'] !== 0) {
        this.selectLazyloadedPlaces = true;
      } else {
        this.selectLazyloadedPlaces = false;
      }
    }
    const filterData = JSON.parse(JSON.stringify(this.filterData));
    const filters = {...filterData, ...this.currentSort, ...{page: this.placeListPage}};
    this.getPlacesDataFromAPI(filters, 'pagination');
  }
  onDetailsPaging(pageDetails) {
    this.reqParams.page = pageDetails['page'];
    const filtersData = this.placeFilterService.getPlacesSession();
    const filters = JSON.parse(JSON.stringify(filtersData['filters']));
    let reqParams = {};
    if (this.selectedTab === 1) {
      this.reqParams['poiIds'] = pageDetails['sfids'];
      delete this.reqParams['place'];
      delete this.reqParams['placeNameList'];
      reqParams = this.reqParams;
    } else {
      filters['placeNameList'] = this.reqParams['placeNameList'];
      filters['page'] = pageDetails['page'];
      reqParams = filters;
    }
    this.getPlaceDetails(reqParams)
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((res: PlaceProperties[]) => {
        const newPlaces = res.map(item => {
          if (pageDetails['selectAll']) {
            item.selected = true;
          } else {
            item.selected = false;
          }
          return item;
        });
        this.places = [...this.places, ...newPlaces];
      },
      error => {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      });
  }

  hoverOnCard(place) {
    this.onHoverOnCard.emit(place);
  }
  hoverOffCard() {
    this.onLeaveOnCard.emit(true);
  }
  clickOnCard(place) {
    this.onClickOnCard.emit(place);
  }

  onDetailsSorting(sortDetails) {
    this.reqParams.page = 0;
    const filtersData = this.placeFilterService.getPlacesSession();
    const filters = JSON.parse(JSON.stringify(filtersData['filters']));
    let reqParams = {};
    if (this.selectedTab === 1) {
      this.reqParams['poiIds'] = sortDetails['sfids'];
      delete this.reqParams['place'];
      delete this.reqParams['placeNameList'];
      reqParams = this.reqParams;
    } else {
      filters['placeNameList'] = this.reqParams['placeNameList'];
      filters['page'] = 0;
      reqParams = filters;
    }
    
    /* this.reqParams.page = 0;
    if (this.selectedTab === 1) {
      this.reqParams['poiIds'] = sortDetails['sfids'];
      delete this.reqParams['place'];
      delete this.reqParams['placeNameList'];
    }
    delete sortDetails['sfids']; */

    reqParams = {...reqParams, ...sortDetails};
    this.getPlaceDetails(reqParams)
      .pipe(take(1))
      .subscribe((res: PlaceProperties[]) => {
        const newPlaces = res.map(item => {
          item.selected = true;
          return item;
        });
        this.places = newPlaces;
      },
      error => {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      });
  }
  getPlacesDataFromAPI(filterData: Partial<PlaceFilterParams>, type: string = 'sort') {
    let query = this.elasticSearch.prepareElasticQuery(filterData);
    query = this.elasticSearch.addGroupedPlacesQueries(query);
    query = this.elasticSearch.addTotalQuery(query);
    this.elasticSearch.getDataFromElasticSearch(query).subscribe(response => {
      let hits = [];
      if (response['hits'] && response['hits']['hits']) {
        hits = response['hits']['hits'];
      }
      const places = this.elasticSearch.formatLocationData(hits);
      if (type === 'sort') {
        places.map(p => p['selected'] = true);
        this.placeResults = places;
      } else {
        let newPlaces: Place[] = [];
        if (this.selectLazyloadedPlaces) {
          newPlaces = places.map((p: Place) => {
            p['selected'] = true;
            return p;
          });
        } else {
          newPlaces = places.map((p: Place) => {
            p['selected'] = false;
            return p;
          });
        }
        this.placeResults = [...this.placeResults, ...newPlaces];
        const paging = JSON.parse(JSON.stringify(this.paging));
        paging['page'] = filterData['page'];
        this.paging = {};
        this.paging = paging;
      }

    });
    /* this.placeFilterService.getPlaces(filterData)
      .subscribe(response => {
        if (type === 'sort') {
          const places = response['places'];
          places.map(p => p['selected'] = true);
          this.placeResults = places;
        } else {
          const places = response['places'];
          let newPlaces: Place[] = [];
          if (this.selectLazyloadedPlaces) {
            newPlaces = places.map((p: Place) => {
              p['selected'] = true;
              return p;
            });
          } else {
            newPlaces = places.map((p: Place) => {
              p['selected'] = false;
              return p;
            });
          }
          this.placeResults = [...this.placeResults, ...newPlaces];
          const paging = JSON.parse(JSON.stringify(this.paging));
          paging['page'] = filterData['page'];
          this.paging = {};
          this.paging = paging;
        }
    }); */
  }
  backToResults() {
    this.summary = this.searchResults['summary'];
    this.sidebarTitle = 'Your Place Results';
    this.reqParams.page = 0;
    if (this.backRoute) {
      this.setActiveView(this.backRoute);
      this.backRoute = '';
    } else {
      this.setActiveView(this.routes.placeResultsGrid);
    }
    this.placeFilterService.savePlacesSession('placeDetail', {'placeName': '', 'route': ''});
    this.placeDataDetails = {};
    this.placeFilterService.setPoiData([]);
    this.updateNationalLevel.emit({query: this.filterData, placeNames: this.sfids, selectedStage: 'unselected', resultType: 'grouped'});
  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  onSelection(data) {
    this.selectedCount = data['count'];
    this.selectedStage = data['selectedStage'] || 'unselected';
    this.selectedStatus = {query: this.filterData, placeNames: data['placeNames'], selectedStage: data['selectedStage'],
    resultType: data['resultType'], noOfPlaces: this.summary.number_of_places};
    // Below function call is to update the national bubble count values based on places selection.
    if (!data['initCall']) {
      this.updateNationalLevel.emit({query: this.filterData, placeNames: data['placeNames'], selectedStage: data['selectedStage'],
      resultType: data['resultType']});
    }
  }

  onOpenSavePlaseSet() {
    let type = 'group';
    switch (this.activeRoute) {
      case this.routes.placeResultsGrid:
        type = 'group';
        this.placesDataService.setPOILocationData(this.selectedStatus);
        break;
      case this.routes.placeResultsList:
        type = 'group';
        this.placesDataService.setPOILocationData(this.selectedStatus);
        break;
      case this.routes.placeDetailsGrid:
        type = 'single';
        this.placesDataService.setPOIPlacesData(this.sfids.filter(s => s.selected));
        break;
      case this.routes.placeDetailsList:
        type = 'single';
        this.placesDataService.setPOIPlacesData(this.sfids.filter(s => s.selected));
        break;
      default:
        break;
    }
    const filters = this.placeFilterService.getPlacesSession();
    const data = {
      title: 'Save as New Place Set',
      buttonText: 'Create Place Set',
      isSavePlaceSet: false,
      type: type,
      selectedPlacesCount: this.selectedCount,
      summaryId: filters['filters'] && filters['filters']['summaryId'] && filters['filters']['summaryId']
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data,
      panelClass: 'placesSet-dialog-container'
    });
  }
  onOpenSaveToExistingPlaseSet() {
    let type = 'group';
    switch (this.activeRoute) {
      case this.routes.placeResultsGrid:
        type = 'group';
        this.placesDataService.setPOILocationData(this.selectedStatus);
        break;
      case this.routes.placeResultsList:
        type = 'group';
        this.placesDataService.setPOILocationData(this.selectedStatus);
        break;
      case this.routes.placeDetailsGrid:
        type = 'single';
        this.placesDataService.setPOIPlacesData(this.sfids.filter(s => s.selected));
        break;
      case this.routes.placeDetailsList:
        type = 'single';
        this.placesDataService.setPOIPlacesData(this.sfids.filter(s => s.selected));
        break;
      default:
        break;
    }
    const filters = this.placeFilterService.getPlacesSession();
    const data = {
      title: 'Save to Existing Place Set',
      buttonText: 'Save to selected Place Set',
      isExistingPlaceSet: true,
      type: type,
      selectedPlacesCount: this.selectedCount,
      summaryId: filters['filters'] && filters['filters']['summaryId'] && filters['filters']['summaryId']
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data
    });
  }
  onSaveExistingPlaceSet() {
    const data = {
      title: 'Save Place Set',
      buttonText: 'Save',
      isSavePlaceSet: true,
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data
    });
  }
  onOpenPlaceSetsDialog() {
    this.placesDataService.getExistingPlaceSet().subscribe(placeSets => {
    if (placeSets.length !== 0) {
      this.dialog.open(PlaceSetsDialogComponent, {
        data : placeSets
      }).afterClosed().subscribe(data => {
        if (data && data['place']) {
            this.placeFilterService.setSelectedPlaceSet(data['place']);
        }
      });
    } else {
      swal('Warning', 'No custom place sets exist. Please create place sets first.', 'warning');
    }
    });
  }
}
