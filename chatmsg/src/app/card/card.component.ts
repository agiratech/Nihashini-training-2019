import { Component, OnInit } from '@angular/core';
// import { ChatserveService } from '../chatserve.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  // users;
  // delete;
  // user: { name, age, message }={ name : "", age: "", message: ""};
  constructor() { 
    // public chatServe: ChatserveService
    // this.users = this.chatServe.displayCard();
  }
  ngOnInit() {
  }
  
}
