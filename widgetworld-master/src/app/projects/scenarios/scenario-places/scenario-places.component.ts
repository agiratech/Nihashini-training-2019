import { Component, OnInit, ViewChild, Output, EventEmitter, Input, Inject, OnChanges } from '@angular/core';
import { LabelOptions } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SavePlaceSetsDialogComponent } from '../../../shared/components/save-place-sets-dialog/save-place-sets-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService, PlacesService, PlacesDataService, LoaderService } from '../../../shared/services/index';
// import { map } from 'd3';
import { map } from 'rxjs/operators';
import swal from 'sweetalert2';
import { WorkflowLables } from '../../../Interfaces/workspaceV2';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { CustomizeColumnComponent } from '@shared/components/customize-column/customize-column.component';

@Component({
  selector: 'app-scenario-places',
  templateUrl: './scenario-places.component.html',
  styleUrls: ['./scenario-places.component.less']
})
export class ScenarioPlacesComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['Place Name', 'Industry Type', 'Address', 'City', 'State', 'Zip'];
  dataSource = new MatTableDataSource([]);
  @Input() existingPlaceSetsInScenario: any = [];
  @Input() mapQueryParams: any = [];
  @Output() updatePlaceSets: EventEmitter<any> = new EventEmitter();
  @Output() getPlacesDetails: EventEmitter<any> = new EventEmitter();

  public placeSets: any = [];
  public places: any = [];
  public formattedPlaces: any = [];
  showFilter = false;
  sortingElement = 'PlaceName';
  public selectedCount = 0;
  public selectAllPlacesCheckbox = false;
  public editPlaceSets = false;
  public enablePlaces = true;
  public allowInventory: string;
  private sort: MatSort;
  public labels: WorkflowLables;
  public sortable = [];
  public duplicateDisplayedColumns: any;
  @ViewChild(MatSort, {static: false}) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  constructor(
    public dialog: MatDialog,
    private auth: AuthenticationService,
    private placesService: PlacesService,
    private placesDataService: PlacesDataService,
    private workspaceService: NewWorkspaceService,
    public loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.labels = this.workspaceService.getLabels();
    this.duplicateDisplayedColumns = [...this.displayedColumns];
    if (this.existingPlaceSetsInScenario.length > 0) {
      const params = { 'ids': this.existingPlaceSetsInScenario.map(p => p['_id']) };
      this.placesService.getPlaceSetsSummary(params, false)
        .pipe(map(data => data['data']))
        .subscribe(data => {
          this.initializeData(data);
        });
    }
    // this.initializeData(this.existingPlaceSetsInScenario);
    const permissions = this.auth.getModuleAccess('explore');
    this.allowInventory = permissions['features']['gpInventory']['status'];
  }

  private setDataSourceAttributes() {
    this.dataSource.sort = this.sort;
  }
  private initializeData(places) {
    this.placeSets = places;
    const fDatas = this.formattingPlacesData(places);
    this.formattedPlaces = fDatas;
    this.dataSource.data = fDatas;

    // csv export data
    const placename = this.placeSets.map(place => place.name);
    const csvData = {
      placeSets: placename,
      places: fDatas
    };
    this.getPlacesDetails.emit(csvData);
    this.selectAllPlacesCheckbox = true;
    this.updatePlaceSetIds();
    if (this.dataSource.data.length <= 0) {
      this.resetAll();
    }
  }

  public onClose(flag) {
    this.showFilter = flag;
  }

  private updatePlaceSetIds() {
    this.updatePlaceSets.emit(this.placeSets.map((data) => data._id));
  }

  public onSortting(sortElment) {
    this.sortingElement = sortElment;
  }

  public selectCheckboxToggle(place) {
    const index = this.formattedPlaces.map((option) => option.id).indexOf(place.id);
    const placeIndex = this.places.map(placeObj => placeObj.properties.safegraph_place_id).indexOf(place.id);
    if (index > -1 && placeIndex > -1) {
      if (this.formattedPlaces[index].selected) {
        this.formattedPlaces[index].selected = false;
        this.places[placeIndex].properties.selected = false;
      } else {
        this.formattedPlaces[index].selected = true;
        this.places[placeIndex].properties.selected = true;
      }
    }
    this.checkAllSelected();
  }

  public selectAllCheckbox() {
    this.selectAllPlacesCheckbox = !this.selectAllPlacesCheckbox;
    if (this.selectAllPlacesCheckbox) {
      this.selectList('All');
    } else {
      this.selectList('None');
    }
  }
  private selectList(type) {
    switch (type) {
      case 'All':
        this.setPlaces(true);
        this.selectAllPlacesCheckbox = true;
        break;
      case 'None':
        this.setPlaces(false);
        this.selectAllPlacesCheckbox = false;
        break;
      default:
        this.setPlaces(false);
        this.selectAllPlacesCheckbox = false;
        break;
    }
  }

  private setPlaces(value) {
    this.formattedPlaces.map((place) => {
      place.selected = value;
    });
    this.places.map((place) => {
      place.properties.selected = value;
    });
    this.selectAllPlacesCheckbox = value;
    this.selectedCount = value ? this.formattedPlaces.length : 0;
  }
  private checkAllSelected() {
    const selected = this.formattedPlaces.filter(item => item.selected);
    this.selectedCount = selected.length;
    if (selected.length < this.formattedPlaces.length) {
      this.selectAllPlacesCheckbox = false;
    } else {
      this.selectAllPlacesCheckbox = true;
    }
  }
  public formattingPlacesData(data) {
    const formattedData = [];
    let address, city, state, postcode = '';
    if (data.length > 0) {
      let places = [];
      this.enablePlaces = true;
      places = [].concat.apply([], this.placeSets.map(set => set.pois));
      if (places.length > 0) {
        this.places = places.filter((placeObj, index, self) => {
          return self.map(Obj => Obj.properties.safegraph_place_id).indexOf(placeObj.properties.safegraph_place_id) === index;
        });
        this.places.map(placeObj => {
          const fData = {
            'id': '',
            'name': '',
            'details': '',
            'selected': true,
          };
          fData['selected'] = true;
          if (placeObj['properties'] !== undefined) {
            fData['name'] = placeObj['properties']['location_name'];
            placeObj['properties']['selected'] = true;
            if (placeObj['properties']['street_address'] !== undefined) {
              address = placeObj['properties']['street_address'];
            }
            if (placeObj['properties']['city'] !== undefined) {
              city = placeObj['properties']['city'];
            }
            if (placeObj['properties']['zip_code'] !== undefined) {
              postcode = placeObj['properties']['zip_code'];
            }
            if (placeObj['properties']['state'] !== undefined) {
              state = placeObj['properties']['state'];
            }
            if (placeObj['properties']['safegraph_place_id'] !== undefined) {
              fData['id'] = placeObj['properties']['safegraph_place_id'];
            }

            fData['details'] = (address + ', ' + city + ' ' + state).toUpperCase() + ' ' + postcode;
            fData['address'] = address;
            fData['city'] = city;
            fData['state'] = state;
            fData['zipCode'] = postcode;
            fData['industryType'] = placeObj['properties']['top_category'];
          }
          formattedData.push(fData);
        });

        this.selectedCount = formattedData.length;
        return formattedData;
      } else {
        return formattedData;
      }
    } else {
      return formattedData;
    }
  }
  public onOpenPlaseSetModel() {
    const selectedPlaces = this.getSelectedPlaces();
    if (selectedPlaces.length === 0) {
      swal('Warning', 'Please select atleast one place', 'warning');
      return true;
    }
    this.placesDataService.setPOIPlacesData(this.getSelectedPlaces());
    const data = {
      title: 'Save as New Place Set',
      buttonText: 'Create Place Set',
      isSavePlaceSet: false,
      // selectedPlaces: this.getSelectedPlaces(),
      type: 'single'
    };
    this.dialog.open(SavePlaceSetsDialogComponent, {
      data: data
    }).afterClosed().subscribe(result => {
      if (result && result.placeSetId) {
        const ids = [];
        ids.push(result.placeSetId);
        this.updatePlaceSets.emit(ids);
        const params = { 'ids': ids };
        this.placesService.getPlaceSetsSummary(params, false)
          .pipe(map(response => response['data']))
          .subscribe(response => {
            // const placeSets = result.allPlaceSets.filter((placeSet => placeSet['_id'] === result.placeSetId));
            this.initializeData(response);
            this.resetAll();
          });
      }
    });
  }

  private getSelectedPlaces() {
    const places = this.places.filter(placeObj => placeObj.properties.selected);
    const selectedPLaces = [];
    places.map(p => {
      selectedPLaces.push({ 'id': p['properties']['safegraph_place_id'], 'selected': true });
    });
    return selectedPLaces;
  }
  public resetAll() {
    this.selectList('All');
    this.editPlaceSets = false;
    const index = $.inArray('selected', this.displayedColumns);
    if (index >= 0) {
      this.displayedColumns.splice(index, 1);
    }
  }
  public editPlaceSet() {
    if (this.dataSource.data.length > 0) {
      this.editPlaceSets = true;
      this.displayedColumns.unshift('selected');
    }
  }
  public addPlaceSet() {
    this.enablePlaces = true;
  }

  ngOnChanges() {
    if (this.existingPlaceSetsInScenario.length > 0) {
      const params = { 'ids': this.existingPlaceSetsInScenario.map(p => p['_id']) };
      this.placesService.getPlaceSetsSummary(params, false)
        .pipe(map(data => data['data']))
        .subscribe(data => {
          this.initializeData(data);
        });
    }
    // this.initializeData(this.existingPlaceSetsInScenario);
  }

  public selectedFilters(filtersInfo) {
    /**
     * filterInfo contains two values
     * filterType will be either Inventory/Place
     * selectedFilters will contain selected filters data
    */
    // if (this.existingPlaceSetsInScenario.length > 0 && filtersInfo.selectedFilters.length === 0) {
    //   this.initializeData(this.existingPlaceSetsInScenario);
    // } else {
    if (filtersInfo.selectedFilters.length > 0) {
      const params = { 'ids': filtersInfo.selectedFilters };
      this.placesService.getPlaceSetsSummary(params, false)
        .pipe(map(data => data['data']))
        .subscribe(data => {
          this.initializeData(data);
        });
    } else {
      this.initializeData([]);
    }
    // }
  }

  public customizeColumn() {
    const currentSortables = this.displayedColumns.map((name) => {
      const obj = { 'displayname': name, 'field_name': name };
      return obj;
    });
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
        this.displayedColumns = sortableColumn;
      }
    });
  }

}
