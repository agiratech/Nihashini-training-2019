import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotedialogueComponent } from './notedialogue.component';

describe('NotedialogueComponent', () => {
  let component: NotedialogueComponent;
  let fixture: ComponentFixture<NotedialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotedialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotedialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
