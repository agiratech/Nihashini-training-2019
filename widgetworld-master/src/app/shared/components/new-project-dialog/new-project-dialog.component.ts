import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {NewProjectDialog, WorkflowLables, CreateProjectReq} from '@interTypes/workspaceV2';
import {NewWorkspaceService} from '../../../projects/new-workspace.service';
import swal from 'sweetalert2';
import {AuthenticationService} from '@shared/services';

@Component({
  selector: 'app-new-project-dialog',
  templateUrl: './new-project-dialog.component.html',
  styleUrls: ['./new-project-dialog.component.less']
})
export class NewProjectDialogComponent implements OnInit {
  public title: String;
  public description: String;
  public namePlaceHolder: String;
  public descPlaceHolder: String;
  public isProject: Boolean;
  public nameValidError: String = 'Project Name can\'t blank';
  public subProjectLabel: string;
  public parents: any;
  public parentName: string;
  public parentId: string;
  projectForm: FormGroup;
  public labels: WorkflowLables;
  public noBrandId = '';
  public projectId = '';
  public subProjectAccess;
  public projectDepth;
  public isSimpleLayout = false;
  public dialogData = {};
  @ViewChild('fName', {static: false}) focusNameRef: ElementRef;
  constructor(public dialogRef: MatDialogRef<NewProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewProjectDialog,
    private fb: FormBuilder,
    private workSpace: NewWorkspaceService,
    private auth: AuthenticationService
    ) { }

  ngOnInit() {
    this.dialogData = JSON.parse(JSON.stringify(this.data));
    const access = this.auth.getModuleAccess('projects');
    this.subProjectAccess = access['subProjects'];
    this.projectDepth = this.subProjectAccess['depth'];
    this.isSimpleLayout = this.subProjectAccess && this.subProjectAccess.layout === 'simple';
    this.labels = this.workSpace.getLabels();
    this.isProject = this.dialogData['isProject'];
    this.title = this.dialogData['dialogTitle'];
    this.description = this.dialogData['projectDesc'];
    this.namePlaceHolder = this.dialogData['namePlaceHolder'];
    this.descPlaceHolder = this.dialogData['descPlaceHolder'];
    this.nameValidError = this.dialogData['nameValidError'] && this.dialogData['nameValidError'];
    this.subProjectLabel = this.dialogData['subProjectLabel'];
    this.parents = this.dialogData['parents'];
    this.parentName = this.dialogData['parentName'];
    this.parentId = this.dialogData['parentId'] ? this.dialogData['parentId'] : '';
    this.projectId = this.dialogData['projectId'] ? this.dialogData['projectId'] : '';
    if (this.dialogData['parentId'] || this.dialogData['parents']) {
      if (this.dialogData['parents'] && this.isSimpleLayout) {
        this.projectForm = this.fb.group({
          'name': [this.dialogData['projectName'], [Validators.required]],
          'description': new FormControl(null),
          'parentId': [this.parentId] //, [Validators.required]
        });
        const noBrandIndex = this.dialogData['parents'].findIndex(sub => sub.name === '--noBrand--');
        if (noBrandIndex < 0) {
          const newBrand = {
            'name': '--noBrand--',
            'description': '--noBrand--',
            'parentId': this.projectId
          };
          this.workSpace.createSubProject(newBrand).subscribe(data => {
            if (this.projectForm['controls'].parentId
              && (this.projectForm['controls'].parentId.value === ''
                || this.projectForm['controls'].parentId.value === null)) {
              this.projectForm['controls'].parentId.setValue(data['data']['id']);
              // this.onSubProjectChange(data['data']['id'], true);
            }
            this.noBrandId = data['data']['id'];
          });
        } else {
          if (this.projectForm['controls'].parentId
            && (this.projectForm['controls'].parentId.value === ''
              || this.projectForm['controls'].parentId.value === null)) {
            this.projectForm['controls'].parentId.setValue(this.dialogData['parents'][noBrandIndex]['id']);
            // this.onSubProjectChange(data['data']['id'], true);
          }
          this.noBrandId = this.dialogData['parents'][noBrandIndex]['id'];
          this.dialogData['parents'].splice(noBrandIndex, 1);
        }
        // this.dialogData['parents'].splice(noBrandIndex, 1);
        this.parents = this.dialogData['parents'];
      } else {
        this.projectForm = this.fb.group({
          'name': [this.dialogData['projectName'], [Validators.required]],
          'description': new FormControl(null),
          'parentId': [this.parentId, [Validators.required]]
        });
      }
    } else {
      this.projectForm = this.fb.group({
        'name': [this.dialogData['projectName'], [Validators.required]],
        'description': new FormControl(null)
      });
    }
  }
  onSubmit(form) {
    if (this.projectForm.valid) {
      const data = {type: 'saved', parentId: null, response: {}};
      const newProject: CreateProjectReq = form.value;
      this.workSpace.createProject(newProject)
        .subscribe(res => {
          if (!res['error']) {
            data['response'] = res;
            if (newProject['parentId']) {
              data['parentId'] = newProject['parentId'];
              this.workSpace.getProject(data['parentId']).subscribe(project => {
                if (!res['error']) {
                  const parentMaps = this.workSpace.getProjectParents() || [];
                  parentMaps.push({
                    pid: res['data']['id'],
                    pname: project.name,
                    parentId: project['_id'],
                    parentName: project.name
                  });
                  this.workSpace.setProjectParents(parentMaps);
                  this.dialogRef.close(data);
                }
              });
            } else {
              this.dialogRef.close(data);
            }
          } else {
            swal('Warning', res['error']['message'], 'warning');
          }
        });
    }
  }
  createNewProject() {
    this.dialogRef.close({
      'type': 'create'
    });
  }
  closeProjectDialog() {
    this.projectForm.patchValue({
      name: '',
      description: ''
    });
    this.dialogRef.close();
  }
}