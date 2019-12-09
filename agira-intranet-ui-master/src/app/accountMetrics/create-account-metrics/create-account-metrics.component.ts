import { Component, OnInit } from '@angular/core';
import { AccountMetricsService } from '../../services/account-metrics.service';
import { AccountsService } from '../../services/accounts.service';
import { GoalService } from '../../services/goal.service';
import { TemplatesService } from '../../services/templates.service';
import { AuthenticationService } from '../../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MetricService } from '../../services/metric.service';
import { AccountGoalsService } from '../../services/account-goals.service';
import { ErrorService } from '../../services/error.service';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Location } from '@angular/common';
import { TemplatesMetricService } from '../../services/templates-metric.service';

@Component({
  selector: 'app-create-account-metrics',
  templateUrl: './create-account-metrics.component.html',
  styleUrls: ['./create-account-metrics.component.css']
})

export class CreateAccountMetricsComponent implements OnInit {

  constructor(
    private accountMetricService: AccountMetricsService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private goalService: GoalService,
    private metricService: MetricService,
    private flashService: FlashService,
    private accountsService: AccountsService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService,
    private accountGoalsService: AccountGoalsService,
    private authenticationservice: AuthenticationService,
    private templatesService: TemplatesService,
    private templatesMetricService: TemplatesMetricService
  ) {  }

  oldValue = [] ;
  oldMetricValue = [[]];
  accountMetricForm;
  accountGoal_id;
  account_id;
  account_name;
  allGoals;
  goal_metrics= [];
  hide_metrics = true;
  metric_details = true;
  model: any = {};
  goals: any = [];
  metrics: any = [];
  goal: any = {};
  metric: any = {};
  metricErrorMessage: any = [];
  metricError: any = [];
  goalErrorMessage: any = [];
  goalError: any = [];
  goalScoreErrorMessage: any = [];
  goalScoreError: any = [];
  goalMetrics = {};
  is_Admin;
  allTemplates: any = [];
  // i ;

  ngOnInit() {
    /* Taking values from the url */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'],
        this.accountGoal_id = params['accountGoal_id'];
      }
    );

    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });

    /* Getting Account Details */
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.account_name = data.body['result'].name;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    /* getting all goals */
    this.goalService.getGoals(true).subscribe(
      data => {
        this.allGoals = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    this.templatesService.getTemplates('clone template').subscribe(
      data => {
        this.allTemplates = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );

    /* Building the Account Metrics Form */
    this.accountMetricForm =  this.formBuilder.group({
      'accounts_goal_id': this.accountGoal_id,
      'goals': this.formBuilder.array([
        this.createGoal()
       ])
    });

    this.accountMetricService.getAccountMetrics(this.account_id, this.accountGoal_id).subscribe(
      data => {
        /* Creating account metrics object structure same as the form structure */
        let accmet = data.body['result'];
        let new_data: any = {};
        let go = [];
        let goal_obj: any = {};
        let old_goal_id;
        let mt = [];
        let metric_obj: any = {};
        let test = {};
        if (accmet.length >= 1) {
        for (let i = 0; i < accmet.length; i++) {
          new_data.accounts_goal_id = accmet[i].account_goal_id;
          if (i === 0) {
            goal_obj.goal_id = accmet[i].goal.id;
            goal_obj.goal_score = accmet[i].goal.score;
            metric_obj = {};
            metric_obj.metric_id = accmet[i].metric.id;
            metric_obj.metric_description = accmet[i].metric.description;
            metric_obj.metric_score = accmet[i].metric.score;
            mt.push(metric_obj);
            if (accmet.length < 2) {
              goal_obj.metrics = mt;
              go.push(goal_obj);
            }
            continue;
          }
          if (accmet[i].goal.id != accmet[i - 1].goal.id ) {
            goal_obj.metrics = mt;
            go.push(goal_obj);
            mt = [];
            goal_obj = {};
          }
          goal_obj.goal_id = accmet[i].goal.id;
          goal_obj.goal_score = accmet[i].goal.score;
          metric_obj = {};
          metric_obj.metric_id = accmet[i].metric.id;
          metric_obj.metric_description = accmet[i].metric.description;
          metric_obj.metric_score = accmet[i].metric.score;
          mt.push(metric_obj);
          if (i == accmet.length - 1) {
            goal_obj.metrics = mt;
            go.push(goal_obj);
            mt = [];
            goal_obj = {};
          }
        }
        new_data.goals = go;
        this.accountMetricForm.patchValue({
          'accounts_goal_id': new_data.accounts_goal_id
        });
        for (let k = 0; k < new_data.goals.length; k++) {
          this.hide_metrics = false;
          if (k >= 1) {
            const control = <FormArray>this.accountMetricForm.controls['goals'];
            control.push(this.createGoal());
          }

          for (let j = 1; j <= new_data.goals[k].metrics.length; j++) {
            this.oldMetricValue.push([]);
            let metric_id = new_data.goals[k].metrics[j - 1].metric_id;
            this.oldValue[k] = new_data.goals[k].goal_id;
            this.oldMetricValue[k][j - 1] = +metric_id;
            if (j >  1) {
              const control = <FormArray>this.accountMetricForm.controls.goals.controls[k].controls.metrics;
              control.push(this.createMetric());
            }
            if (this.metric[metric_id]) {
              this.metricError[metric_id] = true;
              this.metric[metric_id] = this.metric[metric_id] + 1;
              this.metricErrorMessage[metric_id] = 'Metric has been already selected';
            }else {
              this.metric[metric_id] = 1;
              this.metricError[metric_id] = false;
              this.metricErrorMessage[metric_id] = '';
            }
          }
          this.goalService.goalDetails(new_data.goals[k].goal_id).subscribe(
            data => {
             const id = new_data.goals[k].goal_id;
             this.goal[id] = 1;
             this.goalError[id] = false;
             this.goalErrorMessage[id] = '';
              this.goal_metrics[id] = data.body['result'].metrics;
              for (let l = 0 ; l < this.goal_metrics[id].length; l++) {
                this.goalMetrics[this.goal_metrics[id][l].id] = this.goal_metrics[id][l].description;
               }
            }, error => {
            }
          );
          this.accountMetricForm.controls.goals.controls[k].patchValue(new_data.goals[k]);
        }
      }
      }, error => {
      }
    );
  }

  /* Creating Goal in the Form */
  createGoal() {
    return this.formBuilder.group({
      'goal_id': ['', Validators.required],
      'goal_score': ['', Validators.required],
      'metrics': this.formBuilder.array([ this.createMetric() ])
    });
  }

  /* Creating metrics in the goal */
  createMetric() {
    return this.formBuilder.group({
      'metric_id': ['', Validators.required],
      'metric_description': ['', Validators.required],
      'metric_score': ['']
    });
  }

  /* Adding Goal to the Form */
  addGoal() {
    this.oldMetricValue.push([]);
    const control = <FormArray>this.accountMetricForm.controls['goals'];
    control.push(this.createGoal());
  }
  /* Adding Metric to the form  */
  addMetric(goal): void {
    const control = <FormArray>goal.controls.metrics;
    control.push(this.createMetric());
  }

  /* Removing Goal from the form */
  removeGoal(i: number, id) {
    for (let k = 0; k < this.accountMetricForm.controls.goals.controls[i].controls.metrics.length; k++) {
      let metric_id = this.accountMetricForm.controls.goals.controls[i].controls.metrics.controls[k].controls.metric_id.value;
     if (metric_id === 1) {
      delete this.metric[metric_id];
      this.metricErrorMessage = '';
     } else {
       this.metric[metric_id] = this.metric[metric_id]  - 1;
     }
    }
    if (this.goal[id] === 1) {
      delete this.goal[id];
      this.goalError[id] = '';
    }else if (this.goal[id] > 1) {
      this.goal[id] = this.goal[id] - 1;
      if (this.goal[id] === 1) {
        this.goalError[id] = '';
      }
    }
    const control = <FormArray>this.accountMetricForm.controls['goals'];
    control.removeAt(i);
  }

  /* Removing Metric from the Goal in the Form  */
  removeMetric(goal, j: number, id) {
    if (this.metric[id] === 1) {
      delete this.metric[id];
      this.metricErrorMessage[id] = '';
    }else if (this.metric[id] > 1) {
      this.metric[id] = this.metric[id] - 1;
      if (this.metric[id] === 1) {
        this.metricErrorMessage[id] = '';
      }
    }
    const control = <FormArray>goal.controls.metrics;
    control.removeAt(j);
  }

  /* Getting Metrics from the selected Goal */
  selectGoal(id, i, old) {
    this.spinnerService.show();
    /* getting goal details from the selected goal value */
    this.goalService.goalDetails(id).subscribe(
      data => {
        this.goal_metrics[id] = data.body['result'].metrics;
        for (let k = 0 ; k < this.goal_metrics[id].length; k++) {
         this.goalMetrics[this.goal_metrics[id][k].id] = this.goal_metrics[id][k].description;
        }
        this.hide_metrics = false;
        this.spinnerService.hide();
      },
      error => {
        this.spinnerService.hide();
        this.hide_metrics = true;
        this.errorService.errorHandling(error);
      }
    );

    for (let k = 0; k < this.accountMetricForm.controls.goals.controls[i].controls.metrics.length; k++) {
      const metric_id = this.accountMetricForm.controls.goals.controls[i].controls.metrics.controls[k].controls.metric_id.value;
      if (this.metric[metric_id] === 1) {
      delete this.metric[metric_id];
      this.metricErrorMessage[metric_id] = '';
      } else if (this.metric[metric_id] > 1) {
      this.metric[metric_id] = this.metric[metric_id] - 1;
      if (this.metric[metric_id] === 1) {
        this.metricErrorMessage[id] = '';
      }
      }else {
      }
    }

    /*Removing all the old metrics html if they selected new one  */
    const control = this.accountMetricForm.controls.goals.controls[i].controls.metrics;
    for (let i = control.length; i > 0; i--) {
      control.removeAt(i);
    }
    /*Removing the goal from the array if the count is 0 orelse reducing the count */
    if (this.goal[old] === undefined) {
    }else if (this.goal[old] === 1) {
      delete this.goal[old];
    }else if (this.goal[old] > 1) {
      this.goal[old] = this.goal[old] - 1;
      this.goalErrorMessage[old] = '';
    }else {
    }

    /*Writing the error Message depending on the goal is present or not */
    if (this.goal[id]) {
      this.accountMetricForm.controls.goals.controls[i].controls.metrics.controls[0].patchValue({
        'metric_id':  '',
        'metric_description': '',
        'metric_score': ''
      });
      this.goalError[id] = true;
      this.goal[id] = this.goal[id] + 1;
      this.goalErrorMessage[id] = 'Goal has been already selected';
    }else {
      this.accountMetricForm.controls.goals.controls[i].controls.metrics.controls[0].patchValue({
        'metric_id': '',
        'metric_description': '',
        'metric_score': ''
      });
      this.goal[id] = 1;
      this.goalError[id] = false;
      this.goalErrorMessage[id] = '';
    }
  }

  /* Getting Metric Details from the selected Metrics */
  metricDetails(id, met, i, j, old) {

    /*Getting the metric Details from the selected metric */
    met.patchValue({
      'metric_id': id,
      'metric_description': this.goalMetrics[id],
      'metric_score': ''
    });

    /*Removing the Metric from the array if the count is 0 orelse reducing the count */
    if (this.metric[old] === undefined) {
    } else if (this.metric[old] === 1) {
      delete this.metric[old];
      this.metricErrorMessage[old] = '';
    }else if (this.metric[old] > 1) {
      this.metric[old] = this.metric[old] - 1;
      this.metricErrorMessage[old] = '';
    }else {
    }

    /*Writing the error Message depending on the goal is present or not */
    if (this.metric[id]) {
      this.metricError[id] =  true;
      this.metric[id] = this.metric[id] + 1;
      this.metricErrorMessage[id] = 'Metric has been already selected';
    }else {
      this.metric[id] = 1;
      this.metricError[id] = false;
      this.metricErrorMessage[id] = '';
    }
  }

  /* adding the data to the database on form submit */
  onSubmit(value) {
    if (this.accountMetricForm.valid) {
      this.spinnerService.show();
      this.model.account_metrics = value;
      let error = false;
      for (let i = 0; i < value.goals.length; i++) {
        const goal_score = value.goals[i].goal_score;
        let metric_score = 0;
        let optionalMetricExists = false;
        for (let j = 0; j < value.goals[i].metrics.length; j++) {
          if (value.goals[i].metrics[j].metric_score == null) {
            optionalMetricExists = true;
          }
          metric_score += +value.goals[i].metrics[j].metric_score;
        }
        if ((goal_score != metric_score && optionalMetricExists === false) ||  goal_score < metric_score) {
          error = true;
          this.goalScoreError[value.goals[i].goal_id] = true;
          this.goalScoreErrorMessage[value.goals[i].goal_id] = 'Metric Scores should be equal to the goals score';
        } else {
          this.goalScoreError[value.goals[i].goal_id] = false;
          this.goalScoreErrorMessage[value.goals[i].goal_id] = '';
        }
      }
      if (error === true) {
        this.spinnerService.hide();
        this.flashService.show('please fix the errors in the form', 'alert-danger');
      }else {
        this.accountMetricService.createMetric(this.model, this.account_id, this.accountGoal_id).subscribe(
          data => {
            this.spinnerService.hide();
            if (data.body['success']) {
              this.flashService.show(data.body['message'], 'alert-success');
              this.router.navigateByUrl('/accountGoals/' + this.accountGoal_id + '/metrics');
            }else {
              this.flashService.show(data.body['message'], 'alert-danger');
              // this.metricError[data.body['result'].id[0]] =true
              // this.metricErrorMessage[data.body['result'].id[0]] = data.body['result'].metric_id[0]
              this.goalScoreErrorMessage = data.body['result'];
            }
          },
          error => {
            this.spinnerService.hide();
            this.errorService.errorHandling(error);
          }
        );
      }
    }else {
      this.flashService.show('please fix the errors in the form', 'alert-danger');
    }
  }

  locationBack() {
    this.location.back();
  }

  selectTemplate(template_id){
    if(template_id != ""){
      this.templatesMetricService.getTemplateMetrics(template_id).subscribe(
        data => {
          /* Building the Account Metrics Form */
          this.accountMetricForm =  this.formBuilder.group({
            'accounts_goal_id': this.accountGoal_id,
            'goals': this.formBuilder.array([
              this.createGoal()
             ])
          });
          let accmet = data.body['result'];
          let new_data: any = {};
          let go = [];
          let goal_obj: any = {};
          let old_goal_id;
          let mt = [];
          let metric_obj: any = {};
          let test = {};
          if (accmet.length >= 1) {
          for (let i = 0; i < accmet.length; i++) {
            new_data.accounts_goal_id = accmet[i].account_goal_id;
            if (i === 0) {
              goal_obj.goal_id = accmet[i].goal.id;
              goal_obj.goal_score = accmet[i].goal.score;
              metric_obj = {};
              metric_obj.metric_id = accmet[i].metric.id;
              metric_obj.metric_description = accmet[i].metric.description;
              metric_obj.metric_score = accmet[i].metric.score;
              mt.push(metric_obj);
              if (accmet.length < 2) {
                goal_obj.metrics = mt;
                go.push(goal_obj);
              }
              continue;
            }
            if (accmet[i].goal.id != accmet[i - 1].goal.id ) {
              goal_obj.metrics = mt;
              go.push(goal_obj);
              mt = [];
              goal_obj = {};
            }
            goal_obj.goal_id = accmet[i].goal.id;
            goal_obj.goal_score = accmet[i].goal.score;
            metric_obj = {};
            metric_obj.metric_id = accmet[i].metric.id;
            metric_obj.metric_description = accmet[i].metric.description;
            metric_obj.metric_score = accmet[i].metric.score;
            mt.push(metric_obj);
            if (i == accmet.length - 1) {
              goal_obj.metrics = mt;
              go.push(goal_obj);
              mt = [];
              goal_obj = {};
            }
          }
          new_data.goals = go;
          this.accountMetricForm.patchValue({
            'accounts_goal_id': new_data.accounts_goal_id
          });
          for (let k = 0; k < new_data.goals.length; k++) {
            this.hide_metrics = false;
            if (k >= 1) {
              const control = <FormArray>this.accountMetricForm.controls['goals'];
              control.push(this.createGoal());
            }

            for (let j = 1; j <= new_data.goals[k].metrics.length; j++) {
              this.oldMetricValue.push([]);
              let metric_id = new_data.goals[k].metrics[j - 1].metric_id;
              this.oldValue[k] = new_data.goals[k].goal_id;
              this.oldMetricValue[k][j - 1] = +metric_id;
              if (j >  1) {
                const control = <FormArray>this.accountMetricForm.controls.goals.controls[k].controls.metrics;
                control.push(this.createMetric());
              }
              if (this.metric[metric_id]) {
                this.metricError[metric_id] = true;
                this.metric[metric_id] = this.metric[metric_id] + 1;
                // this.metricErrorMessage[metric_id] = 'Metric has been already selected';
              }else {
                this.metric[metric_id] = 1;
                this.metricError[metric_id] = false;
                this.metricErrorMessage[metric_id] = '';
              }
            }
            this.goalService.goalDetails(new_data.goals[k].goal_id).subscribe(
              data => {
               const id = new_data.goals[k].goal_id;
               this.goal[id] = 1;
               this.goalError[id] = false;
               this.goalErrorMessage[id] = '';
                this.goal_metrics[id] = data.body['result'].metrics;
                for (let l = 0 ; l < this.goal_metrics[id].length; l++) {
                  this.goalMetrics[this.goal_metrics[id][l].id] = this.goal_metrics[id][l].description;
                 }
              }, error => {
              }
            );
            this.accountMetricForm.controls.goals.controls[k].patchValue(new_data.goals[k]);

            }

          }
        }, error => {
        }
      );
    }

  }
}
