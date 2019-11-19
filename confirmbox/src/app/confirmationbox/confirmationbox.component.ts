import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmationbox',
  templateUrl: './confirmationbox.component.html',
  styleUrls: ['./confirmationbox.component.css']
})
export class ConfirmationboxComponent implements OnInit {
  todo=[];
  deletedata:any;
  public confirmMessage:string;

  constructor(public dialog: MatDialog ,public dialogRef: MatDialogRef<ConfirmationboxComponent>) { }

  ngOnInit() {
  }
  delete(data: any) {
    this.dialogRef = this.dialog.open(ConfirmationboxComponent, {
      disableClose: false
    });
    const index: number = this.todo.indexOf(data);
          if (index !== -1) {
            this.deletedata = this.todo.splice(index, 1);

          }
}


onClose(): void {
  console.log('No changes were made'); 
  this.dialogRef.close(); 
  }
}
