import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {
  WorkSpaceService,
  PlacesDataService,
  LoaderService
} from '../../../shared/services/index';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-scenario-filters',
  templateUrl: './scenario-filters.component.html',
  styleUrls: ['./scenario-filters.component.less']
})
export class ScenarioFiltersComponent implements OnInit, OnChanges {
  /**
   * filterType must be
   * 'Place' to load place sets
   * 'Inventory' to load Inventory sets
  */
  @Input() filterType: string;
  @Input() selectedInventorySets: any;
  @Output() selectedFilters: EventEmitter<any> = new EventEmitter();
  @Input() selectedPlacePacks: any = [];
  /**
   * selectedPlacePacksInScenario is backup of selectedPlacePacks on intitalize
  */
  public selectedPlacePacksInScenario: any = [];
  public geoPanelIds: any = [];
  public plantUnitIds: any = [];
  public appliedFilters: any = {};
  public selectedInventoryOptions: any = [];
  public selectedScenarioInventorySets: any = [];
  public placePacks: any = [];
  public packages: any = [];
  public searchedPlaces: any = [];
  public searchedPackages: any = [];
  public projects: any = [];
  inventorySearch = '';
  placeSearch = '';
  constructor(
    private route: ActivatedRoute,
    private workSpaceService: WorkSpaceService,
    private placeDataService: PlacesDataService,
    private loader: LoaderService
    ) { }

  ngOnInit() {
    const routeData = this.route.snapshot.data;
    if (this.filterType === 'Inventory') {
      if (routeData.projects['projects']) {
        this.projects = routeData.projects.projects;
      }
    } else {
      this.selectedPlacePacksInScenario = this.selectedPlacePacks;
      if (routeData.places && routeData.places['data']) {
        this.placeDataService.setExistingPlaceSet(routeData.places.data);
        this.placeDataService.getExistingPlaceSet().subscribe(placeSets => {
          this.placePacks = placeSets;
          this.searchedPlaces = placeSets;
        });
      }
    }
  }
   ngOnChanges(changes: SimpleChanges) {
    const tempSets = [];
    if (changes.selectedInventorySets) {
      this.workSpaceService.getExplorePackages().subscribe(response => {
        let packs = [];
        if (typeof response['packages'] !== 'undefined' && response['packages'].length > 0) {
           packs = response['packages'];
        }
        this.packages = packs;
        this.searchedPackages = packs;
        this.addInventorySetsToProject();
        const packages = changes.selectedInventorySets.currentValue;
        if (packages.length > 0) {
          packages.map(pack => {
            const tempSet = this.findPackage(pack);
            if (tempSet) {
              tempSets.push(tempSet);
            }
          });
          this.selectedInventoryOptions = tempSets;
          if (this.selectedInventoryOptions.length > 0) {
            this.onApply('packagePanel', true);
          }
          this.selectedInventoryOptions = tempSets;
        }
      });
    }
  }
  public addInventorySetsToProject() {
    if (this.packages.length > 0) {
      this.projects.map(project => {
        if (project.scenarios.length > 0) {
          project.scenarios.map(scnearioObject => {
            scnearioObject.packageSets = [];
            if (scnearioObject.package.length > 0) {
              scnearioObject.package.map(packageId => {
                const packageSet = this.findPackage(packageId);
                if (packageSet) {
                  scnearioObject.packageSets.push(packageSet);
                }
              });
            }
          });
        }
      });
    }
  }
  public findPackage(packageId) {
    return this.packages.find(packageSet => packageSet['_id'] === packageId);
  }
  public onClearInventorySet() {
    this.selectedInventoryOptions = [];
    this.inventorySearch = '';
    this.clearFilter('packagePanel');
  }

  public onClearPlaceSet() {
    // selectedPlacePacksIns
    // this.selectedPlacePacks = this.selectedPlacePacksInScenario;
    this.selectedPlacePacks = [];
    this.placeSearch = '';
    this.submitFilters();
  }
  public clearGeoFilter() {
    this.geoPanelIds = [];
    this.clearFilter('geopathPanel');
  }

  public clearPlantFilter() {
    this.plantUnitIds = [];
    this.clearFilter('operatorPanel');
  }
  private clearFilter(type: string): void {
    if (this.appliedFilters['selected'] === type) {
      this.resetAppliedFilters();
      this.submitFilters();
    }
  }

  public submitFilters(initial= false) {
    let filters = {};
    if (this.filterType === 'Inventory') {
      filters = this.appliedFilters;
    } else {
      filters = this.selectedPlacePacks.map(pac => pac['_id']);
    }
    this.selectedFilters.emit({selectedFilters: filters, filterType: this.filterType, initial: initial});
  }

  private resetAppliedFilters() {
    this.appliedFilters = {
      data: [],
      selected: null,
    };
  }

  public onApply(type: string, initial= false): void {
    this.loader.display(true);
    this.resetAppliedFilters();
    switch (type) {
      case 'packagePanel':
        this.getGeoIdsFromSets(this.selectedInventoryOptions);
        this.appliedFilters['selected'] = 'packagePanel';
        this.appliedFilters['additionalData'] = this.selectedInventoryOptions;
        break;
      case 'geopathPanel':
        this.appliedFilters['selected'] = 'geopathPanel';
        this.appliedFilters['data'] = this.geoPanelIds;
        break;
      case 'scenarioPanel':
      this.getGeoIdsFromSets(this.selectedScenarioInventorySets);
        this.appliedFilters['selected'] = 'scenarioPanel';
        this.appliedFilters['additionalData'] = this.selectedScenarioInventorySets;
        break;
      default:
        this.appliedFilters['selected'] = 'operatorPanel';
        this.appliedFilters['data'] = this.plantUnitIds;
        break;
    }
    this.loader.display(false);
    this.submitFilters(initial);
  }

  private getGeoIdsFromSets(inventorySets) {
    /**
     * One or more package panel can be selected, so we are looping over
     *
     */
    inventorySets.map(item => {
      /**
       * For each inventory we only need the geopanel ID, so we're
       * using a function to extract the ID as an array and we are
       * spreading it using the ... spread operator. Finally the
       * resulting array this.appliedFilters['data'] will be an array
       * of geopanel IDs from selected inventory sets
       */
      if (item) {
        this.appliedFilters['data'].push(...Array.from(item.inventory, inventory => inventory['id']));
      }
    });

  }
  public filterPackages(data) {
    if (data.emptySearch) {
      return this.searchedPackages = this.packages;
    }
    return this.searchedPackages = data.value;
  }
  public filterPlacePacks(data) {
    if (data.emptySearch) {
      return this.searchedPlaces = this.placePacks;
    }
    return this.searchedPlaces = data.value;
  }

  public scrollTo(event) {
    $('.inventory-panel').animate({
        scrollTop: ($(event.target).position().top - 60)
      }, 200);
  }

  public compare(c1, c2) {
    return c1 && c2 && c1['_id'] === c2['_id'];
  }
  public checkIsSelected(option) {
    const matches = this.selectedInventoryOptions.filter(v => v._id === option._id);
    return matches.length > 0;
  }
  public onSelectInventorySet(list) {
    this.selectedInventoryOptions = list.selectedOptions.selected.map(item => item.value);
  }
}
