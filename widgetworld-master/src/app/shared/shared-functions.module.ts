import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './pipes/truncate.pipe';
import { GeoKeysPipe } from './../explore/pipes/geo-keys.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TruncatePipe,
    GeoKeysPipe
  ],
  exports: [
    TruncatePipe,
    GeoKeysPipe
  ],
})
export class SharedFunctionsModule { }
