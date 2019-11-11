import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NewProjectDialog, Project, DuplicateProjectReq, ConfirmationDialog, DeleteProject, WorkflowLables } from '@interTypes/workspaceV2';
import { NewProjectDialogComponent } from '@shared/components/new-project-dialog/new-project-dialog.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import { NewWorkspaceService } from '../new-workspace.service';
import { AuthenticationService } from '@shared/services';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent implements OnInit {
  @Input() project: Project = null;
  @Output() loadProject: EventEmitter<any> = new EventEmitter();
  @Output() deleteProject: EventEmitter<any> = new EventEmitter();
  public labels: WorkflowLables;
  public subProjectAccess: any;
  private isProjectOpen = true;
  constructor(private workSpace: NewWorkspaceService,
    public dialog: MatDialog,
    public router: Router,
    private auth: AuthenticationService,
    private projectStore: ProjectDataStoreService) {
  }
  ngOnInit() {
    this.labels = this.workSpace.getLabels();
    const access = this.auth.getModuleAccess('projects');
    this.subProjectAccess = access['subProjects'];
  }

  onProjectAction(pId, pName) {
    this.isProjectOpen = false;
    const newProject: NewProjectDialog = {
      isProject: true,
      namePlaceHolder: `* ${this.labels['project'][0]} Name`,
      descPlaceHolder: `${this.labels['project'][0]} Description (Optional)`,
      dialogTitle: `Duplicate ${this.labels['project'][0]}`,
      projectName: 'Copy of ' + pName,
    };
    this.dialog.open(NewProjectDialogComponent, {
      data: newProject,
    }).afterClosed()
      .subscribe(data => {
        this.isProjectOpen = true;
        if (data && data['name']) {
          const dupProject: DuplicateProjectReq = {
            name: data['name'],
            description: data['description'],
            _id: pId
          };
          this.workSpace.duplicateProjects(dupProject).subscribe(response => {
            if (response.status === 'success') {
              response.message = 'Created Successfully';
              this.onOpenConfirmation(response, 'create', pId);
              this.projectStore.addOrUpdateProject(dupProject)
            }
            if (response.error && response.error.code && response.error.code === 7041) {
              response.message = 'A record is already existed with the same name. Please try with different name';
              this.onOpenConfirmation(response, 'create', pId, true);
            }
          });
        }
      });
  }

  onOpenConfirmation(res, type, projectId, error = false) {
    this.isProjectOpen = false;
    const width = '586px';
    const data: ConfirmationDialog = {
      messageText: res.message,
      notifyMessage: true
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(result => {
      this.isProjectOpen = false;
      if (result && !error) {
        if (type === 'create') {
          this.router.navigate(['/v2/projects/' + res['data']['id']]);
        } else {
          this.deleteProject.emit(projectId);
        }
      }
    });
  }

  onDeleteProject(pId, pName) {
    this.isProjectOpen = false;
    const width = '586px';
    const data: ConfirmationDialog = {
      notifyMessage: false,
      confirmTitle: 'Delete ' + pName + '?',
      confirmDesc: 'Are you sure you want to delete ' + pName + '?',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      messageText: `Your ${this.labels['project'][0]} deleted Successfully`,
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width
    }).afterClosed().subscribe(res => {
      this.isProjectOpen = true;
      if (res && res['action']) {
        const delProject: DeleteProject = {
          _id: pId
        };
        this.workSpace.deleteProjects(delProject).subscribe(response => {
          this.projectStore.deleteProject(pId);
          this.onOpenConfirmation(response, 'delete', pId);
        });
      }
    });
  }
  onOpenProject(projectId) {
    setTimeout(() => {
      if (this.isProjectOpen) {
        this.router.navigate(['/v2/projects/' + projectId]);
      }
    }, 100);
  }
  isOpenPlan(event) {
    this.isProjectOpen = event;
  }
}
