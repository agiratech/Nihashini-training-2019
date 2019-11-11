import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {PlacesFiltersService} from '../../places/filters/places-filters.service';

import { ScenarioListComponent } from './scenario-list.component';
import {
  TitleService, LoaderService, WorkSpaceService, TargetAudienceService,
  InventoryService, FormatService, AuthenticationService
} from '@shared/services';
import { NewWorkspaceService } from '../new-workspace.service';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DebounceDirective } from '@shared/directives/debounce.directive';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { AppConfig } from 'app/app-config.service';
import { NO_ERRORS_SCHEMA } from '@angular/compiler/src/core';
import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';

export class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  public actions = {
    'name': 'sss',
    'description': '',
    'project_id': '5ce3a0174e9e2b5a7405253f',
  };
  open() {
    return {
      afterClosed: () => of({ value: this.actions })
    };
  }
}

describe('ScenarioListComponent', () => {
  let component: ScenarioListComponent;
  let fixture: ComponentFixture<ScenarioListComponent>;
  let appConfig: any;
  let titleService: TitleService;
  let loaderService: LoaderService;
  let workspaceService: WorkSpaceService;
  let targetAudienceService: TargetAudienceService;
  let inventoryService: InventoryService;
  let formatService: FormatService;
  let newWorkspaceService: NewWorkspaceService;
  let router: Router;
  let placesFilterService: PlacesFiltersService;
  let auth: AuthenticationService;
  const mod_permission = {
    features: {
      customInventories:{
        'status': 'active'
      }
    }
  };
  const actions = {
    'name': 'sss',
    'description': '',
    'project_id': '5ce3a0174e9e2b5a7405253f',
  };

  const labels = {
    'folder': [
      'Folder',
      'Folders'
    ],
    'project': [
      'Project',
      'Projects'
    ],
    'scenario': [
      'Scenario',
      'Scenarios'
    ],
    'subProject': [
      'Sub-Project',
      'Sub-Projects'
    ],
  };

  const getExplorePackages = {
    'message': 'No Package(s) Exists for user amith@intermx.com ',
    'packages': []
  };

  const getSavedAudiences = {
    'audienceList': [
      {
        'audiences': [
          {
            'key': 2018,
            'tags': [
              'mferry',
              'away'
            ]
          }
        ],
        'audiencesInfo': [
          {
            '2018': [
              {
                'catalog': 'Population.Behaviors.Commute',
                'tag': 'mferry',
                'description': 'Ferry to Work'
              },
              {
                'catalog': 'Population.Behaviors.Employment',
                'tag': 'away',
                'description': 'Work Outside the Home'
              }
            ]
          }
        ],
        '_id': '5c92287cf7cfd3720537138b',
        'title': 'Commute - Ferry to Work, Employment - Work Outside the Home',
        'owner': '5c58458ae07f0fc452e7cd6c',
        'createdOn': '2019-03-20T11:48:12.575Z'
      }
    ]
  };

  const getMarkets = [
    { name: 'Abilene-Sweetwater, TX', id: 'DMA662' },
    { name: 'Albany, GA', id: 'DMA525' }
  ];

  const scenarioList = [
    {
      audience: '',
      audienceKey: '',
      description: 'hello',
      end: undefined,
      frequency: undefined,
      impressions: undefined,
      labels: undefined,
      market: '',
      marketId: undefined,
      name: 'Untitled Scenario 1',
      reach: undefined,
      start: undefined,
      trp: undefined,
      unitIds: [],
      units: 0,
      _id: '5ce3f7004e9e2b5a74052638'
    }
  ];

  const parentMaps = [{
    'pid': '5ce3a0174e9e2b5a7405253f',
    'pname': '',
    'parentId': '',
    'parentName': ''
  }];

  const createScenario = {
    'status': 'success',
    'api-message': `Scenario 'ssssss' added successfully to Project for user 'amith@intermx.com'`,
    'message': `Scenario 'ssssss' added successfully to Project`,
    'data': {
      'id': {
        'project': '5ce3a0174e9e2b5a7405253f',
        'scenario': '5ce3f7004e9e2b5a74052638'
      }
    }
  };

  beforeEach(async(() => {
    placesFilterService = jasmine.createSpyObj('PlacesFilterService', [
      'getPlacesSet'
    ]);
    appConfig = jasmine.createSpyObj('AppConfigService', [
      'load',
      'API_ENDPOINT'
    ]);

    titleService = jasmine.createSpyObj('TitleService', [
      'updateSiteName'
    ]);

    loaderService = jasmine.createSpyObj('LoaderService', [
      'display'
    ]);

    workspaceService = jasmine.createSpyObj('WorkSpaceService', [
      'getExplorePackages',
      'formattingScenarios',
      'newFormatScenarioData',
      'createScenario'
    ]);

    targetAudienceService = jasmine.createSpyObj('TargetAudienceService', [
      'getSavedAudiences'
    ]);

    inventoryService = jasmine.createSpyObj('InventoryService', [
      'getMarkets',
      'normalizeFilterDataNew',
      'getSummary'
    ]);

    formatService = jasmine.createSpyObj('FormatService', [
      ''
    ]);

    newWorkspaceService = jasmine.createSpyObj('NewWorkspaceService', [
      'getLabels',
      'getProjectParents',
      'setProjectParents'
    ]);
    auth = jasmine.createSpyObj('AuthenticationService', [
      'getModuleAccess'
    ]);
    

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        FormsModule,
        FlexLayoutModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        RouterTestingModule,
        MatDialogModule,
      ],
      declarations: [ScenarioListComponent, DebounceDirective, TruncatePipe],
      providers: [
        { provide: AppConfig, useValue: appConfig },
        { provide: TitleService, useValue: titleService },
        { provide: LoaderService, useValue: loaderService },
        { provide: WorkSpaceService, useValue: workspaceService },
        { provide: TargetAudienceService, useValue: targetAudienceService },
        { provide: InventoryService, useValue: inventoryService },
        { provide: PlacesFiltersService, useValue: placesFilterService },
        { provide: FormatService, useValue: formatService },
        { provide: NewWorkspaceService, useValue: newWorkspaceService },
        { provide: AuthenticationService, useValue: auth },
        { provide: MatDialog, useClass: MatDialogMock }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioListComponent);
    component = fixture.componentInstance;
    (<jasmine.Spy>newWorkspaceService.getLabels).and.returnValue(labels);
    (<jasmine.Spy>workspaceService.getExplorePackages).and.returnValue(of(getExplorePackages));
    (<jasmine.Spy>targetAudienceService.getSavedAudiences).and.returnValue(of(getSavedAudiences));
    (<jasmine.Spy>inventoryService.getMarkets).and.returnValue(of(getMarkets));
    (<jasmine.Spy>workspaceService.formattingScenarios).and.returnValue((scenarioList));
    (<jasmine.Spy>newWorkspaceService.getProjectParents).and.returnValue((parentMaps));
    (<jasmine.Spy>workspaceService.createScenario).and.returnValue(of(createScenario));
    (<jasmine.Spy>auth.getModuleAccess).and.returnValue(mod_permission);
    component.dataSource = new MatTableDataSource([]);
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*it('when scenarios is empty', () => {
    const scenario = [];
    component.ngOnChanges({
      scenarios: new SimpleChange(null, scenario, false)
    });
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');
    const projectId = '5ce3a0174e9e2b5a7405253f';
    component.createScenario();
    const list = '/v2/projects/' + projectId + '/scenarios/' + createScenario.data.id.scenario + '/' + 'inventory';
    expect(navigateSpy).toHaveBeenCalledWith([list]);
  });*/

  it('set scenario list', () => {
    component.dataSource.data = scenarioList;
    fixture.detectChanges();
    expect(component.dataSource.data).toBe(scenarioList);
  });
  it('should show the search field when toggled', () => {
    component.dataSource.data = scenarioList;
    fixture.detectChanges();
    const elem = fixture.nativeElement.querySelector('input');
    expect(elem).toBeDefined();
  });
  it('should set search query when searched', async(() => {
    component.dataSource.data = scenarioList;
    component.showSearchField = true;
    fixture.detectChanges();
    const elem = fixture.nativeElement.querySelector('input');
    elem.value = 'Test';
    elem.dispatchEvent(new Event('input'));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.searchQuery).toBe('Test');
    });
  }));
  it('should have a toggleable search', () => {
    component.showSearchField = true;
    fixture.detectChanges();
    component.showSearch();
    expect(component.showSearchField).toBeFalsy();
  });
  it('click action btn', () => {
    component.dataSource.data = scenarioList;
    fixture.detectChanges();
    const action = fixture.nativeElement.querySelector('#action-btn-parent');
    action.click();
    fixture.detectChanges();
    component.highlight(scenarioList[0]);
    fixture.detectChanges();
    const projectId = '5ce3a0174e9e2b5a7405253f';
    const navigateSpy = spyOn(router, 'navigate');
    component.onOpenScenario(projectId, scenarioList[0]._id);
    const list = '/v2/projects/' + projectId + '/scenarios/' + scenarioList[0]._id;
    fixture.detectChanges();
    action.click();
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith([list]);
  });

});
