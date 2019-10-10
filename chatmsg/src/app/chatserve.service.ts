import { Injectable } from '@angular/core';
// import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatserveService {
  constructor() { }
  users = [];
  name: string;
  message: string;
 
  public createInp(user :{name,message}){
    this.users.push(user);
  }
  public getInp(){
    return this.users;
  }


}



