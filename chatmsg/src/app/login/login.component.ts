import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  name: string;
  email: string;

  constructor() { }

  ngOnInit() {
  }
  regSubmit(registerForm: NgForm) {
    this.name = registerForm.value.name;
    this.email = registerForm.value.email;
    console.log(this.name, this.email);
  }
}
