import { Component, OnInit } from '@angular/core';
import { AccountMetricsService } from '../../services/account-metrics.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MetricService } from '../../services/metric.service';
import { AccountsService } from '../../services/accounts.service';
import { ErrorService } from '../../services/error.service';
import { FlashService } from '../../flash/flash.service';
import { GoalService } from '../../services/goal.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';



@Component({
  selector: 'app-edit-account-metrics',
  templateUrl: './edit-account-metrics.component.html',
  styleUrls: ['./edit-account-metrics.component.css']
})
export class EditAccountMetricsComponent implements OnInit {

  constructor(
    private accountMetricService: AccountMetricsService,
    private accountsService: AccountsService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private goalService: GoalService,
    private metricService: MetricService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService
  ) { }

  accountMetricForm;
  accountGoal_id;
  account_id;
  account_name;
  accountMetric_id;
  goals;
  goal_metrics;
  hide_metrics = true;
  metric_details = true;
  model: any = {};
  metricDetails;
  current_goal;
  metrics: any = {};
  metricError: any = {};

  ngOnInit() {
    this.accountMetricForm = this.formBuilder.group({
      'id': '',
      'accounts_goal_id': '',
      'goal_id': '',
      'goal_name': '',
      'metric_id': '',
      'metric_score': '',
      'metric_description': ''
    });

    this.route.params.subscribe(
      params => {
        this.account_id = params['id'],
        this.accountGoal_id = params['accountGoal_id'];
        this.accountMetric_id = params['accountMetric_id'];
      }
    );

    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    this.goalService.getGoals(true).subscribe(
      data => {
        this.goals = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    this.accountMetricService.getAccountMetricDetails(this.account_id, this.accountGoal_id, this.accountMetric_id).subscribe(
      data => {
        if (data.body['success']) {
          this.goalService.goalDetails(data.body['result'].goal.id).subscribe(
            data => {
             this.goal_metrics = data.body['result'].metrics;
             for (let k = 0; k < this.goal_metrics.length; k++) {
              this.metrics[this.goal_metrics[k].id] = this.goal_metrics[k].description;
             }
            }, error => {
              this.errorService.errorHandling(error);
            }
          );
          this.current_goal = data.body['result'].name;
          this.metricDetails = data.body['result'];
          this.accountMetricForm.patchValue({
            'id': this.metricDetails.id,
            'accounts_goal_id': this.metricDetails.accounts_goal_id,
            'goal_id':  data.body['result'].goal.id,
            'goal_name':  data.body['result'].goal.name,
            'metric_id':  this.metricDetails.metric.id,
            'metric_score':  this.metricDetails.metric.score,
            'metric_description':  this.metricDetails.metric.description
          });
        }else {
          window.alert(data.body['message']);
          this.location.back();
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  metricDescription(id) {
    this.metricError = {};
    this.accountMetricForm.patchValue({
      'metric_description': this.metrics[id]
    });
  }

  selectMetric(id) {
    this.goalService.goalDetails(id).subscribe(
      data => {
        this.goal_metrics = data.body['result'].metrics;
        this.accountMetricForm.patchValue({
          'id': this.metricDetails.id,
          'accounts_goal_id': this.metricDetails.accounts_goal_id,
          'goal_id':  this.metricDetails.goal.id,
          'metric_id':  this.metricDetails.metric.id,
          'metric_score':  this.metricDetails.metric.score,
          'metric_description':  this.metricDetails.metric.description
        });
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  onSubmit(value) {
    this.model.account_metrics = value;
    this.spinnerService.show();
    this.accountMetricService.updateAccountMetrics(this.account_id, this.accountGoal_id, value.id, this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.metricError = {};
          this.router.navigateByUrl('/accountGoals/' + this.accountGoal_id + '/metrics');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
          this.metricError = data.body['result'];
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  locationBack() {
    this.location.back();
  }
}
