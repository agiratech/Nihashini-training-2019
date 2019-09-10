import { Component, ViewEncapsulation } from '@angular/core';
import { NoteserviceService } from '../noteservice.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-text-note',
  templateUrl: './text-note.component.html',
  styleUrls: ['./text-note.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TextNoteComponent {
  title: string;
  description: string;
  val = [];
  arr = [];
  result: any;
  public colors = [];
  constructor(public cardservice: NoteserviceService, public router: Router) {
   }

  formsubmit(formData: NgForm) {
    console.log(formData.value);
    this.cardservice.saveCard(formData.value).subscribe(
      (response) => {
        this.cardservice.setNote(response['name']);
        console.log("notes", this.val);
        //  console.log(response);
      },
      (error) => console.log(error)
    );
  formData.reset();
}
ngOnInit() {
   
  }

  logout() {
    localStorage.removeItem("LoggedInUser");
    this.router.navigate([""]);
  }
}
