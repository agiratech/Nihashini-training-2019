import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { AccountsService } from '../../services/accounts.service';
import { Router } from '@angular/router';
import { FlashService } from '../../flash/flash.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CustomValidators } from '../../validators/custom-validators.validator';
import { Identifiers } from '@angular/compiler/src/identifiers';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { ErrorService } from '../../services/error.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private authenticationservice : AuthenticationService,
    private router : Router,
    private flashService: FlashService,
    private accountsService: AccountsService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService

  ) {
    this.account_id = JSON.parse(localStorage.getItem('currentUser')).id
  }


  passwordForm;
  imageForm;
  model: any = {};
  account: any = {};
  account_id: number;
  errors;
  profile_pic;
  account_name;
  @ViewChild('closeModal') close: ElementRef;
  @ViewChild('closeModal1') close1: ElementRef;
  @ViewChild('fileInput') fileInput;


  ngOnInit() {
    this.accountsService.profile_pic.subscribe(
      data => {
        this.profile_pic = data
      }, error => {
        this.errorService.errorHandling(error)
      }
    )
    this.passwordForm = this.formBuilder.group({
      "password": new FormControl('',[Validators.required,Validators.minLength(6)]),
      "confirm_password": new FormControl('',[Validators.required, Validators.minLength(6)])
    }, {
      validator: this.checkIfMatchingPasswords('password', 'confirm_password')
    } )

    this.imageForm = this.formBuilder.group({
      "image": ''
    })

    this.accountDetails();
  }

  /* Getting Account Details */
  accountDetails(){
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        let user = data.body['result']
        this.account_name = user.name
        if(user.attachment != null) {
          this.accountsService.changeProfilePicture(environment.api_url+user.attachment);
        }
      }, error => {
        this.errorService.errorHandling(error)
      }
    )
  }
  /* Signing Out the User */
  signOut() {
    this.authenticationservice.signOut().subscribe(
      data => {
        localStorage.clear()
        this.flashService.show("signed out successfully","alert-success")
        this.router.navigateByUrl('/login')
      },
      error => {
        this.errorService.errorHandling(error)
      }
    )
  }

  /* Check Matching Password  */
  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
    let passwordInput = group.controls[passwordKey],
      passwordConfirmationInput = group.controls[passwordConfirmationKey];
    if (passwordInput.value !== passwordConfirmationInput.value) {
      return passwordConfirmationInput.setErrors({ notEquivalent: true })
    }
    else {
      return passwordConfirmationInput.setErrors(null);
    }
    }
  }

  onSubmit(formData){
    this.spinnerService.show()
    this.account = {};
    this.model = {};
    this.account.password = formData.password;
    this.account.id = this.account_id;
    this.model.account = this.account;
    this.accountsService.updateAccount(this.model).subscribe(
      data => {
        this.spinnerService.hide()
        if(data.body['success']){
          this.flashService.show(data.body['message'],"alert-success")
          this.close.nativeElement.click();
          this.router.navigateByUrl('/account/'+this.account_id+'/accountGoals')
        }else {
          this.errors = data.body['result']
          this.close.nativeElement.click();
          this.flashService.show(data.body['message'],"alert-danger")
        }
      },
      error => {
        this.spinnerService.hide()
        this.errorService.errorHandling(error)
      }
    )
  }

  onSubmitImage(){
    this.spinnerService.show()
    this.account.id = this.account_id;
    this.model.account = this.account
    this.accountsService.updateAccount(this.model).subscribe(
      data => {
        this.spinnerService.hide()
        if(data.body['success']){
          this.accountDetails()
          this.flashService.show(data.body['message'],"alert-success")
          this.close1.nativeElement.click();
          this.router.navigateByUrl('/account/'+this.account_id+'/accountGoals')
        }else {
          this.errors = data.body['result']
          this.close1.nativeElement.click();
          this.flashService.show(data.body['message'],"alert-danger")
        }
      },
      error => {
        this.spinnerService.hide()
        this.errorService.errorHandling(error)
      }
    )
  }

  onFileChange(event) {
    this.account = {}
    this.model = {}
    let reader = new FileReader();
    let fileBrowser = this.fileInput.nativeElement;
    let src = this
    var file = event.target.files[0];
    if(file )
    {
      reader.onload = function(e) {
        src.imageForm.patchValue ({
          image : e.target['result']
        })
        src.account.image = e.target['result'];
        src.onSubmitImage()
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}

