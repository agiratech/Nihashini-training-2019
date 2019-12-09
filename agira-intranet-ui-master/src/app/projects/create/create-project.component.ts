import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { CategoryService } from '../../services/category.service';
import { AccountsService } from '../../services/accounts.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import {Location} from '@angular/common';




@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})

export class CreateProjectComponent implements OnInit {

  projectForm;
  clients;
  projectModel: any = {};
  categories;
  managers;

  constructor(
  private formBuilder: FormBuilder,
  private clientservice: ClientService,
  private projectservice: ProjectService,
  private router: Router,
  private flashService: FlashService,
  private errorService: ErrorService,
  private accountService: AccountsService,
  private location: Location,
  private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.projectForm = this.formBuilder.group({
      'id' : '',
      'name' : [''],
      'description': [''],
      'duration': [''],
      'budget': '',
      'is_default': '',
      'client_id': ['', Validators.required],
      'category_id': ['', Validators.required],
      'owner_id': ['', Validators.required]
    });

    this.clientservice.getClients().subscribe(
      data => {
        this.clients = data.body['result'];
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
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

  onSubmit(formGroup: FormGroup) {
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
    this.projectservice.createProject(this.projectModel).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('projects');
        } else {
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
