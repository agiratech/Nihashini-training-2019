import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../edit/edit.component';
import { LabelsService } from '../labels.service'
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit{
  labels;
  title: string;
  subTitle: string; 
  dialogRef:any;
    constructor(public dialog: MatDialog, public labelService: LabelsService) { }
    
    ngOnInit(){
      this.labels= this.labelService.getlabel();
    }
    
    openDialog(){
      const editDialog = this.dialog.open(EditComponent,{
        width: '300px'
      });
      editDialog.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });

  }
}
