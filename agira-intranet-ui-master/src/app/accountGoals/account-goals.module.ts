import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountGoalsRoutingModule } from './account-goals-routing.module';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { DuplicateComponent } from './duplicate/duplicate.component';
import { ListComponent } from './list/list.component';
import { ShowErrorsModule } from '../show-errors/show-errors.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShowErrorsModule,
    AccountGoalsRoutingModule
  ],
  declarations: [CreateComponent, EditComponent, DuplicateComponent, ListComponent ]
})
export class AccountGoalsModule { }


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/