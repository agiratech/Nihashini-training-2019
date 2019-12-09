import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountsService } from '../../services/accounts.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { ErrorService } from '../../services/error.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-accounts-metrics',
  templateUrl: './accounts-metrics.component.html',
  styleUrls: ['./accounts-metrics.component.css']
})
export class AccountsMetricsComponent implements OnInit {

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router,
    private goalService: GoalService,
    private formbuilder: FormBuilder,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService

  ) { }

  account_id;
  metrics;
  goal_metrics;
  account_name;
  goals;
  metricForm: FormGroup;
  hide_metrics = true;
  years = [];
  model: any = {};
  @ViewChild('closeModal') close: ElementRef;
  errors: any = {};
  flash_active = false;
  text;
  currentUser;
  admin_manager = false;
  currentYear = new Date().getFullYear();
  emptyData = false;
  account_metrics: any = {};
  met = [];
  met1 = [];
  metricValues;



  ngOnInit() {
    /* Getting the acccount Id*/
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );

    /* Getting whether the role is admin or not  */
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin', 'manager')) {
      this.admin_manager = true;
    }

    /* Building form for creating metrics */
    this.metricForm = this.formbuilder.group({
      'goal_id': '',
      'metric_id': '',
      'assessment_year': this.currentYear
    });

     this.getMetrics();

     /* Getting all the goals */
    this.goalService.getGoals(true).subscribe(
      data => {
        this.goals = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
    this.years.push(new Date().getFullYear() - 1);
    this.years.push(new Date().getFullYear());
    this.years.push(new Date().getFullYear() + 1);
  }

  /* getting all the metrics for the goal */
  selectMetric(id) {
      this.goalService.goalDetails(id).subscribe(
        data => {
          this.goal_metrics = data.body['result'].metrics;
          this.hide_metrics = false;
        },
        error => {
          this.errorService.errorHandling(error);
        }
      );
  }

  /* Creating metrics for that account */
  onSubmit(formData) {
    this.spinnerService.show();
    formData.account_id = this.account_id;
    this.model.accounts_metrics = formData;
    this.accountsService.createMetrics(this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.metricForm.patchValue({
            'goal_id': '',
            'metric_id' : '',
            'assessment_year': this.currentYear
          });
          this.metrics.push(data.body['result']);
          this.flashService.show(data.body['message'], 'alert-success');
          this.close.nativeElement.click();
        } else {
          this.flash_active = true;
          this.text = data.body['message'];
          this.errors = data.body['result'];
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  /*Deleting metrics for that account */
  delete(id) {
    this.spinnerService.show();
    this.accountsService.deleteMetrics(this.account_id, id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getMetrics();
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

  /* Building metrics form for creating mrtrics */
  getMetrics() {
    this.metricForm.patchValue({
      'metric_id' : '',
      'assessment_year': this.currentYear
    });
    /* Get Account Metrics for the user  */
    this.accountsService.getMetrics(this.account_id, this.currentYear).subscribe(
      data => {
        this.metrics = data.body['result'].account_metrics;
        if (this.metrics.length === 0) {
          this.emptyData = true;
        }else {
          this.emptyData = false;
        }
      },
      error => {
        this.errorService.errorHandling(error)
      }
    );
  }

}
