import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTabularViewComponent } from './campaign-tabular-view.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule, MatTableModule, MatTooltipModule, MatDialogModule, MatMenuModule, MatInputModule } from '@angular/material';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { Router } from '@angular/router';
import { AppConfig } from 'app/app-config.service';
import { TitleService, LoaderService, WorkSpaceService, CommonService } from '@shared/services';

describe('CampaignTabularViewComponent', () => {
  let component: CampaignTabularViewComponent;
  let fixture: ComponentFixture<CampaignTabularViewComponent>;
  let router: Router;
  let appConfig: any;
  let titleService: any;
  let loaderService: LoaderService;
  let workspaceService: WorkSpaceService;
  let commonService: CommonService;
  const labels = {
    folder: ['Folder', 'Folders'],
    project: ['Project', 'Projects'],
    scenario: ['Scenario', 'Scenarios'],
    subProject: ['Sub-Project', 'Sub-Projects']
  };
  beforeEach(async(() => {

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

    commonService = jasmine.createSpyObj('CommonService', [
      ''
    ]);

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        FlexLayoutModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        RouterTestingModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatDialogModule,
      ],
      declarations: [ CampaignTabularViewComponent, TruncatePipe ],
      providers: [
        { provide: AppConfig, useValue: appConfig },
        { provide: TitleService, useValue: titleService },
        { provide: LoaderService, useValue: loaderService },
        { provide: WorkSpaceService, useValue: workspaceService },
        { provide: CommonService, useValue: commonService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTabularViewComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    component.subProjects = [
      {
        '_id': '5d25ce5ac7109e3014c76b43',
        'name': 'camp3',
        'customer': {},
        'scenarios': [],
        'subProjects': [],
        'folders': [],
        'isSubProject': true,
        'attachments': [],
        'owner': '5c58458ae07f0fc452e7cd6c',
        'createdAt': '2019-07-10T11:39:06.936Z',
        'updatedAt': '2019-07-10T11:39:06.936Z',
        'scenarioCount': 0,
        'foldersCount': 0,
        'packageCount': 0
      },
      {
        '_id': '5d25b033c7109e3014c76638',
        'name': 'camp11',
        'customer': {},
        'scenarios': [],
        'subProjects': [],
        'folders': [],
        'isSubProject': true,
        'attachments': [],
        'owner': '5c58458ae07f0fc452e7cd6c',
        'createdAt': '2019-07-10T09:30:27.998Z',
        'updatedAt': '2019-07-10T09:30:27.998Z',
        'scenarioCount': 0,
        'foldersCount': 0,
        'packageCount': 0
      },
      {
        '_id': '5d25ce78c7109e3014c76b45',
        'name': 'camp5',
        'customer': {},
        'scenarios': [],
        'subProjects': [],
        'folders': [],
        'isSubProject': true,
        'attachments': [],
        'owner': '5c58458ae07f0fc452e7cd6c',
        'createdAt': '2019-07-10T11:39:36.798Z',
        'updatedAt': '2019-07-10T11:39:36.798Z',
        'scenarioCount': 0,
        'foldersCount': 0,
        'packageCount': 0
      },
    ];
    component.labels = labels;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('click on the campaign', () => {
    component.onOpenCampaign('5d25ce5ac7109e3014c76b43');
    fixture.detectChanges();
  });

});
