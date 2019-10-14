import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatserveService {
  constructor(private http: HttpClient) { }
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
  storeCards(users: any[]) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    // console.log("name");
    return this.http.post('https://chatmsg-b3c96.firebaseio.com/niha.json', users, { headers: headers }
    );
    
  }
  setNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    // console.log("name");

    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha/' + id + '.json', { headers: headers }).subscribe(res => {
      this.users.push({ 'name': res['name'], 'age': res['age'], 'message': res['message'], 'id': id })

    })
  }
  displayCard() {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    // console.log("name");

    let data = []
    this.http.get('https://chatmsg-b3c96.firebaseio.com/niha.json', { headers: headers }).subscribe(response => {
      Object.keys(response).forEach(function (key) {
        data.push({ id: key, 'name': response[key]['name'], 'age': response[key]['age'], 'message': response[key]['message'] })
      })
    })
    
    return data;
  }
  deleteNote(id) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this.http.delete('https://chatmsg-b3c96.firebaseio.com/niha/' + id + '.json', { headers: headers });
  }

}



