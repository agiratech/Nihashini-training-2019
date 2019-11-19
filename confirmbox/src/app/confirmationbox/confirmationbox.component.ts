import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmationbox',
  templateUrl: './confirmationbox.component.html',
  styleUrls: ['./confirmationbox.component.css']
})
export class ConfirmationboxComponent implements OnInit {
confirmMessage: string;
  constructor(public dialog: MatDialog ,public dialogRef: MatDialogRef<ConfirmationboxComponent>) { }

  ngOnInit() {
  }
  delete(data: any) {
    this.dialogRef = this.dialog.open(ConfirmationboxComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = "Are you sure you want to delete?"
}


onClose(): void {
  console.log(this.dialogRef.disableClose); 
  this.dialogRef.close(); 
  }
}
