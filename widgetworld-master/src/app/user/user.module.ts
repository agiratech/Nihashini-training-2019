import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserComponent} from './user.component';
import {UserRouting} from './user.routing';
import {AuthGuard} from '@shared/guards/auth.guard';
import {LoginRedirectGuard} from '@shared/guards/login-redirect.guard';
import {SharedModule} from '@shared/shared.module';
import {AccessGuard} from '@shared/guards/access.guard';
import {UserLoginAgreementComponent} from './user-login-agreement/user-login-agreement.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {ConfirmComponent} from './confirm/confirm.component';
import {LoginResolver} from './resolvers/login.resolver';
import { UserAgreementDialogComponent } from './user-agreement-dialog/user-agreement-dialog.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';


@NgModule({
  imports: [
    CommonModule,
    UserRouting,
    SharedModule,
  ],
  declarations: [
    UserComponent,
    RegisterComponent,
    ConfirmComponent,
    LoginComponent,
    UserLoginAgreementComponent,
    UserAgreementDialogComponent,
    ForgetPasswordComponent,
  ],
  exports: [
    UserComponent,
    SharedModule
  ],
  entryComponents: [ForgetPasswordComponent,  UserAgreementDialogComponent],
  providers: [
    AuthGuard,
    LoginRedirectGuard,
    AccessGuard,
    LoginResolver
  ]
})
export class UserModule {}
