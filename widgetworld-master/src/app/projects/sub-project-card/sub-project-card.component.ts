import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import {NewWorkspaceService} from '../new-workspace.service';
import { SubProject } from '@interTypes/workspaceV2';
import { MatDialog } from '@angular/material/dialog';
import {Router} from '@angular/router';
import {NewProjectDialog, DuplicateProjectReq, ConfirmationDialog, DeleteProject, WorkflowLables} from '@interTypes/workspaceV2';
import { NewProjectDialogComponent } from '@shared/components/new-project-dialog/new-project-dialog.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sub-project-card',
  templateUrl: './sub-project-card.component.html',
  styleUrls: ['./sub-project-card.component.less']
})
export class SubProjectCardComponent implements OnInit {
  @Input() subProject: SubProject = null ;
  @Input() projectId = null ;
  @Input() subProjectLevel: any;
  @Output() loadSubProject: EventEmitter<any> = new EventEmitter();
  @Output() deleteSubProject: EventEmitter<any> = new EventEmitter();
  public labels: WorkflowLables;
  private isSubProjectOpen = true;

  constructor(private workSpace: NewWorkspaceService,
    public dialog: MatDialog,
    public router: Router,
    private projectStore: ProjectDataStoreService) { }

  ngOnInit() {
    this.labels = this.workSpace.getLabels();
  }

  onSubProjectAction(pId, pName) {
    this.isSubProjectOpen = false;
    const newProject: NewProjectDialog = {
      isProject: false,
      namePlaceHolder: `* ${this.labels['subProject'][0]} Name`,
      descPlaceHolder: `${this.labels['subProject'][0]} Description (Optional)`,
      dialogTitle: `Duplicate ${this.labels['subProject'][0]}`,
      projectName: 'Copy of ' + pName,
    };
    this.dialog.open(NewProjectDialogComponent, {
      data: newProject,
    }).afterClosed()
      .subscribe(data => {
        this.isSubProjectOpen = true;
        if (data && data['name']) {
          const dupProject: DuplicateProjectReq = {
            name: data['name'],
            description: data['description'],
            _id: pId
          };
          this.workSpace.duplicateProjects(dupProject).subscribe(response => {
            if (response.status === 'success') {
              response.message = 'Created Successfully';
              this.onOpenConfirmation(response, pId, 'create');
            }
            if (response.error && response.error.code && response.error.code === 7041) {
              response.message = 'A record is already existed with the same name. Please try with different name';
              this.onOpenConfirmation(response, pId, '', true);
            }
          });
        }
    });
  }

  onOpenConfirmation (res, pId, type, error = false) {
    this.isSubProjectOpen = false;
    const width = '586px';
    const data: ConfirmationDialog = {
      messageText: res.message,
      notifyMessage: true
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(result => {
      this.isSubProjectOpen = true;
      if (result && !error) {
        if (type === 'create') {
          localStorage.setItem('parentId', this.projectId);
          this.router.navigate(['/v2/projects/' , res['data']['id']]);
        } else {
          this.deleteSubProject.emit(pId);
        }
      }
    });
  }

  onDeleteSubProject(pId, pName) {
    this.isSubProjectOpen = false;
    const width = '586px';
    const data: ConfirmationDialog = {
      notifyMessage: false,
      confirmTitle: 'Delete ' + pName + '?',
      confirmDesc: 'Are you sure you want to delete ' + pName + '?',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      messageText: 'Your project deleted Successfully',
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(res => {
      this.isSubProjectOpen = true;
      if (res && res['action']) {
        const delProject: DeleteProject = {
          _id: pId
        };
        this.workSpace.deleteProjects(delProject).subscribe(response => {
          this.projectStore.deleteProject(pId);
          this.onOpenConfirmation(response, pId, 'delete');
        });
      }
    });
  }
  onOpenSubProject(subProjectId) {
    setTimeout(() => {
      if (this.isSubProjectOpen) {
        localStorage.setItem('parentId', this.projectId);
        this.router.navigate(['/v2/projects/' , subProjectId]);
      }
    }, 100);
  }
  isOpenPlan(event) {
    this.isSubProjectOpen = event;
  }


}
