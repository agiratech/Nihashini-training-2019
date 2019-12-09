import { Component, OnInit } from '@angular/core';
import { AccountGoalsService } from '../services/account-goals.service';
import { SettingsService } from '../services/settings.service';
import { AuthenticationService } from '../authentication.service';
import { AccountsService } from '../services/accounts.service';
import { FlashService } from '../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment} from '../../environments/environment';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { ErrorService } from '../services/error.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

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
  ) { }

  duration;
  Filter;
  users: any;
  Status;
  user;
  reports: any;
  color = false;
  noData = false;
  current_assessment_year;
  years = [];

  ngOnInit() {
    this.dataService.currentUserReport.subscribe(user => this.user = user)
    this.dataService.currentAssessmentYear.subscribe(ayear => this.current_assessment_year = ayear)
    this.dataService.currentQuarter.subscribe(quarter => this.Filter = quarter)
    this.dataService.currentStatus.subscribe(status => this.Status = status)
    this.spinnerService.show();
    this.settingsService.getSettings().subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['result'].assessment_duration === 'monthly') {
          this.duration = environment.Month;
        }else if (data.body['result'].assessment_duration === 'quarterly') {
          this.duration = environment.Quarters;
        }else if (data.body['result'].assessment_duration === 'half_yearly') {
          this.duration = environment.Half_yearly;
        }else if (data.body['result'].assessment_duration === 'yearly' ) {
          this.duration = environment.Yearly;
        }
        // this.Filter = this.duration[0].key
            /* Getting Assessment Year for filter */
        this.settingsService.getAssessmentYears().subscribe(
          data => {
            this.years = data.body['result'];
            for (let i = 0; i < this.years.length; i++) {
              if (this.years[i].is_current_year && !this.current_assessment_year) {
                this.current_assessment_year = this.years[i].assessment_year;
              }
            }
            this.getReports();
          }, error => {
          }
        );
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
    this.accountsService.getAccounts().subscribe(
      data => {
        this.users = data.body['result'].accounts;
      }, error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  changeQuarter(quarter){
    this.dataService.changeQuarter(quarter)
  }

  changeAssessmentYear(assessmentYear){
    this.dataService.changeAssessmentYear(assessmentYear)
  }

  changeStatus(status){
    this.dataService.changeStatus(status)
  }

  changeUser(user){
    this.user = user;
    this.dataService.changeUserReport(user)
  }

  getReports() {
    this.spinnerService.show();
    this.accountGoalService.getReports(this.Filter, this.Status, this.user, this.current_assessment_year).subscribe(
      data => {
        this.changeQuarter(this.Filter)
        this.changeStatus(this.Status)
        this.changeUser(this.user)
        this.changeAssessmentYear(this.current_assessment_year)
        this.spinnerService.hide();
        this.reports = data.body['result'];
        if (this.reports.length === 0) {
          this.noData = true;
        }else {
          this.noData = false;
        }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  downloadReport() {
    let rep = [];
    rep.push({
      's.no': '#',
      'employee_id': 'Emp Id',
      'account_name' :  'Employee Name',
      'appraiser_name': 'Appraiser Name',
      'Reviewer_name' : 'Reviewer Name',
      'Status': 'Status',
      'Score': 'Score',
      'bonus': 'Bonus',
      'netScore': 'Net score',
      'Overall Score': 'Annual Score'
    });
    for (let i = 0; i < this.reports.length; i++) {
      let new_reports: any = {};
      new_reports['s.no'] = i + 1,
      new_reports.employee_id = this.reports[i].account.emp_id;
      new_reports.account_name = this.reports[i].account.name;
      new_reports.appraiser_name = this.reports[i].appraiser.name;
      new_reports.reviewer_name = this.reports[i].reviewer.name;
      new_reports.status = this.reports[i].status;
      new_reports.score = this.reports[i].score;
      new_reports.bonus = this.reports[i].bonus;
      new_reports.netScore = this.reports[i].final_score;
      new_reports.annual_score = this.reports[i].overall_score;
      rep.push(new_reports);
    }
    new Angular2Csv(rep, this.reports[0].assessment_duration);
  }



  check() {
    this.color = !this.color;
  }


}
