import { Component } from '@angular/core';
// import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  todayDate : Date = new Date();

// constructor() {}
  // constructor(public dialog: MatDialog ,public dialogRef: MatDialogRef<AppComponent>) { }
  // onClose(): void {
  //   console.log(this.dialogRef.disableClose); 
  //   this.dialogRef.close(); 
  //   }
}
