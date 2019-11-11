import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAgreementDialogComponent } from './user-agreement-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  TitleService,
  LoaderService,
  AuthenticationService,
  ThemeService
} from '@shared/services';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../../app-config.service';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {before} from 'selenium-webdriver/testing';

describe('UserAgreementDialogComponent', () => {
  let component: UserAgreementDialogComponent;
  let fixture: ComponentFixture<UserAgreementDialogComponent>;
  let debugElem;
  let elem;
  let title: any;
  let loader: any;
  let http: any;
  let config: any;
  let authService: any;
  let dialogRef: any;
  let theme: any;
  beforeEach(async(() => {
    title = jasmine.createSpyObj('titleService', [
      'getTitle',
      'setTitle',
      'updateTitle',
      'updateSiteName'
    ]);
    theme = jasmine.createSpyObj('ThemeService', [
      'getThemeSettings',
      'generateColorTheme',
    ]);
    loader = jasmine.createSpyObj('loaderService', [
      'display',
    ]);
    http = jasmine.createSpyObj('HttpClient', [
      'get', 'post', 'put', 'patch', 'update'
    ]);
    config = jasmine.createSpyObj('AppConfigService', [
      'load',
      'API_ENDPOINT'
    ]);
    authService = jasmine.createSpyObj('AuthenticationService', [
      'login',
      'logout'
    ]);
    dialogRef = jasmine.createSpyObj('dialogRef', [
      'close'
    ]);
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [ UserAgreementDialogComponent ],
      providers: [
        {provide: TitleService, useValue: title},
        {provide: LoaderService, useValue: loader},
        {provide: HttpClient, useValue: http},
        {provide: AppConfig, useValue: config},
        {provide: AuthenticationService, useValue: authService},
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: ThemeService, useValue: theme},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAgreementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElem = fixture.debugElement.query(By.css('.mat-dialog-header-title'));
    elem = debugElem.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have header', () => {
    fixture.detectChanges();
    expect(elem.textContent).toBe('Data Evaluation Terms & Conditions');
  });
  it('should call agree when clicked agree', () => {
    fixture.detectChanges();
    const toggleSpy = spyOn(component, 'toggleAgreement');
    fixture.nativeElement.querySelector('#action-agree').click();
    fixture.detectChanges();
    expect(toggleSpy).toHaveBeenCalledWith('agreed');
  });
  it('should call disagree when clicked decline', () => {
    fixture.detectChanges();
    const toggleSpy = spyOn(component, 'toggleAgreement');
    fixture.nativeElement.querySelector('#action-decline').click();
    fixture.detectChanges();
    expect(toggleSpy).toHaveBeenCalledWith('decline');
  });
});
