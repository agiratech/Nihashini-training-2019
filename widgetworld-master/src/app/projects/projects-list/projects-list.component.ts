
import {ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {Router} from '@angular/router';
import {CreateProjectReq, NewProjectDialog, Project, WorkflowLables, ScenarioDialog} from '@interTypes/workspaceV2';
import {NewProjectDialogComponent} from '@shared/components/new-project-dialog/new-project-dialog.component';
import {ScenarioDialogComponent} from '@shared/components/scenario-dialog/scenario-dialog.component';
import {TitleService, CommonService, WorkSpaceService, LoaderService, AuthenticationService} from '@shared/services';
import {Subject} from 'rxjs';
import {map, takeUntil, delay, tap } from 'rxjs/operators';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import {NewWorkspaceService} from '../new-workspace.service';
import {trigger} from '@angular/animations';
import swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { fadeIn, fadeOut } from '../../projects/animation/animation-fade';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.less'],
  animations: [
    trigger('fadeOut', fadeOut()),
    trigger('fadeIn', fadeIn())
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  public ghost = [];
  public contentHeight: number;
  public showSearchField = false;
  public dataLoading = false;
  public projects: Observable<any>;
  public labels: WorkflowLables;
  private unSubscribe = new Subject();
  public projectId;
  public projectPermission: any;
  @Output() buttonAction = new EventEmitter();
  constructor(private workSpace: NewWorkspaceService,
    private workSpaceService: WorkSpaceService,
    private loader: LoaderService,
    private matDialog: MatDialog,
    private router: Router,
    private titleService: TitleService,
    private common: CommonService,
    private cdRef: ChangeDetectorRef,
    private auth: AuthenticationService,
    private projectStore: ProjectDataStoreService,
  ) { }
  ngOnInit() {
    this.projectStore.start();
    this.projectPermission = this.auth.getModuleAccess('projects');
    this.workSpace.setSubprojectLevel(-1);
    this.labels = this.workSpace.getLabels();
    this.titleService.updateTitle(this.labels['project'][1]);
    this.dataLoading = true;
    this.listProject();
    this.onResize();
    let breadCrumbs = [];
    breadCrumbs = [
      { label: 'WORKSPACE', url: '' }
    ];
    this.common.setBreadcrumbs(breadCrumbs);
    this.workSpace.clearProjectsForScenario();
  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  public listProject() {
    this.ghost = new Array(11);
    this.projects = this.workSpace.getProjects()
      .pipe(map(data => data.projects),
        tap(() => this.ghost = []));
    //  , takeUntil(this.unSubscribe)).subscribe((projects) => {
    //    this.projects = projects;
    //    this.cdRef.markForCheck();
    //  });
    this.dataLoading = false;
  }
  public showSearch() {
    this.showSearchField = !this.showSearchField;
  }
  public deleteProject() {
    this.listProject();
    // this.projects = this.projects.filter(project => project._id !== projectId);
  }
  public onResize() {
    this.contentHeight = window.innerHeight - 120;
  }
  public createProject(source = 'direct', parentId = '', name = '', plan = 'inventory', level = 0) {
    const newProjectDialog: NewProjectDialog = {
      isProject: true,
      namePlaceHolder: `* ${this.labels['project'][0]} Name`,
      descPlaceHolder: `${this.labels['project'][0]} Description (Optional)`,
      dialogTitle: `Create ${this.labels['project'][0]}`,
    };
    if (parentId !== '') {
      newProjectDialog['isProject'] = false;
      newProjectDialog['parentId'] = parentId;
      newProjectDialog['namePlaceHolder'] = `* ${name} Name`;
      newProjectDialog['descPlaceHolder'] = `${name} Description (Optional)`;
      newProjectDialog['dialogTitle'] = `Create ${name}`;
      newProjectDialog['subProjectLabel'] = name;
    }
    this.matDialog.open(NewProjectDialogComponent, {
      data: newProjectDialog,
    }).afterClosed()
      .subscribe(data => {
        if (data) {
          if (data && data['type']) {
            this.workSpace.getProject(data['response']['data']['id']).subscribe(project => {
              switch (data['type']) {
                case 'saved':
                  this.projectStore.addOrUpdateProject(project, data['parentId']);
                  if (source === 'popup') {
                    this.workSpace.setProjectsForScenario(data['response']['data']['id'], level);
                    this.workSpace.setSubprojectLevel(-1);
                    this.createScenario(plan);
                  } else {
                    this.router.navigate(['/v2/projects/', data['response']['data']['id']]);
                  }
                  break;
                default:
                  break;
              }
            });
          }
        }
      });
  }
  public createScenario(plan = 'inventory') {
    this.buttonAction.emit(false);
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
          this.createProject('popup', data['parentId'], data['name'], plan, data['level']);
        } else if (data) {
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
}
