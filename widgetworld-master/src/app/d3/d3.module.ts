import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3Service } from './services/d3.service';
import { BasicBarChartComponent } from './visuals/basic-bar-chart/basic-bar-chart.component';
import { LineChartComponent } from './visuals/line-chart/line-chart.component';
import { DonutChartComponent } from './visuals/donut-chart/donut-chart.component';
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    BasicBarChartComponent,
    LineChartComponent,
    DonutChartComponent
  ],
  providers: [
    D3Service
  ],
  declarations: [
    BasicBarChartComponent,
    LineChartComponent,
    DonutChartComponent
  ]
})
export class D3Module { }
