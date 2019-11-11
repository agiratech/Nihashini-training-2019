import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ScenarioCreateComponent} from './scenario-create/scenario-create.component';
import {ScenarioViewComponent} from './scenario-view/scenario-view.component';
import {CanExitGuard} from '../../shared/guards/can-exit.guard';
import {ProjectResolver} from './resolvers/project.resolver';
// import {MarketsResolver} from '../../shared/resolvers/markets.resolver';
import {MarketsDummyResolver} from '../../shared/resolvers/markets-dummy.resolver';
import { OperatorsResolver } from '@shared/resolvers/operators.resolver';
import {SavedAudienceResolver} from '../../shared/resolvers/saved-audience.resolver';
import {PlacesResolver} from '../../shared/resolvers/places.resolver';
import {ProjectsResolver} from '../../shared/resolvers/projects.resolver';
import {DefaultAudienceResolver} from '../../shared/resolvers/default-audience.resolver';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'create-scenario/:plan',
        component: ScenarioCreateComponent,
        data: {title: 'Create Scenarios', module: 'projects', 'mandatory': 'scenarioName'},
        canDeactivate: [CanExitGuard],
        resolve: {
          // markets: MarketsResolver,
          dummyMarkets: MarketsDummyResolver,
          project: ProjectResolver,
          audiences: SavedAudienceResolver,
          places: PlacesResolver,
          projects: ProjectsResolver,
          defaultAudience: DefaultAudienceResolver
        }
      },
      {
        path: ':scenarioId/:plan',
        component: ScenarioViewComponent,
        canDeactivate: [CanExitGuard],
        resolve: {
          // markets: MarketsResolver,
          dummyMarkets: MarketsDummyResolver,
          project: ProjectResolver,
          audiences: SavedAudienceResolver,
          places: PlacesResolver,
          projects: ProjectsResolver,
          defaultAudience: DefaultAudienceResolver,
          operators: OperatorsResolver
        },
        data: {title: 'Scenarios Details', module: 'projects'}
      },
      /* Separate route created for scenario view page without plan parameter, plan parameter
      used for selecting the tab after creating scenario*/
      {
        path: ':scenarioId',
        component: ScenarioViewComponent,
        canDeactivate: [CanExitGuard],
        resolve: {
          // markets: MarketsResolver,
          dummyMarkets: MarketsDummyResolver,
          project: ProjectResolver,
          audiences: SavedAudienceResolver,
          places: PlacesResolver,
          projects: ProjectsResolver,
          defaultAudience: DefaultAudienceResolver,
          operators: OperatorsResolver
        },
        data: {title: 'Scenarios Details', module: 'projects'}
      }
    ])
  ],
  declarations: [],
  exports: [RouterModule]
})

export class ScenariosRouting {
}
