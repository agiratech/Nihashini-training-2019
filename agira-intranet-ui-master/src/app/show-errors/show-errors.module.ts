import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShowErrorsComponent } from './show-errors.component';
import { TablecolorPipe } from '../pipes/tablecolor.pipe';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ ShowErrorsComponent, TablecolorPipe ],
  exports: [ ShowErrorsComponent, TablecolorPipe ]
})
export class ShowErrorsModule { }


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/