import { Component, OnInit } from '@angular/core';
import { AccountGoalsService } from '../../services/account-goals.service';
import { AccountsService } from '../../services/accounts.service';
import { FlashService } from '../../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { environment} from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';





@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

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
  dates = [] ;
  accounts;
  model: any = {};
  duration;
  statuses = ['new', 'released', 'submitted', 'reviewed', 'accepted'];
  // check_month;
  year;

  ngOnInit() {

    // this.check_month = [1,2,3].includes(new Date().getMonth())
    // this.year = this.check_month ? new Date().getFullYear()-1 : new Date().getFullYear();

    // /* List of date */
    // for(let k =0; k<2;k++){
    //   this.dates[k]= this.year+(k)+'-'+(this.year+(k+1))
    // }
        /* Getting Assessment Year for filter */
    this.settingsService.getAssessmentYears().subscribe(
      data => {
        this.dates = data.body['result'];
      }, error => {
      }
    );

    /* Building form for  Assessment  */
    this.accountGoalForm = this.formBuilder.group({
      'id' : '',
      'account_id': '',
      'appraiser_id': '',
      'reviewer_id': '',
      'assessment_year': '',
      'status': ''
    });

    /* Getting Account Id and Account Goal ID */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
        this.accountGoal_id = params['accountGoal_id'];
      }
    );

    /* Getting Account Goal Details */
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    this.spinnerService.show();
    /* Get All Accounts */
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
            'id' : this.accountGoal.id,
            'account_id': this.accountGoal.account.id,
            'appraiser_id': this.accountGoal.appraiser.id,
            'reviewer_id': this.accountGoal.reviewer.id,
            'assessment_year': this.accountGoal.assessment_year,
            'status': this.accountGoal.status
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
  /* Updating the Assessment */
  onSubmit(formData) {
    this.spinnerService.show();
    this.model.account_goals = formData;
    this.accountGoalsService.updateAccountGoal(this.account_id, this.accountGoal_id, this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('/account/' + this.account_id + '/accountGoals');
        }else {
          if (data.body['result'].assessment_duration != []) {
            this.flashService.show(data.body['result'].assessment_duration, 'alert-danger');
          }else {
            this.flashService.show(data.body['message'], 'alert-danger');
          }
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
