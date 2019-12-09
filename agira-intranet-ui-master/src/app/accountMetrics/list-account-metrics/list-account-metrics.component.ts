import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountMetricsService } from '../../services/account-metrics.service';
import { AuthenticationService } from '../../authentication.service';
import { AccountsService } from '../../services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { AccountGoalsService } from '../../services/account-goals.service';
import {Location} from '@angular/common';
import { start } from 'repl';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import { SettingsService } from '../../services/settings.service';
import { ErrorService } from '../../services/error.service';
declare var $: any;

@Component({
  selector: 'app-list-account-metrics',
  templateUrl: './list-account-metrics.component.html',
  styleUrls: ['./list-account-metrics.component.css']
})

export class ListAccountMetricsComponent implements OnInit {

  constructor(
    private accountMetricService: AccountMetricsService,
    private router: Router,
    private route: ActivatedRoute,
    private flashService: FlashService,
    private formBuilder: FormBuilder,
    private accountsService: AccountsService,
    private authenticationservice: AuthenticationService,
    private accountsgoalservice: AccountGoalsService,
    private location: Location,
    private spinnerService: Ng4LoadingSpinnerService,
    private settingsService: SettingsService,
    private errorService: ErrorService

  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser['roles'].includes('admin') /*|| this.currentUser['roles'].includes('manager')*/) {
      this.authenticationservice.changeAdmin(false);
    } else {
      this.authenticationservice.changeAdmin(true);
    }
   }


  accountGoal_id;
  account_id;
  accountMetrics;
  accountGoalDetails: any = {};
  account_name;
  currentUser;
  is_Admin;
  color = false;
  accountMetricForm;
  model: any = {};
  current_goal;
  current_description;
  update = {};
  goals = {};
  newmodel: any = {};
  values = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  show_comments = false;
  save_comments = false;
  date_validation = false;
  finish = false;
  show_appraiserScore = false;
  submit_review = false;
  appraiser_score = {};
  score = {};
  appraiser_comment = {};
  validationErrors: any = {};
  accept = false;
  add_comment = false;
  appraiser = false;
  reviewer = false;
  publish;
  employee_comments = false;
  noData = false;
  release = false;
  todayDate = new Date();
  team_assessments = false;
  self_assessments = false;
  assessment_due_days;
  billingHours;
  billingPercentage;
  errorMsg = ''
  @ViewChild('closeModal') close: ElementRef;
  @ViewChild('closeModal1') close1: ElementRef;

  ngOnInit() {
    /* Getting Account Id and Assessment Id */
    this.route.params.subscribe(
      params => {
        this.account_id = params['id'],
        this.accountGoal_id = params['accountGoal_id'];
      }
    );
    this.settingsService.getSettings().subscribe(
      data => {
        this.assessment_due_days = data.body['result'].assessment_due_days;
      }, error => {
        this.errorService.errorHandling(error);
      }
    );

    /* Building Account Metric for the user  */
    this.accountMetricForm =  this.formBuilder.group({
      'id': '',
      'appraisee_comment': ['', Validators.required]
    });

    /* Getting Assessment Details for the User */
    this.assessmentDetails();
    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });
    this.accountsMetrics();
  }
  assessmentDetails() {
    this.accountsgoalservice.accountGoalDetails(this.accountGoal_id).subscribe(
      data => {
        if (data.body['success']) {
         this.accountGoalDetails = data.body['result'];
         this.billingHours = data.body['billing_hours'];
         this.billingPercentage = data.body['billing_percentage'];
         this.account_id = this.currentUser.id;
         if (this.account_id == this.accountGoalDetails.appraiser.id || this.account_id == this.accountGoalDetails.reviewer.id) {
            this.team_assessments = true;
         }else if (this.account_id == this.accountGoalDetails.account.id) {
            this.self_assessments = true;
         } else {
         }
         this.account_name = data.body['result'].account['name'];
         this.account_id = data.body['result'].account['id'];
         let differ_end_date = new Date(this.accountGoalDetails.release_date);
         let end_date = new Date(this.accountGoalDetails.end_date);
         let submit_end_date = new Date(end_date.setDate(end_date.getDate() + this.assessment_due_days));
        if (this.todayDate >= this.setTime(differ_end_date) &&
         this.todayDate >= this.setTime(new Date(this.accountGoalDetails.start_date))) {
          this.employee_comments = true;
        }else {
          this.employee_comments = false;
        }
        if (this.accountGoalDetails.appraiser.id == this.currentUser.id) {
          this.appraiser = true;
        }else {
          this.appraiser = false;
        }
        if (this.accountGoalDetails.reviewer.id == this.currentUser.id) {
        this.reviewer = true;
        }else {
        this.reviewer = false;
        }
      }else {
        window.alert(data.body['message']);
        this.router.navigateByUrl('/');
      }
      }, error => {
        this.errorService.errorHandling(error);
      }
    );
  }
  /*Initializing the time to 0 for date */
  setTime(obj: Date) {
    obj.setHours(23, 59, 59);
    return obj;
  }

  /* Getting Account Metrics for the User  */
  accountsMetrics() {
    this.spinnerService.show();
    this.accountMetricService.getAccountMetrics(this.account_id, this.accountGoal_id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.accountMetrics = data.body['result'];
          if (this.accountMetrics.length == 0) {
            this.noData = true;
          }else {
            this.noData = false;
          }
          for (let i = 0; i < this.accountMetrics.length; i++) {
            if (this.accountMetrics[i].metric.assessment != null) {
              if (this.accountMetrics[i].metric.assessment.score != null) {
                this.score[this.accountMetrics[i].id] = this.accountMetrics[i].metric.assessment.score;
              }else {
                this.score[this.accountMetrics[i].id] = '';
              }
            }else {
              this.score[this.accountMetrics[i].id] = '';
            }
          }
          if (this.todayDate > new Date(this.accountGoalDetails.start_date)) {
            this.date_validation = true;
          }else {
            this.date_validation = false;
          }
          if (this.accountMetrics[0].account.id == this.currentUser.id) {
            this.add_comment = true;
          }else {
            this.add_comment = false;
          }
          if (this.accountMetrics[0].status != 'new') {
            this.show_comments = true;
          }else {
            this.show_comments = false;
          }
          if (this.accountMetrics[0].status == 'released' && (this.todayDate > new Date(this.accountGoalDetails.start_date))) {
            this.save_comments = true;
            this.release = true;
          }else {
            this.save_comments = false;
            this.release = false;
          }
          if (this.accountMetrics[0].status == 'submitted') {
            this.show_appraiserScore = true;
            this.submit_review = true;
          }else if (this.accountMetrics[0].status == 'reviewed') {
            this.show_appraiserScore = true;
            this.submit_review = false;
            this.accept = true;
          }else if (this.accountMetrics[0].status == 'accepted') {
            this.accept = false;
            this.finish = true;
            this.show_appraiserScore = true;
            this.submit_review = false;
          }else {
            this.show_appraiserScore  = false;
            this.accept = false;
            this.submit_review = false;
            this.finish = false;
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

  /* Delete Metrics from the assessment  */
  deleteMetric(metric_id) {
    this.spinnerService.show();
    this.accountMetricService.deleteAccountMetrics(this.account_id, this.accountGoal_id, metric_id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.accountsMetrics();
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

  /* Updating the AccountMetrics */
  onSubmit(value) {
    this.spinnerService.show();
    if (this.accountMetricForm.valid) {
      this.model = {};
      this.model.account_metrics = value;
      this.accountMetricService.updateAccountMetrics(this.account_id, this.accountGoal_id, value.id, this.model).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
            this.accountsMetrics();
            this.close.nativeElement.click();
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
    }else {
      this.spinnerService.hide();
      this.flashService.show('please fill all the fields in the form', 'alert-danger');
    }
  }
  /* Building newMetricForm for giving comments */
  newMetricForm(accountMetric) {
    this.accountMetricForm.patchValue({
      'id': accountMetric.id,
      'appraisee_comment': accountMetric.appraisee_comment
    });
    this.current_goal = accountMetric.goal.name;
    this.current_description = accountMetric.metric.description;
  }

  /* Status change in the Assessments */
  statusChange() {
    this.spinnerService.show();
    this.update = {};
    this.goals = {};
    if (this.save_comments) {
     this.update['submit'] = true;
    }else if (this.submit_review) {
      this.update['review'] = true;
    }else if (this.accept) {
      this.update['accept'] = true;
    }
    this.goals['account_goals'] = this.update;
    if (this.validateEmployeeComment() && this.validateAppraiselComments() && this.validate()) {
      this.accountsgoalservice.updateAccountGoal(this.account_id, this.accountGoal_id, this.goals).subscribe(
        data => {
          this.spinnerService.hide();
          if (data.body['success']) {
            this.flashService.show(data.body['message'], 'alert-success');
            this.assessmentDetails();
            this.accountsMetrics();
            this.close1.nativeElement.click();
          }else {
            this.flashService.show(data.body['message'], 'alert-danger');
          }
        },
        error => {
          this.spinnerService.hide();
          this.errorService.errorHandling(error);
        }
      );
    }else {
      this.spinnerService.hide();
      this.close1.nativeElement.click();
      this.flashService.show(this.errorMsg, 'alert-danger');
    }
  }

  /* Updating Score in the Assessment  */
  changeScore(accountMetric_id, goal_id, metric_id) {
    this.appraiser_score['accounts_goal_id'] = this.accountGoal_id;
    this.appraiser_score['goal_id'] = goal_id;
    this.appraiser_score['metric_id'] = metric_id;
    this.appraiser_score['score'] = this.score[accountMetric_id];
    this.newmodel.assessment = this.appraiser_score;
    this.accountMetricService.updateAppraiserScore(this.account_id, this.accountGoal_id, goal_id, this.newmodel).subscribe(
      data => {
        this.accountGoalDetails.final_score = data.body['result'].accounts_goal.final_score;
        this.accountsMetrics();
      }, error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /*Saving the comments to the assessment */
  onCommentChange(value, metric_id) {
    this.model = {};
    if (this.appraiser) {
      this.appraiser_comment['appraiser_comment'] = value;
    }else if (this.reviewer) {
      this.appraiser_comment['reviewer_comment'] = value;
    }else {
    }
    this.model.account_metrics = this.appraiser_comment;
    this.accountMetricService.updateAccountMetrics(this.account_id, this.accountGoal_id, metric_id, this.model).subscribe(
      data => {
      }, error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Submit for Review button */
  submitForReview() {
    return  this.employee_comments && this.is_Admin  && this.save_comments && this.add_comment && !this.noData;
  }

  /* Score of the goal */
  goalScore() {
    return ((!this.is_Admin &&
       (this.finish || (this.accept && !this.reviewer))) ||
        ((this.finish && (this.accountGoalDetails.publish || this.appraiser)) ||
        (this.appraiser && this.accept) || (this.is_Admin && this.reviewer && this.finish)));
  }

  /*Variable Rating by appraiser or Reviewer */
  rating() {
    return ((this.appraiser && this.submit_review) || (this.reviewer && this.accept)) && (this.submit_review || this.accept);
  }

  /* Reviewer Comment */
  reviewerComment() {
    return (this.finish && (!this.is_Admin || this.accountGoalDetails.publish)) || ((this.appraiser || this.reviewer) && this.finish);
  }

  /* Table head Reviewer Comment */
  headReviewerComment() {
    return ((this.finish &&
       (this.accountGoalDetails.publish || this.allRoles() )) ||
        (this.reviewer && (this.release || this.submit_review || this.accept || this.finish))  );
  }

  /* Table head Rating */
  headRating() {
    return (this.show_comments &&
       (((this.finish || this.accept) && !this.is_Admin) ||
        (this.finish && this.accountGoalDetails.publish) ||
         (this.appraiser && this.show_appraiserScore) ||
          (this.reviewer && (this.accept || this.finish)) ));
  }

  /* Appraiser Comment */
  appraiserComment() {
    return (this.finish && this.accountGoalDetails.publish) ||
     (this.allRoles() && (this.accept || this.finish) ||
      (this.reviewer && this.show_comments && this.date_validation));
  }

  /* Table Head Appraiser Comment */
  headAppraiserComment() {
   return (((this.finish || this.accept) && !this.is_Admin) ||
    (this.finish && this.accountGoalDetails.publish)) ||
     ((this.appraiser || this.reviewer)  && (this.release ||
       this.submit_review || this.accept || this.finish));
  }

  /* Table Head Appraisee Comment */
  headEmployeeComments() {
    return this.is_Admin &&
     this.show_comments &&
      (( this.save_comments && this.add_comment) ||
       this.show_appraiserScore ||
        this.accept ||
         ((this.appraiser || this.reviewer) &&
          this.show_appraiserScore));
  }

  /* Appraisee Comments */
  appraiseeComments() {
    return  (this.is_Admin && ((this.appraiser || this.reviewer) &&
     this.show_appraiserScore)  || (this.add_comment && this.show_comments ) );
  }
  /* All Roles */
  allRoles() {
    return (!this.is_Admin || this.appraiser || this.reviewer);
  }

  onBack() {
    this.location.back();
  }

  validate() {
    let a = $('select.required').filter(function() {
      return !this.value;
    });

    a.css('border', '1px solid red');
    if (a.length === 0) {
      return true;
    }else {
      this.errorMsg = 'please rate all the metrics'
      return false;
    }
  }

  validateAppraiselComments(){
    if(this.appraiser && this.submit_review && !this.noData) {
      let count = 0;
      $('textarea.appraiser-comment').each(function(){
        if($(this).val().replace(/\s\s+/g, '') == ''){
          count = count + 1
          $(this).css('border', '1px solid red');
        }else{
          $(this).css('border', '1px solid lightgray');
        }
      })
      if(count > 0){
        this.errorMsg = "please give all appraiser comments"
        return false;
      }else{
        this.errorMsg = ""
        return true;
      }
    }else{
      return true;
    }
  }

  validateEmployeeComment(){
    if(this.appraiseeComments() && !this.appraiser && !this.reviewer){
      let count = 0;
      $('.appraisee-comment').each(function(){
        if($(this).text().replace(/\s\s+/g, '') == ''){
          count = count + 1
        }
      })
      if(count > 0){
        this.errorMsg = "please give all employee comments"
        return false;
      }else{
        this.errorMsg = ""
        return true;
      }
    }else{
      return true;
    }
  }
}
