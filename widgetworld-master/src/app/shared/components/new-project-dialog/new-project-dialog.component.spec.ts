import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NewProjectDialogComponent } from './new-project-dialog.component';

describe('NewProjectDialogComponent', () => {
  let component: NewProjectDialogComponent;
  let fixture: ComponentFixture<NewProjectDialogComponent>;
  let dialogRef;
  let dialogData;

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
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      declarations: [ NewProjectDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should create', () => {
    expect(component).toBeTruthy();
  }); */
});
