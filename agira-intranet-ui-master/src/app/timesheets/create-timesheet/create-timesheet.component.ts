import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ActivityService } from '../../services/activity.service';
import { TimesheetService } from '../../services/timesheet.service';
import { FlashService } from '../../flash/flash.service';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import {INgxMyDpOptions} from 'ngx-mydatepicker';


@Component({
  selector: 'app-create-timesheet',
  templateUrl: './create-timesheet.component.html',
  styleUrls: ['./create-timesheet.component.css']
})
export class CreateTimesheetComponent implements OnInit {

  timesheetForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private timesheetService: TimesheetService,
    private flashService: FlashService,
    private location: Location,
    private router: Router,
    private activityService: ActivityService
  ) { }

  projects;
  activities;
  currentUser;
  defaultProjects:any = [];
  hideBilledHours:boolean = false;
  myOptions: INgxMyDpOptions = {
    dateFormat: 'mmm dd, yyyy',
    showTodayBtn: false,
    yearSelector: false,
    sunHighlight: false,
    showSelectorArrow: false,
    alignSelectorRight: false,
    firstDayOfWeek: 'su'
  };
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const date = new Date();
    this.timesheetForm = this.formBuilder.group({
      'account_id': this.currentUser.id,
      'project_id': ['', Validators.required],
      'activity_id': ['', Validators.required],
      'worked_hours': ['', Validators.required],
      'billed_hours': '',
      'comment': ['', Validators.required],
      'date': [this.stringToDate(date), Validators.required]
    });
    this.projectService.getProjects().subscribe(
      data => {
        this.projects = data.body['result'];
        this.defaultProjects = data.body['default_projects'];
      },
      error => {
      }
    );
    this.activityService.getActivities().subscribe(
      data => {
        this.activities = data.body['result'];
      }, error => {
      }
    );
  }
  validateFormGroup(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
          control.markAsTouched({
              onlySelf: true
          });
      } else if (control instanceof FormGroup) {
          this.validateFormGroup(control);
      }
    });
  }

  onSubmit(formGroup: FormGroup) {
    this.validateFormGroup(formGroup);
    if (this.timesheetForm.valid) {
      formGroup.value.date = this.dateToString(formGroup.value.date);
      this.timesheetService.createTimesheet(formGroup.value).subscribe(
        data => {
          if (data.body['success']) {
            this.flashService.show(data.body['message'], 'alert-success');
            this.router.navigateByUrl('timesheets');
          }else {
            this.timesheetForm.patchValue({
              'date': this.stringToDate(formGroup.value.date)
            });
            this.flashService.show(data.body['message'], 'alert-danger');
          }
        },
        error => {
        }
      );
    } else {
      this.flashService.show('Timesheet cannot be updated - check error messages', 'alert-danger');
    }
  }

  locationBack() {
    this.location.back();
  }

  dateToString(value) {
    const dateString =  value.date.year + '-' +
    (value.date.month < 9 ? '0' : '') + value.date.month + '-' +
     (value.date.day < 10 ? '0' : '') + value.date.day;
     return dateString;
  }
  stringToDate(value) {
    const dateObject = { date: { year: value.getFullYear(),
      month: (value.getMonth() + 1), day: (value.getDate()) } };
      return dateObject;
  }

  getProject(value){
    if(this.defaultProjects.includes(+value)){
      this.timesheetForm.controls['billed_hours'].setValue("");
      this.hideBilledHours = true;
    }else{
      this.hideBilledHours = false;
    }
  }
}
