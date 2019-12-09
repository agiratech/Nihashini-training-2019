import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplatesService } from '../../services/templates.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';
import {Location} from '@angular/common';
import { FlashService } from '../../flash/flash.service';

@Component({
  selector: 'app-edit-templates',
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.css']
})
export class EditTemplatesComponent implements OnInit {

  templateForm: FormGroup;
  errors: any = {};
  template_id;
  template;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private location: Location,
    private errorService: ErrorService,
    private templateService: TemplatesService,
    private flashService: FlashService
  ) { }

  ngOnInit() {
    this.templateForm = this.formBuilder.group({
      'id': new FormControl(''),
      'name': new FormControl('', [Validators.required]),
      'is_active': new FormControl('', [])
    });


    /* Getting Template Id from URL   */
    this.route.params.subscribe(
      params => {
        this.template_id = params['id'];
      }
    );

    this.spinnerService.show();
    /* Getting Account Details for that Account  */
    this.templateService.getTemplate(this.template_id).subscribe(
      data => {
        this.spinnerService.hide();
        this.template = data.body['result'];
        this.templateForm.patchValue({
          'id': this.template.id,
          'name': this.template.name,
          'is_active': this.template.is_active
        });
      },
      error => {
        this.spinnerService.hide();
      }
    );
  }

  /* Updating the Template */
  onSubmit(formData) {
    this.spinnerService.show();
    this.templateService.updateTemplateData(formData).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('templates');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
          this.errors = data.body['result'];
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
