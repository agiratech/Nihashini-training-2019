import { Injectable } from '@angular/core';
import { AuthserviceService } from './authservice.service';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from 
'@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router:Router,private auth: AuthserviceService,) { }
    canActivate (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.auth. isLoggedIn()){
      return true;
    }else{
      this.router.navigate([""]);
      return false;
    }
  }
}
