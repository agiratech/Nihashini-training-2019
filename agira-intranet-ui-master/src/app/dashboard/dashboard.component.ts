import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FlashService } from '../flash/flash.service'
import { TimesheetService } from '../services/timesheet.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';


declare var $ :any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  labels =  [];
  hours = [];
  data = false;
  totalworked = 0;
  result :any = {};
  chartData;


   colors = [
    { // 1st Year.
      backgroundColor: 'blue'
    }
   ]
   chartOptions = { scales : { yAxes: [{ ticks: { min: 0, stepValue : 1, max : 10, } }] } }


  constructor(
    private flashService: FlashService,
    private timesheetService : TimesheetService, 
    private authenticationservice: AuthenticationService,
    private router : Router
  ) { 
    // this.timesheetService.getTimesheets(this.defaultTime, this.defaultUser,this.startDate, this.endDate).subscribe(
    //   data => {
    //     if(data.body['success']){
    //       this.timesheets = data.body['result']
    //       for(let timesheet of this.timesheets){
    //         if(!this.result[timesheet.date]){
    //           this.result[timesheet.date] = timesheet.worked_hours;
    //         }else {
    //           this.result[timesheet.date] = this.result[timesheet.date]+timesheet.worked_hours;
    //         }
    //       }
    //       this.chartData = [
    //         {
    //           label: '',
    //           data: Object.values(this.result)
    //         }
    //        ];
        
    //       this.labels =Object.keys(this.result)
    //       this.data = true
    //     }else{
    //       this.data = false
    //     }
    //   },
    //   error => {
    //   }
    // ) 
  }

  timesheets;
  defaultTime = "between";
  defaultUser = JSON.parse(localStorage.getItem('currentUser')).id;
  end_date = new Date()
  start_date = new Date(this.end_date.getTime() - (7 * 24 * 60 * 60 * 1000));
  startDate = this.start_date.getDate()+'-'+(this.start_date.getMonth()+1)+'-'+this.start_date.getFullYear()
  endDate = this.end_date.getDate()+'-'+(this.end_date.getMonth()+1)+'-'+this.end_date.getFullYear()
  // @ViewChild('barChart') bar_chart: ElementRef;
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.authenticationservice.is_Admin.subscribe((val: boolean) => {
      this.is_Admin = val;
    });

    if(this.is_Admin){
      this.router.navigateByUrl('/account/'+this.currentUser.id+'/accountGoals')
    }else if(!this.is_Admin){
      this.router.navigateByUrl('/accounts')
    }else {
    }
    
    /* Checking current user is Admin */

  }
  currentUser;
  is_Admin;
}


