import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTimesheetComponent } from './create-timesheet.component';

describe('CreateTimesheetComponent', () => {
  let component: CreateTimesheetComponent;
  let fixture: ComponentFixture<CreateTimesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTimesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
