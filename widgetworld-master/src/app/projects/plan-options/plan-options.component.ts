import { Component, Input, OnInit, ChangeDetectionStrategy, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {Router} from '@angular/router';
import {ScenarioDialog, WorkflowLables} from '@interTypes/workspaceV2';
import {ScenarioDialogComponent} from '@shared/components/scenario-dialog/scenario-dialog.component';
import {TitleService, CommonService, WorkSpaceService, LoaderService, AuthenticationService} from '@shared/services';
import {Subject} from 'rxjs';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import {NewWorkspaceService} from '../new-workspace.service';

@Component({
  selector: 'app-plan-options',
  templateUrl: './plan-options.component.html',
  styleUrls: ['./plan-options.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanOptionsComponent implements OnInit, OnChanges {
  public projects = [];
  public labels: WorkflowLables;
  private unSubscribe = new Subject();
  @Input() projectId: any;
  @Input() currentPlan: any;
  // This action is user to prevent the mat-card click 
  @Output() buttonAction = new EventEmitter();
  @Output() triggerAction = new EventEmitter();
  public projectPermission: any;
  constructor(private workSpace: NewWorkspaceService,
              private workSpaceService: WorkSpaceService,
              private loader: LoaderService,
              private matDialog: MatDialog,
              private router: Router,
              private titleService: TitleService,
              private common: CommonService,
              private auth: AuthenticationService,
              private projectStore: ProjectDataStoreService
              ) { }

  ngOnInit() {
    this.labels = this.workSpace.getLabels();
    this.projectPermission = this.auth.getModuleAccess('projects');
  }

  public createScenario(plan= 'inventory') {
    // this.buttonAction.emit(false);
    const scenarioDialog: ScenarioDialog = {
      namePlaceHolder: `* ${this.labels['scenario'][0]} Name`,
      descPlaceHolder: `${this.labels['scenario'][0]} Description (Optional)`,
      projectPlaceHolder: `Assign to  ${this.labels['project'][0]}`,
      dialogTitle: `Create ${this.labels['scenario'][0]}`,
      buttonLabel: `Create  ${this.labels['scenario'][0]}`,
      projectId: this.projectId
    };
    this.matDialog.open(ScenarioDialogComponent, {
      data: scenarioDialog,
    }).afterClosed()
      .subscribe(data => {
        this.buttonAction.emit(true);
        if (data && data['type'] === 'createNewProject') {
          // this.createScenario('markets');
          data['plan'] = plan;
          this.triggerAction.emit(data);
        } else if (data && data['type'] === 'saved') {
          this.workSpace.clearProjectsForScenario();
          this.router.navigate([
            '/v2/projects/' +
            data['parentId'] +
            '/scenarios/' +
            data['response']['data']['id']['scenario'] + '/' + plan
          ]);
        } else {
          this.workSpace.clearProjectsForScenario();
        }
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (changes.currentPlan
        && changes.currentPlan.currentValue !== ''
        && changes.currentPlan.currentValue !== changes.currentPlan.previousValue) {
      this.createScenario(changes.currentPlan.currentValue);
    }
    }, 200);
  }
}
