import { Component, OnInit } from '@angular/core';
import { ChatserveService } from '../chatserve.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  users;
  delete;
  user: { name, age, message }={ name : "", age: "", message: ""};

  constructor(public chatServe: ChatserveService) { 
    this.users = this.chatServe.displayCard();
  }
  load(formData: NgForm) {
    this.chatServe.storeCards(formData.value).subscribe(response => {
      this.chatServe.setNote(response['name']);
    })
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
        response=>{ })
    }
  }

}
