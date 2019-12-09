import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { AuthenticationService } from '../../authentication.service';
import { CustomValidators  } from '../../validators/custom-validators.validator';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountsService,
    private authenticationService: AuthenticationService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService
  ) { }

  accountForm: FormGroup;
  account_id;
  account_name;
  user: any = {};
  role_ids = [];
  roles;
  manager_role_id;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}';
  account;
  errors: any = {};

  ngOnInit() {
    this.accountForm = this.formBuilder.group({
      'id': new FormControl(''),
      'emp_id': new FormControl('', [Validators.required]),
      'name': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      'manager': new FormControl(''),
      'is_asset_enabled': new FormControl(''),
      'is_timesheet_enabled': new FormControl(''),
      'is_timesheet_manager': new FormControl(''),
      'is_invoice_enabled': new FormControl(''),
      'is_recruitment_enabled': new FormControl('')
      // 'manager': new FormControl('')
    });

    this.role_ids = [];

    /* Getting current User Account ID   */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );

    this.spinnerService.show();
    /* Getting Account Details for that Account  */
    this.accountService.accountDetails(this.account_id).subscribe(
      data => {
        this.spinnerService.hide();
        this.account = data.body['result'];
        this.account_name = data.body['result'].name;
        this.accountForm.patchValue({
          'id': this.account.id,
          'emp_id': this.account.emp_id,
          'name': this.account.name,
          'email': this.account.email,
          'is_asset_enabled': this.account.is_asset_enabled,
          'is_timesheet_enabled': this.account.is_timesheet_enabled,
          'is_timesheet_manager': this.account.is_timesheet_manager,
          'is_invoice_enabled': this.account.is_invoice_enabled,
          'is_recruitment_enabled': this.account.is_recruitment_enabled
        });
        if (this.account.roles.includes('manager')) {
          this.accountForm.patchValue({
            'manager': true
          });
        }
        this.role_ids = data.body['result'].role_ids;
      },
      error => {
        this.spinnerService.hide();
      }
    );

    /* Checking the user is admin or not */
    this.authenticationService.getRoles().subscribe(
      data => {
        this.roles = data['result'];
        for ( var i = 0; i < this.roles.length; i++) {
          if (this.roles[i].name == 'manager') {
            this.manager_role_id = this.roles[i].id;
          }
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Updating the Accounts */
  onSubmit(formData) {
    this.spinnerService.show();
    if (formData.manager) {
      if (this.role_ids.indexOf(this.manager_role_id) !== -1) {
      }else {
        this.role_ids.push(this.manager_role_id);
      }
      formData.role_ids = this.role_ids;
    }else {
      this.role_ids.splice(this.role_ids.indexOf(this.manager_role_id), 1 );
    }
    delete formData.manager;
    formData.role_ids = this.role_ids;
    this.user.account = formData;
    this.accountService.updateAccount(this.user).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('accounts');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
          this.errors = data.body['result'];
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
