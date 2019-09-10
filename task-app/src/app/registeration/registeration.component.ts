import { Component, OnInit,ViewEncapsulation} from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthserviceService } from '../authservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registeration',
  templateUrl: './registeration.component.html',
  styleUrls: ['./registeration.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterationComponent implements OnInit {
  name: string;
  password: string;
  email: string;
  constructor(private authregister: AuthserviceService, private router: Router) { }

  ngOnInit() {

  }

  registerformSubmit(registerForm: NgForm) {
    this.name = registerForm.value.name;
    this.email = registerForm.value.email;
    this.password = registerForm.value.password;
    this.authregister.registerUser(registerForm.value).subscribe(
      (response) => {
        console.log('response signup', response);
        Swal.fire('Success','Registered Succesfully','success');
        this.router.navigate([""]);
      },err => {
        Swal.fire('error','Sry,Please fill in correct vaild user','error');
          }
    );
    registerForm.reset();
  }
}