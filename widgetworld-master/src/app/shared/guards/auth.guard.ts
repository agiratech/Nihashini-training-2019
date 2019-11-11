import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private auth: AuthenticationService, private router: Router, private arouter: ActivatedRoute) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkToken();
  }
  canLoad(route: Route): boolean  {
    return this.checkToken();
  }
  checkToken() {
    if (localStorage.getItem('token')) {
      return true;
    } else {
      this.router.navigateByUrl('/user/login');
      return false;
    }
  }
}
