import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TemplatesMetricService } from '../../services/templates-metric.service';
import { TemplatesService } from '../../services/templates.service';
import { AuthenticationService } from '../../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import {Location} from '@angular/common';
import { start } from 'repl';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import { SettingsService } from '../../services/settings.service';
import { ErrorService } from '../../services/error.service';
declare var $: any;

@Component({
  selector: 'app-list-template-metrics',
  templateUrl: './list-template-metrics.component.html',
  styleUrls: ['./list-template-metrics.component.css']
})
export class ListTemplateMetricsComponent implements OnInit {

  currentUser;
  constructor(
    private templatesMetricService: TemplatesMetricService,
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
    private flashService: FlashService,
    private formBuilder: FormBuilder,
    private authenticationservice: AuthenticationService,
    private location: Location,
    private spinnerService: Ng4LoadingSpinnerService,
    private settingsService: SettingsService,
    private errorService: ErrorService
  )
  {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin') /*|| this.currentUser['roles'].includes('manager')*/) {
      this.authenticationservice.changeAdmin(false);
    } else {
      this.authenticationservice.changeAdmin(true);
    }
  }

  template_id;
  templateMetrics;
  noData = false;
  score = {};
  templateName;

  ngOnInit() {
    /* Getting Account Id and Assessment Id */
    this.route.params.subscribe(
      params => {
        this.template_id = params['id']
      }
    );
    this.templatesMetrics()
  }

  /* Getting Account Metrics for the User  */
  templatesMetrics() {
    this.spinnerService.show();
    this.templatesMetricService.getTemplateMetrics(this.template_id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.templateMetrics = data.body['result'];
          this.templateName = data.body['template_name'];
          if (this.templateMetrics.length == 0) {
            this.noData = true;
          }else {
            this.noData = false;
          }
          for (let i = 0; i < this.templateMetrics.length; i++) {
            if (this.templateMetrics[i].metric.assessment != null) {
              if (this.templateMetrics[i].metric.assessment.score != null) {
                this.score[this.templateMetrics[i].id] = this.templateMetrics[i].metric.assessment.score;
              }else {
                this.score[this.templateMetrics[i].id] = '';
              }
            }else {
              this.score[this.templateMetrics[i].id] = '';
            }
          }
        }else {
          window.alert(data.body['message']);
          this.location.back();
          // this.router.navigateByUrl('account/'+this.account_id+'/accountGoals')
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  onBack() {
    this.location.back();
  }


}
