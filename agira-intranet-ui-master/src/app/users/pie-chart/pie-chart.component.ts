import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import * as Highcharts from 'highcharts';
import { AuthenticationService} from '../../authentication.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

  constructor(
    private usersService: UsersService,
    private authenticationService: AuthenticationService
  ) { }

  Highcharts = Highcharts;
  chartOptions;
  chartOptions1;
  timeSheets;
  is_admin = true;
  is_timesheet_manager: boolean;
  currentUser;


  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser.roles.includes('admin')) {
      this.is_admin = true;
    }else {
      this.is_admin = false;
    }

    if (this.currentUser.is_timesheet_manager) {
      this.is_timesheet_manager = true;
    }else {
      this.is_timesheet_manager = false;
    }
    const colors = Highcharts.getOptions().colors;
    this.usersService.timeSheets.subscribe(val => {
        this.timeSheets = val;
        this.chartOptions = {
          chart: {
            backgroundColor: '#fff',
            renderTo: 'container',
          },
          title: {
            text: 'User Vs Time'
          },
          subtitle: {
            text: 'Total Hours: ' + this.timeSheets.total_hours,
          },
          tooltip: {
            valueSuffix: 'hrs'
          },
          series: [{
            data: [{
              name: 'worked: ' + this.timeSheets.total_hours + ' hours',
              'color': colors[4],
              y: this.timeSheets.total_hours
            },
            {
              name: 'billed: ' + this.timeSheets.billed_hours + ' hours',
              'color': colors[3],
              y: this.timeSheets.billed_hours
            }],
            type: 'pie',
            name: ' ',
            dataLabels: {
              distance: -50
            }
          }]
        };
        this.chartOptions1 = {
          chart: {
            backgroundColor: '#fff',
            renderTo: 'container',
          },
          title: {
            text: 'User Vs Time'
          },
          subtitle: {
            text: 'Total Hours: ' + this.timeSheets.total_hours
          },
          tooltip: {
            valueSuffix: 'hrs'
          },
          series: [{
            data: [{
              name: 'Total: ' + this.timeSheets.total_hours + ' hours',
              'color': colors[2],
              y: this.timeSheets.total_hours
            }],
            type: 'pie',
            name: ' ',
            dataLabels: {
              inside: true
            }
          }],
          plotOptions: {
            pie: {
              dataLabels: {
                distance: -150
              }
            }
          }
        };
    });


  }

}
