import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsMetricsComponent } from './accounts-metrics.component';

describe('AccountsMetricsComponent', () => {
  let component: AccountsMetricsComponent;
  let fixture: ComponentFixture<AccountsMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
