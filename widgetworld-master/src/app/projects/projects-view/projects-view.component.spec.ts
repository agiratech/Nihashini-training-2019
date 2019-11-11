import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

import { ProjectsViewComponent } from './projects-view.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from 'app/app-config.service';
import { of } from 'rxjs';
import { TitleService, LoaderService, AuthenticationService, CommonService } from '@shared/services';
import { NewWorkspaceService } from '../new-workspace.service';

@Component({ selector: 'app-sub-project-card', template: '' })
class SubProjectCardComponent {}

@Component({ selector: 'app-tags-input', template: '' })
class TagsInputComponent {}


describe('ProjectsViewComponent', () => {
  let component: ProjectsViewComponent;
  let fixture: ComponentFixture<ProjectsViewComponent>;
  let config;
  let titleService: TitleService;
  let loaderService: LoaderService;
  let auth: AuthenticationService;
  let common: CommonService;
  let workSpaceService: NewWorkspaceService;

  const access = {
    edit: false,
    status: 'active',
    attachments: {
      edit: false,
      status: 'hidden',
      view: false,
    },
    subProjects: {
      depth: 0,
      status: 'hidden',
      edit: false,
      view: false
    },
    view: true
  };

    const labels = {
      folder: ['Folder', 'Folders'],
      project: ['Project', 'Projects'],
      scenario: ['Scenario', 'Scenarios'],
      subProject: ['Sub-Project', 'Sub-Projects']
    };
  const projectData = [
    {
    createdAt: '2018-08-03T13:03:53.599Z',
    description: 'asdasdasdasd',
    mediaTypes: [],
    name: 'Project 1',
    owner: '1231232322123123',
    scenario: {children: []},
    tags: ['tags1', 'tag2'],
    subProjects: [],
    updatedAt: '2019-02-07T10:51:17.301Z',
    _id: '213123123123123'}];

  beforeEach(async(() => {
    titleService = jasmine.createSpyObj('TitleService', [
      'getTitle',
      'updateTitle',
      'updateSiteName'
    ]);
    loaderService = jasmine.createSpyObj('LoaderService', [
      'display'
    ]);
    config = jasmine.createSpyObj('AppConfigService', [
      'load',
      'API_ENDPOINT'
    ]);
    auth = jasmine.createSpyObj('AuthenticationService', [
      'getModuleAccess'
    ]);
    common = jasmine.createSpyObj('CommonService', [
      'setBreadcrumbs'
    ]);
    workSpaceService = jasmine.createSpyObj('NewWorkSpaceService', [
      'getLabels',
      'getProject',
      'getProjectParents',
      'setProjectParents',
      'setSubprojectLevel',
      'returnNullIfEmpty',
      'updateProject',
      'createSubProject',
    ]);

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        RouterTestingModule,
        OverlayModule,
        HttpClientModule,
        MatDialogModule
      ],
      declarations: [
        ProjectsViewComponent,
        SubProjectCardComponent,
        TagsInputComponent
      ],
      providers: [
        { provide: AppConfig, useValue: config },
        { provide: TitleService, useValue: titleService },
        { provide: LoaderService, useValue: loaderService },
        { provide: AuthenticationService, useValue: auth },
        { provide: CommonService, useValue: common },
        { provide: NewWorkspaceService, useValue: workSpaceService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsViewComponent);
    component = fixture.componentInstance;
    (<jasmine.Spy>auth.getModuleAccess).and.returnValue(access);
    (<jasmine.Spy>workSpaceService.getLabels).and.returnValue(labels);
    (<jasmine.Spy>workSpaceService.getProject).and.returnValue(of(projectData[0]));
    (<jasmine.Spy>workSpaceService.getProjectParents).and.returnValue([]);
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */

  /*it('Set project Data', () => {
    expect(component.currentProject).toBe(projectData[0]);
  });*/
});
