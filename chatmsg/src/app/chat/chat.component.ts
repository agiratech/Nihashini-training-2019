import { Component, OnInit } from '@angular/core';
import { ChatserveService } from '../chatserve.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {User} from '../user';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  users: User[]=[];
  delete;
  // user: { name, age, message }={ name : "", age: "", message: ""};
name: string;
  // loginUsers:any;
  constructor(public chatServe: ChatserveService, private route: Router) { 
    this.name = this.chatServe.name ;  

    this.users = this.chatServe.displayMsg();
    // console.log(this.chatServe.name, this.chatServe.age);
    // this.loginUsers = {
    //   name: this.chatServe.name,
    //   age: this.chatServe.age
    // };
  }
  enterMsg(registerForm: NgForm) {
    this.chatServe.name = registerForm.value.name;
    this.chatServe.message = registerForm.value.message;
    this.chatServe.setMsg(registerForm.value).subscribe(response => {
      this.chatServe.storeMsg(response['name']);
    })
    // console.log(this.chatServe.message);
    // console.log('this.loginUsers', this.loginUsers);
    // console.log(name);
  }
    // load(){
    // this.chatServe.createInp(this.user);
    // this.user = { name:'',age: '', message:''};
    // console.log(this.users);
  ngOnInit() { }
  deleteChat(user) {
    const index: number = this.users.indexOf(user);
    if (index !== -1) {
      this.delete = this.users.splice(index, 1);
      this.chatServe.deleteNote(user.id).subscribe(
        response=>{})
    }
  }

  
  

}
