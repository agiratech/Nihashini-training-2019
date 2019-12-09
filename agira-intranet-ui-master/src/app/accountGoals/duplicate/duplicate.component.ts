import { Component, OnInit } from '@angular/core';
import { AccountGoalsService } from '../../services/account-goals.service';
import { AccountsService } from '../../services/accounts.service';
import { FlashService } from '../../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';
import { environment} from '../../../environments/environment';
import { SettingsService } from '../../services/settings.service';
import { ErrorService } from '../../services/error.service';




@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.css']
})

export class DuplicateComponent implements OnInit {

  constructor(
    private accountGoalsService: AccountGoalsService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private accountsService: AccountsService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private settingsService: SettingsService,
    private errorService: ErrorService


  ) { }

  account_id;
  accountGoal_id;
  accountGoalForm;
  accountGoal;
  account_name;
  accounts;
  model: any = {};
  statuses = ['new', 'released', 'submitted', 'reviewed', 'accepted'];
  dates = [];
  duration;
  errors;
  // check_month;
  year;

  ngOnInit() {

    // this.check_month = [1,2,3].includes(new Date().getMonth())
    // this.year = this.check_month ? new Date().getFullYear()-1 : new Date().getFullYear();

    // /* Creating Dates */
    // for(let k =0; k<2;k++){
    //   this.dates[k]= this.year+(k-1)+'-'+(this.year+(k))
    // }
    /* Getting Assessment Year for filter */
    this.settingsService.getAssessmentYears().subscribe(
      data => {
        this.dates = data.body['result'];
      }, error => {
      }
    );
    /* Building form for assessment */
    this.accountGoalForm = this.formBuilder.group({
      'id' : ['', Validators.required],
      'account_id': ['', Validators.required],
      'appraiser_id': ['', Validators.required],
      'reviewer_id': ['', Validators.required],
      'assessment_year': ['', Validators.required],
      'assessment_duration': ['', Validators.required],
      'duplicate_id': ['', Validators.required],
      'status': ['', Validators.required]
    });

    this.settingsService.getSettings().subscribe(
      data => {
        if (data.body['success']) {
          if (data.body['result'].assessment_duration === 'monthly') {
            this.duration = environment.Month;
          }else if (data.body['result'].assessment_duration === 'quarterly') {
            this.duration = environment.Quarters;
          }else if (data.body['result'].assessment_duration === 'half_yearly') {
            this.duration = environment.Half_yearly;
          }else if (data.body['result'].assessment_duration === 'yearly' ) {
            this.duration = environment.Yearly;
          }
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      }, error => {
        this.errorService.errorHandling(error);
      }
    );

    /* Getting account id and assessment id  */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
        this.accountGoal_id = params['accountGoal_id'];
      }
    );

    /* Getting account Details */
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
    this.spinnerService.show();

    /* Get all the accounts */
    this.accountsService.getAccounts().subscribe(
      data => {
        this.spinnerService.hide();
        this.accounts = data.body['result'].accounts;
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );


    /* Getting Assessment Details */
    this.accountGoalsService.accountGoalDetails(this.accountGoal_id).subscribe(
      data => {
        this.accountGoal = data.body['result'];
        if (data.body['success']) {
          this.accountGoalForm = this.formBuilder.group({
            'account_id': [this.accountGoal.account.id, Validators.required],
            'appraiser_id': [this.accountGoal.appraiser.id, Validators.required],
            'reviewer_id': [this.accountGoal.reviewer.id, Validators.required],
            'assessment_year': [this.accountGoal.assessment_year, Validators.required],
            'assessment_duration': ['', Validators.required],
            'duplicate_id': [this.accountGoal_id, Validators.required],
            'status': ['new', Validators.required]
          });
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }


  /* Submitting form for Duplicate  */
  onSubmit(formData) {
    this.model.account_goals = formData;
    this.spinnerService.show();
    this.accountGoalsService.createGoal(this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('/account/' + this.account_id + '/accountGoals');
        }else {
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
