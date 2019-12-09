import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamGoalsComponent } from './team-goals.component';

describe('TeamGoalsComponent', () => {
  let component: TeamGoalsComponent;
  let fixture: ComponentFixture<TeamGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
