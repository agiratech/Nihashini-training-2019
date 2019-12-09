import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';
import { ErrorService } from '../../services/error.service';



@Component({
  selector: 'app-edit-goal',
  templateUrl: './edit-goal.component.html',
  styleUrls: ['./edit-goal.component.css']
})
export class EditGoalComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private goalService: GoalService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService

  ) { }

  goalForm: FormGroup;
  goal: any = {};
  goal_id;
  goals;

  ngOnInit() {

    /* Getting Goal Id */
    this.route.params.subscribe(
      params => {
      this.goal_id = params['id'];
      }
    );

    /* building form for updating the goals  */
    this.goalForm = this.formBuilder.group ({
      'id': '',
      'name': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
      'score': new FormControl('', [Validators.required]),
      'is_active': ''
   });

   this.spinnerService.show();
   /* Getting Details of that goal */
   this.goalService.goalDetails(this.goal_id).subscribe(
     data => {
       this.spinnerService.hide();
      if (data.body['success']) {
        this.goals = data.body['result'];
        this.goalForm.patchValue({
          'id': this.goals.id,
          'name': this.goals.name,
          'description': this.goals.description,
          'score': this.goals.score,
          'is_active': this.goals.status
        });
      }
     },
     error => {
       this.spinnerService.hide();
       this.errorService.errorHandling(error);
     }
   );
  }

  /* updating the Goals */
  onSubmit(formData) {
    this.spinnerService.show();
    this.goal.goal = formData;
    this.goalService.updateGoal(this.goal).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('goals');
        } else {
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
