import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTextSuggestionComponent } from './single-text-suggestion.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatSelectModule, MatDividerModule, MatFormFieldModule, MatInputModule } from '@angular/material';

describe('SingleTextSuggestionComponent', () => {
  let component: SingleTextSuggestionComponent;
  let fixture: ComponentFixture<SingleTextSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleTextSuggestionComponent ],
      imports: [ BrowserAnimationsModule,
        MatDialogModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexLayoutModule,
        MatIconModule,
        MatSelectModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTextSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
