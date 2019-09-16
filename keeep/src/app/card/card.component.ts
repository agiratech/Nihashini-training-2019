import { Component, OnInit } from '@angular/core';
import { NotecardService } from '../notecard.service';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  notes;

  constructor(public NoteService: NotecardService) { }

  ngOnInit() {
    this.notes= this.NoteService.getNote();
  }  
}
