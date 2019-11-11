import {Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy,
  ChangeDetectorRef, AfterViewChecked, AfterViewInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import {ScenarioDialogComponent} from '@shared/components/scenario-dialog/scenario-dialog.component';
import {AuthenticationService, TitleService, CommonService, ThemeService} from '@shared/services';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import {NewWorkspaceService} from '../new-workspace.service';
import {Project, NewSubProjectDialog, SubProject, WorkflowLables} from './../../Interfaces/workspaceV2';
import swal from 'sweetalert2';
import {NewProjectDialogComponent} from '@shared/components/new-project-dialog/new-project-dialog.component';
import { Scenario } from '@interTypes/workspaceV2';
import { SEMICOLON, COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProjectsAttachmentComponent } from '../attachment-file/projects-attachment/projects-attachment.component';

@Component({
  selector: 'app-projects-view',
  templateUrl: './projects-view.component.html',
  styleUrls: ['./projects-view.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsViewComponent implements OnInit, AfterViewChecked {
  public isEditProject: Boolean = false;
  public projectTitle = '';
  public projectDescription = '';
  public tags: any = [];
  public backTags: any = [];
  public contentHeight: number;
  public isOpenedProject: Boolean = false;
  @ViewChild('fName', {static: false}) focusNameRef: ElementRef;
  public projectViewForm: FormGroup;
  public isSearchHide: Boolean = true;
  public projectId;
  public parentId;
  public currentProject: Project;
  public nameUniqueError: Boolean = false;
  public isSubProject: Boolean = false;
  public searchQuery;
  public subProjects: SubProject[];
  private dummySubProjects: SubProject[];
  public labels: WorkflowLables;
  public subProjectAccess;
  public attachmentAccess;
  public scenarios: Scenario[] = [];
  public subProjectLevel = 0;
  public scenarioKeysCodes = [ENTER, COMMA, SEMICOLON];
  public brandName: any;
  public allProjects = [];
  public isBrandsEnabled = true;
  public projectDepth = 0;
  public parentProjects = [];
  public themeSettings = [];
  public currentPlan = '';
  public isParentProject = false;
  constructor(private fb: FormBuilder,
              public dialog: MatDialog,
              public route: ActivatedRoute,
              private workspaceServe: NewWorkspaceService,
              private cdRef: ChangeDetectorRef,
              private titleService: TitleService,
              private router: Router,
              private auth: AuthenticationService,
              private common: CommonService,
              private projectStore: ProjectDataStoreService,
              private theme: ThemeService) {
              // Checking the route param id is valid one or not
              const checkForHexRegExp = /^[a-f\d]{24}$/i
              this.route.params.subscribe(params => {
                if (!checkForHexRegExp.test(params.id)) {
                  this.router.navigate(['/v2/projects']);
                }
              });
  }

  ngOnInit() {
    this.projectStore.start();
    this.themeSettings = this.theme.getThemeSettings();
    const access = this.auth.getModuleAccess('projects');
    this.subProjects = [];
    this.subProjectAccess = access['subProjects'];
    this.attachmentAccess = access['attachments'];
    this.projectDepth = this.subProjectAccess['depth'];
    this.labels = this.workspaceServe.getLabels();
    this.titleService.updateTitle(this.labels['project'][1]);
    this.isOpenedProject = false;
    this.onResize();
    this.backTags = Object.assign([], this.tags);
    this.projectViewForm = this.fb.group({
      'name': new FormControl(' ', Validators.required),
      'description': new FormControl(null),
      'tags': []
    });
    this.isBrandsEnabled = !(this.subProjectAccess && this.subProjectAccess['layout'] === 'simple');
    if (!this.isBrandsEnabled) {
      this.projectStore.getData().subscribe(data => {
        this.allProjects = data;
        this.listSubProjectFromBackload();
      });
    }
    this.listSubProject();
    this.workspaceServe.clearProjectsForScenario();
  }
  listSubProjectFromBackload () {
    if (!this.allProjects || !this.projectId && !this.isParentProject) {
      return false;
    }
    const currentProject = this.allProjects.find(pro => pro['_id'] === this.projectId);
    if (currentProject) {
      const parentMaps = this.workspaceServe.getProjectParents() || [];
      const subProjects = [];
      const parentSubProjects = [];
      if (currentProject.subProjects) {
        currentProject.subProjects.map(subProject => {
          parentMaps.push({pid: subProject['_id'], pname: subProject.name, parentId: this.projectId, parentName: currentProject.name});
          if (subProject['subProjects'] && subProject['subProjects'].length > 0) {
            subProject.subProjects.map(project => {
              parentMaps.push({pid: project['_id'], pname: project.name, parentId: subProject['_id'], parentName: subProject.name});
              const temp = JSON.parse(JSON.stringify(project));
              temp['brand'] = subProject['name'];
              subProjects.push(temp);
            });
          }
          parentSubProjects.push({
            id: subProject['_id'],
            name: subProject['name']
          });
        });
      }
      this.subProjects = subProjects;
      this.dummySubProjects = subProjects;
      this.parentProjects = parentSubProjects;
      this.brandName = currentProject.name;
      /* this.subProjects.map(proj => {
        parentMaps.push({pid: proj._id, pname: proj.name, parentId: this.projectId, parentName: currentProject.name});
      }); */
      this.workspaceServe.setProjectParents(this.getUnique(parentMaps, 'pid'));
      this.currentProject = currentProject;
      this.scenarios = this.currentProject.scenarios;
      this.projectTitle = currentProject.name;
      this.isSubProject = currentProject.isSubProject;
      this.projectDescription = currentProject.description && currentProject.description || '';
      this.tags = currentProject.tags && Object.assign([], currentProject.tags) || [];
      this.backTags = currentProject.tags && Object.assign([], currentProject.tags) || [];
      const parentProjects = this.prepareBreadcrumbs(currentProject);
      this.subProjectLevel = parentProjects.length;
      this.workspaceServe.setSubprojectLevel(this.subProjectLevel);
      this.cdRef.markForCheck();
      this.projectViewForm.setValue({
        'name': this.projectTitle,
        'description': this.projectDescription,
        'tags': this.tags,
      });
    }
  }
  listSubProject() {
    this.route.params.subscribe(params => {
      this.projectId = params.id;
      this.workspaceServe.getProject(params.id).subscribe(project => {
        if (!project.isSubProject && !this.isBrandsEnabled) {
          this.isParentProject = true;
          this.listSubProjectFromBackload();
        } else {
          this.isParentProject = false;
          const parentMaps = this.workspaceServe.getProjectParents() || [];
          this.subProjects = project.subProjects;
          this.brandName = project.name;
          this.subProjects.map(proj => {
            parentMaps.push({pid: proj._id, pname: proj.name, parentId: this.projectId, parentName: project.name});
          });
          this.workspaceServe.setProjectParents(this.getUnique(parentMaps, 'pid'));
          this.dummySubProjects = project.subProjects;
          this.currentProject = project;
          this.scenarios = this.currentProject.scenarios;
          this.projectTitle = project.name;
          this.isSubProject = project.isSubProject;
          this.projectDescription = project.description && project.description || '';
          this.tags = project.tags && Object.assign([], project.tags) || [];
          this.backTags = project.tags && Object.assign([], project.tags) || [];
          const parentProjects = this.prepareBreadcrumbs(project);
          if (this.isBrandsEnabled) {
            this.subProjectLevel = parentProjects.length;
          } else {
            this.subProjectLevel = 2;
          }
          this.workspaceServe.setSubprojectLevel(this.subProjectLevel);
          this.cdRef.markForCheck();
          /*
          let breadCrumbs = [];
          if (!project.isSubProject) {
            breadCrumbs = [
              {label: 'WORKSPACE', url: '/v2/projects/lists'},
              {label: this.projectTitle, url: ''}
            ];
            this.common.setBreadcrumbs(breadCrumbs);
          } else if (project.isSubProject) {
            const parentId = localStorage.getItem('parentId');
            this.workspaceServe.getProject(parentId).subscribe( response => {
              breadCrumbs = [
                {label: 'WORKSPACE', url: '/v2/projects/lists'},
                {label: response.name, url: '/v2/projects/' + response._id},
                {label: this.projectTitle, url: ''}
              ];
              this.common.setBreadcrumbs(breadCrumbs);
            });
          } */
          this.projectViewForm.setValue({
            'name': this.projectTitle,
            'description': this.projectDescription,
            'tags': this.tags,
          });
        }
      });
    });
  }

  onEditProject() {
    this.isEditProject = true;
    setTimeout(() => {
      this.focusNameRef.nativeElement.focus();
    }, 100);
  }

  onSaveProject() {
    this.isEditProject = false;
    this.projectTitle = this.projectViewForm.value.name;
    this.onSubmit(this.projectViewForm);
    this.projectDescription = this.projectViewForm.value.description;
    this.backTags = Object.assign([], this.projectViewForm.value.tags);
  }

  onCancelProject() {
    this.isEditProject = false;
    this.projectViewForm['controls'].name.patchValue(this.projectTitle);
    this.projectViewForm['controls'].description.patchValue(this.projectDescription);
    this.tags = Object.assign([], this.backTags);
  }

  /** commented as per new desing  */

  /* dropdownStageChange(state: boolean) {
     this.cService.setDropdownState(state);
   }  
   disableEditProjectNote() {
     this.isEditProjectNote = false;
     this.projectViewForm['controls'].notes.disable();
     this.projectViewForm['controls'].notes.patchValue(this.formData.notes && this.formData.notes || null);
     this.projectViewForm['controls'].customer['controls']['name'].disable();
     this.projectViewForm['controls'].customer['controls']['name'].patchValue(this.formData.customer.name && this.formData.customer.name || null);
     this.projectViewForm['controls'].customer['controls']['notes'].disable();
 
     this.projectViewForm['controls'].customer['controls']['notes'].patchValue(this.formData.customer.notes && this.formData.customer.notes || null);
 
     this.projectViewForm['controls'].customer['controls']['email'].disable();
     this.projectViewForm['controls'].customer['controls']['email'].patchValue(this.formData.customer.email && this.formData.customer.email || null);
 
     this.dropdownStageChange(false);
   }
   editProjectNote() {
     this.isEditProjectNote = true;
     this.projectViewForm['controls'].notes.enable();
     this.projectViewForm['controls'].customer['controls']['name'].enable();
     this.projectViewForm['controls'].customer['controls']['notes'].enable();
     this.projectViewForm['controls'].customer['controls']['email'].enable();
     this.formData = this.projectViewForm.value;
   }*/

  onSubmit(form) {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({
          onlySelf: true
        });
      } else if (control instanceof FormGroup) {
        this.validateFormGroup(control);
      }
    });
    if (form.valid) {
      const formatProject = {
        'name': form.value.name,
        'description': this.workspaceServe.returnNullIfEmpty(form.value.description),
        'tags': form.value.tags.length > 0 ? form.value.tags : null,
        'parentId': null,
        'attachments': null,
        'folders': this.currentProject.folders.length > 0 && this.currentProject.folders.map(folder => folder['_id']) || null,
        'subProjects': this.currentProject.subProjects.length > 0
          && this.currentProject.subProjects.map(subProject => subProject._id) || null,
        'scenarios': this.currentProject.scenarios.length > 0 && this.currentProject.scenarios.map(scenario => scenario['_id']) || null,
        'isSubProject': this.isSubProject
      };
      if (this.subProjectAccess['status'] !== 'active') {
        delete formatProject['subProjects'];
      }
      this.tags = Object.assign([], form.value.tags);
      this.workspaceServe.updateProject(this.projectId, formatProject)
        .subscribe(result => {
          if (result['error'] && result['error']['code'] && result['error']['code'] === 7041) {
            this.nameUniqueError = true;
            this.isEditProject = true;
          } else if (result['error'] && result['error']['code']) {
            swal('Warning', result['error']['message'], 'warning');
            this.nameUniqueError = false;
            this.isEditProject = true;
          } else {
            this.currentProject.name = form.value.name;
            this.currentProject.tags = form.value.tags.length > 0 ? form.value.tags : null;
            this.currentProject.description = form.value.description;
            this.projectStore.addOrUpdateProject(this.currentProject, this.currentProject.parentId);
            swal('Success', result['message'], 'success');
            this.nameUniqueError = false;
            this.isEditProject = false;
          }
      });
    }
  }

  validateFormGroup(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({
          onlySelf: true
        });
      } else if (control instanceof FormGroup) {
        this.validateFormGroup(control);
      }
    });
  }

  onResize() {
    this.contentHeight = window.innerHeight - 122;
  }

  deleteSubProject(subProjectId) {
    this.subProjects = this.subProjects.filter(project => project._id !== subProjectId);
  }

  onOpenConfirmation() {
    const width = '586px';
    const height = '230px';
    const data = {};
    data['title'] = 'Delete Project Name 001?';
    data['description'] = 'Are you sure you want to delete Project Name 001?';
    data['confirmButtonText'] = 'Yes, Delete';
    data['cancelButtonText'] = 'Cancel';
    data['messageText'] = `Your ${this.labels['project'][0]} deleted Successfully`;
    this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: width,
      height: height
    }).afterClosed().subscribe();
  }

  onOpenScenario() {
    const width = '586px';
    const height = 'auto';
    const data = {};
    this.dialog.open(ScenarioDialogComponent, {
      data: data,
      width: width,
      height: height
    }).afterClosed().subscribe();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  onNewSubProject(type = 'direct', isParent = false, parentProjects = [], parentId = '', name = '', plan = 'inventory', level = 0) {
    const title = name !== ''? name : (this.subProjectLevel < 1 && this.isBrandsEnabled ? this.labels['subProject'][0] :  this.labels['folder'][0]);
    let newSubProject: NewSubProjectDialog;
    if (parentProjects.length > 0 || isParent) {
      newSubProject = {
        isProject: false,
        namePlaceHolder: `* ${title} Name`,
        descPlaceHolder: `${title} Description (Optional)`,
        dialogTitle: `Create ${title}`,
        nameValidError: `${title} name can't blank`,
        subProjectLabel: title,
        parents: parentProjects,
        parentName: this.labels['subProject'][0],
        parentId: parentId,
        projectId: this.projectId
      };
    } else {
      newSubProject = {
        isProject: false,
        namePlaceHolder: `* ${title} Name`,
        descPlaceHolder: `${title} Description (Optional)`,
        dialogTitle: `Create ${title}`,
        nameValidError: `${title} name can't blank`,
        subProjectLabel: title,
        parentId: parentId,
        projectId: this.projectId
      };
    }
    this.currentPlan = '';
    this.dialog.open(NewProjectDialogComponent, {
      data: newSubProject,
    }).afterClosed()
        .subscribe(data => {
          if (data) {
            if (data && data['type']) {
              switch (data['type']) {
                case 'saved':
                  this.workspaceServe.getProject(data['response']['data']['id']).subscribe(project => {
                    this.projectStore.addOrUpdateProject(project, data['parentId']);
                    this.cdRef.markForCheck();
                    if (type === 'popup') {
                      this.workspaceServe.setProjectsForScenario(data['response']['data']['id'], level);
                      this.currentPlan = plan;
                    } else if (type === 'projectPopup') {
                      this.onNewSubProject('direct', true, this.parentProjects, data['response']['data']['id'], this.labels['folder'][0]);
                    } else {
                      this.router.navigate(['/v2/projects/', data['response']['data']['id']]);
                    }
                  });
                  break;
                case 'create':
                  this.onNewSubProject('projectPopup', false, [], this.projectId, this.labels['subProject'][0]);
                  break;
                default:
                  break;
              }
            }
          }
        });
      // .subscribe(data => {
      //   if (data && data['type'] && data['type'] === 'create') {
      //     this.onNewSubProject('direct', [], this.projectId , this.labels['subProject'][0]);
      //   } else if (data) {
      //     const values = data.values;
      //     const subProject = {
      //       'name': values.name,
      //       'description': values.description && data.description || null,
      //       'parentId': values.parent_id
      //     };
      //     this.workspaceServe.createSubProject(subProject).subscribe(res => {
      //       if (!res['error']) {
      //         this.workspaceServe.getProject(res['data']['id']).subscribe(project => {
      //           this.projectStore.addOrUpdateProject(project, subProject.parentId);
      //           const parentMaps = this.workspaceServe.getProjectParents() || [];
      //           parentMaps.push({
      //             pid: res['data']['id'],
      //             pname: data.name,
      //             parentId: this.currentProject['_id'],
      //             parentName: this.currentProject.name
      //           });
      //           this.workspaceServe.setProjectParents(parentMaps);
      //           // localStorage.setItem('parentId', this.projectId);
      //           this.cdRef.markForCheck();
      //           if (values.parent_id === this.projectId && !this.isBrandsEnabled) {
      //             this.onNewSubProject('direct', this.parentProjects, res['data']['id'], this.labels['folder'][0]);
      //           } else {
      //             this.router.navigate(['/v2/projects/', res['data']['id']]);
      //           }
      //         });
      //       } else {
      //         swal('Warning', res['error']['message'], 'warning');
      //       }
      //     });
      //   }
      // });
  }
  public clearSearch() {
    this.isSearchHide = !this.isSearchHide;
    this.searchQuery = '';
    this.subProjects = this.dummySubProjects;
  }

  public filterSubProject(eventData) {
    if (!eventData || eventData === '') {
      this.resetSearch();
      return;
    }
    const searchTerm = eventData.split(' ');
    this.subProjects = this.dummySubProjects
      .filter(item => {
        const name = item.name || '';
        const desc = item.description || '';
        let result = 0;
        searchTerm.forEach(term => {
          term = term.toLowerCase();
          if (name.toLowerCase().includes(term) || desc.toLowerCase().includes(term)) {
            result++;
          }
        });
        return result > 0;
      });
  }

  private resetSearch() {
    this.subProjects = this.dummySubProjects;
  }
  public onCreateScenario(plan= 'inventory') {
    const routerLink = '/v2/projects/' + this.projectId + '/scenarios/create-scenario/' + plan;
    this.router.navigate([routerLink]);
  }
  getUnique(arr, comp) {
    const unique = arr
      .map(e => e[comp])

      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the dead keys & store unique objects
      .filter(e => arr[e]).map(e => arr[e]);

    return unique;
  }
  prepareBreadcrumbs(project) {
    const breadcrumb = this.common.prepareBreadcrumbs(project);
    const breadCrumbs = breadcrumb['breadCrumbs'];
    // breadCrumbs.push({label: project['name'], url: ''});
    this.common.setBreadcrumbs(breadCrumbs);
    return breadcrumb['projects'];
    /* const parents = this.workspaceServe.getProjectParents();
    let pid = project['_id'];
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
    } */
  }
  attchmentFile(type = 'view'): void {
    const data = {
      'title': this.currentProject['name'],
      'attachments' : this.currentProject['attachments'],
      'data': this.currentProject,
      'id': this.currentProject['_id'],
      'type': type
    };
    const dialogRef = this.dialog.open(ProjectsAttachmentComponent, {
      width: '900px',
      // height: '450px',
      panelClass: 'attachment-dialog-container',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  triggerAction(values) {
    this.onNewSubProject('popup', false, [], values['parentId'], values['name'], values['plan'], values['level']);
  }
}
