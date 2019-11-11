import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectsV2Component } from './projects-v2.component';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { ProjectsViewComponent } from './projects-view/projects-view.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ProjectsV2Component,
        data: { title: 'Projects', module: 'projects' },
        children: [
          {
            path: '',
            redirectTo: 'lists',
            pathMatch: 'full'
          },
          {
            path: 'lists',
            component: ProjectsListComponent,
            data: { title: 'Projects', module: 'projects' }
          },
          {
            path: ':id',
            component: ProjectsViewComponent,
            data: { title: 'Projects', module: 'projects' }
          },
          {
            path: ':id/scenarios',
            loadChildren: './scenarios/scenarios.module#ScenariosModule',
            data: { title: 'Scenarios', module: 'projects' }
          }
        ]
      }
    ])
  ],
  declarations: [],
  exports: [RouterModule]
})
export class ProjectsV2Routing {}
