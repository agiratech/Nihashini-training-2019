import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotecardService {

  constructor() { }
  notes=[]
 
  public createNote(note: {title,subTitle,dateTime}){
    this.notes.push(note);
  }
  public getNote(){
    return this.notes;
  }



}



