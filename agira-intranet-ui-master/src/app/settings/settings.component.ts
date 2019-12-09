import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountGoalsService } from '../services/account-goals.service';
import { SettingsService } from '../services/settings.service';
import { FlashService } from '../flash/flash.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment} from '../../environments/environment';
import { ErrorService } from '../services/error.service';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(
    private accountGoalService: AccountGoalsService,
    private flashService: FlashService,
    private formBuilder: FormBuilder,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private settingsService: SettingsService,
    private errorService: ErrorService
  ) { }
  publish_all = true;
  accountGoals: any = {};
  model: any = {};
  account_id;
  cloneForm;
  assessmentForm;
  assessmentDurationForm;
  freezeForm;
  duration;
  errors ;
  ass_years;

  @ViewChild('errorModal') message: ElementRef;
  ngOnInit() {
    this.account_id = JSON.parse(localStorage.getItem('currentUser')).id;

    this.assessmentForm =  this.formBuilder.group({
      'id': '',
      'assessment_duration': '',
      'assessment_due_days': '',
      'current_assessment_year': ''
    });

    this.settingsService.getSettings().subscribe(
      data => {
        this.assessmentForm.patchValue({
          'id': data.body['result'].id,
          'assessment_duration': data.body['result'].assessment_duration,
          'assessment_due_days': data.body['result'].assessment_due_days,
          'current_assessment_year': data.body['result'].current_assessment_year
        });
        if (data.body['result'].assessment_duration === 'monthly') {
          this.duration = environment.Month;
        }else if (data.body['result'].assessment_duration === 'quarterly') {
          this.duration = environment.Quarters;
        }else if (data.body['result'].assessment_duration === 'half_yearly') {
          this.duration = environment.Half_yearly;
        }else if (data.body['result'].assessment_duration === 'yearly' ) {
          this.duration = environment.Yearly;
        }
      }, error => {
        this.errorService.errorHandling(error);
      }
    );


    this.assessmentDurationForm = this.formBuilder.group({
      'assessment_duration': ['', Validators.required],
      'assessment_year': ['', Validators.required]
    });

    this.freezeForm = this.formBuilder.group({
      'assessment_duration': ['', Validators.required],
      'assessment_year': ['', Validators.required]
    });

    this.settingsService.getAssessmentYears().subscribe(
      data => {
        this.ass_years = data.body['result'];
        for (let i = 0; i < this.ass_years.length; i++) {
          if (this.ass_years[i].is_current_year) {
            this.assessmentDurationForm.patchValue({
              'assessment_year' : this.ass_years[i].assessment_year
            });
            this.freezeForm.patchValue({
              'assessment_year' : this.ass_years[i].assessment_year
            });

          }
        }
      }, error => {
      }
    );

  }


  /* Publish all assessments for all user  */
  publishAll() {
    this.spinnerService.show();
    this.accountGoalService.publishAll(this.account_id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
        }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
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

  /* Cloning all assessments for all users */
  onSubmit(formGroup: FormGroup) {
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
    if (this.assessmentDurationForm.valid) {
      this.spinnerService.show();
      this.accountGoalService.cloneAll(this.account_id, formGroup.value).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
            if (data.body['result']) {
              this.flashService.show(data.body['message'], 'alert-success');
              this.errors = [];
              for (let i = 0; i < data.body['result'].length; i++) {
                this.errors[i] = data.body['result'][i];
              }
            }else {
              this.flashService.show(data.body['message'], 'alert-success' );
              this.router.navigateByUrl('accounts');
            }
          }
        }, error => {
          this.spinnerService.hide();
          this.errorService.errorHandling(error);
        }
      );
    }else {
      this.flashService.show('please give assessment year and duration', 'alert-danger');
    }

  }

  onFreeze(formGroup: FormGroup) {
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
    if (this.freezeForm.valid) {
      this.spinnerService.show();
      this.accountGoalService.freezeAll(this.account_id, formGroup.value).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
              this.flashService.show(data.body['message'], 'alert-success');
          }else {
              this.flashService.show(data.body['message'], 'alert-success');
          }
        }, error => {
          this.spinnerService.hide();
          this.errorService.errorHandling(error);
        }
      );
    }else {
      this.flashService.show('please give assessment year and duration', 'alert-danger');
    }

  }
  /* Change the Settings Option */
  onSubmitAssessment(value) {
    this.spinnerService.show();
    this.model = {};
    this.model.settings = value;
    this.settingsService.updateSetting(this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
        }else {
          this.flashService.show(data.body['messgae'], 'alert-danger');
        }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  onClick() {
    this.errors = null;
  }
}
