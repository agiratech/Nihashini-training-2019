import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScenarioCreateComponent } from './scenario-create.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { OverlayModule } from '@angular/cdk/overlay';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { ConvertPipe } from '../../../shared/pipes/convert.pipe';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {HttpClientModule} from '@angular/common/http';

import {
  WorkSpaceService,
  WorkSpaceDataService,
  CommonService,
  ExploreDataService,
  ExploreService,
  FormatService,
  LoaderService,
  TargetAudienceService,
  AuthenticationService,
  TitleService
} from '../../../shared/services/index';
import { SearchDirective } from '../../../shared/directives/search.directive';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { DisableSortPipe } from '../pipes/disable-sort.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import {AppConfig} from '../../../app-config.service';

@Component({ selector: 'app-dropdown', template: '' })
class DropdownComponent { }

@Component({ selector: 'app-scenarios-inner-list', template: '' })
class ScenariosInnerListComponent { }


@Component({ selector: 'app-tags-input', template: '' })
class TagsInputComponent { }

@Component({ selector: 'app-scenarios-inventories', template: '' })
class ScenariosInventoriesComponent { }

@Component({ selector: 'app-scenario-places', template: '' })
class ScenarioPlacesComponent { }

@Component({ selector: 'app-scenario-filters', template: '' })
class ScenarioFiltersComponent { }

@Component({ selector: 'app-scenarios-inventory-list', template: '' })
class ScenariosInventoryListComponent { }

describe('ScenarioCreateComponent', () => {
  let component: ScenarioCreateComponent;
  let fixture: ComponentFixture<ScenarioCreateComponent>;
  let workSpaceService: WorkSpaceService;
  let workSpaceDataService: WorkSpaceDataService;
  let common: CommonService;
  let formatService: FormatService;
  let loader: LoaderService;
  let targetAudience: TargetAudienceService;
  let auth: AuthenticationService;
  let title: TitleService;
  let route: ActivatedRoute;
  let config;
  let dialogRef;
  let dialogData;
  beforeEach(async(() => {
    workSpaceService = jasmine.createSpyObj('WorkSpaceService', [
      'getExplorePackages',
      'createScenario',
      'getLabels',
      'formatScenarioData'
    ]);
    workSpaceDataService = jasmine.createSpyObj('WorkSpaceDataService', [
      'getDayparts'
    ]);
    common = jasmine.createSpyObj('CommonService', [
      'setBreadcrumbs',
      'setWorkSpaceState',
      'setDropdownState',
      'confirmExit'
    ]);
    formatService = jasmine.createSpyObj('FormatService', [
      'getObjectTitle'
    ]);
    loader = jasmine.createSpyObj('LoaderService', [
      'display'
    ]);
    targetAudience = jasmine.createSpyObj('TargetAudienceService', [
      'getSavedAudiences'
    ]);
    auth = jasmine.createSpyObj('AuthenticationService', [
      'getModuleAccess'
    ]);
    title = jasmine.createSpyObj('TitleService', [
      'updateTitle',
      'updateSiteName'
    ]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data'
    ]);
    dialogData = jasmine.createSpyObj('MAT_DIALOG_DATA', [
      ''
    ]);
    config = jasmine.createSpyObj('AppConfigService', [
      'load',
      'API_ENDPOINT'
    ]);
    formatService.getObjectTitle = jasmine.createSpy('getObjectTitle', () => { }).and.returnValue(of([]));
    const projectData = {
      'customer': {
        'contact': {
          'email': 'mail@mail.com'
        },
        'name': 'custome name',
        'notes': 'customer notes'
      },
      'description': 'Project description',
      'mediaTypes': [],
      'name': 'New project create',
      'owner': 'dfsajdfglaskdgf',
      'scenario': {
        'children': []
      },
      '_id': 'ldjgsdfasdfasdf'
    };

    const marketData = [
      {
        'id': '58260bea-039b-45f0-85a0-b0f4a6595326',
        'name': 'Abilene-Sweetwater, TX'
      }];
    // (<jasmine.Spy>exploreData.getMarketsData).and.returnValue(of(marketData));
    (<jasmine.Spy>workSpaceService.getExplorePackages).and.returnValue(of(marketData));

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatSidenavModule,
        OverlayModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatToolbarModule,
        MatDatepickerModule,
        MatChipsModule,
        MatMenuModule,
        MatTableModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatBadgeModule,
        MatSortModule,
        MatNativeDateModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        ScenarioCreateComponent,
        DropdownComponent,
        TagsInputComponent,
        TruncatePipe,
        ScenariosInventoriesComponent,
        ScenarioPlacesComponent,
        ConvertPipe,
        ScenarioFiltersComponent,
        ScenariosInventoryListComponent,
        SearchDirective,
        HighlightPipe,
        DisableSortPipe
      ],
      providers: [
        { provide: CommonService, useValue: common },
        { provide: WorkSpaceService, useValue: workSpaceService },
        { provide: WorkSpaceDataService, useValue: workSpaceDataService },
        { provide: FormatService, useValue: formatService },
        { provide: LoaderService, useValue: loader },
        { provide: TitleService, useValue: title },
        { provide: TargetAudienceService, useValue: targetAudience },
        { provide: AppConfig, useValue: config},
        { provide: AuthenticationService, useValue: auth },

        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              'data': {
                'projects': { 'projects': {} },
                'project': projectData,
                'places': {
                  'places': []
                },
                'audiences': {
                  'audienceList': [
                    {
                      'audiences': { 'key': 'pz_seg03', 'tags': ['seg03'] },
                      'title': 'save audience data',
                      '_id': '5bc5fb2f8b55346b60704753'
                    },
                  ]
                }
              }
            }
          }
        },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioCreateComponent);
    component = fixture.componentInstance;
    const modPermission = {
      'features': {
        'gpInventory': {
          'edit': true,
          'status': 'active',
          'view': true
        },
        'status': 'active',
        'view': true
      }
    };
    (<jasmine.Spy>auth.getModuleAccess).and.returnValue(modPermission);
    const labels = {
      folder: ['Folder', 'Folders'],
      project: ['Project', 'Projects'],
      scenario: ['Scenario', 'Scenarios'],
      subProject: ['Sub-Project', 'Sub-Projects']
    };
    component.projectId = 'ldjgsdfasdfasdf';
    component.projectName = 'New project create';
    component.scenarioName = 'Untitled Scenario 1';
    component.isEditScenarioName = false;
    component.saveButtonText = 'save Scenario';
    component.labels = labels;
    fixture.detectChanges();
  });

   /* it('should create scenario component', () => {
    expect(component).toBeTruthy();
  });

  it('should set bread crumbs', () => {
    (<jasmine.Spy>common.setBreadcrumbs).and.returnValue(of([
      { label: 'WORKSPACE', url: '' },
      { label: 'MY PROJECTS', url: '/projects/lists' },
      { label: component.projectName, url: '/projects/' + component.projectId },
      { label: component.scenarioName, url: '' }
    ]));
  });

  it('should have a default scenario name `Untitled Scenario`', () => {
    const scenarioName = fixture.nativeElement.querySelector('.scenario-name-edit') as HTMLElement;
    expect(scenarioName.innerText).toContain(component.scenarioName);
  });

  it('should able to edit the scenario name', () => {
    const scenarioName = fixture.nativeElement.querySelector('.scenario-name-edit') as HTMLElement;
    scenarioName.click();
    fixture.detectChanges();
    expect(component.isEditScenarioName).toBe(true);
  });

  it('should able to add the description & tags', () => {
    component.scenarioStep2Form.controls['description'].patchValue('This is description');
    component.scenarioStep2Form.controls['scenario_tags'].patchValue(['tag1', 'tag2', 'tag3']);
    expect(component.scenarioStep2Form.value.description).toBe('This is description');
    expect(component.scenarioStep2Form.value.scenario_tags).toContain('tag1');
  });

  it('should be audience & market form field', () => {
    const audiecnceField = fixture.nativeElement.querySelector('.test-audience-field .mat-select-value') as HTMLElement;

    const MarketField = fixture.nativeElement.querySelector('.test-market-field .mat-select-value') as HTMLElement;

    component.scenarioStep2Form.controls['default_audience'].setValue('5bc5fb2f8b55346b60704753');
    component.scenarioStep2Form.controls['default_market'].setValue('58260bea-039b-45f0-85a0-b0f4a6595326');

    fixture.detectChanges();
    const audiencedeValue = audiecnceField.children[0].children[0];
    const marketValue = MarketField.children[0].children[0];

    expect(audiencedeValue.innerHTML).toEqual('save audience data');
    // expect(marketValue.innerHTML).toEqual('Abilene-Sweetwater, TX');
  });

  it('should able to get `Delivery Goals`', () => {
    expect(component.isAddGoal).toBe(false);
    component.onAddGoals();
    fixture.detectChanges();
    expect(component.isAddGoal).toBe(true);
  });

  it('should able to add `Delivery Goals` inputs', () => {
    component.onAddGoals();
    fixture.detectChanges();
    expect(component.isAddGoal).toBe(true);
    const gaolsData = 1000;
    component.scenarioStep2Form.controls['goals']['controls']['impressions'].setValue(gaolsData);
    component.scenarioStep2Form.controls['goals']['controls']['trp'].setValue(gaolsData);
    component.scenarioStep2Form.controls['goals']['controls']['reach'].setValue(gaolsData);
    component.scenarioStep2Form.controls['goals']['controls']['frequency'].setValue(gaolsData);
    fixture.detectChanges();
    expect(component.scenarioStep2Form.value['goals']['impressions']).toBe(gaolsData);
    expect(component.scenarioStep2Form.value['goals']['trp']).toBe(gaolsData);
    expect(component.scenarioStep2Form.value['goals']['reach']).toBe(gaolsData);
    expect(component.scenarioStep2Form.value['goals']['frequency']).toBe(gaolsData);
  });

  it('should have inventory & places section', () => {
    const inventoryComponent = fixture.nativeElement.querySelector('app-scenarios-inventories') as HTMLElement;
    const placesComponent = fixture.nativeElement.querySelector('app-scenario-places') as HTMLElement;
    expect(inventoryComponent.innerHTML).toBe('');
    expect(placesComponent.innerHTML).toBe('');
  });

  it('Should have valid scenario form', () => {
    expect(component.scenarioStep2Form.invalid).toBe(false);
  });

  it('Scenario form is not a valid form', () => {
    component.scenarioStep2Form.controls['name'].setValue('');
    expect(component.scenarioStep2Form.invalid).toBe(false);
  });


  it('should create a scenario', () => {
    (<jasmine.Spy>workSpaceService.createScenario).and.returnValue(of({ 'result': 'scenario created' }));
    (<jasmine.Spy>workSpaceService.formatScenarioData).and.returnValue(true);
    fixture.detectChanges();
    const result = workSpaceService.createScenario('skdjfclasdfsdf', component.scenarioStep2Form.value);
    expect(result['value']['result']).toBe('scenario created');
  }); */
});
