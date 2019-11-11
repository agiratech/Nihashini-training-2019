import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, AfterContentChecked, AfterViewChecked, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { Duration } from './../../../Interfaces/workspaceV2';

@Component({
  selector: 'app-goals-details',
  templateUrl: './goals-details.component.html',
  styleUrls: ['./goals-details.component.less']
})
export class GoalsDetailsComponent implements OnInit , OnChanges, AfterViewInit {
  @Output() goalDetails = new EventEmitter();
  @Input() innerMediaGoalForm: any;
  @Input() mainPlanGoal: any;
  public goalsForm: FormGroup;
  public effectiveReach: any = [];
  public weeklyDurations: Duration;
  numericPattern = '^[0-9,-]*$';
  constructor(private fb: FormBuilder, private workspaceScevice: NewWorkspaceService) { }
  public defaultDuration;
  public defaultEffectiveReach = 1;
  private innerMediaTypeFormData: any;
  private mainPlanGoalFormData: any;
  ngOnInit() {
    this.goalsForm = this.fb.group({
      'allocationMethod': ['equal'],
      'trp': [null, Validators.pattern(this.numericPattern)],
      'reach': [null, Validators.pattern(this.numericPattern)],
      'frequency': [null, Validators.pattern(this.numericPattern)],
      'duration': null,
      'effectiveReach': 1
    });
    this.workspaceScevice.getDurations().subscribe(durations => {
      if (durations['durations']) {
        this.weeklyDurations = durations['durations'];
        durations['durations'].filter(duration => {
          if (duration.isDefault && this.goalsForm.getRawValue().duration === null) {
            this.defaultDuration = duration.duration;
            this.goalsForm['controls'].duration.patchValue(duration.duration);
          }
        });
      }
    });
    this.effectiveReach = [{ label: 1, value: 1 }, { label: 3, value: 3 }];
    if (this.mainPlanGoal) {
      this.goalDetails.emit(this.goalsForm.value);
    }
    this.onFormChanges();
  }

  ngOnChanges (changes: SimpleChanges)  {
    if (changes['innerMediaGoalForm'] && changes['innerMediaGoalForm'].currentValue) {
      this.innerMediaTypeFormData = changes['innerMediaGoalForm'].currentValue;
    }
    if (changes['mainPlanGoal'] && changes['mainPlanGoal'].currentValue) {
      this.loadvalue(changes['mainPlanGoal'].currentValue);
    }
  }
  ngAfterViewInit() {
    if (this.innerMediaTypeFormData) {
      setTimeout(() => {
        this.loadvalue(this.innerMediaTypeFormData['goals']);
      }, 1000);
    }
  }

  loadvalue(goal) {
    if (!this.goalsForm) {
      return;
    }
    this.goalsForm.patchValue({
      'allocationMethod': goal['allocationMethod'] ? goal['allocationMethod'] : '',
      'trp': goal['trp'],
      'reach': goal['reach'],
      'frequency': goal['frequency'],
      'duration': goal['duration'],
      'effectiveReach': goal['effectiveReach'] ? goal['effectiveReach'] : ''
    });
    this.defaultDuration = Number(goal['duration']);
    this.defaultEffectiveReach = goal['effectiveReach'];

  }

  onSubmit() {
    this.goalDetails.emit(this.goalsForm.value);
  }
  onFormChanges() {
      this.goalsForm.valueChanges.subscribe(form => {
        //if (this.mainPlanGoal) {
          this.goalDetails.emit(form);
        //}
      });
  }
  onChangeDuration(duration) {
    this.goalsForm['controls'].duration.patchValue(duration.value);
    if (this.mainPlanGoal) {
      this.onSubmit();
    }
  }
  onChangeEffectiveReach(effectiveReach) {
    this.goalsForm['controls'].effectiveReach.patchValue(effectiveReach.value);
    if (this.mainPlanGoal) {
      this.onSubmit();
    }
  }
}
