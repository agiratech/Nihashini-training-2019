import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowGoalComponent } from './show-goal.component';

describe('ShowGoalComponent', () => {
  let component: ShowGoalComponent;
  let fixture: ComponentFixture<ShowGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
