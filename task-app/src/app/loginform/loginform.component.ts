import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';
import{AuthGuardService} from '../auth-guard.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-loginform',
  templateUrl: './loginform.component.html',
  styleUrls: ['./loginform.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginformComponent implements OnInit {

  constructor(private authlogin:AuthserviceService,private router:Router,private authguard:AuthGuardService) { }
  email: string;
  password: string;
 
  ngOnInit() {
    if (this.authlogin.isLoggedIn()) {
      this.router.navigate(['/keep']);
    }
  }
  formInputSubmit(loginUser:NgForm) {
    this.email=loginUser.value.email;
    this.password=loginUser.value.password;
    this.authlogin.loginUser(loginUser.value).subscribe (
      (response)=>
    {
      console.log('response login', response);
      localStorage.setItem('user',response['email'] )
     
      if(response['idToken']) {
        this.authlogin.sendToken(response['idToken'])
        this.router.navigate(["/keep"]); 
      }
     },err => {
     Swal.fire('error','Not Authorised User','error');
        
}
     );

     
     loginUser.reset();
}
}
 
  

