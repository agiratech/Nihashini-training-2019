import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoginAgreementComponent } from './user-login-agreement.component';
import {ThemeService} from '@shared/services';
import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

describe('UserLoginAgreementComponent', () => {
  let component: UserLoginAgreementComponent;
  let fixture: ComponentFixture<UserLoginAgreementComponent>;
  let theme: any;
  let router: any;
  let dialog: any;
  beforeEach(async(() => {
    theme = jasmine.createSpyObj('ThemeService', {
      'getThemeSettings': () => {
        return {'legal': false};
      },
    });
    router = jasmine.createSpyObj('Router', [
      'navigate',
    ]);
    dialog = jasmine.createSpyObj('dialog', [
      'open'
    ]);
    TestBed.configureTestingModule({
      declarations: [ UserLoginAgreementComponent ],
      providers: [
        {provide: ThemeService, useValue: theme},
        {provide: Router, useValue: router},
        {provide: MatDialog, useValue: dialog}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLoginAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
