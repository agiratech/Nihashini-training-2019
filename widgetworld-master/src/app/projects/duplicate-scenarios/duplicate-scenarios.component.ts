import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {DuplicateScenarioReq, WorkflowLables} from '../../Interfaces/workspaceV2';
import {LoaderService} from '../../shared/services/index';
import {NewWorkspaceService} from '../new-workspace.service';


@Component({
  selector: 'app-duplicate-scenarios',
  templateUrl: './duplicate-scenarios.component.html',
  styleUrls: ['./duplicate-scenarios.component.less']
})
export class DuplicateScenariosComponent implements OnInit {
  public labels: WorkflowLables;
  projectId = '';
  scenarioId = '';
  isScenarioNameError = false;
  scenarioName: any;
  errorMessage: string;

  constructor(
    private workspace: NewWorkspaceService,
    private lService: LoaderService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DuplicateScenariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.labels = this.workspace.getLabels();
    this.projectId = this.data.projectId;
    this.scenarioId = this.data.scenarioId;
    this.scenarioName = this.data.scenarioName;
  }

  scenarioSubmit() {
    if (typeof this.scenarioName !== 'undefined' && this.scenarioName.trim() !== '') {
      this.isScenarioNameError = false;
      this.lService.display(true);
      const data: DuplicateScenarioReq = {
        scenario: {
          name: this.scenarioName,
        }
      };
      this.workspace.duplicateScenario(data, this.scenarioId)
        .subscribe(res => {
          this.lService.display(false);
          this.dialogRef.close(res);
          this.scenarioName = '';
        }, error => {
          const dupError = error.error;
          this.isScenarioNameError = true;
            if (dupError['code'] === 7087) {
              this.errorMessage  =  `This ${this.labels['scenario'][0]} Name already exists. Please try with another name`;
            }
            this.lService.display(false);
        });
    } else {
      this.isScenarioNameError = true;
      this.errorMessage = `${this.labels['scenario'][0]} name can't be empty`;
    }
  }
  onCancelDuplicateScenario() {
    this.scenarioName = '';
    this.dialogRef.close();
  }


}
