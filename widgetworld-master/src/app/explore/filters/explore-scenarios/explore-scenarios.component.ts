import {Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy, Pipe} from '@angular/core';
import {WorkflowLables} from '@interTypes/workspaceV2';
import {CommonService} from '@shared/services';
import {ProjectDataStoreService} from '../../../dataStore/project-data-store.service';
import {NewWorkspaceService} from '../../../projects/new-workspace.service';
import {WorkSpaceDataService} from '../../../shared/services/work-space-data.service';
import {takeWhile, debounceTime, distinctUntilChanged, map, take, last, switchMap, filter} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FormatService} from '../../../shared/services/format.service';
import {LoaderService} from '../../../shared/services/loader.service';
import swal from 'sweetalert2';
import {WorkSpaceService} from '../../../shared/services/work-space.service';
import {ExploreDataService} from '../../../shared/services/explore-data.service';
import {FiltersService} from '../filters.service';
import { ListKeyManager } from '@angular/cdk/a11y';
import {ArrowNavigationComponent} from '../../../shared/components/arrow-navigation/arrow-navigation.component';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { TargetAudienceService } from '@shared/services/target-audience.service';
import {combineLatest, Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-explore-scenarios',
  templateUrl: './explore-scenarios.component.html',
  styleUrls: ['./explore-scenarios.component.less']
})
export class ExploreScenariosComponent implements OnInit, AfterViewInit, OnDestroy {
  private unSubscribe = true;
  private unSubscribeMap: Subscription;
  private routeParams: any = {};
  public packages = [];
  public scenarios: any = [];
  public appliedFilters = {};
  public currentScenario = {};
  public filteredScenarios: any = [];
  public selectedInventoryOptions = [];
  public selectedScenario = {};
  public savedAudiences = [];
  public defaultAudience = [];
  public markets = [];
  public searchQuery = '';
  @ViewChild('scenarioSearch', { static: false}) focusOperator: ElementRef;
  public keyboardEventsManager: ListKeyManager<any>;
  @ViewChildren(ArrowNavigationComponent) listItems: QueryList<ArrowNavigationComponent>;
  public mod_permission: any;
  public mod_project_permission: any;
  public allowInventory = '';
  public allowScenarios = '';
  public workFlowLabels: WorkflowLables;
  constructor(
    private workSpaceDataService: WorkSpaceDataService,
    private route: ActivatedRoute,
    private formatService: FormatService,
    private loaderService: LoaderService,
    private router: Router,
    private workSpaceService: WorkSpaceService,
    private newWorkspaceService: NewWorkspaceService,
    private exploreData: ExploreDataService,
    private filtersService: FiltersService,
    private auth: AuthenticationService,
    private targetAudienceService: TargetAudienceService,
    private commonService: CommonService,
    private projectStore: ProjectDataStoreService) {
    this.workFlowLabels = this.commonService.getWorkFlowLabels();
  }

  public ngOnInit() {
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.mod_project_permission = this.auth.getModuleAccess('projects');
    this.allowScenarios = this.mod_project_permission['status'];
    this.defaultAudience = this.route.snapshot.data.defaultAudience;
    // Commented to use markets list from CSV by Jagadeesh on 03-10-2019
    // this.markets = this.route.snapshot.data['markets'] || [];
    this.markets = this.route.snapshot.data['dummyMarkets'] || [];

    // this.savedAudiences = routeData.audiences['audienceList'];
    this.targetAudienceService
      .getSavedAudiences()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(response => {
        this.savedAudiences = response.audienceList || [];
      });

      this.workSpaceService.getExplorePackages()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(inventory => {
        this.packages = inventory['packages'] && inventory['packages'];
      });
    this.workSpaceService.getProjects()
    .pipe(map(data => data['projects']))
    .subscribe(data => {
      if (data && data.length > 0) {
        data.map(project => {
          if (project.scenarios && project.scenarios) {
            project.scenarios.map(scenario => {
              scenario.projectId = project._id;
              scenario.projectName = project.name;
              scenario.displayName = project.name + ': ' + scenario.name;
              this.scenarios.push(scenario);
            });
          }
        });
        this.scenarios.sort((item1, item2) => this.formatService.sortAlphabetic(item1, item2, 'displayName'));
        this.workSpaceDataService.setScenarios(this.scenarios);
      }
    });
    this.workSpaceDataService
      .getScenarios()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(scenarios => {
        this.scenarios = scenarios;
        this.filteredScenarios = scenarios;
      });
    this.workSpaceDataService
      .getPackages()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeWhile(() => this.unSubscribe)
      )
      .subscribe(packages => {
        this.packages = packages || [];
      });
      combineLatest([
        this.route.queryParams
          .pipe(filter(params => params.scenario )),
        this.exploreData.onMapLoad()
          .pipe(filter(res => res)),
      ]).pipe(switchMap(([params, event]) => {
        return this.projectStore.getScenarioById(params['scenario'])
          .pipe(filter(scenario => scenario),
            map(scenario => scenario.scenario));
      })).pipe(
        debounceTime(1000), // To avoid overriding bubbles count while clicking map inventory on workspace
        takeWhile(() => this.unSubscribe)).subscribe((scenarioData) => {
        this.mapScenario(scenarioData);
      });
      this.filtersService.onReset()
        .pipe(takeWhile(() => this.unSubscribe))
        .subscribe(type => {
        this.selectedInventoryOptions = [];
        this.clearFilter();
    });
    this.filtersService.checkSessionDataPushed()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(val => {
        if (val) {
          this.loadFilterFromSession();
        }
      });
  }
  private loadFilterFromSession() {
    const filters = this.filtersService.getExploreSession();
    if (filters) {
      if (
          typeof filters['data'] !== 'undefined' &&
          typeof filters['data']['scenario'] !== 'undefined' &&
          filters['data']['scenario']['id']
        ) {
        const id = filters['data']['scenario']['id'];
        const scenario = this.scenarios.find(s => (s._id === id));
        this.selectedScenario = scenario;
      }
    }
  }
  public ngOnDestroy() {
    this.unSubscribe = false;
  }

  public onApply() {
    this.resetAppliedFilters();
    /**
     * A scenario can have audience, market, inventory sets and place
     * packs, we're just sending the scenario data here. On base
     * filter and on explore component, the audience, market, place-set
     * and the inventory set will be handled respectively
     */
    if (this.selectedScenario['audience'] && this.selectedScenario['audience']['audience_id']) {
      const audience = this.savedAudiences.filter(a => ( a['_id'] ===  this.selectedScenario['audience']['audience_id'] ));
      if (audience.length > 0) {
        const target = {};
        target['key'] = audience[0]['audiences'][0]['key'];
        target['details'] = {
          currentTargetId: audience[0]['_id'],
          currentTargetKey: audience[0]['audiences'][0]['key'],
          editAudienceId: 0,
          selectedAudienceList: [],
          tabPosition: 0,
          targetAudience: {
            name: audience[0]['title'],
            audience: audience[0]['audiences'][0]['key']
          },
          tabType: 'saved'
        };
        this.filtersService.setFilter('audience', target);
        // this.exploreData.setSelectedTargetID(audience[0]['_id']);
        this.exploreData.setSelectedTarget(audience[0]['audiences'][0]['key']);
        this.exploreData.setSelectedTargetName(audience[0].title);
      }
      //
    }
    if (this.selectedScenario['audience']) {
      if (this.selectedScenario['audience']['market_id']) {
        const market = this.getMarket(this.selectedScenario['audience']['market_id']);
        if (market) {
          this.filtersService.setFilter('market', market );
          this.exploreData.setSelectedMarket(market);
        } else {
          this.filtersService.setFilter('market', ' ' );
        }
      } else {
        this.filtersService.setFilter('market', ' ' );
      }
    }
    this.appliedFilters['selected'] = 'scenarioPanel';
    this.appliedFilters['filterType'] = 'scenario';
    this.getPackagesData().then( responsePackages => {
      this.appliedFilters['data'] = {
        id: this.selectedScenario['_id'],
        displayName: this.getDisplayName(this.selectedScenario),
        ids: this.selectedScenario['inventory'] || []
      };
      this.submitFilters();
    });

  }

  /**
   * Sometimes selected scenario does not containing displayName while loading.
   * To fix this method will help
   */
  private getDisplayName(selectedScenario) {
    if (selectedScenario['displayName']) {
      return selectedScenario['displayName'];
    } else {
      const filteredScenario = this.scenarios.filter(scenario => scenario['_id'] === selectedScenario['_id'])[0];
      if (filteredScenario && filteredScenario['displayName']) {
        return filteredScenario['displayName'];
      }
    }
  }

  async getPackagesData() {
    if (this.selectedScenario['package'] && this.packages.length > 0) {
      await this.selectedPackageInv(this.packages);
      return true;
    } else if (this.selectedScenario['package'] && this.packages.length < 1) {
      await this.workSpaceService.getExplorePackages()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(inventory => {
        this.packages = inventory['packages'] && inventory['packages'] ;
         this.selectedPackageInv(this.packages);
          this.appliedFilters['data'] = {
            id: this.selectedScenario['_id'],
            displayName: this.getDisplayName(this.selectedScenario),
            ids: this.selectedScenario['inventory'] || []
          };
          this.submitFilters();
          return true;
      });
    } else {
      return true;
    }
  }

  selectedPackageInv(inventorySets) {
    // scenario may contain multiple inventory sets
    const packs = inventorySets.filter(packageSet => this.selectedScenario['package'].indexOf(packageSet._id) !== -1);
    if (packs.length > 0) {
      this.selectedInventoryOptions = packs;
      // getting just the geoPanel Ids we need from inventory set
      this.selectedScenario['inventory'] = [];
      this.selectedInventoryOptions.map(item => {
        /**
        * For each inventory we only need the geopanel ID, so we're
        * using a function to extract the ID as an array and we are
        * spreading it using the ... spread operator. Finally the
        * resulting array this.appliedFilters['data'] will be an array
        * of geopanel IDs from selected inventory sets
        */
        if (item) {
          this.selectedScenario['inventory'].push(...Array.from(item.inventory, inventory => inventory['id']));
        }
      });
    }
  }

  private submitFilters() {
    if (this.selectedScenario['_id']) {
      this.filtersService.setFilter(this.appliedFilters['filterType'], this.appliedFilters['data']);
    } else {
      this.clearFilter();
    }
  }

  private resetAppliedFilters() {
      this.appliedFilters = {
        data: [],
        selected: null,
        filterType: '',
      };
  }

  public filterScenarios(data) {
    if (data.emptySearch) {
      this.filteredScenarios = this.scenarios;
    } else {
      this.filteredScenarios = data.value;
    }
  }

  public clearFilter() {
    const filters = this.filtersService.getExploreSession();
    const selected = this.selectedScenario;
    if (
      Object.keys(selected).length > 0 && filters &&
      typeof filters['data'] !== 'undefined' &&
      typeof filters['data']['scenario'] !== 'undefined'
    ) {
       if (filters['data']['audience'] &&
        filters['data']['audience']['details'] && filters['data']['audience']['details']['currentTargetId']) {
         if (filters['data']['audience']['details']['currentTargetId'] === selected['audience']['audience_id']) {
           this.filtersService.clearFilter('audience');
           this.exploreData.setSelectedTarget(this.defaultAudience['audienceKey']);
           this.exploreData.setSelectedTargetName(this.defaultAudience['description']);
         }
       }
       if (filters['data']['market']) {
         if (filters['data']['market']['id'] === selected['audience']['market_id']) {
           this.filtersService.clearFilter('market');
           this.exploreData.setSelectedMarket({});
         }
       }
    }
    this.currentScenario = {};
    this.selectedScenario = {};
    this.filtersService.clearFilter('scenario', true);
    this.searchQuery = '';
    this.filteredScenarios = this.scenarios;
    this.resetAppliedFilters();
  }

  public editScenario(scenario) {
    this.router.navigate([
      '/v2/projects/' +
      scenario.projectId +
      '/scenarios/' + scenario._id
    ]);
  }

  public deleteScenario(scenario) {
    swal({
      title: `'Are you sure you want to delete the ${this.workFlowLabels.scenario[0]} "${scenario.name}"?`,
      text: '',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, DELETE',
      confirmButtonClass: 'waves-effect waves-light',
      cancelButtonClass: 'waves-effect waves-light'
    }).then((x) => {
      if (typeof x.value !== 'undefined' && x.value) {
        this.loaderService.display(true);
        this.workSpaceService
          .deleteScenarios(scenario._id)
          .subscribe(success => {
            this.projectStore.deleteScenario(scenario._id, scenario.projectId);
              const updated = this.scenarios.filter(item => {
                return item._id !== scenario._id;
              });
              this.scenarios = updated;
              this.filteredScenarios = updated;
              this.loaderService.display(false);
              this.clearFilter();
            },
            e => {
              swal('Error', 'An error has occurred. Please try again later.', 'error');
              this.loaderService.display(false);
            });
      }
    }).catch(swal.noop);
  }

  private mapScenario(scenario): void {
    this.currentScenario = scenario;
    this.selectedScenario = scenario;
    this.filtersService.isSessionFilter = false;
    this.onApply();
  }
  public onRadioBtnChange(scenario) {
    this.selectedScenario = scenario;
  }
  public setSelectedScenario(selected) {
    if (typeof selected['_id'] !== 'undefined') {
      this.selectedScenario = selected;
    } else {
      this.selectedScenario = this.currentScenario;
    }
  }
  public ngAfterViewInit() {
    if (this.listItems['_results']) {
      this.keyboardEventsManager = new ListKeyManager<any>(this.listItems).withWrap().withTypeAhead();
    }
  }
  getMarket(id) {
    const market = this.markets.find(m => m.id === id);
    return market;
  }
}
