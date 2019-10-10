import { Component, OnInit } from '@angular/core';
import { ChatserveService } from '../chatserve.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  users;
  user: { name, message }={ name : "", message: ""};

  constructor(public chatServe: ChatserveService) { }

    createInp(){
    this.chatServe.createInp(this.user);
    this.user = { name:'', message:''};
  }

  ngOnInit() {
      this.users= this.chatServe.getInp();
      console.log(this.users);

  }

}
