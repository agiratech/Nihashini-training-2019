import { Component, OnInit } from '@angular/core';
import { NotecardService } from '../notecard.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.css']
})
export class ReminderComponent implements OnInit {
  
  title: string;
  subTitle: string;
  
  constructor(public NoteCard: NotecardService) {}

  ngOnInit() {
  }
  createNote(formData: NgForm){
    console.log('formData.value',formData.value);
    this.NoteCard.createNote(formData.value);
  }
}
