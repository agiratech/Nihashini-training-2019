import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotecardService } from '../notecard.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  notes=[]
  note;

  constructor(public NoteService: NotecardService, public dialog: MatDialog) { }

  ngOnInit() {
    this.notes= this.NoteService.getNote();
  }  
  delete(note){   
    const index: number = this.notes.indexOf(note);
    if (index !== -1) {
      this.notes.splice(this.notes.indexOf(note),1);
    }
  }
  openDialog(){
    const editDialog = this.dialog.open(CardDialogComponent,{
      width: '300px'
      // data: todo,
      // closeOnNavigation: true
    });
    editDialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

}


}





