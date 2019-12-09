import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(
    private router: Router
  ) {}

  canActivate() { 
  let  currentUser;
  currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (currentUser['roles'].includes('admin') /* || currentUser['roles'].includes('manager') */) {
      return true;
    }
    window.alert("you cannot access this page"); 
    this.router.navigate(['']);
    return false;
  }
}
