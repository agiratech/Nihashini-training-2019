import { Component, OnInit } from '@angular/core';
import { AccountGoalsService } from '../../services/account-goals.service';
import { AuthenticationService } from '../../authentication.service';
import { AccountsService } from '../../services/accounts.service';
import { FlashService } from '../../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SettingsService } from '../../services/settings.service';
import { environment} from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-team-goals',
  templateUrl: './team-goals.component.html',
  styleUrls: ['./team-goals.component.css']
})
export class TeamGoalsComponent implements OnInit {
  constructor(
    private accountGoalService: AccountGoalsService,
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService,
    private authenticationservice: AuthenticationService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private dataService: DataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin') /*|| this.currentUser['roles'].includes('manager')*/) {
      this.authenticationservice.changeAdmin(false);
    } else {
      this.authenticationservice.changeAdmin(true);
    }
   }

  accountGoals;
  account_id;
  // account_name;
  currentUser;
  is_Admin;
  color = false;
  model = {};
  update = {};
  noData = false;
  durations;
  duration;
  status;
  years = [];
  current_assessment_year;
  searchText = '';

  ngOnInit() {
    this.dataService.currentTeamGoalDuration.subscribe(duration => this.duration = duration)
    this.dataService.currentTeamGoalAssessmentYear.subscribe(year => this.current_assessment_year = year)
    this.dataService.currentTeamGoalStatus.subscribe(status => this.status = status)
    this.dataService.currentTeamAccountName.subscribe(text => this.searchText = text)
    this.spinnerService.show();
    this.settingsService.getSettings().subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['result'].assessment_duration === 'monthly') {
          this.durations = environment.Month;
        }else if (data.body['result'].assessment_duration === 'quarterly') {
          this.durations = environment.Quarters;
        }else if (data.body['result'].assessment_duration === 'half_yearly') {
          this.durations = environment.Half_yearly;
        }else if (data.body['result'].assessment_duration === 'yearly' ) {
          this.durations = environment.Yearly;
        }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );

    /* Getting Account Id */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );

    /* Checking Current User is Admin or Not */
    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });

    // /* Getting Account Details */
    // this.accountsService.accountDetails(this.account_id).subscribe(
    //   data => {
    //     this.account_name = data.body['result'].name
    //   },
    //   error =>{
    //     this.errorService.errorHandling(error)
    //   }
    // )


    /* Getting Assessment Year for filter */
    this.settingsService.getAssessmentYears().subscribe(
      data => {
        this.years = data.body['result'];
        for (let i = 0; i < this.years.length; i++) {
          if (this.years[i].is_current_year && !this.current_assessment_year) {
            this.current_assessment_year = this.years[i].assessment_year;
          }
        }
        this.getTeamGoals();
      }, error => {
      }
    );
  }

  changeDuration(duration){
    this.dataService.changeTeamGoalDuration(duration)
  }

  changeStatus(status){
    this.dataService.changeTeamGoalStatus(status)
  }

  changeAssessmentYear(year){
    this.dataService.changeTeamGoalAssessmentYear(year)
  }

  getAccountSearchName(name) {
    this.dataService.changeTeamAccountName(name)
  }

  getTeamGoals() {
    this.changeDuration(this.duration)
    this.changeStatus(this.status)
    this.changeAssessmentYear(this.current_assessment_year)
    this.spinnerService.show();
    this.accountGoalService.getTeamGoals(this.duration, this.current_assessment_year, this.status).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body.success) {
          this.accountGoals = data.body.result;
          if (this.accountGoals.length === 0) {
            this.noData = true;
          }else {
            this.noData = false;
          }
        }
      },
      error => {
        this.errorService.errorHandling(error);
        this.spinnerService.hide();
      }
    );
  }
  /* Delete Account Goal for User Account*/
  deleteAccount(account_id, accountGoal_id) {
    this.spinnerService.show();
    this.accountGoalService.deleteAccountGoal(account_id, accountGoal_id).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getTeamGoals();
        }else {
          this.spinnerService.hide();
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  check() {
      this.color = !this.color;
    }

  /* Release Assessment for user */
  release(id) {
    this.spinnerService.show();
    this.update['release'] = true;
    this.model['account_goals'] = this.update;
    this.accountGoalService.updateAccountGoal(this.account_id, id, this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getTeamGoals();
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }
  }

