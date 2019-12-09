import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { AccountsService } from '../../services/accounts.service';
import { ActivityService } from '../../services/activity.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { UsersService } from '../../users/users.service';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-list-timesheet',
  templateUrl: './list-timesheet.component.html',
  styleUrls: ['./list-timesheet.component.css']
})

export class ListTimesheetComponent implements OnInit {
  @ViewChild('baseChart') Chart;
  constructor(
    private timesheetService: TimesheetService,
    private formBuilder: FormBuilder,
    private flashService: FlashService,
    private accountService: AccountsService,
    private datepipe: DatePipe,
    private projectService: ProjectService,
    private usersService: UsersService,
    private activityService: ActivityService,
    private spinnerService: Ng4LoadingSpinnerService,
    private dataService: DataService
  ) {
    this.createForm();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.accountService.accountDetails(this.currentUser.id).subscribe(
      data => {
        this.currentAccount = data.body['result'];
        if (this.currentAccount.is_timesheet_manager === true) {
          this.timeSheetManager = true;
        }else {
          this.timeSheetManager = false;
        }
        if (this.admin || this.timeSheetManager) {
          this.spinnerService.show();
          this.projectService.getProjects().subscribe(
            data1 => {
              this.spinnerService.hide();
              this.projects = data1.body['result'];
            },
            error => {
              this.spinnerService.hide();
            }
          );
        }else {
          this.spinnerService.show();
          this.projectService.getProjects().subscribe(
            data2 => {
              this.spinnerService.hide();
              this.projects =  data2.body['result'];
            }, error => {
              this.spinnerService.hide();
            }
          );
        }
      }, error => {
        console.log(error);
      }
    );
  }
  dateForm: FormGroup;
  dateShow= false;
  currentUser;
  currentAccount: any;
  timeSheetManager = false;
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
  defaultProject = 'all';
  defaultUser = "";
  defaultActivity = 'all';
  timesheets;
  response: any = {};
  count = 0;
  pagenumber = [];
  currentPgNo;
  admin;
  manager;
  accounts = [{id: 'all', name: 'Select all'}];
  emptyData = false;
  totalWorkedHours ;
  totalBilledHours ;
  hours = [];
  days = [];
  data = false;
  projects;
  activities;
  project = [];
  result: any = {};
  project_hours: any = {};
  total_hours;
  accountFilter = 'all';
  start_date;
  end_date;
  owner;
  errors;

  ngOnInit() {
    this.dataService.currentProject.subscribe(project => this.defaultProject = project)
    this.dataService.currentUser.subscribe(user => this.defaultUser = user)
    this.dataService.currentActivity.subscribe(activity => this.defaultActivity = activity)
    this.dataService.currentTime.subscribe(time => this.defaultTime = time)
    this.dataService.currentPgNo.subscribe(pgNo => this.currentPgNo = pgNo)
    this.dataService.startDate.subscribe(time => this.start_date = time)
    this.dataService.endDate.subscribe(time => this.end_date = time)

    if ((this.currentUser.roles.includes('admin')) || (this.currentUser.roles.includes('manager')) || this.timeSheetManager ) {
      if(this.defaultUser == ""){
        this.dataService.changeUser('all');
      }
    }else {
      if(this.defaultUser == ""){
        this.dataService.changeUser(this.currentUser.id);
      }
    }
    if (this.currentUser.roles.includes('admin')) {
      this.admin = true;
    }else {
      this.admin = false;
    }
    if (this.currentUser.roles.includes('manager')) {
      this.manager = true;
    }else {
      this.manager = false;
    }
    if (this.currentUser.owner) {
      this.owner = true;
    }else {
      this.owner = false;
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
    this.addDate()

    this.getData(this.currentPgNo);
      this.accountService.getAccounts().subscribe(
        data => {
          this.spinnerService.hide();
          this.accounts = this.accounts.concat(data.body['result'].accounts);
        },
        error => {
          this.spinnerService.hide();
        }
      );
    // if (this.admin) {
    //   this.spinnerService.show();
    //   this.accountService.getAccounts().subscribe(
    //     data => {
    //       this.spinnerService.hide();
    //       this.accounts = this.accounts.concat(data.body['result'].accounts);
    //     },
    //     error => {
    //       this.spinnerService.hide();
    //     }
    //   );
    // }else if (this.manager) {
    //   this.spinnerService.show();
    //   this.accountService.getAccounts().subscribe(
    //     data => {
    //       this.spinnerService.hide();
    //       this.accounts = this.accounts.concat(data.body['result'].accounts);
    //       let userExists = false;
    //       for (let i = 0; i < this.accounts.length; i++) {
    //         if (this.accounts[i].id == this.currentUser.id) {
    //           userExists = true;
    //         }
    //       }
    //       if (!userExists) {
    //         this.accounts.push({id : this.currentUser.id, name: this.currentUser.name});
    //       }
    //     },
    //     error => {
    //       this.spinnerService.hide();
    //     }
    //   );
    // }
  }

  addDate(): void {
    if(this.start_date){
      let sdate = this.start_date ? new Date(this.start_date) : null;
      this.dateForm.patchValue({start_date: {
        date: {
          year: sdate.getFullYear(),
          month: sdate.getMonth() + 1,
          day: sdate.getDate()}
        }
      });
    }
    if(this.end_date){
      let edate = this.end_date ? new Date(this.end_date) : null;
      this.dateForm.patchValue({end_date: {
        date: {
          year: edate.getFullYear(),
          month: edate.getMonth() + 1,
          day: edate.getDate()}
        }
      });
    }
  }

  createForm() {
    this.dateForm = this.formBuilder.group({
      start_date: ['', Validators.required ],
      end_date: ['', Validators.required ]
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

  changeProject(value){
    this.dataService.changeProject(value)
    this.dataService.changePgNo(1)
  }

  changeUser(value){
    this.dataService.changeUser(value)
    this.dataService.changePgNo(1)
    this.defaultUser = value
  }

  changeActivity(value){
    this.dataService.changeActivity(value)
    this.dataService.changePgNo(1)
  }

  changeTime(value) {
    this.dataService.changeTime(value)
    this.dataService.changePgNo(1)
  }

  getValue(pgno) {
    this.dataService.changePgNo(pgno);
    const element = document.querySelector('#top-element');
    element.scrollIntoView();
    this.currentPgNo = pgno;
    if (this.defaultTime == 'between') {
      this.spinnerService.show();
      this.timesheetService.getTimesheets(this.defaultTime,
        this.defaultUser, this.currentPgNo,
        this.defaultProject, this.defaultActivity,
        this.start_date, this.end_date).subscribe(
        data => {
          this.spinnerService.hide();
          this.afterGettingTimesheets(data);
        },
        error => {
          this.spinnerService.hide();
        }
      );
    }else {
      this.getData();
    }
  }

  getData(pgno?) {
    // if (pgno != null) {
    //   console.log('not null')
    //   this.currentPgNo = 1;
    // }
    if (this.defaultTime == 'between') {
      this.dataService.startDate.subscribe(time => this.start_date = time)
      this.dataService.endDate.subscribe(time => this.end_date = time)
      this.dateShow = true;
      this.timesheetService.getTimesheets(this.defaultTime,
        this.defaultUser, this.currentPgNo,
        this.defaultProject, this.defaultActivity,
        this.start_date, this.end_date).subscribe(
        data => {
          this.spinnerService.hide();
          this.afterGettingTimesheets(data);
        },
        error => {
          this.spinnerService.hide();
        }
      );
    } else {
      this.dateShow = false;
      this.spinnerService.show();
      this.timesheetService.getTimesheets (this.defaultTime,
         this.defaultUser, this.currentPgNo,
         this.defaultProject, this.defaultActivity).subscribe(
        data => {
          this.spinnerService.hide();
          this.afterGettingTimesheets(data);
        },
        error => {
          this.spinnerService.hide();
        }
      );
    }
  }

  setTime(obj: Date) {
    obj.setHours(23, 59, 59);
    return obj;
  }

  calculateHours(timesheets) {
    let roles = JSON.parse(localStorage.getItem('currentUser')).roles;
    for (let timesheet of timesheets) {
      let date = new Date(timesheet.date);
      date.setDate( date.getDate() + 3 );
      this.setTime(date);
      if (roles.includes('admin') || roles.includes('manager') || this.timeSheetManager) {
        timesheet.edit = true;
      }else if ( new Date() <= date ) {
        timesheet.edit = true;
      }else {
        timesheet.edit = false;
      }
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
    this.usersService.changeDates(this.days);
  }

  onSubmit(value) {
    this.getDateArray(value.start_date, value.end_date);
    this.start_date = value.start_date.date.year + '-' + (value.start_date.date.month < 9 ?
       '0' : '') + value.start_date.date.month + '-' + (value.start_date.date.day < 10 ? '0' : '') + value.start_date.date.day;

    this.end_date = value.end_date.date.year + '-' + (value.end_date.date.month < 9 ?
       '0' : '') + value.end_date.date.month + '-' + (value.end_date.date.day < 10 ? '0' : '') + value.end_date.date.day;
      this.dateLessThan(this.start_date, this.end_date);
    // this.currentPgNo = 1;
    this.spinnerService.show();
    if (!this.errors.dates) {
      this.dataService.changeStartDate(this.start_date);
      this.dataService.changeEndDate(this.end_date);
      this.timesheetService.getTimesheets(this.defaultTime, this.defaultUser,
        this.currentPgNo, this.defaultProject, this.defaultActivity, this.start_date, this.end_date).subscribe(
        data => {
          this.spinnerService.hide();
          this.afterGettingTimesheets(data);
        },
        error => {
        }
      );
    }
    this.spinnerService.hide();
  }

  delete(id) {
    this.spinnerService.show();
    this.timesheetService.deleteTimesheet(id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.getData();
          this.flashService.show(data.body['message'], 'alert-success');
        } else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
      }
    );
  }

  afterGettingTimesheets(data) {
    if (data.body['success']) {
      this.pagenumber = [];
      // const accountIds = Array.from(this.accounts, account => account.id);
      // this.usersService.changeTimeSheets(data.body['result'])
      this.response = data.body['result'];
      this.timesheets = data.body['result'].timesheets;
      // if (this.manager) {
      //   const users = [];
      //   this.timesheets.map(timesheet => {
      //     const existing = [...accountIds, ...Array.from(users, user => user.id)];
      //     if (existing.indexOf(timesheet['user']['id']) === -1) {
      //       users.push(timesheet['user']);
      //     }
      //   });
      //   this.accounts = this.accounts.concat(users);
      // }

      this.count = data.body['result'].count;
      this.totalWorkedHours = data.body['result'].worked_hours;
      this.totalBilledHours = data.body['result'].billed_hours;
      for (let c = 1; c <= this.count / 50; c++) {
        this.pagenumber.push(c);
      }
      if (this.pagenumber.length < this.count / 5) {
        this.pagenumber.push(this.pagenumber.length + 1);
      }
      this.data = true;
      this.calculateHours(this.timesheets);
      if (this.timesheets.length == 0) {
        this.emptyData = true;
      }else {
        this.emptyData = false;
      }
    }else {
      this.data = false;
    }
  }

  enableDate() {
    if (this.defaultTime == 'between') {
      this.dateShow = true;
    }else {
      this.dateShow = false;
    }
  }

  downloadReport() {
    let rep = [];
    rep.push({
      's.no': '#',
      'user': 'User',
      'project_name' :  'Project Name',
      'activity_name': 'Activity Name',
      'date' : 'Date',
      'comment': 'Comment',
      'mentor': 'Mentor',
      'worked': 'Worked',
      'billed': 'Billed'
    });
    for (let i = 0; i < this.timesheets.length; i++) {
      let new_reports: any = {};
      new_reports['s.no'] = i + 1;
      new_reports.user = this.timesheets[i]['user'].name;
      new_reports.project_name = this.timesheets[i]['project'].name;
      new_reports.activity_name = this.timesheets[i]['activity'].name;
      new_reports.date = this.timesheets[i].date;
      new_reports.comment = this.timesheets[i].comment;
      new_reports.mentor = this.timesheets[i]['mentor'].name;
      new_reports.worked = this.timesheets[i].worked_hours;
      new_reports.billed = this.timesheets[i].billed_hours;
      rep.push(new_reports);
    }
    if (this.pagenumber.length > 1) {
      new Angular2Csv(rep, "Timesheets-pgno="+this.currentPgNo);
    }else {
      new Angular2Csv(rep, "Timesheets");
    }
  }
}
