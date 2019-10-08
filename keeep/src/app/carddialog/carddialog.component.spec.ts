import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarddialogComponent } from './carddialog.component';

describe('CarddialogComponent', () => {
  let component: CarddialogComponent;
  let fixture: ComponentFixture<CarddialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarddialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarddialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
