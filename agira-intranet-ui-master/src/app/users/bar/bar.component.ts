import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import * as Highcharts from 'highcharts';
// require('highcharts/modules/exporting')(Highcharts);
import highstock from 'highcharts/modules/stock.src'

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {

  constructor(
    private usersService: UsersService
  ) { }

  dates = [];
  timesheets:any = {};
  user_hours = {};
  data = []
  chartData;
  Highcharts = Highcharts;
  categories;

  ngOnInit() {
    this.usersService.timeSheets.subscribe(
    val => {
      var colors = Highcharts.getOptions().colors
      this.timesheets = val
      this.categories = (Object.keys(this.timesheets).length > 0)?this.timesheets.bar_data:[{},{}]
      this.chartData =  {
        chart: {
          backgroundColor: '#fff',
          type: 'column'
        },
        title: {
          text: 'Date Vs Total Time Spent'
        },
        xAxis: {
          categories: this.timesheets.duration,
          crosshair: true
        },
        scrollbar: {
          enabled: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Hours'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.1,
            borderWidth: 0,
            // colorByPoint: true,
            // colors: ["#fff","#19E72C"]
          }
        },
        series: this.categories
      } 
    }
  )
  }
}
