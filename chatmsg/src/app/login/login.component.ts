import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ChatserveService } from '../chatserve.service';
import { Router } from '@angular/router';
import {User} from '../user'; 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  users: User[]=[];
  // user: { name, age, message } = { name: "",age: "", message: "" };
  // name: string;
  // age: string;

  constructor(public chatServe: ChatserveService, private route: Router) {
  }

  ngOnInit() {
    // this.users = this.chatServe.getInp();
  }

  regSubmit(registerForm: NgForm) {
    // console.log(registerForm);
    this.chatServe.name = registerForm.value.name;
    this.chatServe.age = registerForm.value.age;
    this.chatServe.setValue(registerForm.value).subscribe(response => {
      this.chatServe.storeValue(response['name']);
    })
    console.log(this.chatServe.name, this.chatServe.age);

    if (registerForm.valid) {
      this.route.navigateByUrl('/chat');
    }
  }

  
  // load() {
  //   this.chatServe.createInp(this.user);
  //   this.user = { name: '', age: '', message: '' };
  // }

}
