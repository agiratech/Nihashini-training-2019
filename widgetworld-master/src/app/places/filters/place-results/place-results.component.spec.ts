import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { ConvertPipe } from '@shared/pipes/convert.pipe';
import { PlaceResultsComponent } from './place-results.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Input, NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlacesFiltersService } from '../places-filters.service';
import { PlacesDataService } from '@shared/services/places-data.service';
import { AppConfig } from '../../../app-config.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SavePlaceSetsDialogComponent } from '@shared/components/save-place-sets-dialog/save-place-sets-dialog.component';



describe('PlaceResultsComponent', () => {
  let component: PlaceResultsComponent;
  let fixture: ComponentFixture<PlaceResultsComponent>;
  let placeFilterService: PlacesFiltersService;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  let dialogSpy: jasmine.Spy;
  let dialogRef;

  const sortables = [
    {field_name: 'Place Name', key: 'place_name'}
  ];

  const summary = {
    avg_weekly_traffic: 0,
    avg_weekly_unique_visits: 0,
    number_of_places: 2427
  };

  const routes = {
    'placeResultsGrid': 'placeResultsGrid',
    'placeResultsList': 'placeResultsList',
    'placeDetailsGrid': 'placeDetailsGrid',
    'placeDetailsList': 'placeDetailsList',
  };

  const reqParams = {
    page: 0,
    placeNameList: ['Atlanta Bread Company'],
    size: 100,
    place: 'Atlanta'
  };
  const res = [{
      location_name: 'Atlanta Bread Company',
      longitude: '-84.544345',
      naics_code: '',
      parent_safegraph_place_id: 'sg:67c8996a0235454c92dfc0a61c1eb641',
      phone_number: '',
      safegraph_brand_ids: '',
      safegraph_place_id: 'sg:5432212100a342a1abbc52d0601b6f5a',
      selected: true,
      state: 'ga',
      street_address: '120 142 woodstock square avenue',
      sub_category: '',
      top_category: '',
      zip_code: '30189'
    }];

    const TEST_DIRECTIVES = [
      SavePlaceSetsDialogComponent
    ];

  beforeEach(async(() => {
    placeFilterService = jasmine.createSpyObj('PlacesFiltersService', [
      'setFilterLevel',
      'savePlacesSession',
      'getPlacesSession',
      'getPlaceDetails',
      'getPlaces'
    ]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data'
    ]);
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        RouterTestingModule,
        MatMenuModule,
        HttpClientModule,
        HttpClientTestingModule,
        MatDialogModule,
        BrowserAnimationsModule

      ],

      declarations: [
        PlaceResultsComponent,
        TruncatePipe,
        ConvertPipe,
        SavePlaceSetsDialogComponent
       ],
       providers: [
        { provide: PlacesFiltersService, useValue: placeFilterService },
        { provide: MatDialogRef, useValue: dialogRef },
        PlacesDataService,
        AppConfig
       ],
       schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceResultsComponent);
    component = fixture.componentInstance;
    component.sortables = sortables;
    component.summary = summary;
    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    const filterData = {
      'mapPosition': {
        'type': 'MultiPolygon',
        'coordinates': [
          [
            [
              [
                -23.126167724655488,
                56.60829704983004
              ]
            ]
          ]
        ]
      },
      'filterLevelState': [
        {
          'filterLevel': 1,
          'searchHide': false,
          'placeResultExpand': false
        },
        {
          'filterLevel': 1,
          'searchHide': false,
          'placeResultExpand': false
        }
      ],
      'filters': {
        'place': 'atlanta',
        'summaryId': '5ca60d1fb4142400190f45c2'
      },
      'placeDetail': {
        'placeName': 'Atlanta Bread Company',
        'route': 'placeDetailsList'
      }
    };
    const placeDetailData = {
      "sortKey": [
        {
          "field_name": "Place Name",
          "key": "location_name"
        }
      ],
      "orderBy": [
        {
          "key": "Asc",
          "value": 1
        },
        {
          "key": "Desc",
          "value": -1
        }
      ],
      "places": [
        {
          "geometry": {
            "coordinates": [
              [
                [
                  -84.54437403502794,
                  34.08441342956178
                ]
              ]
            ],
            "type": "Polygon"
          },
          "properties": {
            "safegraph_place_id": "sg:5432212100a342a1abbc52d0601b6f5a",
            "parent_safegraph_place_id": "sg:67c8996a0235454c92dfc0a61c1eb641",
            "safegraph_brand_ids": "",
            "location_name": "Atlanta Bread Company",
            "brands": "",
            "top_category": "",
            "sub_category": "",
            "naics_code": "",
            "latitude": "34.084278",
            "longitude": "-84.544345",
            "street_address": "120 142 woodstock square avenue",
            "city": "woodstock",
            "state": "ga",
            "zip_code": "30189",
            "phone_number": "",
            "created_datetime": "2019-02-28T00:00:00",
            "selected": true
          },
          "_id": "5c88d8321f69bd8597d7a713",
          "type": "Feature"
        }
      ],
      "ids": [
        "sg:5432212100a342a1abbc52d0601b6f5a"
      ],
      "summary": {
        "number_of_places": 17,
        "avg_weekly_traffic": 0,
        "avg_weekly_unique_visits": 0
      }
    };

    const sort = {
      'sort_by': 'count',
      'order_by': 1
    };
    const getPlacesData = {
      "summaryId": "5ca6ffa0b4142400190f45da",
      "summary": {
        "number_of_places": 2427,
        "avg_weekly_traffic": 0,
        "avg_weekly_unique_visits": 0
      },
      "places": [
        {
          "count": 1,
          "industry": "Tax Preparation Services",
          "place_type": "Accounting, Tax Preparation, Bookkeeping, and Payroll Services",
          "place_name": "The Atlanta IRS Tax Group",
          "selected": true
        }
      ],
      "sortKey": [
        {
          "field_name": "Place Name",
          "key": "place_name"
        },
        {
          "field_name": "Place Type",
          "key": "place_type"
        },
        {
          "field_name": "Industry",
          "key": "industry"
        },
        {
          "field_name": "Number of Places",
          "key": "count"
        }
      ],
      "orderBy": [
        {
          "key": "Asc",
          "value": 1
        },
        {
          "key": "Desc",
          "value": -1
        }
      ],
      "filters": {
        "place_types": [
          {
            "sub_categories": [
              {
                "name": "Commercial Screen Printing",
                "count": 3
              }
            ],
            "top_category": "Printing and Related Support Activities"
          },
          {
            "sub_categories": [
              {
                "name": "Industrial Machinery and Equipment Merchant Wholesalers",
                "count": 1
              }
            ],
            "top_category": "Machinery, Equipment, and Supplies Merchant Wholesalers"
          },
          {
            "sub_categories": [
              {
                "name": "Direct Mail Advertising",
                "count": 1
              }
            ],
            "top_category": "Advertising, Public Relations, and Related Services"
          },
          {
            "sub_categories": [
              {
                "name": "Amusement and Theme Parks",
                "count": 4
              }
            ],
            "top_category": "Amusement Parks and Arcades"
          }
        ],
        "brands": [
          {
            "count": 62,
            "name": "Atlanta City School District"
          },
          {
            "count": 32,
            "name": "Atlanta City Government"
          },
          {
            "count": 29,
            "name": "Atlanta Bread"
          }
        ],
        "states": {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -75.637036,
                  38.670383
                ]
              },
              "properties": {
                "code": "DE",
                "count": 1
              }
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -89.553678,
                  31.867971
                ]
              },
              "properties": {
                "code": "MS",
                "count": 1
              }
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -92.47535533333333,
                  39.847745333333336
                ]
              },
              "properties": {
                "code": "MO",
                "count": 3
              }
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  -76.391391,
                  36.820608
                ]
              },
              "properties": {
                "code": "VA",
                "count": 1
              }
            }
          ]
        },
        "ids": [
          "sg:111964a5c4134ae1908e73f78b64d2f6",
          "sg:5354b9b0e9154e75bafc2c52616c8a46",
          "sg:6c5f463f9a7843b681b2b1019f817c3d",
          "sg:1f6dfcdd78474174aeb52d8bc07767a2",
          "sg:e7a3e74827c14f339653bfd9c55c27e0"
        ],
        "industries": [
          {
            "count": 10,
            "name": "Administration of Human Resource Programs (except Education, Public Health, and Veterans' Affairs Programs)",
            "code": "923130"
          },
          {
            "count": 1,
            "name": "All Other Amusement and Recreation Industries",
            "code": "713990"
          },
          {
            "count": 3,
            "name": "Women's Handbag and Purse Manufacturing",
            "code": "316992"
          }
        ],
        "popular_attributes": [],
        "markets": []
      }
    };
    const placesData = {
      "summaryId": "5ca71dca8cb1c7001931066c",
      "summary": {
        "number_of_places": 2427,
        "avg_weekly_traffic": 0,
        "avg_weekly_unique_visits": 0
      },
      "places": [
        {
          "count": 62,
          "industry": "Elementary and Secondary Schools",
          "place_type": "Elementary and Secondary Schools",
          "place_name": "Atlanta City School District",
          "selected": true
        }
      ],
      "sortKey": [
        {
          "field_name": "Place Name",
          "key": "place_name"
        },
        {
          "field_name": "Place Type",
          "key": "place_type"
        },
        {
          "field_name": "Industry",
          "key": "industry"
        },
        {
          "field_name": "Number of Places",
          "key": "count"
        }
      ],
      "orderBy": [
        {
          "key": "Asc",
          "value": 1
        },
        {
          "key": "Desc",
          "value": -1
        }
      ],
      "filters": {}
    };
    component.currentSort = sort;
    component.filterData = filterData;
    component.reqParams.place = 'Atlanta';
    component.routes.placeDetailsList = routes.placeDetailsList;
    (<jasmine.Spy>placeFilterService.getPlacesSession).and.returnValue(filterData);
    (<jasmine.Spy>placeFilterService.getPlaceDetails).and.returnValue(of(placeDetailData));
    (<jasmine.Spy>placeFilterService.getPlaces).and.returnValue(of(getPlacesData));

    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`it should call 'setActiveView' method case-1`, () => {
    component.setActiveView('placeResultsGrid');
    fixture.detectChanges();
  });

  it(`it should call 'setActiveView' method case-2`, () => {
    component.setActiveView('placeDetailsList');
    fixture.detectChanges();
  });

  it(`it should call 'setViewDetail' method with viewName`, () => {
    component.setViewDetail('placeDetailsGrid');
    fixture.detectChanges();
  });

  it(`it should call 'openDetails' with place name`, () => {
    component.openDetails('Atlanta');
    fixture.detectChanges();
  });

  it(`it should call 'onDetailsPaging' on paging`, () => {
    component.onDetailsPaging(1);
    fixture.detectChanges();
  });

  it(`it should call 'onPagination' on paging`, () => {
    component.onPagination(1);
    fixture.detectChanges();
  });

  it(`it should call 'onSorting' on paging`, () => {
    component.onSorting(component.clickOnCard);
    fixture.detectChanges();
  });

  it(`it should call 'onDetailsSorting' on sorting detail data case-1`, () => {
    const detailSort = {
      'sort_by': 'city',
      'order_by': 1
    };
    component.selectedTab = 0;
    component.onDetailsSorting(detailSort);
    fixture.detectChanges();
  });

  it(`it should call 'onDetailsSorting' on sorting detail data case-2`, () => {
    const detailSort = {
      'sort_by': 'city',
      'order_by': 1
    };
    component.selectedTab = 1;
    component.onDetailsSorting(detailSort);
    fixture.detectChanges();
  });

  it(`it should call 'onOpenSavePlaseSet' method case-1`, () => {
    component.activeRoute = component.routes.placeResultsGrid;
    component.onOpenSavePlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSavePlaseSet' method case-2`, () => {
    component.activeRoute = component.routes.placeResultsList;
    component.onOpenSavePlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSavePlaseSet' method case-3`, () => {
    component.activeRoute = component.routes.placeDetailsGrid;
    component.onOpenSavePlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSavePlaseSet' method case-4`, () => {
    component.activeRoute = component.routes.placeDetailsList;
    component.onOpenSavePlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSaveToExistingPlaseSet' method case-1`, () => {
    component.activeRoute = component.routes.placeResultsGrid;
    component.onOpenSaveToExistingPlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSaveToExistingPlaseSet' method case-2`, () => {
    component.activeRoute = component.routes.placeResultsList;
    component.onOpenSaveToExistingPlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSaveToExistingPlaseSet' method case-2`, () => {
    component.activeRoute = component.routes.placeDetailsGrid;
    component.onOpenSaveToExistingPlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`it should call 'onOpenSaveToExistingPlaseSet' method case-2`, () => {
    component.activeRoute = component.routes.placeDetailsList;
    component.onOpenSaveToExistingPlaseSet();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
  }); */

});
