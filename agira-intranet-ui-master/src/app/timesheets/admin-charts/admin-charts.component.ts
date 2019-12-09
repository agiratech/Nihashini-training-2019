import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { AccountsService } from '../../services/accounts.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { UsersService } from '../../users/users.service';
import {INgxMyDpOptions} from 'ngx-mydatepicker';
import { ActivityService } from '../../services/activity.service';
import { CategoryService } from '../../services/category.service';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { ErrorService } from '../../services/error.service';


@Component({
  selector: 'app-charts',
  templateUrl: './admin-charts.component.html',
  styleUrls: ['./admin-charts.component.css']
})
export class AdminChartsComponent implements OnInit {
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
    private activityService: ActivityService,
    private categoryService: CategoryService,
    private errorService: ErrorService
  ) {
  }

  currentUser;
  admin;
  manager;
  projects;
  activities;
  categories;
  accounts = [{id: 'all', name: 'All Users'}];
  dateForm: FormGroup;
  defaultTime = 'between';
  defaultProject = 'all';
  defaultUser = 'all';
  defaultActivity = 'all';
  defaultCategory = 'all';
  days = [];
  start_date;
  end_date;
  api_start_date;
  api_end_date;
  noData = false;
  timeSheets: any = {};
  myOptions: INgxMyDpOptions = {
    dateFormat: 'mmm dd, yyyy',
    showTodayBtn: false,
    yearSelector: false,
    sunHighlight: false,
    showSelectorArrow: false,
    alignSelectorRight: false,
    firstDayOfWeek: 'su'
  };
  errors: any = {};
  users: any = {};

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.defaultTime = 'between';
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.start_date = { date: { year: firstDay.getFullYear(), month: (firstDay.getMonth() + 1), day: (firstDay.getDate()) } };

    this.end_date = { date: { year: lastDay.getFullYear(),
       month: (lastDay.getMonth() + 1), day: (lastDay.getDate() < 10 ? '0' : '') + (lastDay.getDate()) } };
    this.activityService.getActivities().subscribe(
      data => {
        if (data.body['success']) {
          this.activities = data.body['result'];
        }
      }, error => {
      }
    );

    this.categoryService.getCategories().subscribe(
      data => {
        this.categories = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    this.spinnerService.show();
    this.projectService.getProjects().subscribe(
      data => {
        this.spinnerService.hide();
        // let new_projects = []
        // for(let pro of data.body['result']){
        //   new_projects.push({
        //     project: pro
        //   })
        // }
        this.projects = data.body['result'];
      },
      error => {
        this.spinnerService.hide();
      }
    );
    this.getData();
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
    this.api_start_date = this.start_date.date.year + '-' + (this.start_date.date.month < 9 ? '0' : '')
     + this.start_date.date.month + '-' + (this.start_date.date.day < 10 ? '0' : '') + this.start_date.date.day;
    this.api_end_date = this.end_date.date.year + '-' +
     (this.end_date.date.month < 9 ? '0' : '') +
     this.end_date.date.month + '-' + (this.end_date.date.day < 10 ? '0' : '') + this.end_date.date.day;
    this.dateLessThan(this.api_start_date, this.api_end_date);
    if (this.defaultTime == 'between' && !this.errors.dates ) {
      if (this.start_date) {
        this.spinnerService.show();
        this.timesheetService.getAdminCharts (this.defaultTime,
           this.defaultUser, this.defaultProject,
            this.defaultActivity, this.defaultCategory,
             this.api_start_date, this.api_end_date).subscribe(
          data => {
            this.spinnerService.hide();
            if (data.body['result'].total_hours == 0) {
              this.noData = true;
            }else {
              this.noData = false;
              this.timeSheets = data.body['result'];
              this.usersService.changeTimeSheets(this.timeSheets);
            }
          },
          error => {
            this.spinnerService.hide();
          }
        );
      }
    }else {
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

  projectSummary(timesheet) {
    this.spinnerService.show();
    this.projectService.projectDetailsWithName(timesheet).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.projectService.projectSummary(data.body['result'].id, this.api_start_date, this.api_end_date).subscribe(
            val => {
              if (data.body['success']) {
                this.users = val.body['result'][0];
              }
            }, error => {
            }
          );
        }
      }, error => {
        this.spinnerService.hide();
      }
    );
  }


  downloadReport() {
    let rep = [];
    rep.push({
      's.no': '#',
      'project' : 'Project Name',
      'worked': 'Worked Hours',
      'billed' : 'Billed Hours'
    });
    for (let i = 0; i < this.timeSheets.duration.length; i++) {
      let new_reports: any = {};
      new_reports['s.no'] = i + 1,
      new_reports.project = this.timeSheets.duration[i];
      new_reports.worked = this.timeSheets.bar_data[0].data[i];
      new_reports.billed = this.timeSheets.bar_data[1].data[i];
      rep.push(new_reports);
    }
    new Angular2Csv(rep, 'projects Summary');
  }
  // onSubmit(){
  //   console.log(this.start_date)
  //   console.log(this.end_date)
  //   this.start_date = this.start_date.date.year+'-'+(this.start_date.date.month)+'-'+this.start_date.date.day;
  //   this.end_date = this.end_date.date.year+'-'+(this.end_date.date.month)+'-'+this.end_date.date.day;
  //   this.getDateArray(this.start_date,this.end_date)
  //   this.spinnerService.show()
  //   this.timesheetService.getCharts(this.defaultTime,this.defaultUser,this.defaultProject,this.start_date,this.end_date).subscribe(
  //     data => {
  //       this.spinnerService.hide()
  //       if(data.body['result'].total_hours == 0){
  //         this.noData = true
  //       }else{
  //         this.noData = false
  //         this.timeSheets = data.body['result']
  //         this.usersService.changeTimeSheets(this.timeSheets)
  //       }
  //     },
  //     error => {
  //       this.spinnerService.hide()
  //     }
  //   )
  // }
}
