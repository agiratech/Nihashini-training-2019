import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { AccountGoalsService } from '../../services/account-goals.service';
import { AccountsService } from '../../services/accounts.service';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';
import { environment} from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';
import { TemplatesService } from '../../services/templates.service';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  accountGoalForm;
  accounts;
  model: any = {};
  account_id;
  account_name;
  dates = [] ;
  errors;
  duration;
  // check_month;
  year;
  allTemplates;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private flashService: FlashService,
    private accountsService: AccountsService,
    private settingsService: SettingsService,
    private accountGoalsService: AccountGoalsService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService,
    private templatesService: TemplatesService

  ) { }

  ngOnInit() {

    /* Getting Account Id */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );

    this.templatesService.getTemplates('clone template').subscribe(
      data => {
        this.allTemplates = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    /* Building Form for assessment */
    this.accountGoalForm = this.formBuilder.group({
      'id' : ['', Validators.required],
      'account_id': this.account_id,
      'appraiser_id': ['', Validators.required],
      'reviewer_id': ['', Validators.required],
      'assessment_year': ['', Validators.required],
      'assessment_duration': ['', Validators.required],
      'clone_template': ['']
    });

    /* Getting Assessment Year for filter */
    this.settingsService.getAssessmentYears().subscribe(
    data => {
      this.dates = data.body['result'];
      for (let i = 0; i < this.dates.length; i++) {
        if (this.dates[i].is_current_year) {
          this.accountGoalForm.patchValue({
            'assessment_year' : this.dates[i].assessment_year
          });
        }
      }
    }, error => {
    }
  );
    // this.check_month = [1,2,3].includes(new Date().getMonth())
    // this.year = this.check_month ? new Date().getFullYear()-1 : new Date().getFullYear();

    /* List of date */
    // for(let k =0; k<2;k++){
    //   this.dates[k]= this.year+(k)+'-'+(this.year+(k+1))
    // }



    /* Getting Account Details*/
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

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

    this.spinnerService.show();
    /* Getting all the accounts */
    this.accountsService.getAccounts().subscribe(
      data => {
        this.spinnerService.hide();
        this.accounts = data.body['result'].accounts;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Validation for date */
  dateLessThan(from: string, to: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value && t.value !== '') {
        return {
          dates: 'Start date should be less than the end date'
        };
      }
      return {};
    };
  }

  /* Creating Assessment */
  onSubmit(formData) {
    this.spinnerService.show();
    this.model.account_goals = formData;
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
