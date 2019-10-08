import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
name: string;
email: string;
  constructor() { }

  ngOnInit() {
  }
  loginSubmit(registerForm: NgForm) {
    this.name = registerForm.value.name;
    this.email = registerForm.value.email;
    console.log(this.name, this.email);
  }

}
