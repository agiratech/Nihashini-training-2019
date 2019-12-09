import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountMetricsComponent } from './edit-account-metrics.component';

describe('EditAccountMetricsComponent', () => {
  let component: EditAccountMetricsComponent;
  let fixture: ComponentFixture<EditAccountMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
