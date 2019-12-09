import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { Router } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';

@Component({
  selector: 'app-create-goal',
  templateUrl: './create-goal.component.html',
  styleUrls: ['./create-goal.component.css']
})
export class CreateGoalComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private goalService: GoalService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService
  ) { }

  goalForm: FormGroup;
  goal: any = {};

  ngOnInit() {
    /* Building form for creating goal  */
    this.goalForm = this.formBuilder.group ({
      'name': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
      'order': new FormControl('', [Validators.required]),
      'score': new FormControl('', [Validators.required]),
  });
  }

  /* creating goal on submit */
  onSubmit(formData) {
    this.spinnerService.show();
    this.goal.goal = formData;
    this.goalService.createGoal(this.goal).subscribe(
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
