import { Component, OnInit } from '@angular/core';
import { AccountGoalsService } from '../../services/account-goals.service';
import { AuthenticationService } from '../../authentication.service';
import { AccountsService } from '../../services/accounts.service';
import { ErrorService } from '../../services/error.service';
import { SettingsService } from '../../services/settings.service';
import { FlashService } from '../../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  constructor(
    private accountGoalService: AccountGoalsService,
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService,
    private authenticationservice: AuthenticationService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService,
    private settingsService: SettingsService,
    private dataService: DataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin') /* || this.currentUser['roles'].includes('manager') */ ) {
      this.authenticationservice.changeAdmin(false);
    } else {
      this.authenticationservice.changeAdmin(true);
    }
   }

  accountGoals;
  account_id;
  account_name;
  currentUser;
  is_Admin;
  dates = [];
  color = false;
  model = {};
  update = {};
  dateFilter;
  average_final_score = 0;
  noData = false;
  // check_month;
  year;

  ngOnInit() {
    this.dataService.currentAssessmentGoalYear.subscribe(year => this.dateFilter = year)
    // this.check_month = [0,1,2].includes(new Date().getMonth())
    // this.year = this.check_month ? new Date().getFullYear()-1 : new Date().getFullYear();

    /* Getting Account Id for Routes */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );

    // /* Getting Dates */
    // for(let k =0; k<2;k++){
    //   this.dates[k]= this.year+(k-1)+'-'+(this.year+(k))
    // }
    /* Checking current user is Admin */
    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });

    /* Getting Account Goal Details */
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    /* Getting Assessment Year for filter */
    this.settingsService.getAssessmentYears().subscribe(
      data => {
        this.dates = data.body['result'];
        for (let i = 0; i < this.dates.length; i++) {
          if (this.dates[i].is_current_year && this.dateFilter == '') {
            this.changeAssessmentGoalYear(this.dates[i].assessment_year)
          }
        }
        this.getAccountGoals();
      }, error => {
      }
    );

    // this.dateFilter = this.dates[1];




  }

  changeAssessmentGoalYear(year) {
    this.dataService.changeAssessmentGoalYear(year);
    this.dateFilter = year;
  }

  /* Getting Assessments for that Account*/
  getAccountGoals() {
    this.changeAssessmentGoalYear(this.dateFilter);
    this.spinnerService.show();
    this.accountGoalService.getAccountGoals(this.account_id, this.dateFilter).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body.success) {
          this.accountGoals = data.body.result;
            let total = 0;
          for (let k = 0; k < this.accountGoals.length; k++) {
            if (this.accountGoals[k].final_score != null && this.accountGoals[k].publish) {
              total = total + 1 ;
              this.average_final_score = (this.average_final_score + this.accountGoals[k].final_score);
            }
          }
          this.average_final_score = this.average_final_score / total ;
          if (this.accountGoals.length === 0) {
            this.noData = true;
          }else {
            this.noData = false;
          }
        }else {
          window.alert(data.body['message']);
          this.router.navigateByUrl('/');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Delete Assessment for that account goal */
  deleteAccount(account_id, accountGoal_id) {
    this.accountGoalService.deleteAccountGoal(account_id, accountGoal_id).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.spinnerService.show();
          this.accountGoalService.getAccountGoals(this.account_id, this.dateFilter).subscribe(
            data => {
              this.spinnerService.hide();
              if (data.body.success) {
                this.accountGoals = data.body.result;
              }
            },
            error => {
            }
          );
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

  check() {
      this.color = !this.color;
    }
  /* Releasing the Assessment */
  release(id) {
    this.spinnerService.show();
    this.update['release'] = true;
    this.model['account_goals'] = this.update;
    this.accountGoalService.updateAccountGoal(this.account_id, id, this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.getAccountGoals();
          this.flashService.show(data.body['message'], 'alert-success');
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

  /* Publishing the assessment */
  publish(id) {
    this.spinnerService.show();
    this.update['publish'] = true;
    this.model['account_goals'] = this.update;
    this.accountGoalService.updateAccountGoal(this.account_id, id, this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getAccountGoals();
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
