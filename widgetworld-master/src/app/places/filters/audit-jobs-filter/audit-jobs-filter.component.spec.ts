import { of } from 'rxjs';
import {
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { AuditJobsFilterComponent } from './audit-jobs-filter.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatIconModule,
  MatTreeModule
} from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlacesFiltersService } from '../places-filters.service';
import { By } from '@angular/platform-browser';
import { AuditPlaceNode } from '@interTypes/Place-audit-types';

class AuditPlacesDatabase {}

describe('AuditJobsFilterComponent', () => {
  let component: AuditJobsFilterComponent;
  let fixture: ComponentFixture<AuditJobsFilterComponent>;
  const audiDataBase = AuditPlacesDatabase;
  let placeFilterService: PlacesFiltersService;
  let treeElement: HTMLElement;
  const auditPlaces = {
    audited_places: [
      {
        audit_status_cd: 0,
        clients: [
          {
            client_name: '3CDC',
            client_id: 81,
            count: '2',
            locations: [
              {
                id: 629891,
                place_id: null,
                location_name: 'location test 1'
              },
              {
                id: 629892,
                place_id: null,
                location_name: 'location test 2'
              }
            ]
          }
        ],
        count: '129303',
        status: 'Unaudited'
      },
      {
        status: 'Requested',
        audit_status_cd: 1,
        count: '34042',
        clients: [
          {
            client_id: 81,
            client_name: 'Adcart',
            count: '1',
            locations: [
              {
                id: 629890,
                place_id: '78132',
                location_name: 'location test 3'
              },
              {
                id: 553683,
                place_id: '78115',
                location_name: 'location test 4'
              }
            ]
          },
          {
            client_id: 61,
            client_name: 'Adcart',
            count: '8',
            locations: [
              {
                id: 23592,
                place_id: '67441',
                location_name: 'Tuesday Market'
              },
              {
                id: 23593,
                place_id: '67441',
                location_name: 'Tuesday Market'
              }
            ]
          }
        ]
      }
    ]
  };
  const auditPlaceNode: AuditPlaceNode = {
    count: 0,
    expandable: false,
    id: '629891',
    isLoading: false,
    level: 2,
    name: 'Mani test',
    parent: '81',
    placeId: '0',
    superParent: 'Unaudited',
    isExpand: true,
    children: []
  };
  const placeDeails = {
    place: {
      id: 629891,
      place_id: null,
      client_id: 81,
      location_id: null,
      location_name: 'Mani test',
      street_address: '190 Prospect Place',
      city: 'Alpharetta',
      state: 'GA',
      zip_code: '30005',
      lat: null,
      lng: null,
      dma_market: null,
      dma_rank: null,
      heregeodisplat: null,
      heregeodisplon: null,
      heregeonavlat: null,
      heregeonavlon: null,
      heregeoaddress: null,
      heregeocity: null,
      heregeostate: null,
      heregeozipcode: null,
      heregeomatch: null,
      heregeomatchtype: null,
      heregeomatchrelevance: null,
      heregeomatchquality: null,
      display_geometry: null,
      nav_geometry: null
    }
  };
  function getNodes(treeElement: Element): Element[] {
    return [].slice.call(
      treeElement.querySelectorAll(
        '.mat-tree-node, .mat-nested-tree-node, .level-1'
      )
    )!;
  }
  beforeEach(async(() => {
    placeFilterService = jasmine.createSpyObj('PlacesFiltersService', [
      'getPlaceAudit',
      'loadNextPlace',
      'setLoadNextPlace',
      'reloadAuditPlace',
      'setReloadAuditPlace',
      'getAuditPlaces',
      'getAuditedPlaceByID',
      'getUnAuditedPlaceByID',
      'setClearPlaseSetFilter',
      'loadAuditPlaces',
      'setPlaceAudit'
    ]);

    (<jasmine.Spy>placeFilterService.getPlaceAudit).and.returnValue(of(null));
    (<jasmine.Spy>placeFilterService.getAuditPlaces).and.returnValue(
      of(auditPlaces)
    );
    (<jasmine.Spy>placeFilterService.loadNextPlace).and.returnValue(of(true));
    (<jasmine.Spy>placeFilterService.reloadAuditPlace).and.returnValue(
      of(true)
    );
    (<jasmine.Spy>placeFilterService.getAuditedPlaceByID).and.returnValue(
      of(placeDeails)
    );
    (<jasmine.Spy>placeFilterService.setPlaceAudit).and.returnValue(of(true));

    TestBed.configureTestingModule({
      declarations: [AuditJobsFilterComponent, TruncatePipe],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        OverlayModule,
        MatTreeModule
      ],
      providers: [
        { provide: AuditPlacesDatabase, useValue: audiDataBase },
        { provide: PlacesFiltersService, useValue: placeFilterService }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditJobsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    treeElement = fixture.nativeElement.querySelector('mat-tree');
  });

  it('should create audit list component', () => {
    expect(component).toBeTruthy();
  });

  // it('should able to load the audit list', () => {
  //   expect(component.dataSource.data.length).toBe(
  //     auditPlaces.audited_places.length
  //   );
  //   expect(
  //     fixture.debugElement.queryAll(
  //       By.css('.auditListBlock .mat-tree mat-nested-tree-node')
  //     ).length
  //   ).toEqual(2);
  // });

  it('should able to select the audit place', () => {
    fixture.detectChanges();
    expect(component.treeControl.expansionModel.selected.length).toBe(
      0,
      `Expect no expanded node`
    );
    fixture.nativeElement
      .querySelectorAll(
        '.auditListBlock .mat-tree mat-nested-tree-node .unit-toogle-button'
      )[0]
      .click();
    fixture.detectChanges();
    expect(component.treeControl.expansionModel.selected.length).toBe(
      1,
      `Expect one expanded node`
    );
    const nodes = getNodes(treeElement);
    (nodes[1].querySelector('.unit-toogle-button') as HTMLElement).click();
    expect(component.treeControl.expansionModel.selected.length).toBe(
      2,
      `Expect two expanded node`
    );
    const childNodes = getNodes(treeElement);
  });
  it('should able to select the audit place location', () => {
    const spyService = new PlacesFiltersService(undefined, undefined);
    const spy = spyOn(spyService, 'getAuditedPlaceByID').and.callThrough();
    component.openPlaceDetails(auditPlaceNode);
    const placeData = placeFilterService.getAuditPlaces();
    expect(spy).toBeDefined();
    expect(placeData).toBeTruthy();
  });
  it('should able to reset the audit list', () => {
    spyOn(component, 'refreshAuditPlaces');
    const reset = fixture.nativeElement.querySelectorAll(
      '.auditListBlock .refresh-icon'
    )[0];
    reset.click();
    fixture.detectChanges();
    expect(component.refreshAuditPlaces).toHaveBeenCalled();
  });
});
