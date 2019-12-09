import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationservice: AuthenticationService
  ) { }

  canActivate() {
    if (localStorage.getItem('access-token')) {
      this.authenticationservice.changeLogin(true);
      return true;
    }
    window.alert('You dont have permission to view this page');
    this.router.navigate(['']);
    return false;
  }
}
