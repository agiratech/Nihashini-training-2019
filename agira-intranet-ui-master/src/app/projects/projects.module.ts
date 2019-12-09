import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ShowErrorsModule } from '../show-errors/show-errors.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CreateProjectComponent } from './create/create-project.component';
import { EditProjectComponent } from './edit/edit-project.component';



const routes: Routes = [
  // { path: 'new', component: CreateProjectComponent },
  { path: ':id/edit', component: EditProjectComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShowErrorsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ EditProjectComponent],
  exports: [RouterModule]
})
export class ProjectsModule { }
