import { Component, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {WorkSpaceDataService} from '../../../shared/services/work-space-data.service';
import {takeWhile, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltersService} from '../filters.service';
import swal from 'sweetalert2';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import {WorkSpaceService} from '../../../shared/services/work-space.service';
@Component({
  selector: 'app-explore-inventory-sets',
  templateUrl: './explore-inventory-sets.component.html',
  styleUrls: ['./explore-inventory-sets.component.less']
})
export class ExploreInventorySetsComponent implements OnInit, OnDestroy {
  private unSubscribe = true;
  private routeParams: any = {};
  public packages = [];
  public appliedFilters = {};
  public searchedPackages = [];
  public searchQuery = '';
  public selectedInventoryOptions = [];
  @Output() editInventoryPackage: EventEmitter<boolean> = new EventEmitter();
  @Output() deleteInventoryPackage: EventEmitter<boolean> = new EventEmitter();
  public mod_permission: any;
  public scenario_mod_permission: any;
  public allowInventory = '';
  public allowScenarios = '';
  constructor(
    private workSpaceDataService: WorkSpaceDataService,
    private workSpaceService: WorkSpaceService,
    private route: ActivatedRoute,
    private filtersService: FiltersService,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.scenario_mod_permission = this.auth.getModuleAccess('projects');
    this.allowScenarios = this.scenario_mod_permission['status'];
    this.route.queryParams.subscribe(params => {
      this.routeParams = params;
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
        this.searchedPackages = packages || [];
        this.loadFilterFromSession();
      });
    this.filtersService
      .onReset()
      .subscribe(type => {
        this.selectedInventoryOptions = [];
        this.resetAppliedFilters();
    });
    this.filtersService
      .checkSessionDataPushed()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeWhile(() => this.unSubscribe)
      )
      .subscribe(val => {
        if (val) {
          this.loadFilterFromSession();
        }
      });
  }
  private loadFilterFromSession() {
    const filterSession = this.filtersService.getExploreSession();
    if (filterSession && filterSession['data']) {
      if (filterSession['data']['inventorySet'] &&
        filterSession['data']['inventorySet']['inventoryIds'] && filterSession['data']['inventorySet']['inventoryIds'].length !== 0) {
        const sessionSets  = this.searchedPackages.filter(packageSet => {
          return filterSession['data']['inventorySet']['inventoryIds'].filter( set => {
              return packageSet._id === set;
          }).length !== 0;
        });
        this.selectedInventoryOptions = sessionSets;
      }
    }
  }
  public ngOnDestroy() {
    this.unSubscribe = false;
  }

  public onApply() {
    this.resetAppliedFilters();
        /**
         * One or more package panel can be selected, so we are looping over
         *
         */
        this.selectedInventoryOptions.map(item => {
          /**
           * For each inventory we only need the geopanel ID, so we're
           * using a function to extract the ID as an array and we are
           * spreading it using the ... spread operator. Finally the
           * resulting array this.appliedFilters['data'] will be an array
           * of geopanel IDs from selected inventory sets
           */
          this.appliedFilters['data'].push(...Array.from(item.inventory, inventory => inventory['id']));
        });
        this.appliedFilters['filterType'] = 'inventorySet';
        this.submitFilters();
  }

  public submitFilters() {
    if (this.appliedFilters['data'].length > 0) {
      this.filtersService.setFilter(this.appliedFilters['filterType'],
      {ids: this.appliedFilters['data'], inventoryIds: this.selectedInventoryOptions.map(set => set._id)});
    } else {
      this.onClearInventorySet();
    }
  }

  private resetAppliedFilters() {
    this.searchQuery = '';
    this.searchedPackages = this.packages;
    this.appliedFilters = {
      data: [],
      selected: null,
      filterType: ' ',
    };
  }

  public filterPackages(data) {
    if (data.emptySearch) {
      this.searchedPackages = this.packages;
    } else {
      this.searchedPackages = data.value;
    }
  }

  public onClearInventorySet() {
    this.selectedInventoryOptions = [];
    this.filtersService.clearFilter('inventorySet', true);
    this.resetAppliedFilters();
  }

  public onEditInventorySet(pack) {
    this.filtersService.openPackage('edit', pack, true);
  }

  public onDeleteInventorySet(pack) {
    const name = pack.name;
    const id = pack['_id'];
    swal({
      title: 'Are you sure you want to delete "' + name + '" inventory set?',
      text: '',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, DELETE',
      confirmButtonClass: 'waves-effect waves-light',
      cancelButtonClass: 'waves-effect waves-light'
    }).then((x) => {
      if (typeof x.value !== 'undefined' && x.value) {
        this.workSpaceService
          .deletePackage(id)
          .subscribe(success => {
              this.workSpaceService.getExplorePackages()
                .subscribe(inventory => {
                  this.workSpaceDataService.setPackages(inventory['packages']);
                  this.onClearInventorySet();
                });
            },
            e => {
              let message = '';
              if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
                message = 'An error has occurred. Please try again later.';
              }
              swal('Error', message, 'error');
            });
      }
    }).catch(swal.noop);
  }


  public compare(c1, c2) {
    return c1 && c2 && c1['_id'] === c2['_id'];
  }

}
