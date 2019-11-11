import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AuthGuard} from '@shared/guards/auth.guard';
import {PlacesComponent} from './places.component';
import {AccessGuard} from '@shared/guards/access.guard';
import { PlaceSetResolver } from '@shared/resolvers/place-set.resolver';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PlacesComponent,
        canActivate: [ AuthGuard ],
        canActivateChild: [ AccessGuard ],
        resolve: {existingPlaseSet: PlaceSetResolver},
        data: { title: 'Places' , module: 'explore' }
      }
    ])
  ],
  declarations: [],
  exports: [ RouterModule ]
})

export class PlacesRoutingModule {}
