import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketTypeFilterComponent } from './market-type-filter.component';

describe('MarketTypeFilterComponent', () => {
  let component: MarketTypeFilterComponent;
  let fixture: ComponentFixture<MarketTypeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketTypeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
