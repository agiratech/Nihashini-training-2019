import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NoteserviceService {

  title: any;
  description: any;
  pinned: boolean;
  val = [];
  vale: any;
  removeitems: any;
  arr = [];
  public color = [];
  colors = [];
  

  constructor(private http: HttpClient) {
}

  saveCard(formData) {
    console.log('title', formData.title);
    console.log('description', formData.description);
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    formData.pinned = false;
    formData.user = localStorage.getItem('user')
    return this.http.post('https://angular-note-7104c.firebaseio.com/data.json', formData, { headers: headers });
  }

  setNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://angular-note-7104c.firebaseio.com/data.json' + id +  { headers: headers }).subscribe(
      response => {
        console.log('response', response);
        this.val.push({ 'title': response['title'], 'description': response['description'], 'id': id})
        console.log("this.val",this.val);
        (this.val).forEach(function (key) {
          if (response[key]['user'] == localStorage.getItem('user')) {
            console.log('key', key, response[key])
            if (response[key]['pinned']) {
              console.log(response[key]['pinned'],"response[key]['pinned']")
              this.arr.push({ id: key, 'title': response[key]['title'], 'description': response[key]['description'], 'color': response[key]['color'] })
            } else {
              console.log(response[key]['pinned'],"response[key]['pinned']")
              this.val.push({ id: key, 'title': response[key]['title'], 'description': response[key]['description'], 'color': response[key]['color'] })
            }
          }
        })
      })
  }

getNotes() {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    let data = [], pinnedArray = [];
    this.http.get('https://angular-note-7104c.firebaseio.com/data.json', { headers: headers }).subscribe(
      response => {
        console.log(Object.keys(response), 'getresponse', response);
        Object.keys(response).forEach(function (key) {
          if (response[key]['user'] == localStorage.getItem('user')) {
            console.log('key', key, response[key])
            if (response[key]['pinned']) {
              console.log(response[key]['pinned'],"response[key]['pinned']")
              pinnedArray.push({ id: key, 'title': response[key]['title'], 'description': response[key]['description'], 'color': response[key]['color'] })
            } else {
              console.log(response[key]['pinned'],"response[key]['pinned']")
              data.push({ id: key, 'title': response[key]['title'], 'description': response[key]['description'], 'color': response[key]['color'] })
            }
          }
        })
      }
    );
    this.val = data;
    this.arr = pinnedArray;
    console.log(this.val, this.arr, "pinnedarrayvalues")
    return [this.val, this.arr];
  }


  updateNote(formData){
    console.log('formData', formData);
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.put('https://angular-note-7104c.firebaseio.com/data/' + formData.id + '.json',formData, { headers: headers }).subscribe(
      response => {
        console.log('response', response, formData);

        // this.val.push({'title':response['title'], 'description':response['description'],'id':formData.id})
      }
    );
  }

  deleteNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.delete('https://angular-note-7104c.firebaseio.com/data/' + id + '.json', { headers: headers });
  }

  getNotesPinned(formData) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.get('https://angular-note-7104c.firebaseio.com/data/' + formData.id + '.json', { headers: headers });
  }

  getColor() {
    return this.color;
  }

  getColors() {
    return this.colors;
  }

 

}

























