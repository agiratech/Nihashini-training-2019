import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ScenarioDialogComponent } from '@shared/components/scenario-dialog/scenario-dialog.component';
import { WorkflowLables, Scenario, ScenarioDialog, NewProjectDialog } from '@interTypes/workspaceV2';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import { NewWorkspaceService } from '../new-workspace.service';
import {
  FormatService,
  LoaderService,
  TargetAudienceService,
  WorkSpaceService,
  InventoryService,
  AuthenticationService
} from '@shared/services';
import { forkJoin, zip, of, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { DuplicateScenariosComponent } from '../duplicate-scenarios/duplicate-scenarios.component';
import { PlacesFiltersService } from 'app/places/filters/places-filters.service';
import { CustomizeColumnComponent } from '@shared/components/customize-column/customize-column.component';
import { catchError } from 'rxjs/operators';
import { NewProjectDialogComponent } from '@shared/components/new-project-dialog/new-project-dialog.component';

@Component({
  selector: 'app-scenario-list',
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioListComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() scenarios: any = [];
  @Input() isSubProject: boolean;
  @Input() projectId: any;
  @Input() subProjectLevel: any;
  @Output() createScenarioEmit: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[] = [
    'Scenario Name',
    'Description',
    'Units',
    'Audience',
    'Market',
    '# of Places',
    'Action'
  ];
  // , 'start', 'end'
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  sortingElement = '';
  isSameColumnSort = 0;

  public formattedScenarios: any = [];
  showSearchField: any;
  scenariosCount: any = 0;
  selectedRow = '';
  public searchQuery;
  public scrollContent: number;
  fDatas = [];
  markets: any = [];
  savedAudiences: any = [];
  dataChanges: any = [];
  packages: any = [];
  places: any = [];
  public labels: WorkflowLables;
  public sortable = [];
  public duplicateDisplayedColumns: any;
  public cbsaMarkets: any[];
  public customInventories: any = false;
  constructor(
    private workspace: NewWorkspaceService,
    private wsService: WorkSpaceService,
    private targetAudience: TargetAudienceService,
    private inventoryService: InventoryService,
    private fService: FormatService,
    private lService: LoaderService,
    private router: Router,
    public dialog: MatDialog,
    private placesFilterService: PlacesFiltersService,
    private cdr: ChangeDetectorRef,
    public loaderService: LoaderService,
    private projectStore: ProjectDataStoreService,
    private auth: AuthenticationService
    ) { }

  ngOnInit() {
    this.labels = this.workspace.getLabels();
    this.duplicateDisplayedColumns = [...this.displayedColumns];
    // this.subProjectLevel = this.workspace.getSubprojectLevel();
    this.formattedScenarios = this.fDatas;
    this.dataSource.data = this.formattedScenarios;
    this.scenariosCount = this.dataSource.filteredData.length;
    this.reSize();
    const mod_permission = this.auth.getModuleAccess('explore');
    if (mod_permission
      && mod_permission.features
      && mod_permission.features.customInventories
      && mod_permission.features.customInventories.status
      && mod_permission.features.customInventories.status === 'active') {
      this.customInventories = true;
    }
  }
  public ngOnChanges(changes: SimpleChanges) {
    this.dataChanges = changes;
    if (this.dataChanges.scenarios) {
      if (this.dataChanges.scenarios.currentValue.length > 0) {
        const cbsaAPIs = [];
        const cbsaIDs = [];
        this.dataChanges.scenarios.currentValue.map(scenario => {
          if (scenario.audience
            && scenario.audience.market_type
            && scenario.audience.market_type === 'CBSA'
            && cbsaIDs.indexOf(scenario.audience.market_id) === -1) {
            cbsaIDs.push(scenario.audience.market_id);
            cbsaAPIs.push(this.inventoryService
              .getMarketByID(scenario.audience.market_id, false)
              .pipe(catchError(error => of({})))
            );
          }
        });
        const packages = this.wsService.getExplorePackages().pipe(catchError(error => of({})));
        const audiences = this.targetAudience.getSavedAudiences().pipe(catchError(error => of({})));
        /** commented on getting market data from API because local Json file have all the market data.  commented Date 05-11-2019 */
        // const marketResult = this.inventoryService.getMarkets(false).pipe(catchError(error => of([])));
        const marketResult = this.inventoryService.getMarketsFromFile().pipe(catchError(error => of([])));
        const places = this.placesFilterService.getPlacesSet(false).pipe(catchError(error => of({})));

        const scenarioListAPIs = [packages, audiences, marketResult, places];
        if (cbsaAPIs.length > 0) {
          scenarioListAPIs.push(zip(...cbsaAPIs));
        }
        forkJoin(scenarioListAPIs).subscribe(results => {
          if (results[0]['packages'] && results[0]['packages'].length > 0) {
            this.packages = results[0]['packages'];
            this.packages.sort(this.fService.sortAlphabetic);
          }
          if (
            results[1]['audienceList'] &&
            results[1]['audienceList'].length > 0
          ) {
            this.savedAudiences = results[1]['audienceList'];
          }
          if (results[2] && results[2].length > 0) {
            this.markets = results[2];
          }
          if (results[3] && results[3]['data'] && results[3]['data'].length > 0) {
            this.places = results[3]['data'];
          }
          const cbsaMarkets = [];
          if (results[4] && results[4].length) {
            results[4].map(cbsa => {
              if (cbsa['market']) {
                cbsaMarkets.push(cbsa['market']);
              }
            });
          }
          this.cbsaMarkets = cbsaMarkets;
          this.loadScenarios();
        });
      } else {
        this.formattedScenarios = [];
        this.dataSource.data = [];
        this.scenariosCount = 0;
      }
    }
  }
  private loadScenarios() {
    this.formattedScenarios = [];
    this.dataSource.data = [];
    this.scenariosCount = 0;
    let fDatas: Scenario[] = [];
    const scenarios: SimpleChange = this.dataChanges.scenarios;
    const scenariosData = scenarios && scenarios.currentValue || [];
    if (scenariosData.length > 0) {
      fDatas = this.wsService.formattingScenarios(
        scenariosData,
        this.packages,
        this.savedAudiences,
        this.markets,
        this.places,
        this.cbsaMarkets
      );
    } else {
      fDatas = [];
    }
    this.formattedScenarios = fDatas;
    this.dataSource.data = fDatas;
    fDatas.forEach((val, index) => {
      if (val['unitIds'].length > 0) {
        const filterData = {};
        filterData['audience'] = val['audienceKey'] || 'pf_pop';
        filterData['base'] = 'pf_pop_a18p';
        filterData['page'] = 0;
        if (val['marketId']) {
          filterData['audienceMarket'] = val['marketId'];
          filterData['location'] =  {'type': 'geography', 'selectedGeoLocation' : {
            'id' : val['marketId']
          }};
        }
        filterData['geopathPanelIdList'] = val['unitIds'];
        const formattedFilters = this.inventoryService.normalizeFilterDataNew(
          filterData
        );
        formattedFilters['measures_range_list'] = [{'type': 'imp', 'min': 0 }];

        const summary = this.inventoryService.getSummary(formattedFilters).pipe(catchError(error => EMPTY));
        const summaryAPIs = [summary];
        if (this.customInventories) {
          const customDBData = this.inventoryService.getCustomDBSpotsCount(formattedFilters);
          summaryAPIs.push(customDBData);
        }
        forkJoin(summaryAPIs).subscribe(results => {
          let spots = results[0]['spots'];
          if (results[1]) {
            spots = spots + Number(results[1]);
          }
          fDatas[index]['units'] = spots;
          this.formattedScenarios = [];
          this.dataSource.data = [];
          this.formattedScenarios = fDatas;
          this.dataSource.data = fDatas;
        });
        /* this.inventoryService.getCustomDBSpotsCount(formattedFilters).subscribe(result => {
          console.log('result', result);
        });
        this.inventoryService.getSummary(formattedFilters).subscribe(res => {
          console.log('asdasd', res);
          fDatas[index]['units'] = res['spots'];
          this.formattedScenarios = [];
          this.dataSource.data = [];
          this.formattedScenarios = fDatas;
          this.dataSource.data = fDatas;
        }); */
      }
    });
    this.scenariosCount = this.dataSource.filteredData.length;
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  public onSortting(sortValue: string) {
    if (this.sortingElement === '' || this.sortingElement !== sortValue) {
      this.isSameColumnSort = 1;
    } else if (this.sortingElement === sortValue) {
      ++this.isSameColumnSort;
    }
    if (this.isSameColumnSort < 3) {
      this.sortingElement = sortValue;
    } else {
      this.sortingElement = '';
    }
  }
  public showSearch() {
    this.showSearchField = !this.showSearchField;
    if (!this.showSearchField) {
      this.resetSearch();
    }
  }
  private resetSearch() {
    this.dataSource.data = this.formattedScenarios;
    this.scenariosCount = this.dataSource.filteredData.length;
  }
  highlight(row) {
    if ($('.mat-menu-panel').is(':visible')) {
      this.selectedRow = row._id;
    } else {
      this.selectedRow = '';
    }
  }
  public onOpenScenario(projectId, scenarioId) {
    const list = '/v2/projects/' + projectId + '/scenarios/' + scenarioId;
    this.router.navigate([list]);
  }
  deleteScenario(pid, sid) {
    swal({
      title: `Are you sure you want to delete this ${
        this.labels['scenario'][0]
        }?`,
      text: '',
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: 'NO',
      confirmButtonText: 'YES, DELETE',
      confirmButtonClass: 'waves-effect waves-light',
      cancelButtonClass: 'waves-effect waves-light'
    })
      .then(x => {
        if (typeof x.value !== 'undefined' && x.value) {
          this.lService.display(true);
          this.wsService.deleteScenarios(sid).subscribe(
            response => {
              this.projectStore.deleteScenario(sid, pid);
              const dataChange = this.formattedScenarios.filter(function (
                scenario,
                index,
                self
              ) {
                if (scenario['_id'] !== sid) {
                  return true;
                } else {
                  return false;
                }
              });
              this.dataSource.data = dataChange;
              this.formattedScenarios = dataChange;
              this.scenariosCount = this.dataSource.filteredData.length;

              this.lService.display(false);
              swal(
                'Deleted!',
                `${this.labels['scenario'][0]} set deleted successfully`,
                'success'
              );
            },
            e => {
              let message = '';
              if (
                typeof e.error !== 'undefined' &&
                typeof e.error.message !== 'undefined'
              ) {
                message = 'An error has occurred. Please try again later.';
              }
              swal('Error', message, 'error');
              this.lService.display(false);
            }
          );
        }
      })
      .catch(swal.noop);
  }
  onDuplicateScenario(projectId, scenarioId) {
    const data = {};
    const width = '500px';
    const height = 'auto';
    data['projectId'] = projectId;
    data['scenarioId'] = scenarioId;
    data['scenarioName'] = '';

    const browser = this.dialog
      .open(DuplicateScenariosComponent, {
        height: height,
        data: data,
        width: width,
        closeOnNavigation: true,
        panelClass: 'duplicate-scenario-container'
      })
      .afterClosed()
      .subscribe(response => {
        if (response && response['data'] && response['data']['id']) {
          const list =
            '/v2/projects/' +
            response['data']['id'].project +
            '/scenarios/' +
            response['data']['id'].scenario;
          swal('Success', response.message, 'success').then(result => {
            this.router.navigate([list]);
          });
        }
      });
  }
  public filterScenarios(eventData) {
    if (!eventData || eventData === '') {
      this.resetSearch();
      return;
    }
    const searchTerm = eventData.split(' ');

    this.dataSource.data = this.formattedScenarios.filter(item => {
      let index = 0;
      searchTerm.map(search => {
        if (
          item.name.toLowerCase().indexOf(search) !== -1 ||
          (item.description && item.description.toLowerCase().indexOf(search) !== -1)
        ) {
          index++;
        }
      });
      if (index > 0) {
        return true;
      } else {
        return false;
      }
    });
  }
  // window resize
  reSize() {
    this.scrollContent = window.innerHeight - 380;
  }

  public createProject(source = 'direct', parentId = '', name = '', plan = 'inventory', level = 0) {
    const newProjectDialog: NewProjectDialog = {
      isProject: true,
      namePlaceHolder: `* ${this.labels['project'][0]} Name`,
      descPlaceHolder: `${this.labels['project'][0]} Description (Optional)`,
      dialogTitle: `Create ${this.labels['project'][0]}`,
    };
    if (parentId !== '') {
      newProjectDialog['isProject'] = false;
      newProjectDialog['parentId'] = parentId;
      newProjectDialog['namePlaceHolder'] = `* ${name} Name`;
      newProjectDialog['descPlaceHolder'] = `${name} Description (Optional)`;
      newProjectDialog['dialogTitle'] = `Create ${name}`;
      newProjectDialog['subProjectLabel'] = name;
    }
    this.dialog.open(NewProjectDialogComponent, {
      data: newProjectDialog,
    }).afterClosed()
      .subscribe(data => {
        if (data) {
          if (data && data['type']) {
            this.workspace.getProject(data['response']['data']['id']).subscribe(project => {
              switch (data['type']) {
                case 'saved':
                  this.projectStore.addOrUpdateProject(project, data['parentId']);
                  if (source === 'popup') {
                    this.workspace.setProjectsForScenario(data['response']['data']['id'], level);
                    // this.workspace.setSubprojectLevel(-1);
                    this.createScenario(plan);
                  } else {
                    this.router.navigate(['/v2/projects/', data['response']['data']['id']]);
                  }
                  break;
                default:
                  break;
              }
            });
          }
        }
      });
  }

  public createScenario(plan = 'inventory') {
    const scenarioDialog: ScenarioDialog = {
      namePlaceHolder: `* ${this.labels['scenario'][0]} Name`,
      descPlaceHolder: `${this.labels['scenario'][0]} Description (Optional)`,
      projectPlaceHolder: `Assign to  ${this.labels['project'][0]}`,
      dialogTitle: `Create ${this.labels['scenario'][0]}`,
      buttonLabel: `Create  ${this.labels['scenario'][0]}`,
      projectId: this.projectId
    };
    this.dialog.open(ScenarioDialogComponent, {
      data: scenarioDialog,
    }).afterClosed()
      .subscribe(data => {
        if (data && data['type'] === 'createNewProject') {
          this.createProject('popup', data['parentId'], data['name'], plan, data['level']);
        } else if (data) {
          this.workspace.clearProjectsForScenario();
          this.router.navigate([
            '/v2/projects/' +
            data['parentId'] +
            '/scenarios/' +
            data['response']['data']['id']['scenario'] + '/' + plan
          ]);
        } else {
          this.workspace.clearProjectsForScenario();
        }
        // if (data) {
        //   this.router.navigate([
        //     '/v2/projects/' +
        //     data['parentId'] +
        //     '/scenarios/' +
        //     data['response']['data']['id']['scenario'] + '/' + plan
        //   ]);
        //   this.loaderService.display(false);
        //   // Note: These lines are no needed for breadcrumbs - in future will remove these lines 
        //   // const parentMaps = this.workspace.getProjectParents() || [];
        //   // parentMaps.push({
        //   //   pid: data.value.project_id,
        //   //   pname: '',
        //   //   parentId: data.value.sub_project_id || '',
        //   //   parentName: ''
        //   // });
        //   // this.workspace.setProjectParents(parentMaps);
        // }
      });
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
        this.loaderService.display(true);
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
        sortableColumn.push('Action');
        this.displayedColumns = sortableColumn;
        this.cdr.detectChanges();
        this.loaderService.display(false);
      }
    });
  }

}
