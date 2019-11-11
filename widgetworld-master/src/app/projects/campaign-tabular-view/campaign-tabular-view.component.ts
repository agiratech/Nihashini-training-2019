import { Component, OnInit, Input, ViewChild,
  AfterViewInit, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { NewWorkspaceService } from '../new-workspace.service';
import { ProjectDataStoreService } from 'app/dataStore/project-data-store.service';
import { SubProject, ConfirmationDialog, DeleteProject,
   NewProjectDialog, DuplicateProjectReq } from '@interTypes/workspaceV2';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { NewProjectDialogComponent } from '@shared/components/new-project-dialog/new-project-dialog.component';
import { CustomizeColumnComponent } from '@shared/components/customize-column/customize-column.component';

@Component({
  selector: 'app-campaign-tabular-view',
  templateUrl: './campaign-tabular-view.component.html',
  styleUrls: ['./campaign-tabular-view.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignTabularViewComponent implements OnInit, AfterViewInit {
  @Input() subProjects = [];
  @Input() brandName: any;
  @Input() labels: any;
  public campaignColumns = ['Campaign Name', 'Brand', '# of Plans', 'Created By', 'Action'];
  public dataSource = new MatTableDataSource([]);
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  public selectedRow = '';
  @Input() subProject: SubProject = null ;
  @Input() projectId = null ;
  @Input() subProjectLevel: any;
  @Output() loadSubProject: EventEmitter<any> = new EventEmitter();
  @Output() deleteSubProject: EventEmitter<any> = new EventEmitter();
  private isSubProjectOpen = true;
  public sortable = [];
  public duplicateDisplayedColumns: any;
  @Input() currentProject: any;

  constructor(private workSpace: NewWorkspaceService,
    public dialog: MatDialog,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private projectStore: ProjectDataStoreService) { }

  ngOnInit() {
    this.duplicateDisplayedColumns = [...this.campaignColumns];
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onOpenCampaign(id) {
    const list = '/v2/projects/' + id;
    this.router.navigate([list]);
  }

  highlight(row) {
    if ($('.mat-menu-panel').is(':visible')) {
      this.selectedRow = row._id;
    } else {
      this.selectedRow = '';
    }
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

  onSubProjectAction(pId, pName) {
    this.isSubProjectOpen = false;
    const newProject: NewProjectDialog = {
      isProject: false,
      namePlaceHolder: `* ${this.labels['folder'][0]} Name`,
      descPlaceHolder: `${this.labels['folder'][0]} Description (Optional)`,
      dialogTitle: `Duplicate ${this.labels['folder'][0]}`,
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
              this.projectStore.addOrUpdateProject(dupProject, dupProject._id);
              const parentMaps = this.workSpace.getProjectParents() || [];
              parentMaps.push({
                pid: response['data']['id'],
                pname: data.name,
                parentId: this.currentProject['_id'],
                parentName: this.currentProject.name
              });
              this.workSpace.setProjectParents(parentMaps);
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

  public customizeColumn() {
    const currentSortables = this.campaignColumns.map((name) => {
      const obj = { 'displayname': name, 'field_name': name };
      return obj;
    });
    currentSortables.splice(currentSortables.length - 1, 1);
    const ref = this.dialog.open(CustomizeColumnComponent, {
      data: {
        'sortables': Object.assign([], this.sortable),
        'currentSortables': Object.assign([], currentSortables), 'origin': 'workspace'
      },
      width: '700px',
      closeOnNavigation: true,
      panelClass: 'audience-browser-container',
    });
    ref.afterClosed().subscribe(res => {
      if (res && res.action !== 'cancel') {
        const sortableColumn = [];
        const displayedColumns = [...this.duplicateDisplayedColumns];
        displayedColumns.splice(displayedColumns.length - 1, 1);
        res.currentSortables.forEach((data) => {
          sortableColumn.push(data.displayname);
          displayedColumns.forEach((data1, index) => {
            if (data1 === data.displayname) {
              displayedColumns.splice(index, 1);
            }
          });
        });
        const sortable = displayedColumns.map((data) => {
          return { 'displayname': data, 'field_name': data };
        });
        this.sortable = sortable;
        sortableColumn.push('Action');
        this.campaignColumns = sortableColumn;
        this.cdr.detectChanges();
      }
    });
  }


}
