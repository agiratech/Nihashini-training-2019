import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { ProjectService } from '../../services/project.service';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import { AuthenticationService } from '../../authentication.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private accountsService: AccountsService,
    private projectService: ProjectService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService,
    private authenticationservice: AuthenticationService,
  ) { }

  account_id;
  account: any = {};
  managers;
  projects;
  all_projects = {'id': '', 'name': 'Select'};
  emptyData;
  noData;
  mentor: any = {};
  mentor_id;
  is_admin;
  accounts;
  project_id = '';
  @ViewChild('closeModal') close: ElementRef;

  ngOnInit() {
    /* Getting Account Id */

    this.route.params.subscribe(
      params => {
        this.account_id = params['id'];
      }
    );
    this.accountsService.getEmployees(this.account_id).subscribe(
      data => {
        this.spinnerService.hide();
        this.accounts = data.body['result'];
        if (this.accounts.length === 0) {
          this.noData = true;
        }else {
          this.noData = false;
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );

    this.projectService.getProjects().subscribe(
      data => {
        if (data.body['success']) {
          this.all_projects = data.body['result'];
        }
      }, error => {
        console.log(error);
      }
    );
    // this.authenticationservice.is_Admin.subscribe((val: boolean) => {
    //   this.is_Admin = val;
    // });




    this.spinnerService.show();
    /* Getting Account Details for the User */

    this.accountDetails();
    this.spinnerService.show();
    this.accountsService.getManagers().subscribe(
      data => {
        this.spinnerService.hide();
        this.managers = data.body['result'];
      }, error => {
        this.spinnerService.hide(),
        this.errorService.errorHandling(error);
      }
    );
  }

  accountDetails() {
    this.accountsService.accountDetails(this.account_id).subscribe(
      data => {
        this.spinnerService.hide();
        this.account = data.body['result'];
        this.projects = data.body['result'].projects;
        if (this.account.roles.includes('admin')) {
          this.is_admin = false;
        }else {
          this.is_admin = true;
        }
        if (this.projects.length == 0) {
          this.emptyData = true;
        }else {
          this.emptyData = false;
        }
        this.mentor_id = data.body['result'].manager.id;
        this.projects = data.body['result'].projects;
        // if(this.projects.length == 0){
        //   this.emptyData = true;
        // }else{
        //   this.emptyData = false;
        // }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  changeMentor() {
    this.mentor.employee_id = this.account.id;
    this.mentor.manager_id = parseInt(this.mentor_id);
    let form: any = {};
    form.mentor = this.mentor;
    this.spinnerService.show();
    this.accountsService.assignMentor(this.account.id, form).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
        }else {
          this.flashService.show(data.body['message'], 'alert-danger');
        }
      }, error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  add_account (id, value) {
    let model: any = {};
    model.account_id = this.account_id;
    model.project_id = id;
    model.action = value;
    let form: any = {};
    form.project_accounts = model;
    this.accountsService.addProject(form).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.accountDetails();
          this.close.nativeElement.click();
        }
      }, error => {
        console.log(error);
      }
    );
  }
}
