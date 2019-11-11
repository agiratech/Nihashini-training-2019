import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { of, pipe } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PlacesFiltersService } from '../places-filters.service';
import { PlacesDataService } from '@shared/services/places-data.service';
import { PlacesSetComponent } from './places-set.component';
import { SearchDirective } from '../../../shared/directives/search.directive';
import { ExploreDataService } from '../../../shared/services/explore-data.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';

describe('PlacesSetComponent', () => {
  let component: PlacesSetComponent;
  let fixture: ComponentFixture<PlacesSetComponent>;
  let placeFilterService: PlacesFiltersService;
  let placesDataService: PlacesDataService;
  let exploreDataService: ExploreDataService;

  beforeEach(async(() => {
    placeFilterService = jasmine.createSpyObj('PlacesFiltersService', [
      'getPlacesSet',
      'deletePlaceSet',
      'getClearPlaseSetFilter'
    ]);
    placesDataService = jasmine.createSpyObj('PlacesDataService', [
      'getExistingPlaceSet',
      'setExistingPlaceSet'
    ]);
    exploreDataService = jasmine.createSpyObj('ExploreDataService', [
      'getSelectedMarket',
      'getHighlightedPosition'
    ]);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule
      ],
      declarations: [ PlacesSetComponent,
        SearchDirective , TruncatePipe],
      providers: [
        { provide: PlacesFiltersService, useValue: placeFilterService },
        { provide: PlacesDataService, useValue: placesDataService },
        { provide: ExploreDataService, useValue: exploreDataService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacesSetComponent);
    component = fixture.componentInstance;
    const placeSet = [
      {
        name: 'atlanta place set',
        owner: '5afd1db1e8c630e6d5f05158',
        pois: ['sg:111964a5c4134ae1908e73f78b64d2f6', 'sg:5354b9b0e9154e75bafc2c52616c8a46'],
        _id: '5c937b874df9d80012b716c8'
      }
    ];

    const places = {
      data: [
        {
          name: 'atlanta place set',
          owner: '5afd1db1e8c630e6d5f05158',
          pois: ['sg:111964a5c4134ae1908e73f78b64d2f6', 'sg:5354b9b0e9154e75bafc2c52616c8a46'],
          _id: '5c937b874df9d80012b716c8'
        }
      ]
    };
    component.placeSets = placeSet;
    component.searchedPlaceSets = placeSet;
    (<jasmine.Spy>placesDataService.getExistingPlaceSet).and.returnValue(of(placeSet));
    (<jasmine.Spy>placeFilterService.getPlacesSet).and.returnValue(of(places));
    (<jasmine.Spy>placeFilterService.getClearPlaseSetFilter).and.returnValue(of({}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('search place sets', () => {
    const searchKeywordValue = fixture.nativeElement.querySelector('.e2e-my-place-search') as HTMLInputElement;
    searchKeywordValue.click();
    component.searchQuery = 'atlanta';
    fixture.detectChanges();
  });

  it(`should be able to select place sets`, () => {
    spyOn(component, 'onSelectPlaceSets');
    const placeSetList = fixture.debugElement.queryAll(By.css('.mat-radio-button'));
    placeSetList[0].triggerEventHandler('change', { target: placeSetList[0].nativeElement });
    expect(component.onSelectPlaceSets).toHaveBeenCalled();
    fixture.detectChanges();
  });

  it(`should be able to delete place sets`, () => {
    spyOn(component, 'onDeletePlaceSet');
    const placeSetList = fixture.debugElement.queryAll(By.css('.delete-place-set'));
    placeSetList[0].nativeNode.click();
    expect(component.onDeletePlaceSet).toHaveBeenCalled();
    fixture.detectChanges();
  });
});
