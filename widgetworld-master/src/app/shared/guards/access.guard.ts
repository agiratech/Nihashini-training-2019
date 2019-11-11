import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ThemeService } from '../services/theme.service';

@Injectable()
export class AccessGuard implements CanActivateChild, CanActivate {
  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private theme: ThemeService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivateChild(route, state);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const mod = next.data['module'];
    const submodule = next.data['submodule'];
    const url = state.url;
    let themeSettings = JSON.parse(localStorage.getItem('themeSettings'));
    let userAgreementAgreed = localStorage.getItem('userAgreementAgreed');
    const userData = JSON.parse(localStorage.getItem('user_data'));
    this.theme.themeSettings.subscribe(res => {
      themeSettings = this.theme.getThemeSettings();
    });
    if (
      themeSettings &&
      typeof themeSettings['legal'] !== 'undefined' &&
      themeSettings['legal'] !== 'hidden' &&
      userAgreementAgreed !== 'agreed' &&
      submodule !== 'user-agreement'
    ) {
      this.router.navigate(['/user/user-agreement']);
    }
    if (mod === 'common') {
      if (submodule === 'user-agreement') {
        userAgreementAgreed = localStorage.getItem('userAgreementAgreed');
        if (userAgreementAgreed === 'agreed') {
          if (themeSettings['home'] === 'zoomExtents') {
            this.router.navigate(['/explore']);
          }
        }
      }
      return true;
    }
    /** Commented by vignesh M on 9/5/2019 because these conditions doesn't seem to be required when we are using module access data.
    if (url === '/projects/home') {
      if (
        userData &&
        typeof userData['workspace'] !== 'undefined' &&
        typeof userData['workspace']['projects'] !== 'undefined'
      ) {
        this.router.navigate(['/projects/lists']);
      }
    } else if (url === '/projects/lists') {
      if (
        userData &&
        typeof userData['workspace'] === 'undefined' ||
        typeof userData['workspace']['projects'] === 'undefined'
      ) {
        this.router.navigate(['/projects/home']);
      }
    }*/
    if (!mod) {
      return true;
    }
    const module_access = this.auth.getModuleAccess(mod);
    if (
      module_access &&
      typeof module_access.status !== 'undefined' &&
      !(module_access.status === 'active')
    ) {
      console.log(`blocked access to ${mod} by access.guard`);
      return false;
    }
    return true;
  }
}
