import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(
    private router: Router,
    private authenticationservice: AuthenticationService
  ) {}
  currentUser;
  loggedIn;
  className = false ;
  ngOnInit() {
    /* Getting Current User and check whether the user is logged in or not */
    this.currentUser = localStorage.getItem('access-token')
    this.authenticationservice.loggedIn.subscribe((val: boolean) => {
      this.loggedIn = val;
    });
  }
}
