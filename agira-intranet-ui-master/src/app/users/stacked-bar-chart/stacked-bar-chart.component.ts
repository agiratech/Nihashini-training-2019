import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.css']
})
export class StackedBarChartComponent implements OnInit {

  constructor(
    private usersService: UsersService
  ) { }
  timesheets: any = {};

  ngOnInit() {
    let colors = Highcharts.getOptions().colors;
    let display_colors = [];
    this.usersService.timeSheets.subscribe(
      val => {
        this.timesheets = val;
        if (this.timesheets.stacked_bar_data != null) {
          let size = this.timesheets.stacked_bar_data.length;
          for (let i = 2; i < size + 2; i++ ) {
            display_colors.push(colors[i]);
          }
        }
        const stacked_bar = document.getElementById('container');
        if (stacked_bar !== undefined) {
          Highcharts.chart('container', {
            chart: {
              backgroundColor: '#fff',
              type: 'column'
            },
            title: {
              text: 'Daily Time Spent Vs Projects'
            },
            xAxis: {
              categories: this.timesheets.duration,
              crosshair: true
            },
            yAxis: {
              allowDecimals: false,
              min: 0,
              title: {
                text: 'Hours'
              },
            },
            colors: display_colors,
            tooltip: {
              formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                  this.series.name + ': ' + this.y + '<br/>' +
                  'Total: ' + this.point.stackTotal;
              }
            },
            plotOptions: {
              column: {
                stacking: 'normal'
              }
            },
            series: this.timesheets.stacked_bar_data
          });
        }

      }
    );
  }

}
