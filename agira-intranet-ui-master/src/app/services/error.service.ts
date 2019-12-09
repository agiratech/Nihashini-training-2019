import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../authentication.service'


@Injectable()
export class ErrorService {

  constructor(
    private router: Router,
    private authenticationservice: AuthenticationService
  ) { }

  loggedIn;

  ngOnInit() {
    this.authenticationservice.loggedIn.subscribe((val: boolean) => {
      this.loggedIn = val;
    });
  }

  errorHandling(error) {
    if (error.error.errors[0] == 'You need to sign in or sign up before continuing.') {
      localStorage.clear();
      this.authenticationservice.changeLogin(false);
      this.router.navigateByUrl('login');
    }
  }
}

