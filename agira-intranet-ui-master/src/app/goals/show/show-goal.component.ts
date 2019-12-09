import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MetricService } from '../../services/metric.service';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';



@Component({
  selector: 'app-show-goal',
  templateUrl: './show-goal.component.html',
  styleUrls: ['./show-goal.component.css']
})
export class ShowGoalComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goalService: GoalService,
    private formBuilder: FormBuilder,
    private metricservice: MetricService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService


  ) { }

  goal_id;
  goal;
  metricForm: FormGroup;
  metric;
  model: any = {};
  emptyData = false;
  @ViewChild('closeModal') close: ElementRef;
  ngOnInit() {
    /* getting goal Id */
    this.route.params.subscribe(
      params => {
        this.goal_id = params['id'];
      });

    /* Building metric form for creating metrics */
    this.metricForm = this.formBuilder.group({
      'id': '',
      'name': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required])
    });

    this.spinnerService.show();

    this.goalService.goalDetails(this.goal_id).subscribe(
      data => {
        this.spinnerService.hide();
        this.goal = data.body['result'];
        if (this.goal.metrics.length === 0) {
          this.emptyData = true;
        }else {
          this.emptyData = false;
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Getting Goal Details */
  editForm(metric) {
    this.metricservice.metricDetails(metric.id).subscribe(
      data => {
      if (data.body['success']) {
        this.metric = data.body['result'];
        this.metricForm.patchValue({
          'id': this.metric.id,
          'name': this.metric.name,
          'description': this.metric.description
        });
      }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Building new form for metrics */
  newForm() {
    this.metricForm.patchValue({
      'id': '',
      'name': '',
      'description': ''
    });
  }

  /* Updating Account Goals */
  onSubmit(formData) {
    this.spinnerService.show();
    formData.goal_id = this.goal_id;
    this.model.metric = formData;
    if (formData.id) {
      this.metricservice.updateMetric(this.model).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
            this.close.nativeElement.click();
            this.goalDetails();
            this.metricForm.patchValue({
              'id': '',
              'name': '',
              'description': ''
            });
          }
        },
        error => {
          this.spinnerService.hide();
          this.errorService.errorHandling(error);
        }
      );
    }else {
      this.metricservice.createMetric(this.model).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
            this.close.nativeElement.click();
            this.goalDetails();
          }
        },
        error => {
          this.spinnerService.hide();
          this.errorService.errorHandling(error);
        }
      );
    }
  }

  /* Getting Goal Details */
  goalDetails() {
    this.goalService.goalDetails(this.goal_id).subscribe(
      data => {
        this.goal = data.body['result'];
        if (this.goal.metrics.length === 0) {
          this.emptyData = true;
        }else {
          this.emptyData = false;
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }
  /* Deleting Metrics */
  delete(id) {
    this.spinnerService.show();
    this.metricservice.deleteMetric(id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.goalService.goalDetails(this.goal_id).subscribe(
            data1 => {
              this.goal = data1.body['result'];
            },
            error => {
              this.errorService.errorHandling(error);
            }
          );
          this.flashService.show(data.body['message'], 'alert-success');
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

}
