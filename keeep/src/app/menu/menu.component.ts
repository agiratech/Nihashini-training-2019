import { Component } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EditComponent} from '../edit/edit.component';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  labelArray=[];
  title:string;
  note:string;
  dialogRef:any;
    constructor(public dialog: MatDialog) { }
  
    openDialog(){
      const editDialog = this.dialog.open(EditComponent,{
        width: '500px'
      });
      editDialog.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });

  }
}
