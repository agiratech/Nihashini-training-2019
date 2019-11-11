import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AuthGuard} from '@shared/guards/auth.guard';
import {ExploreComponent} from './explore.component';
import {AccessGuard} from '@shared/guards/access.guard';
// import {PlacesResolver} from '@shared/resolvers/places.resolver';
import { MarketsResolver } from '@shared/resolvers/markets.resolver';
// import { ProjectsResolver } from '@shared/resolvers/projects.resolver';
import { PackagesResolver } from '@shared/resolvers/packages.resolver';
import { DefaultAudienceResolver } from '@shared/resolvers/default-audience.resolver';
import { MarketsDummyResolver } from '@shared/resolvers/markets-dummy.resolver';
import { CountiesResolver } from '@shared/resolvers/counties.resolver';
import { StatesResolver } from '@shared/resolvers/states.resolver';
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ExploreComponent,
        canActivate: [ AuthGuard, AccessGuard ],
        data: { title: 'Explore', module: 'explore' },
        resolve: {
          // places: PlacesResolver,
          // markets: MarketsResolver,
          dummyMarkets: MarketsDummyResolver,
          // projects: ProjectsResolver,
          // packages: PackagesResolver,
          defaultAudience: DefaultAudienceResolver,
          counties: CountiesResolver,
          states: StatesResolver
        }
      }
    ])
  ],
  declarations: [],
  exports: [ RouterModule ]
})

export class ExploreRouting { }
