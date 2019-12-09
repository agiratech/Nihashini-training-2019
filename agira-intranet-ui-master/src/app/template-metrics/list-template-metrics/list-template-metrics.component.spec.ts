import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTemplateMetricsComponent } from './list-template-metrics.component';

describe('ListTemplateMetricsComponent', () => {
  let component: ListTemplateMetricsComponent;
  let fixture: ComponentFixture<ListTemplateMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTemplateMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTemplateMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
