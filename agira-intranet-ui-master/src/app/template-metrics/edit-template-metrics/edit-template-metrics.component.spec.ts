import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTemplateMetricsComponent } from './edit-template-metrics.component';

describe('EditTemplateMetricsComponent', () => {
  let component: EditTemplateMetricsComponent;
  let fixture: ComponentFixture<EditTemplateMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTemplateMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTemplateMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
