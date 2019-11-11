import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserComponent} from './user.component';
import {UserLoginAgreementComponent} from './user-login-agreement/user-login-agreement.component';
import {AuthGuard} from '@shared/guards/auth.guard';
import {LoginComponent} from './login/login.component';
import {LoginRedirectGuard} from '@shared/guards/login-redirect.guard';
import {RegisterComponent} from './register/register.component';
import {ConfirmComponent} from './confirm/confirm.component';
import {LoginResolver} from './resolvers/login.resolver';
import { PublicSiteRedirctGaurd } from '@shared/guards/public-site-redirect.gaurd';

@NgModule({
  imports: [

    RouterModule.forChild([
      {
        path: 'user',
        component: UserComponent,
        resolve: {themeSettings: LoginResolver},
        children: [
          {
            path: 'user-agreement',
            component: UserLoginAgreementComponent,
            data: { title: 'User Agreement', module: 'common', submodule: 'user-agreement'},
            canActivate: [ AuthGuard ],
          },
          {
            path: 'login',
            component: LoginComponent,
            canActivate: [LoginRedirectGuard, PublicSiteRedirctGaurd],
            resolve: {themeSettings: LoginResolver},
            data: {title: 'Login'}
          },
          {
            path: 'signup',
            component: RegisterComponent,
            canActivate: [LoginRedirectGuard],
            data: {title: 'Signup'}
          },
          {
            path: 'confirm',
            component: ConfirmComponent,
            canActivate: [LoginRedirectGuard],
            data: {title: 'Confirm'}
          },
          {
            path: 'public',
            component: LoginComponent,
            canActivate: [LoginRedirectGuard],
            resolve: {themeSettings: LoginResolver},
            data: {title: 'Public'}
          }
        ]
      }
    ])
  ],
  declarations: [],
  exports: [ RouterModule]
})
export class UserRouting { }
