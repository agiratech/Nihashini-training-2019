import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivityService } from '../../services/activity.service';
import { ErrorService } from '../../services/error.service';
import { FlashService } from '../../flash/flash.service';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {

  constructor(
    private activityService: ActivityService,
    private flashService: FlashService,
    private errorService: ErrorService
  ) { }

  activities;
  no_record:boolean = false;
  submit_button; 
  name = '';
  @ViewChild('closeModal') close: ElementRef;
  id ;
  ngOnInit() {
    this.getActivities()
  }

  getActivities(){
    this.activityService.getActivities().subscribe(
      data => {
        this.activities = data.body['result'];
        this.no_record = this.activities.length>0 ? false : true;
      },
      error => {
        this.errorService.errorHandling(error) 
      }
    )
  }

  delete(id) {
    this.activityService.deleteActivity(id).subscribe(
      data => {
        if(data.body['success'] == true){
          this.getActivities()
        }
      },
      error => {
        this.errorService.errorHandling(error) 
      }
    )
  }

  createActivities(){
    let value:any = {}
    let activity = {
      id: this.id,
      name: this.name
    }
    value.activity = activity
    this.close.nativeElement.click();
    if(!this.id){
      this.activityService.createActivity(value).subscribe(
        data => {
          this.id = null;
          if(data.body['success']){
            this.getActivities()
            this.flashService.show(data.body['message'],"alert-success")
          }else{
            this.flashService.show(data.body['message'],"alert-danger")
          }
        }, error => {
        }
      )
    }else{
      this.activityService.updateActivity(value).subscribe(
        data => {
          if(data.body['success']){
            this.getActivities()
            this.flashService.show(data.body['message'],"alert-success")
          }else{
            this.flashService.show(data.body['message'],"alert-danger")
          }
        }, error => {
        }
      )   
    }

  }

  editActivity(id){
    this.id = id
    this.submit_button = "Edit Activity"
    this.activityService.showActivity(id).subscribe(
      data => {
        if(data.body['success']){
          this.name = data.body['result'].name
        }else{
        }
      }
    )
  }

  createActivity(){
    this.id = null;
    this.name = '';
    this.submit_button = "Create Activity"
  }
}
