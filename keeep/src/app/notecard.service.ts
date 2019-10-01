import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotecardService {
  constructor(private http: HttpClient) { }
  notes = [];
  title: string;
  subTitle: string;
  dateTime: string;
  label: string;
  // public createNote(note: {title,subTitle,dateTime}){
  //   this.notes.push(note);
  // }
  // public getNote(){
  //   return this.notes;
  // }
  storeCards(notes: any[]) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.post('https://gkeep-7aa60.firebaseio.com/nihaNotes.json', notes, { headers: headers }
    );

  }
  setNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://gkeep-7aa60.firebaseio.com/nihaNotes/' + id + '.json', { headers: headers }).subscribe(res => {
      console.log(this.notes, 'asdfgh');
      this.notes.push({ 'title': res['title'], 'subTitle': res['subTitle'], 'id': id })
      console.log(this.notes, 'tisdfgh');

    })
  }
  displayCard() {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    let data = []
    this.http.get('https://gkeep-7aa60.firebaseio.com/nihaNotes.json', { headers: headers }).subscribe(response => {
      Object.keys(response).forEach(function (key) {
        data.push({ id: key, 'title': response[key]['title'], 'subTitle': response[key]['subTitle'] })
      })
    })
    return data;
  }
}



