import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ScenarioDialogComponent } from './scenario-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ScenarioDialogComponent', () => {
  let dialogRef;
  let dialogData;
  let component: ScenarioDialogComponent;
  let fixture: ComponentFixture<ScenarioDialogComponent>;

  beforeEach(async(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data',
    ]);
    dialogData = jasmine.createSpyObj('MAT_DIALOG_DATA', [
      ''
    ]);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      declarations: [ ScenarioDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

 /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
