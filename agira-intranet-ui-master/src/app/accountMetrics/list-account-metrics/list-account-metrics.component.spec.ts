import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAccountMetricsComponent } from './list-account-metrics.component';

describe('ListAccountMetricsComponent', () => {
  let component: ListAccountMetricsComponent;
  let fixture: ComponentFixture<ListAccountMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAccountMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAccountMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
