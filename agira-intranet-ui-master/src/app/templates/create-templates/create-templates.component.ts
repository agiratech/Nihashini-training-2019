import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { TemplatesService } from '../../services/templates.service';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {Location} from '@angular/common';


@Component({
  selector: 'app-create-templates',
  templateUrl: './create-templates.component.html',
  styleUrls: ['./create-templates.component.css']
})
export class CreateTemplatesComponent implements OnInit {

  templateForm: FormGroup;
  errors;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private templateService: TemplatesService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
     /* Building form for creating Templates */
    this.templateForm = this.formBuilder.group({
      'name': new FormControl('', [Validators.required]),
      'is_active': new FormControl(true, [])
    });
  }

  /* Creating the Template */
  onSubmit(formData) {
    this.spinnerService.show();
    this.templateService.createTemplate(formData).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('templates');
        } else {
          this.errors = data.body['result'];
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  locationBack() {
    this.location.back();
  }

}
