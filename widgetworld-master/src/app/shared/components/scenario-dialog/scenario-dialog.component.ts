import { Component, OnInit,  Inject, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ScenarioDialog, WorkflowLables, Project, SubProject } from '@interTypes/workspaceV2';
import { NewWorkspaceService } from '../../../projects/new-workspace.service';
import {AuthenticationService, ThemeService, CommonService, WorkSpaceService, LoaderService} from '@shared/services';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import { ProjectDataStoreService } from '../../../dataStore/project-data-store.service';
import swal from 'sweetalert2';
@Component({
  selector: 'app-scenario-dialog',
  templateUrl: './scenario-dialog.component.html',
  styleUrls: ['./scenario-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioDialogComponent implements OnInit, AfterViewChecked {
  public title: String;
  public description: String;
  public namePlaceHolder: String;
  public descPlaceHolder: String;
  public projectPlaceHolder: String;
  public isProject: Boolean;
  public showProject = false;
  public showSubProject = false;
  public nameValidError: String = 'Scenario Name can\'t blank';
  public buttonLabel: String;
  public labels: WorkflowLables;
  public subProjectAccess;
  public projects = [];
  public subProjectLevel;
  public subProjects: SubProject[];
  private unSubscribe = new Subject();
  public selectedProject: String;
  scenarioForm: FormGroup;
  public subSubProjects: SubProject[];
  private projectId = '';
  public currentProject: Project;
  public isSimpleLayout = false;
  private hierarchies = [];
  private currentSubProject: Project;
  public projectDepth;
  public noBrandId = '';
  constructor(public dialogRef: MatDialogRef<ScenarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScenarioDialog,
    private fb: FormBuilder,
    private workSpace: NewWorkspaceService,
    private oldWorkSpace: WorkSpaceService,
    private cdRef: ChangeDetectorRef,
    private auth: AuthenticationService,
    private projectStore: ProjectDataStoreService,
    public themeService: ThemeService,
    private cService: CommonService,
    private loaderService: LoaderService ) { }

  ngOnInit() {
    const access = this.auth.getModuleAccess('projects');
    this.subProjectAccess = access['subProjects'];
    this.projectDepth = this.subProjectAccess['depth'];
    this.isSimpleLayout = this.subProjectAccess && this.subProjectAccess.layout === 'simple';
    this.labels = this.workSpace.getLabels();
    this.title = this.data.dialogTitle;
    this.description = this.data.scenarioDesc;
    this.namePlaceHolder = this.data.namePlaceHolder;
    this.descPlaceHolder = this.data.descPlaceHolder;
    this.projectPlaceHolder = this.data.projectPlaceHolder;
    this.nameValidError = this.data['nameValidError'] && this.data['nameValidError'];
    this.buttonLabel = this.data.buttonLabel;
    this.selectedProject = this.data.projectId;
    this.subProjectLevel = Number(this.workSpace.getSubprojectLevel());
    // This changes for only OMG
    // TODO : We have to make this form generation to dynamic based on depth of the level because it current implement only for 2 levels.;
    if (this.isSimpleLayout) {
      if (this.subProjectLevel <= 0) {
        this.scenarioForm = this.fb.group({
          'name': ['', [Validators.required]],
          'description': [''],
          'project_id': ['', [Validators.required]],
          'sub_project_id': new FormControl({ value: null, disabled: true }), // , Validators.required
          'sub_sub_project_id': new FormControl({ value: null, disabled: true }, Validators.required)
        });
      } else if (this.subProjectLevel === 1) {
        this.scenarioForm = this.fb.group({
          'name': ['', [Validators.required]],
          'description': [''],
          'project_id': ['', [Validators.required]],
          'sub_project_id': new FormControl({ value: null, disabled: true }, Validators.required)
        });
      } else if (this.subProjectLevel === 2) {
        this.scenarioForm = this.fb.group({
          'name': ['', [Validators.required]],
          'description': [''],
          'project_id': ['', [Validators.required]]
        });
      } else {
        this.scenarioForm = this.fb.group({
          'name': ['', [Validators.required]],
          'description': [''],
          'project_id': ['', [Validators.required]],
          'sub_project_id': new FormControl({ value: null, disabled: true }, Validators.required),
          'sub_sub_project_id': new FormControl({ value: null, disabled: true }, Validators.required)
        });
      }
    } else {
      this.scenarioForm = this.fb.group({
        'name': ['', [Validators.required]],
        'description': [''],
        'project_id': ['', [Validators.required]],
        'sub_project_id': new FormControl({ value: null, disabled: true })
      });
    }
    this.scenarioForm.controls['project_id'].patchValue(this.selectedProject);
    this.listProject(this.selectedProject);
    const parentIds = this.workSpace.getProjectsForScenario();
    if (parentIds) {
      if (parentIds[0] && this.scenarioForm.controls['project_id']) {
        this.scenarioForm.controls['project_id'].patchValue(parentIds[0]);
        this.onProjectChange(parentIds[0]);
      }
      if (parentIds[1] && this.scenarioForm.controls['sub_project_id']) {
        this.scenarioForm.controls['sub_project_id'].enable();
        this.scenarioForm.controls['sub_project_id'].patchValue(parentIds[1]);
        this.onSubProjectChange(parentIds[1]);
      }
      if (parentIds[2] && this.scenarioForm.controls['sub_sub_project_id']) {
        this.scenarioForm.controls['sub_sub_project_id'].enable();
        this.scenarioForm.controls['sub_sub_project_id'].patchValue(parentIds[2]);
      }
    }
    this.dialogRef.afterClosed().subscribe(data => {
      this.workSpace.setPopupScenarioName(this.scenarioForm.controls['name'].value);
    });
    if (this.workSpace.getPopupScenarioName()) {
      this.scenarioForm.controls['name'].patchValue(this.workSpace.getPopupScenarioName());
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public listProject(pId) {
    // let pjctArray = {};
    this.workSpace.getProjects()
      .pipe(map(data => data.projects), takeUntil(this.unSubscribe)).subscribe((projects) => {
        this.projects = projects;
      });
      if (pId) {
        this.onProjectChange(pId);
      }
    /* if (pId) {
      this.workSpace.getProject(pId).subscribe(project => {
        pjctArray = {'name': project.name, '_id': project._id};
        this.projects.push(pjctArray);
        this.onProjectChange(project);
      });
    } else {
      this.workSpace.getProjects()
      .pipe(map(data => data.projects), takeUntil(this.unSubscribe)).subscribe((projects) => {
        this.projects = projects;
      });
    } */
 }

  public createNewProject(level) {
    this.dialogRef.close({
      name: this.labels['project'][0],
      type: 'createNewProject',
      level: level
    });
  }

  onNewSubProject(title, level) {
    let parentId = '';
    if (level === 2) {
      parentId = this.scenarioForm.controls['sub_project_id'].value;
    } else {
      parentId = this.scenarioForm.controls['project_id'].value;
    }
    this.dialogRef.close({
      name: title,
      type: 'createNewProject',
      parentId: parentId,
      level: level
    });
  }
  onProjectChange(proId, flag = false) {
    this.projectId = proId;
    if (flag) {
      this.workSpace.setProjectsForScenario(proId, 0);
    }
    if (this.subProjectAccess['status'] === 'active') {
      const title = this.scenarioForm.controls.name.value;
      if (proId) {
        this.workSpace.getProject(proId).subscribe(project => {
          if (this.hierarchies.length > 0) {
            this.hierarchies.shift();
          }
          this.hierarchies.unshift({parentName: project.name, parentId: project._id});
          this.currentProject = project;
          this.subProjects = project.subProjects;
          if (this.subProjects) {
            const noBrandIndex = this.subProjects.findIndex(sub => sub.name === '--noBrand--');
            if (this.subProjectLevel !== 2 && this.isSimpleLayout) {
              if (noBrandIndex < 0) {
                const newBrand = {
                  'name': '--noBrand--',
                  'description': '--noBrand--',
                  'parentId': proId
                };
                this.workSpace.createSubProject(newBrand).subscribe(data => {
                  const parentMaps = this.workSpace.getProjectParents() || [];
                    parentMaps.push({
                      pid: data['data']['id'],
                      pname: '--noBrand--',
                      parentId: proId,
                      parentName: project.name
                    });
                    this.workSpace.setProjectParents(parentMaps);
                  if (this.scenarioForm['controls'].sub_project_id
                    && (
                      this.scenarioForm['controls'].sub_project_id.value === ''
                      || this.scenarioForm['controls'].sub_project_id.value === null
                    )) {
                    this.scenarioForm['controls'].sub_project_id.setValue(data['data']['id']);
                    this.onSubProjectChange(data['data']['id'], true);
                  }
                  this.noBrandId = data['data']['id'];
                });
              } else {
                if (this.scenarioForm['controls'].sub_project_id
                  && (
                    this.scenarioForm['controls'].sub_project_id.value === ''
                    || this.scenarioForm['controls'].sub_project_id.value === null
                  )) {
                  this.scenarioForm['controls'].sub_project_id.setValue(this.subProjects[noBrandIndex]['_id']);
                  this.onSubProjectChange(this.subProjects[noBrandIndex]['_id'], true);
                }
                this.noBrandId = this.subProjects[noBrandIndex]['_id'];
              }
            }
            if (noBrandIndex >= 0) {
              this.subProjects.splice(noBrandIndex, 1);
            }
          }
          if (this.scenarioForm['controls'].sub_project_id) {
            this.scenarioForm['controls'].sub_project_id.enable();
            if (this.scenarioForm['controls'].sub_sub_project_id) {
              this.scenarioForm['controls'].sub_sub_project_id.enable();
            }
          }
        });
      } else {
        if (this.scenarioForm['controls'].sub_project_id) {
          this.scenarioForm['controls'].sub_project_id.disable();
          if (this.scenarioForm['controls'].sub_sub_project_id) {
            this.scenarioForm['controls'].sub_sub_project_id.disable();
          }
        }
      }
    }
  }
  private prepareBreadcrumbs(project) {
    const parents = JSON.parse(localStorage.getItem('projectParents'));
    let pid = project['id'];
    const projects = [];
    if (parents) {
      while (pid !== '') {
        const value = parents.filter(p => p.pid === pid);
        parents.splice(parents.findIndex(v => v.pid === pid), 1);
        if (value && value.length > 0) {
          pid = value[0].parentId;
          projects.push(value[0]);
        } else {
          pid = '';
        }
      }
    }
    const breadCrumbs = [
      {label: 'WORKSPACE', url: '/v2/projects/lists'},
      // {label: response.name, url: '/v2/projects/' + response._id},
      // {label: this.projectTitle, url: ''}
    ];
    if (projects.length > 0) {
      for (let i = projects.length - 1; i >= 0; i--) {
        breadCrumbs.push({label: projects[i].parentName, url: '/v2/projects/' + projects[i].parentId});
      }
    } else {
      for (let i = this.hierarchies.length - 1; i >= 0; i--) {
        breadCrumbs.push({label: this.hierarchies[i].parentName, url: '/v2/projects/' + this.hierarchies[i].parentId});
      }
    }
    breadCrumbs.push({label: project['name'], url: '/v2/projects/' + project['id']});
    this.cService.setBreadcrumbs(breadCrumbs);
    // return breadCrumbs;
  }

  // create new sub-project
  onSubProjectChange(subProjectId, flag = false) {
    this.projectId = subProjectId;
    if (flag) {
      this.workSpace.setProjectsForScenario(subProjectId, 1);
    }
    if (this.subProjectAccess['status'] === 'active') {
      const title = this.scenarioForm.controls.name.value;
      if (this.scenarioForm['controls'].sub_sub_project_id) {
        if (subProjectId) {
          this.scenarioForm['controls'].sub_sub_project_id.enable();
        } else {
          this.scenarioForm['controls'].sub_sub_project_id.disable();
        }
      }
      this.workSpace.getProject(subProjectId).subscribe(project => {
        this.currentProject = project;
        this.currentSubProject = project;
        this.subSubProjects = project.subProjects;
      });
    }
  }

  onSubmit(form) {
    if (this.scenarioForm.valid) {
      this.loaderService.display(true);
      if (this.currentSubProject) {
        this.prepareBreadcrumbs(this.currentSubProject);
      }
      let pId;
      if (form.value.sub_sub_project_id) {
        pId = form.value.sub_sub_project_id;
      } else if (form.value.sub_project_id) {
        pId = form.value.sub_project_id;
      } else {
        pId = form.value.project_id;
      }
      this.loaderService.display(true);
      const formatted = this.oldWorkSpace.newFormatScenarioData(form);
      this.oldWorkSpace.createScenario(pId, formatted)
        .subscribe(response => {
          const data = {
            type: 'saved',
            parentId: pId,
            response: response
          };
          formatted['_id'] = response.data.scenario;
          this.projectStore.addOrUpdateScenrio(formatted, pId);
          /* const parentMaps = this.workSpace.getProjectParents() || [];
          parentMaps.push({
            pid: data.value.project_id,
            pname: '',
            parentId: data.value.sub_project_id || '',
            parentName: ''
          });
          this.workSpace.setProjectParents(parentMaps); */
          this.dialogRef.close(data);
        }, error => {
          if (error.error.message) {
            swal(error.error.message);
          } else {
            swal('Something went wrong');
          }
          // $('.scenario-spacing').click();
          this.loaderService.display(false);
        });
    }
  }
  closeScenarioDialog() {
    this.scenarioForm.patchValue({
      name: '',
      description: '',
      project_id: '',
      sub_project_id: ''
    });
    this.dialogRef.close();
  }
}