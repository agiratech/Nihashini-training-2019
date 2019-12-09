import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTemplateComponent } from './show-template.component';

describe('ShowTemplateComponent', () => {
  let component: ShowTemplateComponent;
  let fixture: ComponentFixture<ShowTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
