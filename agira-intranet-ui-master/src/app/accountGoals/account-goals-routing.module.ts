import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { DuplicateComponent } from './duplicate/duplicate.component';
import { ListComponent } from './list/list.component';
import { RoleGuard } from '../guards/role.guard';

const routes: Routes = [
  { path: '', component: ListComponent },
  { path: '', canActivate:[RoleGuard], children: [
    { path: 'new', component: CreateComponent },
    { path: ':accountGoal_id/edit', component: EditComponent },
    { path: ':accountGoal_id/duplicate', component: DuplicateComponent },
    { path: ':accountGoal_id/delete', component: EditComponent },
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountGoalsRoutingModule { }


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/