import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-notedialogue',
  templateUrl: './notedialogue.component.html',
  styleUrls: ['./notedialogue.component.css']
})
export class NotedialogueComponent {
  val = [];
  arr = [];
  constructor(
    public dialogRef: MatDialogRef<NotedialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
    // this.val = JSON.parse(localStorage.getItem('val'));
    }

     
  ngOnInit() {
  
  }
  onClose(): void {
    console.log(this.dialogRef.disableClose); 
    this.dialogRef.close(); 
    }
}




