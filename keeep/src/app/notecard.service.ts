import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotecardService {

  constructor() { }
  notes=[]
  title: string;
  subTitle:string;


  public createNote(note: {title,subTitle}){
    this.notes.push(note);
  }
  public getNote(): Array<{title,subTitle}>{
    return this.notes;
  }



}



