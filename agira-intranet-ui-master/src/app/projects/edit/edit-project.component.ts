import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { ProjectService } from '../../services/project.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterConfigLoader } from '@angular/router/src/router_config_loader';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import {Location} from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { AccountsService } from '../../services/accounts.service';




@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  clients;
  project_id;
  project;
  projectForm: FormGroup;
  projectModel: any = {};
  categories;
  managers;

  constructor(
    private clientservice: ClientService,
    private projectservice: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private flashService: FlashService,
    private errorService: ErrorService,
    private location: Location,
    private categoryService: CategoryService,
    private accountService: AccountsService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.project_id = params['id'];
      }
    );

    this.projectForm = this.formBuilder.group({
      'id' : '',
      'name' : ['', Validators.required],
      'description': '',
      'duration': ['', Validators.required],
      'budget': '',
      'is_default': '',
      'is_active': '',
      'client_id': ['', Validators.required],
      'category_id': ['', Validators.required],
      'owner_id': ['', Validators.required]
    });

    this.categoryService.getCategories().subscribe(
      data => {
        this.categories = data.body['result'];
      }, error => {
        this.errorService.errorHandling(error);
      }
    );


    this.accountService.getManagers().subscribe(
      data => {
        this.managers = data.body['result'];
      }, error => {
        this.errorService.errorHandling(error);
      }
    );

    this.clientservice.getClients().subscribe(
      data => {
        this.clients = data.body['result'];
        if (data.body['success'] === true) {
          this.projectservice.projectDetails(this.project_id).subscribe(
            data1 => {
              this.project = data1.body['result'];
                if (data1.body['success'] === true) {
                  this.projectForm.patchValue({
                    'id' : this.project.id,
                    'name' : this.project.name,
                    'description': this.project.description,
                    'duration': this.project.duration,
                    'budget': this.project.budget,
                    'client_id': this.project.client_id,
                    'category_id': this.project.category.id,
                    'owner_id': this.project.owner.id,
                    'is_default': this.project.is_default,
                    'is_active': this.project.is_active
                  });
                }
            },
            error => {
              this.errorService.errorHandling(error);
            }
          );
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
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

  onSubmit(formGroup) {
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
    this.projectModel.project = formGroup.value;
    this.projectservice.updateProject(this.projectModel).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('project/' + data.body['result'].id);
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  locationBack() {
    this.location.back();
  }

}

