import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service' ;
import { ClientService } from '../../services/client.service';
import { ErrorService } from '../../services/error.service';
import { CustomValidators } from '../../validators/custom-validators.validator';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {

  clientForm: FormGroup;
  user: any = {};
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}';
  ngOnInit() {
    this.clientForm = this.formBuilder.group ({
        'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
        'name': new FormControl('', [Validators.required]),
        'phone_number': new FormControl('', [Validators.required]),
        'country': new FormControl('', [Validators.required])
    });
  }

  onSubmit(formData) {
    this.spinnerService.show();
    this.user.client = formData;
    this.clientService.createClient(this.user).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.router.navigateByUrl('clients');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

}
