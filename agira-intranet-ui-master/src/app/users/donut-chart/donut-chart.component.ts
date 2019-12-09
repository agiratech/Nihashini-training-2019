import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.css']
})
export class DonutChartComponent implements OnInit {

  constructor(
    private usersService: UsersService
  ) { }

  Highcharts = Highcharts;
  timesheets ;
  project_hours = {};
  chartOptions2;

  ngOnInit() {

    this.usersService.timeSheets.subscribe(
      val => {
        this.project_hours = {}
        this.timesheets = val
        this.project_hours = this.timesheets.projects
        if(this.project_hours != undefined){
          var colors = Highcharts.getOptions().colors
          var categories = Object.keys(this.project_hours)
          var data = [];
          var c =2 ;
          var browserData = [];
          var drillDataLen;
          var brightness;
          var versionsData = [];
          for(let category of categories){
            data.push({
              "y": this.project_hours[category].total_hours,
              "color": colors[c],
              "drilldown": {
                "name": category,
                "categories":[
                  "billed",
                  "worked"
                ],
                "data": [
                  this.project_hours[category]['billed_hours'],
                  this.project_hours[category]['worked_hours']
                ]
              }
            })
            c++;
          }
          var dataLen = data.length
          for (let i = 0; i < dataLen; i += 1) {

            // add browser data
            browserData.push({
                name:  categories[ i],
                y:  data[i].y,
                color: data[i].color,
                parent_name: 'total'
            });
        
            // add version data
            drillDataLen =  data[i].drilldown.data.length;
            for ( let j = 0;  j <  drillDataLen;  j += 1) {
              brightness = 0.2 - ( j /  drillDataLen) / 5;
              versionsData.push({
                name: data[i].drilldown.categories[j],
                y:  data[ i].drilldown.data[j],
                parent_name: data[i].drilldown.name,
                color: Highcharts.Color( data[i].color).brighten(brightness).get()
              });
            }
          }
        }
        this.chartOptions2 ={
            chart: {
                backgroundColor: '#fff',
                type: 'pie'
              },
          title: {
              text: 'User Vs Projects'
          },
          subtitle: {
              text: 'Total Hours: '+this.timesheets.total_hours
          },
          yAxis: {
              title: {
                  text: 'Total percent market share'
              }
          },
          plotOptions: {
              pie: {
                shadow: false,
                center: ['50%', '50%']
              }
          },
          tooltip: {
            headerFormat: '<small>{point.key}</small></b><br/>',
            pointFormat: '{point.parent_name}: <b>{point.y}</b><br/>',
            valueSuffix: ' hrs'
          },
          series: [{
              name: 'Total',
              data:  browserData,
              size: '60%',
              dataLabels: {
                  formatter: function () {
                      return null;
                  },
                  color: '#ffffff',
                  distance: -50
              }
          }, {
              name: 'Versions',
              data: versionsData,
              size: '80%',
              innerSize: '60%',
              dataLabels: {
                  formatter: function () {
                      // display only if larger than 1
                      return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
                          this.y + 'hrs' : null;
                  }
              },
              id: 'versions'
          }],
          minSize:20,
          responsive: {
              rules: [{
                  condition: {
                      maxWidth: 400
                  },
                  chartOptions: {
                      series: [{
                          id: 'versions',
                          dataLabels: {
                              enabled: false
                          }
                      }]
                  }
              }]
          }
        }
      }
    )
  }

}
