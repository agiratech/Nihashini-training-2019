import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMapDetailComponent } from './inventory-map-detail.component';

describe('InventoryMapDetailComponent', () => {
  let component: InventoryMapDetailComponent;
  let fixture: ComponentFixture<InventoryMapDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryMapDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryMapDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
