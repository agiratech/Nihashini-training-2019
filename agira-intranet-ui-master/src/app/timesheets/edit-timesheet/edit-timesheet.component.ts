import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { TimesheetService } from '../../services/timesheet.service';
import { FlashService } from '../../flash/flash.service';
import { Router, ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import {INgxMyDpOptions} from 'ngx-mydatepicker';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { ActivityService } from '../../services/activity.service';
import { ValueTransformer } from '@angular/compiler/src/util';




@Component({
  selector: 'app-edit-timesheet',
  templateUrl: './edit-timesheet.component.html',
  styleUrls: ['./edit-timesheet.component.css']
})
export class EditTimesheetComponent implements OnInit {

  timesheetForm: FormGroup;
  timesheet_id;
  currentUser;
  projects;
  activities;
  myOptions: INgxMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    showTodayBtn: false,
    yearSelector: false,
    sunHighlight: false,
    showSelectorArrow: false,
    alignSelectorRight: false,
    firstDayOfWeek: 'su'
  };

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private timesheetService: TimesheetService,
    private flashService: FlashService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private activityService: ActivityService

  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.timesheetForm = this.formBuilder.group({
      'id': '',
      'account_id': this.currentUser.id,
      'project_id': ['', Validators.required],
      'activity_id': ['', Validators.required],
      'worked_hours': ['', Validators.required],
      'billed_hours': '',
      'comment': ['', Validators.required],
      'date': ['', Validators.required]
    });

    this.route.params.subscribe(
      params => {
        this.timesheet_id = params['id'];
      }
    );

    this.projectService.getProjects().subscribe(
      data => {
        this.projects = data.body['result'];
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



    this.timesheetService.getTimesheet(this.timesheet_id).subscribe(
      data => {
        if (data.body['success']) {
          const timesheet_date = new Date( data.body['result'].date );
          this.timesheetForm.patchValue({
            'id': data.body['result'].id,
            'account_id': data.body['result'].user.id,
            'project_id': data.body['result'].project.id,
            'activity_id': data.body['result'].activity.id,
            'worked_hours': data.body['result'].worked_hours,
            'billed_hours': data.body['result'].billed_hours,
            'comment': data.body['result'].comment,
            'date': this.stringToDate(timesheet_date)
          });
        }else {
          this.locationBack();
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
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
      this.timesheetService.updateTimesheet(formGroup.value).subscribe(
        data => {
          if (data.body['success']) {
            this.router.navigateByUrl('timesheets');
            this.flashService.show(data.body['message'], 'alert-success');
          } else {
            this.locationBack();
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

}
