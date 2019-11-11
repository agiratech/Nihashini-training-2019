import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { WorkflowLables, SubProject } from '@interTypes/workspaceV2';
import {
  WorkSpaceService,
  CommonService,
  WorkSpaceDataService,
  FormatService,
  ExploreDataService,
  TargetAudienceService,
  AuthenticationService
} from '@shared/services';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ProjectDataStoreService } from '../../dataStore/project-data-store.service';
import { FiltersService } from '../filters/filters.service';
import { zip, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
@Component({
  selector: 'app-explore-save-scenarios',
  templateUrl: './explore-save-scenarios.component.html',
  styleUrls: ['./explore-save-scenarios.component.less']
})
export class ExploreSaveScenariosComponent implements OnInit, OnDestroy {
  scenarioForm: FormGroup;
  projects: any = [];
  packages: any = [];
  inventories: any = [];
  selectedBaseID: any;
  selectedMarket: any;
  from = 'tab';
  private defaultAudience: any = {};
  public currentTargetId: any;
  public audienceTabType: any;
  public filterSession = {};
  public isDefaultAudience = false;
  public dataLoading = false;
  public workFlowLabels: WorkflowLables;
  public subProjectAccess;
  public isSimpleLayout = false;
  public projectDepth;
  public subProjects: SubProject[];
  public folders: SubProject[];
  private unSubscribe: Subject<void> = new Subject<void>();
  public noBrandId = '';
  constructor(
    private fb: FormBuilder,
    private workSpaceService: WorkSpaceService,
    private commonService: CommonService,
    private workSpaceDataService: WorkSpaceDataService,
    private formatService: FormatService,
    private exploreDataService: ExploreDataService,
    private router: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ExploreSaveScenariosComponent>,
    private targetAudience: TargetAudienceService,
    private filtersService: FiltersService,
    private projectStore: ProjectDataStoreService,
    private auth: AuthenticationService,
    private newWorkSpaceService: NewWorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.targetAudience.getDefaultAudience().pipe(takeUntil(this.unSubscribe))
      .subscribe(audience => this.defaultAudience = audience);
    this.workFlowLabels = this.commonService.getWorkFlowLabels();
  }

  ngOnInit() {
    const access = this.auth.getModuleAccess('projects');
    this.subProjectAccess = access['subProjects'];
    this.projectDepth = this.subProjectAccess['depth'];
    this.isSimpleLayout = this.subProjectAccess && this.subProjectAccess.layout === 'simple';
    this.filterSession = this.filtersService.getExploreSession();
    if (this.filterSession['data'] && this.filterSession['data']['audience'] && this.filterSession['data']['audience']['details']) {
      this.currentTargetId = this.filterSession['data']['audience']['details']['currentTargetId'];
      this.isDefaultAudience = false;
      this.audienceTabType = this.filterSession['data']['audience']['details']['tabType'];
    } else {
      this.isDefaultAudience = true;
    }
    this.inventories = this.data.inventories.filter(place => place.selected);
    /* this.projects = this.data.projects;
    this.packages = this.data.packages; */
    this.from = this.data.from;

    this.exploreDataService.getSelectedTarget().pipe(takeUntil(this.unSubscribe)).subscribe(target => {
      if (target !== '') {
        this.selectedBaseID = target;
      } else {
        this.selectedBaseID = this.defaultAudience.audienceKey;
      }
    });
    this.exploreDataService.getSelectedMarket().pipe(takeUntil(this.unSubscribe)).subscribe(market => {
      this.selectedMarket = market;
    });
    const audienceName = this.filterSession['data'] &&
      this.filterSession['data']['audience'] &&
      this.filterSession['data']['audience']['details']['targetAudience']['name'] || this.defaultAudience['description'];
    if (this.isSimpleLayout && this.subProjectAccess['status'] === 'active') {
      this.scenarioForm = this.fb.group({
        'name': ['', [Validators.required]],
        'packageName': ['', [Validators.required]],
        'projectId': ['', [Validators.required]],
        'audienceName': [audienceName, [Validators.required]],
        'subProjectId': new FormControl({ value: null, disabled: true }), //, Validators.required
        'folderId': new FormControl({ value: null, disabled: true }, Validators.required)
      });
    } else if (this.subProjectAccess['status'] === 'active' && this.projectDepth > 1) {
      this.scenarioForm = this.fb.group({
        'name': ['', [Validators.required]],
        'packageName': ['', [Validators.required]],
        'projectId': ['', [Validators.required]],
        'audienceName': [audienceName, [Validators.required]],
        'subProjectId': new FormControl({ value: null, disabled: true }),
        'folderId': new FormControl({ value: null, disabled: true })
      });
    } else if (this.projectDepth === 1 && this.subProjectAccess['status'] === 'active') {
      this.scenarioForm = this.fb.group({
        'name': [`Untitled ${this.workFlowLabels.scenario[0]}`, [Validators.required]],
        'packageName': ['', [Validators.required]],
        'projectId': ['', [Validators.required]],
        'subProjectId': new FormControl({ value: null, disabled: true }, Validators.required),
        'audienceName': [audienceName, [Validators.required]]
      }, { validator: this.checkUniqueName('packageName') });
    } else {
      this.scenarioForm = this.fb.group({
        'name': [`Untitled ${this.workFlowLabels.scenario[0]}`, [Validators.required]],
        'packageName': ['', [Validators.required]],
        'projectId': ['', [Validators.required]],
        'audienceName': [audienceName, [Validators.required]]
      }, { validator: this.checkUniqueName('packageName') });
    }
    this.dataLoading = true;
    zip(
      this.workSpaceService.getExplorePackages(true),
      this.workSpaceService.getProjects(true)).pipe(takeUntil(this.unSubscribe)).subscribe(result => {
        this.packages = result[0]['packages'] || [];
        this.projects = result[1]['projects'] || [];
        this.dataLoading = false;
      });
    const parentIds = this.newWorkSpaceService.getProjectsForScenario();
    if (parentIds) {
      if (parentIds[0] && this.scenarioForm.controls['projectId']) {
        this.scenarioForm.controls['projectId'].patchValue(parentIds[0]);
        this.onProjectChange(parentIds[0]);
      }
      if (parentIds[1] && this.scenarioForm.controls['subProjectId']) {
        this.scenarioForm.controls['subProjectId'].enable();
        this.scenarioForm.controls['subProjectId'].patchValue(parentIds[1]);
        this.onSubProjectChange(parentIds[1]);
      }
      if (parentIds[2] && this.scenarioForm.controls['folderId']) {
        this.scenarioForm.controls['folderId'].enable();
        this.scenarioForm.controls['folderId'].patchValue(parentIds[2]);
      }
    }

    this.dialogRef.afterClosed().subscribe(data => {
      this.newWorkSpaceService.setPopupScenarioName(this.scenarioForm.controls['name'].value);
      this.newWorkSpaceService.setPopupInventoryName(this.scenarioForm.controls['packageName'].value);
    });
    if (this.newWorkSpaceService.getPopupScenarioName()) {
      this.scenarioForm.controls['name'].patchValue(this.newWorkSpaceService.getPopupScenarioName());
    }
    if (this.newWorkSpaceService.getPopupInventoryName()) {
      this.scenarioForm.controls['packageName'].patchValue(this.newWorkSpaceService.getPopupInventoryName());
    }
  }

  checkUniqueName(name: string) {
    return (group: FormGroup) => {
      const packages = this.packages;
      const nameInput = group.controls[name];
      if (nameInput.value !== '') {
        const p = packages.filter(function (value) {
          if (value.name != null) {
            return ((value.name).toLowerCase() === (nameInput.value).toLowerCase());
          }
        });
        if (p.length > 0) {
          return nameInput.setErrors({ uniqueName: true });
        } else {
          return nameInput.setErrors(null);
        }
      }
    };
  }
  onSubmit(formGroup) {
    this.commonService.validateFormGroup(formGroup);
    if (formGroup.valid) {
      this.submitDataToServer(formGroup.value);
    }
  }
  submitDataToServer(value) {
    const selected = [];
    let projectId = '';
    if (value['folderId']) {
      projectId = value['folderId'];
    } else if (value['subProjectID']) {
      projectId = value['folderId'];
    } else {
      projectId = value['projectId'];
    }
    if (this.from === 'tabular') {
      this.inventories.map(place => {
        selected.push({ 'id': place.properties.frame_id, 'type': 'geopathPanel' });
      });
    } else {
      this.inventories.map(place => {
        selected.push({ 'id': place.fid, 'type': 'geopathPanel' });
      });
    }
    if (selected.length > 0) {
      if (selected.length > 2000) {
        swal('Warning', 'Inventory Sets are limited to 2000 units', 'warning');
      } else {
        this.workSpaceService
          .saveExplorePackage({
            name: value.packageName,
            name_key: '', description: null
          }, selected).pipe(takeUntil(this.unSubscribe))
          .subscribe(
            response => {
              if (typeof response['data'] !== 'undefined' && typeof response['data']['id'] !== 'undefined') {
                const package_id = response['data']['id'];
                const package_ids = [];
                package_ids.push(package_id);
                if (!((!this.currentTargetId && !this.isDefaultAudience) || (this.audienceTabType && this.audienceTabType !== 'saved'))) {
                  this.createScenario(projectId, {
                    name: value.name, package: package_ids,
                    audience: {
                      audience_id: (this.currentTargetId && this.currentTargetId || this.selectedBaseID),
                      market_id: this.selectedMarket.id || null,
                      market_type: this.selectedMarket['type'] || null
                    }
                  },
                    package_id);
                } else {
                  const audienceTags = [];
                  if (this.filterSession['data'] && this.filterSession['data']['audience']) {
                    this.filterSession['data']['audience']['details']['selectedAudienceList'].map(audience => {
                      audienceTags.push(audience['tag']);
                    });
                  }
                  const audienceData: any = {
                    audience: {
                      title: value.audienceName,
                      audiences: [{
                        key: this.filterSession['data'] &&
                          this.filterSession['data']['audience'] && this.filterSession['data']['audience']['key'],
                        tags: audienceTags
                      }],
                    }
                  };
                  this.targetAudience.saveAudience(audienceData).pipe(takeUntil(this.unSubscribe)).subscribe(audienceResponse => {
                    this.createScenario(projectId, {
                      name: value.name, package: package_ids,
                      audience: {
                        audience_id: audienceResponse.data.id,
                        market_id: this.selectedMarket['id'] || null,
                        market_type: this.selectedMarket['type'] || null
                      }
                    },
                      package_id);
                  }, error => {
                    if (typeof error.error !== 'undefined' && typeof error.error['error'] !== 'undefined' &&
                      error.error['error'] === 'duplicateAudienceSetTitle') {
                      this.workSpaceService
                        .deletePackage(package_id).pipe(takeUntil(this.unSubscribe))
                        .subscribe(success => {
                          swal('Info', error.error['message'], 'warning');
                        },
                          e => {
                            let message = '';
                            if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
                              message = e.error.message;
                            } else {
                              message = 'An error has occurred. Please try again later.';
                            }
                            swal('Error', message, 'error');
                          });
                    } else {
                      swal('Warning', 'Some error occured. Please try again', 'warning');
                    }
                  });
                }
              }
            },
            e => {
              let message = '';
              if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
                message = e.error.message;
              } else {
                message = 'An error has occurred. Please try again later.';
              }
              swal('Error', message, 'error');
            }
          );
      }
    } else {
      swal('Warning', 'Please select atleast one inventory', 'warning');
    }
  }
  createScenario(projectId, audienceData, package_id) {
    if (audienceData['audience'] && !audienceData['audience']['market_id']) {
      delete audienceData['audience']['market_id'];
      delete audienceData['audience']['market_type'];
    }
    this.workSpaceService
      .createScenario(projectId, audienceData).pipe(takeUntil(this.unSubscribe))
      .subscribe(
        success => {
          audienceData['_id'] = success.data.scenario;
          this.projectStore.addOrUpdateScenrio(audienceData, projectId);
          setTimeout(() => {
            this.workSpaceService.getExplorePackages().pipe(takeUntil(this.unSubscribe)).subscribe(packagesResponse => {
              let packs = [];
              if (typeof packagesResponse['packages'] !== 'undefined' && packagesResponse['packages'].length > 0) {
                packs = packagesResponse['packages'];
              }
              this.workSpaceDataService.setPackages(packs);
            });
          }, 500);

          this.workSpaceService.getProjects()
            .subscribe(projects => {
              const scenarios = [];
              const projectsResponse = projects['projects'];
              // Api response has two projects
              if (projectsResponse && projectsResponse.length > 0) {
                projectsResponse.map(project => {
                  if (project.scenarios && project.scenarios) {
                    project.scenarios.map(scenario => {
                      scenario.projectId = project._id;
                      scenario.projectName = project.name;
                      scenario.displayName = project.name + ': ' + scenario.name;
                      scenarios.push(scenario);
                    });
                  }
                });
              }
              scenarios.sort((item1, item2) => this.formatService.sortAlphabetic(item1, item2, 'displayName'));
              this.workSpaceDataService.setScenarios(scenarios);
            });
          swal('Success', `${this.workFlowLabels.scenario[0]} saved successfully.`, 'success');
          this.scenarioForm.patchValue({
            name: 'Untitled Scenario 1',
            packageName: '',
            projectId: ''
          });
          this.dialogRef.close();
        },
        e => {
          this.workSpaceService
            .deletePackage(package_id).pipe(takeUntil(this.unSubscribe))
            .subscribe(success => {
              swal('Info', e.error['message'], 'warning');
            },
              error => {
                let message = '';
                if (typeof error.error !== 'undefined' && typeof error.error.message !== 'undefined') {
                  message = error.error.message;
                } else {
                  message = 'An error has occurredi. Please try again later.';
                }
                swal('Error', message, 'error');
              });
        }
      );
  }
  onProjectChange(projectId) {
    this.newWorkSpaceService.setProjectsForScenario(projectId, 0);
    if (this.subProjectAccess['status'] === 'active') {
      if (this.scenarioForm['controls'].subProjectId) {
        if (projectId) {
          this.scenarioForm['controls'].subProjectId.enable();
        } else {
          this.scenarioForm['controls'].subProjectId.disable();
        }
      }
      this.newWorkSpaceService.getProject(projectId).pipe(takeUntil(this.unSubscribe)).subscribe(project => {
        this.subProjects = project.subProjects;
        if (this.subProjects) {
          const noBrandIndex = this.subProjects.findIndex(sub => sub.name === '--noBrand--');
          if (this.isSimpleLayout) {
            if (noBrandIndex < 0) {
              const newBrand = {
                'name': '--noBrand--',
                'description': '--noBrand--',
                'parentId': projectId
              };
              this.newWorkSpaceService.createSubProject(newBrand).subscribe(data => {
                const parentMaps = this.newWorkSpaceService.getProjectParents() || [];
                  parentMaps.push({
                    pid: data['data']['id'],
                    pname: '--noBrand--',
                    parentId: projectId,
                    parentName: project.name
                  });
                  this.newWorkSpaceService.setProjectParents(parentMaps);
                if (this.scenarioForm['controls'].subProjectId
                  && (
                    this.scenarioForm['controls'].subProjectId.value === ''
                    || this.scenarioForm['controls'].subProjectId.value === null
                  )) {
                  this.scenarioForm['controls'].subProjectId.setValue(data['data']['id']);
                  this.onSubProjectChange(data['data']['id']);
                }
                this.noBrandId = data['data']['id'];
              });
            } else {
              if (this.scenarioForm['controls'].subProjectId
                && (
                  this.scenarioForm['controls'].subProjectId.value === ''
                  || this.scenarioForm['controls'].subProjectId.value === null
                )) {
                this.scenarioForm['controls'].subProjectId.setValue(this.subProjects[noBrandIndex]['_id']);
                this.onSubProjectChange(this.subProjects[noBrandIndex]['_id']);
              }
              this.noBrandId = this.subProjects[noBrandIndex]['_id'];
            }
            if (noBrandIndex >= 0) {
              this.subProjects.splice(noBrandIndex, 1);
            }
          }
        }
      });
    }
    this.setScenarioName(this.projects, projectId);
  }


  onSubProjectChange(subProjectId) {
    this.newWorkSpaceService.setProjectsForScenario(subProjectId, 1);
    if (this.scenarioForm['controls'].folderId) {
      if (subProjectId) {
        this.scenarioForm['controls'].folderId.enable();
      } else {
        this.scenarioForm['controls'].folderId.disable();
      }
    }
    this.newWorkSpaceService.getProject(subProjectId).pipe(takeUntil(this.unSubscribe)).subscribe(project => {
      this.folders = project.subProjects;
    });
    this.setScenarioName(this.subProjects, subProjectId);
  }
  onFolderChange(folderId) {
    this.setScenarioName(this.folders, folderId);
  }

  setScenarioName(projects, projectID) {
    const title = this.scenarioForm.controls.name.value;
    let scenarioName = '';
    if (projectID !== '' && (title === '' || title.indexOf('Untitled ' + this.workFlowLabels.scenario[0]) !== -1) && projects) {
      const proj = projects.find(option => option._id === projectID);
      if (typeof proj !== 'undefined' && typeof proj.scenarios !== 'undefined' && proj.scenarios.length > 0) {
        scenarioName = this.formatService.getObjectTitle(proj.scenarios, this.workFlowLabels.scenario[0], 'name');
      } else {
        scenarioName = `Untitled ${this.workFlowLabels.scenario[0]} 1`;
      }
      this.scenarioForm.controls.name.setValue(scenarioName);
    }
  }
  closeModal() {
    this.scenarioForm.patchValue({
      name: `Untitled ${this.workFlowLabels.scenario[0]} 1`,
      packageName: '',
      projectId: ''
    });
    this.dialogRef.close();
  }
  openAddProject() {
    this.router.navigate(['/v2/projects/lists']);
    this.dialogRef.close();
  }
  onCreateNewProject(title, level) {
    let parentId = '';
    if (level === 2 && this.scenarioForm.controls['subProjectId']) {
      parentId = this.scenarioForm.controls['subProjectId'].value;
    } else if (level === 1  && this.scenarioForm.controls['projectId']) {
      parentId = this.scenarioForm.controls['projectId'].value;
    }
    this.dialogRef.close({
      name: title,
      type: 'createNewProject',
      parentId: parentId,
      level: level
    });
  }
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
