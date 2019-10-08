import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotecardService } from '../notecard.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  notes = []
  res: string;
  title: string;
  subTitle: string;
  delete: any;

  constructor(public NoteService: NotecardService, public dialog: MatDialog, ) {
    this.notes = this.NoteService.displayCard();
  }
  

  ngOnInit() {
    // this.notes= this.NoteService.getNote();
  }
  deleteCard(note) {
    const index: number = this.notes.indexOf(note);
    if (index !== -1) {
      // this.notes.splice(this.notes.indexOf(note), 1);
      this.delete = this.notes.splice(index, 1);
      this.NoteService.deleteNote(note.id).subscribe(
        response=>{
          console.log('response');
          console.log(response);
        })
      }
  } 
  
            
         
}





