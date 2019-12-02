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

  // delete(item){   
  //   const index: number = this.todo.indexOf(item);
  //   if (index !== -1) {
  //     this.todo.splice(this.todo.indexOf(item),1);
  //   } 
  //   console.log('selected iem is deleted'); 

  // } 
  delete(data: any) {
    this.dialogRef = this.dialog.open(ConfirmationboxComponent, {
      disableClose: false
    });
    const index: number = this.todo.indexOf(data);
          if (index !== -1) {
            this.deletedata = this.todo.splice(index, 1);

          }
          console.log('selected iem is deleted'); 

}


onClose(): void {
  this.dialogRef.close(); 
  console.log('No changes were made'); 

  }
}
