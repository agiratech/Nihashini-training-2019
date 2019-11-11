import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AuthGuard} from '@shared/guards/auth.guard';
import {ReportsComponent} from './reports.component';
import {AccessGuard} from '@shared/guards/access.guard';

@NgModule({
  imports: [
  	RouterModule.forChild([
      {
        path: '',
        component: ReportsComponent,
        canActivate: [ AuthGuard ],
        canActivateChild: [ AccessGuard ],
        data: { title: 'Reports' ,module: 'reports' }
      }
    ])
  ],
  declarations: [],
  exports: [ RouterModule ]
})

export class ReportsRouting { }
