import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateMetricsComponent } from './create-template-metrics.component';

describe('CreateTemplateMetricsComponent', () => {
  let component: CreateTemplateMetricsComponent;
  let fixture: ComponentFixture<CreateTemplateMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTemplateMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTemplateMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
