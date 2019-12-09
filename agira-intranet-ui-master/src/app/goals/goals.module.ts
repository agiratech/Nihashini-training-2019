import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowErrorsModule } from '../show-errors/show-errors.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditGoalComponent } from './edit/edit-goal.component';
import { CreateGoalComponent } from './create/create-goal.component';
import { ShowGoalComponent } from './show/show-goal.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: ':id/edit', component: EditGoalComponent },
  { path: 'new', component: CreateGoalComponent },
  { path: ':id', component: ShowGoalComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShowErrorsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditGoalComponent, CreateGoalComponent, ShowGoalComponent ],
  exports: [RouterModule]
})
export class GoalsModule { }
