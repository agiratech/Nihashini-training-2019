import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatserveService {
  constructor(private http: HttpClient) { }
  data =[];
  users = [];
  name: string;
  age: string;
  message: string;
 
  // public createInp(user :{name,age,message}){
  //   this.users.push(user);
  // }
  // public getInp(){
  //   return this.users;
  // }
  setValue(users: any[]) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.post('https://chatmsg-b3c96.firebaseio.com/niha.json', users, { headers: headers }
    );
    
  }
  
  storeValue(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha/' + id + '.json', { headers: headers }).subscribe(res => {
      this.users.push({ 'name': res['name'], 'age': res['age'], 'message': res['message'], 'id': id })
    console.log(this.users);
    })
  }

  displayCard() {
    
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha.json', { headers: headers }).subscribe(response => {
      Object.keys(response).forEach(function (key) {
        this.data.push({ id: key, 'name': response[key]['name'], 'age': response[key]['age'], 'message': response[key]['message'] })
      })
    })
    console.log(this.data);
    return this.data;
  }
  setMsg(users: any[]) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.post('https://chatmsg-b3c96.firebaseio.com/niha.json', users, { headers: headers }
    );
    
  }
  
  storeMsg(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha/' + id + '.json', {headers: headers}).subscribe(res => {
      this.users.push({ 'message': res['message'], 'id': id })
    console.log(this.users);
    })
  }

  displayMsg() {
    
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha.json', {headers: headers}).subscribe(response => {
      Object.keys(response).forEach(function (key) {
        this.data.push({ id: key,'message': response[key]['message'] })
      })
    })
    console.log(this.data);
    return this.data;
  }


  deleteNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.delete('https://chatmsg-b3c96.firebaseio.com/niha/' + id + '.json', { headers: headers });
  }

}



