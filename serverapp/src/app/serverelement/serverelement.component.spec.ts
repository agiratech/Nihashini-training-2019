import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerelementComponent } from './serverelement.component';

describe('ServerelementComponent', () => {
  let component: ServerelementComponent;
  let fixture: ComponentFixture<ServerelementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerelementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerelementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
