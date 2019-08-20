import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteplaceComponent } from './noteplace.component';

describe('NoteplaceComponent', () => {
  let component: NoteplaceComponent;
  let fixture: ComponentFixture<NoteplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
