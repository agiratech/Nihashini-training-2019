import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service' ;
import { HttpResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment} from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  signUpForm: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    /* Building form for registration  */
    this.signUpForm = this.formBuilder.group({
      'email': [''],
      'password': [''],
      'name': '',
      'role': ''
    });
  }

  /*Submitting for registering*/
  onSubmit(formData) {
    this.http.post(environment.api_url + '/accounts/', formData, { observe: 'response' }).subscribe(
      (data: HttpResponse<any>) => {
      },
      error => {
        this.errorService.errorHandling(error);
      }
    )
  }

}
