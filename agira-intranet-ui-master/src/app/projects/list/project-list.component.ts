import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { AccountsService} from '../../services/accounts.service';
import { AuthenticationService } from '../../authentication.service';
import { FlashService } from '../../flash/flash.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ErrorService } from '../../services/error.service';
import { IMultiSelectOption, IMultiSelectSettings} from 'angular-2-dropdown-multiselect';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})

export class ProjectListComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private accountService: AccountsService,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private flashservice: FlashService ,
    private errorService: ErrorService,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  projects ;
  no_record: boolean = false;
  exis_project: any = {};
  searchText = '';
  currentPageNo = 1;
  count: any = 0;
  order: string = '';
  orderType: string = '';
  projectCounter: any = 0;
  clientCounter: any = 0;
  managerCounter: any = 0;
  categoryCounter: any = 0;
  statusCounter: any = 0;
  // accounts: IMultiSelectOption[];
  // mySettings: IMultiSelectSettings;
  @ViewChild('closeModal') close: ElementRef;
  model: any = {};
  optionsModel: number[];

  ngOnInit() {
    this.getProjects();
  }

  delete(id) {
    this.projectService.deleteProject(id).subscribe(
      data => {
        if (data.body['success'] === true) {
          this.getProjects();
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  getProjects(pgNo?) {
    if (pgNo != null) {
      this.currentPageNo = pgNo;
    }
    this.spinnerService.show();
    this.projectService.getProjects('', this.currentPageNo, this.searchText, this.order, this.orderType).subscribe(
      data => {
        this.spinnerService.hide();
        this.projects = data.body['result'];
        this.count = data.body['count'];
        this.no_record = this.projects.length > 0 ? false : true;
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

  sortProjects(value){
    switch(value){
      case 'projects':
        this.projectCounter += 1;
        this.callSorting(this.projectCounter, value)
        break;
      case 'clients':
        this.clientCounter += 1;
        this.callSorting(this.clientCounter, value)
        break;
      case 'managers':
        this.managerCounter += 1;
        this.callSorting(this.managerCounter, value)
        break;
      case 'categories':
        this.categoryCounter += 1;
        this.callSorting(this.categoryCounter, value)
        break;
      case 'statuses':
        this.statusCounter += 1;
        this.callSorting(this.statusCounter, value)
        break;
    }
  }

  callSorting(counter, value){
    this.order = value
    if(counter%2 == 0){
      this.orderType = 'asc'
    }else{
      this.orderType = 'desc'
    }
    this.getProjects(this.currentPageNo)
  }

  addAccounts(value) {
    this.exis_project = value;
    this.optionsModel = JSON.parse(JSON.stringify(value.accounts));
  }


  onReload(value) {
    if (value === true) {
      this.getProjects();
    }
  }
  // assignEmployee() {
  //   this.model.employees = this.optionsModel;
  //   this.model.project_id = this.exis_project.id;
  //   let form: any ={};
  //   form.project_accounts = this.model;
  //   this.projectService.addAccounts(form).subscribe(
  //     data => {
  //       this.getProjects()
  //       this.flashservice.show(data.body['message'],"alert-success")
  //       this.close.nativeElement.click();
  //     },
  //     error => {
  //       this.errorService.errorHandling(error)
  //     }
  //   )
  // }

}
