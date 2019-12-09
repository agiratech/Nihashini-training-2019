import { Component, OnInit } from '@angular/core';
import { GoalService } from '../../services/goal.service';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';



@Component({
  selector: 'app-goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.css']
})
export class GoalsListComponent implements OnInit {

  constructor(
    private router: Router,
    private goalService: GoalService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  goals;

  ngOnInit() {
    this.spinnerService.show();
    this.goalService.getGoals(false).subscribe(
      data => {
        this.spinnerService.hide();
        this.goals = data.body['result'];
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  delete(id) {
    this.spinnerService.show();
    this.goalService.deleteGoal(id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success'] === true) {
          this.goalService.getGoals(false).subscribe(
            data1 => {
              this.goals = data1.body['result'];
            },
            error => {
              this.errorService.errorHandling(error);
            }
          );
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

}
