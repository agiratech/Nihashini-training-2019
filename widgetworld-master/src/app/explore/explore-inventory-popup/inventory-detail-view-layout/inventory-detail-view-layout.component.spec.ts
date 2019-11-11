import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDetailViewLayoutComponent } from './inventory-detail-view-layout.component';

describe('InventoryDetailViewLayoutComponent', () => {
  let component: InventoryDetailViewLayoutComponent;
  let fixture: ComponentFixture<InventoryDetailViewLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryDetailViewLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryDetailViewLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
