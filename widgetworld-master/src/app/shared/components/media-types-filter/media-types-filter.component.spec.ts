import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTypesFilterComponent } from './media-types-filter.component';

describe('MediaTypesFilterComponent', () => {
  let component: MediaTypesFilterComponent;
  let fixture: ComponentFixture<MediaTypesFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaTypesFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaTypesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
