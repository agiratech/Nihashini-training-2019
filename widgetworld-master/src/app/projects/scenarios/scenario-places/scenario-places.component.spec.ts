import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ScenarioPlacesComponent } from './scenario-places.component';

import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthenticationService, PlacesService, PlacesDataService} from '../../../shared/services/index';
import { SavePlaceSetsDialogComponent } from '../../../shared/components/save-place-sets-dialog/save-place-sets-dialog.component';

describe('ScenarioPlacesComponent', () => {
  let component: ScenarioPlacesComponent;
  let fixture: ComponentFixture<ScenarioPlacesComponent>;
  let dialogRef;
  let auth: AuthenticationService;
  let placesService: PlacesService;
  let placesDataService: PlacesDataService;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  let dialogSpy: jasmine.Spy;
  const placeSets = [{
    'name': 'atlanta bread',
    'owner': '5afd1db1e8c630e6d5f05158',
    'pois': [{
      'geometry': {
        'type': 'Point',
        'coordinates' : [
          '74.141423', '40.056283'
        ]
      },
      'properties': {
        'brands': 'Atlanta Bread',
        'city': 'brick',
        'created_datetime': '2019-02-28T00:00:00',
        'latitude': '40.056283',
        'location_name': 'Atlanta Bread',
        'longitude': '-74.141423',
        'naics_code': '722511',
        'parent_safegraph_place_id': 'sg:d3718b7a6df347d6b5ddab6ed1ca264c',
        'phone_number': '17324511400',
        'safegraph_brand_ids': 'SG_BRAND_20cdbe025bb0f8ac8a88299c11cddf6a',
        'safegraph_place_id': 'sg:0008e66788014d60aa848fb6dd0ec8cf',
        'selected': true,
        'state': 'nj',
        'street_address': '1042 cedar bridge avenue',
        'sub_category': 'Full-Service Restaurants',
        'top_category': 'Restaurants and Other Eating Places',
        'zip_code': '8723',
        'open_hours': {}
      },
      'type': 'Feature',
      '_id': '5c88d8141f69bd8597d5b446'
    }]
  }];

  beforeEach(async(() => {
    auth = jasmine.createSpyObj('AuthenticationService', [
      'getModuleAccess'
    ]);

    placesService = jasmine.createSpyObj('PlacesService', [
      'getPlaceSetsSummary'
    ]);

    placesDataService = jasmine.createSpyObj('PlacesDataService', [
      'setPOIPlacesData'
    ]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data'
    ]);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        FormsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSidenavModule,
        FlexLayoutModule,
        MatCheckboxModule
      ],
      declarations: [
        ScenarioPlacesComponent,
        TruncatePipe,
        SavePlaceSetsDialogComponent
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: AuthenticationService, useValue: auth },
        { provide: PlacesService, useValue: placesService },
        { provide: PlacesDataService, useValue: placesDataService }
      ],
      schemas: [NO_ERRORS_SCHEMA]

    }).compileComponents();
  }));
  beforeEach(() => {
    const mod_permission = {
      features: {
        gpInventory: {
          'status': 'active'
        }
      }
    };

    (<jasmine.Spy>auth.getModuleAccess).and.returnValue(mod_permission);
    fixture = TestBed.createComponent(ScenarioPlacesComponent);
    component = fixture.componentInstance;
    component.existingPlaceSetsInScenario = [];
    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
  });

  /* it(`should create 'Scenario Places Component'`, () => {
    expect(component).toBeTruthy();
  });

  it(`should able to get 'Place'`, () => {
    component.enablePlaces = true;
    fixture.detectChanges();
    const inventoryBlock = fixture.nativeElement.querySelector('.inventory-table-block') as HTMLElement;
    expect(inventoryBlock.innerHTML).toBeTruthy();
  });

  it(`should able to show 'Map Inventory & Edit Place Sets button,'`, () => {
    component.enablePlaces = true;
    fixture.detectChanges();

    const mapInventoryButton = fixture.nativeElement.querySelector('.test-inventory-btn') as HTMLLinkElement;

    const editPlaceButton = fixture.nativeElement.querySelector('.test-edit-place-button') as HTMLLinkElement;

    expect(mapInventoryButton.innerHTML).toBeTruthy();
    expect(editPlaceButton.innerHTML).toBeTruthy();
  });

  it(`should able to format the 'Place data'`, () => {
    component.enablePlaces = true;
    fixture.detectChanges();
    component.placeSets = placeSets;
    component.existingPlaceSetsInScenario = placeSets;
    const fdata = component.formattingPlacesData(placeSets);
    component.formattedPlaces = fdata;
    component.dataSource.data = fdata;
    fixture.detectChanges();
    expect(fdata[0]).toEqual({ id: 'sg:0008e66788014d60aa848fb6dd0ec8cf', name: 'Atlanta Bread', details: '1042 CEDAR BRIDGE AVENUE, BRICK NJ 8723', selected: true });
  });

  it(`should able to get the 'save as new place set & save model'`, () => {
    component.enablePlaces = true;
    fixture.detectChanges();
    component.placeSets = placeSets;
    component.existingPlaceSetsInScenario = placeSets;
    const fdata = component.formattingPlacesData(placeSets);
    component.formattedPlaces = fdata;
    component.dataSource.data = fdata;
    fixture.detectChanges();

    const editPlaceButton = fixture.nativeElement.querySelector('.test-edit-place-button') as HTMLLinkElement;
    editPlaceButton.click();
    fixture.detectChanges();
    const savePlaceButton = fixture.nativeElement.querySelector('.test-save-place-set') as HTMLLinkElement;
    expect(savePlaceButton.innerHTML).toBeTruthy();
    this.places = placeSets;
    // const result = component.onOpenPlaseSetModel();
    savePlaceButton.click();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
  });

  it(`should be selected places able to check & unchecked `, () => {
    component.enablePlaces = true;
    fixture.detectChanges();
    component.placeSets = placeSets;
    component.existingPlaceSetsInScenario = placeSets;
    const fdata = component.formattingPlacesData(placeSets);
    component.formattedPlaces = fdata;
    component.dataSource.data = fdata;
    fixture.detectChanges();
    const editPlaceButton = fixture.nativeElement.querySelector('.test-edit-place-button') as HTMLLinkElement;
    editPlaceButton.click();
    fixture.detectChanges();
    const savePlaceButton = fixture.nativeElement.querySelector('.test-save-place-set') as HTMLLinkElement;
    expect(savePlaceButton.innerHTML).toBeTruthy();
    this.places = placeSets;
    fixture.detectChanges();
    const checkBox = fixture.nativeElement.querySelector('.inventory-sidenav-content .mat-table .mat-row:nth-child(2) .mat-cell:first-child .mat-checkbox-input') as HTMLElement;
    checkBox.click();
    fixture.detectChanges();
    expect(component.formattedPlaces[0].selected).toBeFalsy();
    checkBox.click();
    fixture.detectChanges();
    expect(component.formattedPlaces[0].selected).toBeTruthy();
  });

  it(`should cancel the save place set options`, () => {
    component.enablePlaces = true;
    fixture.detectChanges();
    component.placeSets = placeSets;
    component.existingPlaceSetsInScenario = placeSets;
    const fdata = component.formattingPlacesData(placeSets);
    component.formattedPlaces = fdata;
    component.dataSource.data = fdata;
    fixture.detectChanges();
    const editPlaceButton = fixture.nativeElement.querySelector('.test-edit-place-button') as HTMLLinkElement;
    editPlaceButton.click();
    fixture.detectChanges();
    const cancelButton = fixture.nativeElement.querySelector('.test-cancel-btn') as HTMLButtonElement;
    expect(cancelButton.innerHTML).toBeTruthy();
    expect(component.editPlaceSets).toBeTruthy();
    cancelButton.click();
    fixture.detectChanges();
    const cancelButton_1 = fixture.nativeElement.querySelector('.test-cancel-btn') as HTMLButtonElement;
    expect(cancelButton_1).toBeFalsy();
    expect(component.editPlaceSets).toBeFalsy();
  }); */
});
