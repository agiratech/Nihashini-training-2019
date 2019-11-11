import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SubProjectCardComponent } from './sub-project-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';


describe('SubProjectCardComponent', () => {
  let component: SubProjectCardComponent;
  let fixture: ComponentFixture<SubProjectCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        RouterTestingModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
      ],
      declarations: [
        SubProjectCardComponent,
         TruncatePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubProjectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
