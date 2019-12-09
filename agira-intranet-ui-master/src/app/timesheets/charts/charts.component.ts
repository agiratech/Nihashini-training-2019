import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { AccountsService } from '../../services/accounts.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { UsersService } from '../../users/users.service';
import { ActivityService } from '../../services/activity.service';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  @ViewChild('baseChart') Chart;
  constructor(
    private timesheetService: TimesheetService,
    private formBuilder: FormBuilder,
    private flashService: FlashService,
    private accountService: AccountsService,
    private datepipe: DatePipe,
    private projectService: ProjectService,
    private usersService: UsersService,
    private spinnerService: Ng4LoadingSpinnerService,
    private activityService: ActivityService
  ) {
    this.createForm();
   }

  currentUser;
  admin;
  manager;
  projects;
  activities;
  defaultCategory = 'all';
  accounts = [{id: 'all', name: 'All Accounts'}];
  dateForm: FormGroup;
  times = [
    {
    'key': 'Between',
    'value': 'between'
    }, {
    'key': 'This Month',
    'value': 'this month'
    }, {
    'key': 'Last Month',
    'value': 'prev month'
    }, {
    'key': 'This Week',
    'value': 'this week'
    }, {
    'key': 'Last Week',
    'value': 'prev week'
  }];
  defaultTime = 'this month';
  defaultProject= 'all';
  defaultUser = 'all';
  defaultActivity= 'all';
  days = [];
  start_date;
  end_date;
  dateShow = false;
  noData = false;
  api_start_date;
  api_end_date;
  errors: any = {};

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser.roles.includes('admin')) {
      this.defaultUser = 'all';
      this.admin = true;
    }else {
      this.defaultUser = this.currentUser.id;
      this.admin = false;
    }
    if (this.currentUser.roles.includes('manager')) {
      this.defaultUser = 'all';
      this.manager = true;
    }else {
      this.manager = false;
    }

    this.activityService.getActivities().subscribe(
      data => {
        if (data.body['success']) {
          this.activities = data.body['result'];
        }
      }, error => {
        console.log(error);
      }
    );

    // if (this.admin) {
    //   this.defaultTime = 'between';
    //   let date = new Date();
    //   let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    //   let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    //   this.start_date = firstDay.getFullYear() + '-' +
    //    (firstDay.getMonth() < 9 ? '0' : '') + (firstDay.getMonth() + 1) + '-' +
    //  (firstDay.getDate() < 10 ? '0' : '') + (firstDay.getDate());
    //   this.end_date = lastDay.getFullYear() + '-' +
    //    (lastDay.getMonth() < 9 ? '0' : '') + (lastDay.getMonth() + 1) + '-' + (lastDay.getDate() < 10 ? '0' : '') + (lastDay.getDate()) ;
    //   this.dateForm.patchValue({
    //     start_date: this.start_date,
    //     end_date: this.end_date
    //   });
    //   this.spinnerService.show();
    //   this.projectService.getProjects().subscribe(
    //     data => {
    //       this.spinnerService.hide();
    //       let new_projects = [];
    //       for (let pro of data.body['result']){
    //         new_projects.push({
    //           project: pro
    //         });
    //       }
    //       this.projects = new_projects;
    //     },
    //     error => {
    //       this.spinnerService.hide();
    //     }
    //   );
    // }else {
      this.spinnerService.show();
      this.projectService.getProjects().subscribe(
        data => {
          this.spinnerService.hide();
          this.projects =  data.body['result'];
        }, error => {
          this.spinnerService.hide();
        }
      );
    // }
    this.getData();
    if (this.admin || this.manager) {
      this.spinnerService.show();
      this.accountService.getAccounts().subscribe(
        data => {
          this.spinnerService.hide();
          this.accounts = this.accounts.concat(data.body['result'].accounts);
        },
        error => {
          this.spinnerService.hide();
        }
      );
    }
  }

  createForm() {
    this.dateForm = this.formBuilder.group({
      start_date: '',
      end_date: ''
    });
  }

  dateLessThan(from, to) {
    if (new Date(from) > new Date(to) && new Date(from) != null) {
      this.errors = {
        dates: 'Start date should be less than the end date'
      };
    }else {
      this.errors = {};
    }
  }

  getData() {
    if (this.defaultTime == 'between' || this.admin) {
      this.dateShow = true;
      if (this.start_date) {
        this.spinnerService.show();
        this.timesheetService.getCharts(this.defaultTime, this.defaultUser,
          this.defaultProject, this.defaultActivity, this.defaultCategory, this.api_start_date, this.api_end_date).subscribe(
          data => {
            this.spinnerService.hide();
            if (data.body['result'].total_hours == 0) {
              this.noData = true;
            }else {
              this.noData = false;
              this.usersService.changeTimeSheets(data.body['result']);
            }
          },
          error => {
            this.spinnerService.hide();
          }
        );
      }
    }else {
      this.spinnerService.show();
      this.dateShow = false;
      this.timesheetService.getCharts(this.defaultTime, this.defaultUser,
         this.defaultProject, this.defaultActivity, this.defaultCategory).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['result'].total_hours == 0) {
            this.noData = true;
          }else {
            this.noData = false;
            this.usersService.changeTimeSheets(data.body['result']);
          }
        },
        error => {
          this.spinnerService.hide();
        }
      );
    }
  }

  getDateArray(start, end) {
    this.days = [];
    var startdate = new Date(start);
    var enddate = new Date(end);
    while (startdate <= enddate) {
      this.days.push(this.datepipe.transform(startdate, 'yyyy-MM-dd'));
      startdate.setDate(startdate.getDate() + 1);
    }
  }

  onSubmit(value) {
    this.getDateArray(value.start_date, value.end_date);
    this.start_date = value.start_date;
    this.end_date = value.end_date;
    this.api_start_date = this.start_date.date.year + '-' + (this.start_date.date.month < 9 ? '0' : '')
    + this.start_date.date.month + '-' + (this.start_date.date.day < 10 ? '0' : '') + this.start_date.date.day;
   this.api_end_date = this.end_date.date.year + '-' +
    (this.end_date.date.month < 9 ? '0' : '') +
    this.end_date.date.month + '-' + (this.end_date.date.day < 10 ? '0' : '') + this.end_date.date.day;
    this.dateLessThan(this.api_start_date, this.api_end_date);
    this.spinnerService.show();
    if (!this.errors.dates) {
      this.timesheetService.getCharts(this.defaultTime, this.defaultUser,
        this.defaultProject, this.defaultActivity, this.defaultCategory, this.api_start_date, this.api_end_date).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['result'].total_hours == 0) {
            this.noData = true;
          }else {
            this.noData = false;
            this.usersService.changeTimeSheets(data.body['result']);
          }
        },
        error => {
          this.spinnerService.hide();
        }
      );
    }
    this.spinnerService.hide();
  }

  enableDate() {
    if (this.defaultTime == 'between') {
      this.dateShow = true;
    }else {
      this.dateShow = false;
    }
  }

}
