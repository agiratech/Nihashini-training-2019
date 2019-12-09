import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { FlashService } from '../../flash/flash.service';
import { ErrorService } from '../../services/error.service';
import { AccountsService} from '../../services/accounts.service';
import { ProjectListComponent } from '../list/project-list.component';
import { IMultiSelectOption, IMultiSelectSettings} from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'app-assign-projects',
  templateUrl: './assign-projects.component.html',
  styleUrls: ['./assign-projects.component.css']
})
export class AssignProjectsComponent implements OnInit {

  @ViewChild('closeModal') close: ElementRef;

  constructor(
    private projectService: ProjectService,
    private flashservice: FlashService ,
    private errorService: ErrorService,
    private accountService: AccountsService
  ) {
  }

  @Input() project;
  @Input() optionsModel;
  @Output() reload = new EventEmitter<boolean>();
  accounts: IMultiSelectOption[];
  model: any = {};
  exis_project: any = {};
  mySettings: IMultiSelectSettings;
  // optionsModel: number[];

  ngOnInit() {
    this.mySettings = {
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'btn btn-default btn-block',
      maxHeight: '150px',
      displayAllSelectedText: true,
      dynamicTitleMaxItems: 1000
    };

    this.accountService.getAccounts().subscribe(
      data => {
        this.accounts = data.body['result'].accounts;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
    // this.exis_project = this.project;
    // this.optionsModel = JSON.parse(JSON.stringify(this.project.accounts));
  }

  assignEmployee() {
    this.model.employees = this.optionsModel;
    this.model.project_id = this.project.id;
    let form: any = {};
    form.project_accounts = this.model;
    this.projectService.addAccounts(form).subscribe(
      data => {
        this.reload.emit(true);
        this.flashservice.show(data.body['message'], 'alert-success');
        this.close.nativeElement.click();
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }
}
