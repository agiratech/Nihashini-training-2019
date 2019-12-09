import { Component, OnInit } from '@angular/core';
import { TemplatesService } from '../../services/templates.service';
import { AuthenticationService } from '../../authentication.service';
import { ErrorService } from '../../services/error.service';
import { FlashService } from '../../flash/flash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.css']
})
export class ListTemplatesComponent implements OnInit {

  currentUser;
  templates;
  template: any = {};
  noData = false;
  model: any = {};
  constructor(
    private templateService: TemplatesService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationservice: AuthenticationService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService,
    private dataService: DataService)
    {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (this.currentUser['roles'].includes('admin') /* || this.currentUser['roles'].includes('manager') */ ) {
        this.authenticationservice.changeAdmin(false);
      } else {
        this.authenticationservice.changeAdmin(true);
      }
   }

  ngOnInit() {
    this.spinnerService.show();
    this.getTemplates();
  }

  getTemplates(){
    this.templateService.getTemplates().subscribe(
      data => {
        this.spinnerService.hide();
        this.templates = data.body['result'];
        if(this.templates.length === 0) {
          this.noData = true;
        }else {
          this.noData = false;
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

  /* Updating the Template */
  active(template) {
    this.spinnerService.show();
    this.template.id = template
    this.template.is_active = true;
    this.model.template = this.template;
    this.spinnerService.show();
    this.templateService.updateTemplate(this.model).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success']) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getTemplates();
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

  /* Delete the Template*/
  delete(id) {
    this.spinnerService.show();
    this.templateService.deleteTemplate(id).subscribe(
      data => {
        if (data.body['success'] === true) {
          this.flashService.show(data.body['message'], 'alert-success');
          this.getTemplates();
        }
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }

}
