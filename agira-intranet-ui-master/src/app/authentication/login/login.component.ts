import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service' ;
import { ClientService } from '../../services/client.service';
import { ErrorService } from '../../services/error.service';
import { AccountsService } from '../../services/accounts.service';
import { CustomValidators } from '../../validators/custom-validators.validator';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup ;
  forgotPasswordForm: FormGroup ;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private clientservice: ClientService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService,
    private accountsService: AccountsService
  ) {  }

  currentUser;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}';
  @ViewChild('closeModal') close: ElementRef;

  ngOnInit() {
    /* Getting Current User */
    this.currentUser = localStorage.getItem('access-token');
    if (this.currentUser != null) {
      this.authenticationService.changeLogin(true);
      this.router.navigate(['dashboard']);
    }
    /* Building Form for Login */
    this.loginForm = this.formBuilder.group ({
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      'password': new FormControl('', [Validators.required])
    });

    /* Building Form for Forgot Password */
    this.forgotPasswordForm = this.formBuilder.group ({
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
    });

  }

  /* Submit Details for Login */
  onSubmit(formData) {
    this.spinnerService.show();
    this.authenticationService.login(formData).subscribe(
      data => {
        this.spinnerService.hide();
        localStorage.setItem('access-token', data.headers.get('access-token') );
        localStorage.setItem('client', data.headers.get('client'));
        localStorage.setItem('expiry', data.headers.get('expiry'));
        localStorage.setItem('uid', data.headers.get('uid'));
        localStorage.setItem('currentUser',
         JSON.stringify({ id: data.body['data'].id,
          name: data.body['data'].name,
          email: data.body['data'].uid,
          roles: data.body['data'].roles,
          owner: data.body['data'].owner,
          is_timesheet_manager: data.body['data'].is_timesheet_manager }));
        this.authenticationService.changeLogin(true);
        this.flashService.show('Logged in successfully', 'alert-success');
        this.router.navigateByUrl('dashboard');
      },
      error => {
        this.spinnerService.hide();
        this.flashService.show(error.error.errors[0], 'alert-danger');
        this.authenticationService.changeLogin(false);
        this.errorService.errorHandling(error);
      }
    );
  }

  forgotPassword(formData) {
    this.spinnerService.show();
    this.accountsService.forgotPassword(formData).subscribe(
      data => {
        this.spinnerService.hide();
        this.close.nativeElement.click();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      }, error => {
        this.spinnerService.hide();
      }
    );
  }

}
