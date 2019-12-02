import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelconComponent } from './delcon.component';

describe('DelconComponent', () => {
  let component: DelconComponent;
  let fixture: ComponentFixture<DelconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
