import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportsComponent} from './reports.component';
import {ReportsRouting} from './reports.routing';
import {SharedModule} from '@shared/shared.module';
import {D3Module} from '@d3/d3.module';

@NgModule({
  imports: [
    CommonModule,
    ReportsRouting,
    SharedModule,
    D3Module
  ],
  declarations: [
  	ReportsComponent
  ],
  exports: [
    ReportsComponent,
    SharedModule,
    D3Module
  ],
})
export class ReportsModule { }
