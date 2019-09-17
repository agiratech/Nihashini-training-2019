import { Component, OnInit } from '@angular/core';
import { NotecardService } from '../notecard.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  
  title: string;
  subTitle:string;

  constructor(public NoteCard: NotecardService) {}

  ngOnInit() {}

  createNote(formData: NgForm){
    console.log('formData.value',formData.value);
    this.NoteCard.createNote(formData.value);
  }
}


