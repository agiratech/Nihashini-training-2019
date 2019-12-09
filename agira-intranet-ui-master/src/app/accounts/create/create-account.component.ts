import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { AuthenticationService } from '../../authentication.service';
import { CustomValidators  } from '../../validators/custom-validators.validator';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';


@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountsService,
    private authenticationService: AuthenticationService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService
  ) { }

  accountForm: FormGroup;
  user: any = {};
  accounts_roles_attributes = [];
  roles;
  manager_role_id;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}';
  errors;

  ngOnInit() {

    /* Building form for creating Accounts */
    this.accountForm = this.formBuilder.group({
      'emp_id': new FormControl('', [Validators.required]),
      'name': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      'manager': new FormControl(''),
      'is_asset_enabled': new FormControl(''),
      'is_timesheet_enabled': new FormControl(''),
      'is_timesheet_manager': new FormControl(''),
      'is_invoice_enabled': new FormControl('')

      // 'manager': new FormControl('')
    });

    /* Getting all the roles for the account */
    this.authenticationService.getRoles().subscribe(
      data => {
        this.roles = data['result'];
        for (let i = 0; i < this.roles.length; i++) {
          if (this.roles[i].name === 'manager') {
            this.manager_role_id = this.roles[i].id;
          }
          // if(this.roles[i].name == 'manager'){
          //   this.manager_role_id = this.roles[i].id;
          // }
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
    }

  /* Creating the Account */
  onSubmit(formData) {
    this.spinnerService.show();
    if (formData.manager) {
      this.accounts_roles_attributes.push({
        'role_id': this.manager_role_id
      });
    }
    formData.accounts_roles_attributes = this.accounts_roles_attributes;
    delete formData.manager;
    this.user.account = formData;
    this.accountService.createAccount(this.user).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('accounts');
        } else {
          this.errors = data.body['result'];
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  locationBack() {
    this.location.back();
  }

}
