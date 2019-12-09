import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-show-project',
  templateUrl: './show-project.component.html',
  styleUrls: ['./show-project.component.css']
})
export class ShowProjectComponent implements OnInit {

  project_id;
  project: any = {};
  accounts;
  new_accounts = [];
  emptyData = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectservice: ProjectService,
    private flashService: FlashService,
    private errorService: ErrorService

  ) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.project_id = params['id'];
      }
    );
    this.projectDetails();
  }
  addAccounts() {
    this.project = this.project;
    this.new_accounts = JSON.parse(JSON.stringify(this.new_accounts));

    // this.new_accounts = this.new_accounts;
  }
  deleteAccount(id) {
    this.projectservice.deleteAccount(this.project_id, id).subscribe(
      data => {
        if (data.body['success']) {
          this.projectDetails();
          this.flashService.show(data.body['message'], 'alert-success');
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  projectDetails() {
    this.projectservice.projectDetails(this.project_id).subscribe(
      data => {
        this.project = data.body['result'];
        this.accounts = data.body['result'].accounts;
        this.new_accounts = [];
        for (let i = 0; i < this.accounts.length; i++) {
          if (this.accounts[i].is_active) {
            this.new_accounts.push(this.accounts[i].account.id);
          }
        }
        if (this.accounts.length === 0) {
          this.emptyData = true;
        }else {
          this.emptyData = false;
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }
  onReload(value) {
    if (value === true) {
      this.projectDetails();
    }
  }

  addAccount(id) {
    this.new_accounts.push(id);
    let model: any = {};
    model.employees = this.new_accounts;
    model.project_id = this.project_id;
    let form: any = {};
    form.project_accounts = model;
    this.projectservice.addAccounts(form).subscribe(
      data => {
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.projectDetails();
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }
  }


