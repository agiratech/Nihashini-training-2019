import { Component, OnInit } from '@angular/core';
import { NotecardService } from '../notecard.service';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  notes=[]
  note;

  constructor(public NoteService: NotecardService) { }

  ngOnInit() {
    this.notes= this.NoteService.getNote();
  }  
  delete(note){   
    const index: number = this.notes.indexOf(note);
    if (index !== -1) {
      this.notes.splice(this.notes.indexOf(note),1);
    }
}
}
