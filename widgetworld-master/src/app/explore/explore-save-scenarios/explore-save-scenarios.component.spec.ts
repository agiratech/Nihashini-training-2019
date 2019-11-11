import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExploreSaveScenariosComponent } from './explore-save-scenarios.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonService } from '@shared/services/common.service';
import { WorkSpaceService } from '@shared/services/work-space.service';
import { WorkSpaceDataService } from '../../shared/services/work-space-data.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormatService } from '@shared/services/format.service';
import { ExploreDataService } from '@shared/services/explore-data.service';
import { TargetAudienceService } from '@shared/services/target-audience.service';
import { FiltersService } from '../filters/filters.service';
import { of, zip } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('ExploreSaveScenariosComponent', () => {
  let component: ExploreSaveScenariosComponent;
  let fixture: ComponentFixture<ExploreSaveScenariosComponent>;
  let common: CommonService;
  let workSpaceService: WorkSpaceService;
  let workSpaceDataService: WorkSpaceDataService;
  let formatService: FormatService;
  let exploreDataService: ExploreDataService;
  let targetAudience: TargetAudienceService;
  let filtersService: FiltersService;
  let dialogRef;
  let dialogData;
  let audienceName = 'Persons 0+ yrs';
  let isDefaultAudience = false;
  let currentTargetId = false;
  beforeEach(async(() => {
    common = jasmine.createSpyObj('CommonService', [
      'validateFormGroup',
    ]);
    workSpaceService = jasmine.createSpyObj('WorkSpaceService', [
      'getExplorePackages',
      'saveExplorePackage',
      'deletePackage',
      'getProjects',
      'createScenario'
    ]);
    workSpaceDataService = jasmine.createSpyObj('WorkSpaceDataService', [
      'setPackages',
      'setScenarios',
    ]);
    formatService = jasmine.createSpyObj('FormatService', [
      'sortAlphabetic',
      'getObjectTitle',
    ]);
    exploreDataService = jasmine.createSpyObj('ExploreDataService', [
      'getSelectedTarget',
      'getSelectedMarket',
    ]);
    targetAudience = jasmine.createSpyObj('TargetAudienceService', [
      'getDefaultAudience',
      'saveAudience'
    ]);
    filtersService = jasmine.createSpyObj('FiltersService', [
      'getExploreSession'
    ]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data',
    ]);
    dialogData = jasmine.createSpyObj('MAT_DIALOG_DATA', [
      ''
    ]);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule
      ],
      declarations: [
        ExploreSaveScenariosComponent
      ],
      providers: [
        { provide: CommonService, useValue: common },
        { provide: WorkSpaceService, useValue: workSpaceService },
        { provide: WorkSpaceDataService, useValue: workSpaceDataService },
        { provide: FormatService, useValue: formatService },
        { provide: ExploreDataService, useValue: exploreDataService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: TargetAudienceService, useValue: targetAudience },
        { provide: FiltersService, useValue: filtersService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const audience = { 'audienceKey': 'pf_pop', 'description': 'Persons 0+ yrs' };
    (<jasmine.Spy>targetAudience.getDefaultAudience).and.returnValue(of(audience));

    fixture = TestBed.createComponent(ExploreSaveScenariosComponent);
    component = fixture.componentInstance;
    component.data = {
      inventories: [{'fid': 149334, 'selected': true}, {'fid': 149662, 'selected': true}],
      /* packages: [{inventory: [
        {id: 398584, type: 'geopathPanel'}], name: 'test name', owner: '5afd1dfee8c630e6d5f054f8', _id: '5badeae039750d10cf7e8d1d' }
      ],
      projects: [
        {'createdAt': '2018-07-19T10:24:15.429Z',
        'customer': {'contact': '', 'name': 'test name customer', 'notes': 'test node'},
        'description': 'sample description', 'name': 'Test project Name',
        'scenario': {
          'children': [
            {'name': 'scenario1',
            '_id': '5b559ce9eadc754d855582a9',
            'projectId': 'sdljfhasldfgasd'}
          ]} ,
        '_id': 'sdljfhasldfgasd'}] */
    };
    const resultData = [
      {packages: [{inventory: [
      {id: 398584, type: 'geopathPanel'}], name: 'test name', owner: '5afd1dfee8c630e6d5f054f8', _id: '5badeae039750d10cf7e8d1d' }
    ]},
    {projects: [
      {'createdAt': '2018-07-19T10:24:15.429Z',
      'customer': {'contact': '', 'name': 'test name customer', 'notes': 'test node'},
      'description': 'sample description', 'name': 'Test project Name',
      'scenarios':  [
          {'name': 'scenario1',
          '_id': '5b559ce9eadc754d855582a9',
          'projectId': 'sdljfhasldfgasd'}
        ] ,
      '_id': 'sdljfhasldfgasd'}]
    }];
    const projectsData = [
      {'createdAt': '2018-07-19T10:24:15.429Z',
      'customer': {'contact': '', 'name': 'test name customer', 'notes': 'test node'},
      'description': 'sample description', 'name': 'Test project Name',
      'scenarios':  [
          {'name': 'scenario1',
          '_id': '5b559ce9eadc754d855582a9',
          'projectId': 'sdljfhasldfgasd'}
        ] ,
      '_id': 'sdljfhasldfgasd'}];
    component.projects = projectsData;
    const packageData = {
      'data': {
        'id': '5c6125d0c989610bf5ae425c'
      },
      'message': 'InventorySet added',
      'status': 'success'
     };
    (<jasmine.Spy>filtersService.getExploreSession).and.returnValue(of(packageData));

    (<jasmine.Spy>workSpaceService.getProjects).and.returnValue(of(resultData['projects']));
    (<jasmine.Spy>exploreDataService.getSelectedTarget).and.returnValue(of(null));

    (<jasmine.Spy>exploreDataService.getSelectedMarket).and.returnValue(of(null));

    fixture.detectChanges();
  });

 /* it('should create', () => {
    expect(component).toBeTruthy();
  });

 it(`should have a 'Create New Scenario'`, () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.test-scenario-title') as HTMLElement;
    expect(title.innerText).toBe('New Scenario');
  });

  it(`should have a form field 'Scenario name, Inventory set, Parent project' `, () => {
    const name = fixture.nativeElement.querySelector('#scenario-name') as HTMLInputElement;
    expect(name.value).toContain('Untitled Scenario');
    const packageName = fixture.nativeElement.querySelector('#package-name') as HTMLInputElement;
    expect(packageName.value).toBe('');

   const parentProjectName = fixture.nativeElement.querySelector('mat-select .mat-select-value') as HTMLElement;

    const innerSpan = parentProjectName.children[0].children[0]; // for getting the inner span
    expect(innerSpan).toEqual(undefined);

  component.scenarioForm.controls['project_id'].setValue('sdljfhasldfgasd');
   fixture.detectChanges();
   const selectValue = parentProjectName.children[0].children[0];
   expect(selectValue.innerHTML).toEqual('Test project Name');
  });

  it(`should have a valid scenario name' `, () => {
    const name = fixture.nativeElement.querySelector('#scenario-name') as HTMLInputElement;
    component.scenarioForm.controls['name'].setValue('test scenario name');
   expect(component.scenarioForm.controls['name'].valid).toEqual(true);
  });

  it(`Scenario name is empty' `, () => {
    const name = fixture.nativeElement.querySelector('#scenario-name') as HTMLInputElement;
    component.scenarioForm.controls['name'].setValue('');
   expect(component.scenarioForm.controls['name'].valid).toEqual(false);
  });

  it(`Scenario component is not a valid form' `, () => {
   expect(component.scenarioForm.invalid).toEqual(true);
  });

  it(`Scenario component is a valid form' `, () => {
    component.scenarioForm.controls['name'].setValue('scenatio test name test');
    component.scenarioForm.controls['package_name'].setValue('inventory set name test');
    component.scenarioForm.controls['project_id'].setValue('sdljfhasldfgasd');
    component.scenarioForm.controls['audience_name'].setValue(audienceName);
    fixture.detectChanges();
    expect(component.scenarioForm.invalid).toEqual(false);
   });

   it(`Scenario create with default Audience' `, () => {
    expect(isDefaultAudience).toEqual(false);
   });

   it(`Scenario - Selected audience not a default audience' `, () => {
    component.isDefaultAudience = false;
    component.currentTargetId = null;
    fixture.detectChanges();
    const isVisibleAudiencInput = fixture.nativeElement.querySelector('.test-saved-audience') as HTMLElement;
    fixture.detectChanges();
    expect(isVisibleAudiencInput.innerHTML).toContain('input');
   });

   it(`Create a scenario' `, () => {
     const responseScenario = {
       'code' : 200,
        'data' : {
          'id' : { 'project': '5b51d45a86d0606d59b05fa9',
          'scenario': '5c613e78c989610bf5aea8c5'}
        },
        'message': 'Scenario added Successfully',
        'status': 'success'
     };
    (<jasmine.Spy>workSpaceService.createScenario).and.returnValue(of(responseScenario));

    component.scenarioForm.controls['name'].setValue('scenatio test name test');
    component.scenarioForm.controls['package_name'].setValue('inventory set name test');
    component.scenarioForm.controls['project_id'].setValue('sdljfhasldfgasd');
    component.scenarioForm.controls['audience_name'].setValue(audienceName);
    const audienceData = {
      'audience': {
        'audience_id' : '5c613e76c989610bf5aea8c4',
        'market_id': null
      },
      name: 'test name',
      package: ['5c613e74c989610bf5aea8c']
    };
    fixture.detectChanges();
    expect(component.scenarioForm.invalid).toEqual(false);
   const result = workSpaceService.createScenario(component.scenarioForm.value.projectId, audienceData);
   expect(result['_isScalar']).toEqual(true);
   }); */
});
