import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { CustomValidators } from '../../validators/custom-validators.validator';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';


@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.css']
})
export class EditClientComponent implements OnInit {

  clientForm: FormGroup;
  user: any = {};
  client_id;
  client;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private clientservice: ClientService,
    private router: Router,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.clientForm = this.formBuilder.group ({
      'id': new FormControl(''),
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      'name': new FormControl('', [Validators.required]),
      'phone_number': new FormControl('', [Validators.required]),
      'country': new FormControl('', [Validators.required])
  });

  this.route.params.subscribe(
    params => {
      this.client_id = params['id'];
    }
  );

  this.clientservice.clientDetails(this.client_id).subscribe(
    data => {
      this.client = data.body['result'];
      if (data.body['success'] === true) {
        this.clientForm.patchValue({
          'id': this.client.id,
          'name': this.client.name,
          'email': this.client.email,
          'phone_number': this.client.phone_number,
          'country': this.client.country
        });
      }
    },
    error => {
      this.errorService.errorHandling(error);
    }
  );
}


onSubmit(formData) {
  this.spinnerService.show();
  this.user.client = formData;
  this.clientservice.updateClient(this.user).subscribe(
    data => {
      this.spinnerService.hide();
      this.flashService.show(data.body['message'], 'alert-success');
      this.router.navigateByUrl('clients');
    },
    error => {
      this.spinnerService.hide();
      this.errorService.errorHandling(error);
    }
  );
}
}
