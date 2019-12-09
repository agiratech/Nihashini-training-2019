import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { FlashService } from '../../flash/flash.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  projects;
  color = false;
  currentUser: any = {};
  noData = false;
  constructor(
    private projectService: ProjectService,
    private flashService: FlashService,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    /* Getting All the accounts */
    this.projectService.getProjects(false).subscribe(
      data => {
        this.projects = data.body['result'];
        if (this.projects.length === 0) {
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


  check() {
    this.color = !this.color;
  }

}
